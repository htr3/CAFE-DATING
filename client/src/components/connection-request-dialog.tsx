import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBluetooth } from "@/lib/bluetooth-context";
import { ShieldCheck, User } from "lucide-react";

export const ConnectionRequestDialog = () => {
  const { pendingRequest, acceptConnection, rejectConnection } = useBluetooth();

  if (!pendingRequest) return null;

  return (
    <AlertDialog open={!!pendingRequest} onOpenChange={(open) => !open && rejectConnection()}>
      <AlertDialogContent className="max-w-[320px] rounded-3xl border-0 shadow-2xl bg-background/95 backdrop-blur-md">
        <AlertDialogHeader className="items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center relative">
            <img src={pendingRequest.avatar} className="w-full h-full rounded-full opacity-80" />
            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-lg">
               <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <AlertDialogTitle className="text-xl font-heading text-primary">Connection Request</AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-foreground/80">
              <span className="font-semibold text-foreground">{pendingRequest.name}</span> wants to start a secure, encrypted chat with you.
            </AlertDialogDescription>
          </div>
          
          <div className="text-xs font-mono bg-muted p-2 rounded w-full text-center text-muted-foreground">
            Key Fingerprint: {pendingRequest.id.substring(0, 8).toUpperCase()}...
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="grid grid-cols-2 gap-3 sm:gap-0 mt-2">
          <AlertDialogCancel onClick={rejectConnection} className="rounded-xl h-12 border-0 bg-muted hover:bg-muted/80">
            Reject
          </AlertDialogCancel>
          <AlertDialogAction onClick={acceptConnection} className="rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
            Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
