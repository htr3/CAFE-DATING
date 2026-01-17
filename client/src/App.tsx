import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BluetoothProvider } from "@/lib/bluetooth-context";
import { MobileWrapper } from "@/components/mobile-wrapper";
import { ConnectionRequestDialog } from "@/components/connection-request-dialog";
import NearbyPage from "@/pages/nearby";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={NearbyPage} />
      <Route path="/chat" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BluetoothProvider>
          <MobileWrapper>
            <Router />
            <ConnectionRequestDialog />
          </MobileWrapper>
          <Toaster />
        </BluetoothProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
