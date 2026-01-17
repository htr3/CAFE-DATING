import { Device } from '@/lib/mock-bluetooth';
import { motion } from 'framer-motion';
import { Signal, SignalHigh, SignalLow, SignalMedium, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeviceCardProps {
  device: Device;
  onConnect: (device: Device) => void;
}

const getSignalIcon = (rssi: number) => {
  if (rssi > -60) return <SignalHigh className="w-4 h-4 text-green-500" />;
  if (rssi > -75) return <SignalMedium className="w-4 h-4 text-yellow-500" />;
  return <SignalLow className="w-4 h-4 text-orange-500" />;
};

export const DeviceCard = ({ device, onConnect }: DeviceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="p-4 bg-card rounded-2xl shadow-sm border border-border/50 flex items-center gap-4 hover:bg-secondary/50 transition-colors"
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-secondary overflow-hidden border-2 border-background shadow-inner">
          <img src={device.avatar} alt={device.name} className="w-full h-full object-cover" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
           {getSignalIcon(device.rssi)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-foreground truncate">{device.name}</h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Smartphone className="w-3 h-3" />
          {device.distance}m away
        </p>
      </div>

      <Button 
        size="sm" 
        onClick={() => onConnect(device)}
        className="rounded-full px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm active:scale-95 transition-all"
      >
        Connect
      </Button>
    </motion.div>
  );
};
