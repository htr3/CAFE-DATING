import { BluetoothProvider } from "@/lib/bluetooth-context";
import { SocketProvider } from "@/lib/socket-context";
import { MobileWrapper } from "@/components/mobile-wrapper";
import { ConnectionRequestDialog } from "@/components/connection-request-dialog";
import NearbyPage from "@/pages/nearby";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";
import { io } from "socket.io-client";import { useState } from "react";

const socket = io();

export default function App() {
  const [currentPage, setCurrentPage] = useState<"nearby" | "chat">("nearby");

  return (
    <BluetoothProvider>
      <SocketProvider socket={socket}>
        <MobileWrapper>
          <ConnectionRequestDialog />
          {currentPage === "nearby" && (
            <NearbyPage onNavigateToChat={() => setCurrentPage("chat")} />
          )}
          {currentPage === "chat" && (
            <ChatPage onNavigateToNearby={() => setCurrentPage("nearby")} />
          )}
        </MobileWrapper>
      </SocketProvider>
    </BluetoothProvider>
  );
}