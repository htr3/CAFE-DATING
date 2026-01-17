import { useBluetooth } from "@/lib/bluetooth-context";
import { useLocation } from "wouter";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Lock, MoreVertical, ShieldCheck, OctagonAlert, Ban, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: Date;
  isEncrypted: boolean;
}

export default function ChatPage() {
  const { connectedDevice, disconnect, blockDevice, connectionState } = useBluetooth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Redirect if not connected
  useEffect(() => {
    if (!connectedDevice && connectionState !== 'connecting') {
      setLocation('/');
    }
  }, [connectedDevice, connectionState, setLocation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulated incoming messages
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const responses = [
          "Hey there!", 
          "Is this really offline?", 
          "Cool app design!", 
          "How's the coffee nearby?",
          "Nice to meet you.",
          "Encrypted vibes only 😎"
        ];
        const text = responses[Math.floor(Math.random() * responses.length)];
        addMessage(text, 'them');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addMessage = (text: string, sender: 'me' | 'them') => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      sender,
      text,
      timestamp: new Date(),
      isEncrypted: true
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    addMessage(inputValue, 'me');
    setInputValue("");
  };

  const handleBlock = () => {
    if (connectedDevice) {
      blockDevice(connectedDevice);
    }
  };

  if (!connectedDevice) return null;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Chat Header */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-4 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 rounded-full" onClick={disconnect}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-secondary">
                <img src={connectedDevice.avatar} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-sm leading-none">{connectedDevice.name}</h3>
              <div className="flex items-center gap-1 text-[10px] text-accent font-medium mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                Encrypted
              </div>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/50 shadow-lg bg-background/95 backdrop-blur-md">
            <DropdownMenuLabel>Chat Options</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setMessages([])} className="cursor-pointer">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleBlock} className="text-destructive focus:text-destructive cursor-pointer">
              <Ban className="w-4 h-4 mr-2" />
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
        <div className="space-y-4 pb-4">
          {/* Encryption Notice */}
          <div className="flex justify-center my-6">
            <div className="bg-accent/10 text-accent text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-accent/20">
              <Lock className="w-3 h-3" />
              Messages are end-to-end encrypted. No one outside this chat can read them.
            </div>
          </div>

          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-12">
              <p>Start the conversation with {connectedDevice.name}!</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative group
                    ${msg.sender === 'me' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-white dark:bg-neutral-800 text-foreground rounded-tl-none border border-border/50'}
                  `}
                >
                  {msg.text}
                  <div className={`text-[9px] mt-1 opacity-70 ${msg.sender === 'me' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border/50">
        <form 
          className="flex gap-2 items-end"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-2xl border-border bg-secondary/30 focus-visible:ring-primary pl-4"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full w-10 h-10 bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 shadow-sm"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
