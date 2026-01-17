import { useBluetooth } from "@/lib/bluetooth-context";
import { DeviceCard } from "@/components/device-card";
import { ScanningRadar } from "@/components/scanning-radar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Shield, Info, Bluetooth, BluetoothOff } from "lucide-react";
import { motion } from "framer-motion";

export default function NearbyPage() {
  const { devices, isScanning, connectToDevice, startScanning, isBluetoothSupported } = useBluetooth();

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 pb-2 space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-primary">Café Secure</h1>
          <div className="flex items-center gap-1.5 bg-accent/10 text-accent px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-accent/20">
            <Shield className="w-3 h-3" />
            AES-256
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Discover people nearby without internet.</p>
      </div>

      {/* Status Card */}
      <div className="px-6 py-4">
        <div className="bg-secondary/50 rounded-2xl p-4 border border-border/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm">Bluetooth Radar</h2>
                {isBluetoothSupported ? (
                  <Bluetooth className="w-4 h-4 text-green-500" />
                ) : (
                  <BluetoothOff className="w-4 h-4 text-red-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {isBluetoothSupported
                  ? (isScanning ? "Scanning for devices..." : "Ready to scan")
                  : "Web Bluetooth not supported on this device/browser"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isScanning && <ScanningRadar />}
              {isBluetoothSupported && !isScanning && (
                <Button
                  size="sm"
                  onClick={startScanning}
                  className="rounded-full px-4"
                >
                  Scan for Devices
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Device List */}
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Nearby ({devices.length})</span>
          </div>
          
          {devices.length === 0 ? (
            <div className="py-12 text-center space-y-4 opacity-50">
               <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                 <Info className="w-8 h-8 text-muted-foreground" />
               </div>
               <p className="text-sm">
                 {isBluetoothSupported
                   ? "Tap 'Scan for Devices' to discover nearby users"
                   : "Web Bluetooth is not supported in this browser"
                 }
               </p>
            </div>
          ) : (
            devices.map(device => (
              <DeviceCard key={device.id} device={device} onConnect={connectToDevice} />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Bottom Hint */}
      <div className="p-4 text-center">
         <p className="text-[10px] text-muted-foreground/60 max-w-[200px] mx-auto">
           Your device ID is visible to others only while this screen is active.
         </p>
      </div>
    </div>
  );
}
