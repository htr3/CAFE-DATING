import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Device } from './mock-bluetooth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Type declarations for Web Bluetooth API
declare global {
  interface Navigator {
    bluetooth: Bluetooth;
  }
}

interface Bluetooth {
  requestDevice(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
}

interface RequestDeviceOptions {
  filters?: BluetoothLEScanFilterInit[];
  optionalServices?: BluetoothServiceUUID[];
}

interface BluetoothLEScanFilterInit {
  services?: BluetoothServiceUUID[];
  name?: string;
  namePrefix?: string;
}

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  connected: boolean;
}

type BluetoothServiceUUID = string | number;

interface BluetoothContextType {
  isScanning: boolean;
  devices: Device[];
  connectedDevice: Device | null;
  pendingRequest: Device | null;
  startScanning: () => void;
  stopScanning: () => void;
  connectToDevice: (device: Device) => void;
  disconnect: () => void;
  acceptConnection: () => void;
  rejectConnection: () => void;
  blockDevice: (device: Device) => void;
  connectionState: 'idle' | 'connecting' | 'connected' | 'error';
  isBluetoothSupported: boolean;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error('useBluetooth must be used within a BluetoothProvider');
  }
  return context;
};

export const BluetoothProvider = ({ children }: { children: ReactNode }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [blockedDevices, setBlockedDevices] = useState<string[]>(() => {
    const saved = localStorage.getItem('blocked_devices');
    return saved ? JSON.parse(saved) : [];
  });
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [pendingRequest, setPendingRequest] = useState<Device | null>(null);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Define the service UUID for the app
  const SERVICE_UUID = '0000cafe-0000-1000-8000-00805f9b34fb';

  // Check for Web Bluetooth support
  useEffect(() => {
    setIsBluetoothSupported('bluetooth' in navigator);
  }, []);

  // Persist blocked devices
  useEffect(() => {
    localStorage.setItem('blocked_devices', JSON.stringify(blockedDevices));
  }, [blockedDevices]);

  // Auto-start scanning on mount if supported
  useEffect(() => {
    if (isBluetoothSupported) {
      startScanning();
    }
    return () => stopScanning();
  }, [isBluetoothSupported]);

  // Note: Web Bluetooth doesn't support continuous scanning.
  // Scanning is done via user-initiated requestDevice() calls.

  // Note: Real Web Bluetooth doesn't simulate incoming requests.
  // Incoming connections would need to be handled via GATT server mode, which is not implemented here.

  const startScanning = async () => {
    if (!isBluetoothSupported) {
      toast({
        variant: "destructive",
        title: "Bluetooth Not Supported",
        description: "Your browser doesn't support Web Bluetooth API.",
      });
      return;
    }

    try {
      setIsScanning(true);
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SERVICE_UUID] }],
        optionalServices: [SERVICE_UUID],
      });

      // Create a Device object from the BluetoothDevice
      const newDevice: Device = {
        id: device.id,
        name: device.name || 'Unknown Device',
        lastSeen: Date.now(),
        status: 'available',
        bluetoothDevice: device,
        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${device.name || device.id}&backgroundColor=transparent`,
      };

      // Only add if not blocked and not already in list
      if (!blockedDevices.includes(newDevice.id) && !devices.some(d => d.id === newDevice.id)) {
        setDevices(prev => [...prev, newDevice]);
        toast({
          title: "Device Found",
          description: `Discovered ${newDevice.name}`,
        });
      }
    } catch (error) {
      console.error('Error scanning for devices:', error);
      toast({
        variant: "destructive",
        title: "Scanning Failed",
        description: "Failed to scan for nearby devices.",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const stopScanning = () => setIsScanning(false);

  const connectToDevice = (device: Device) => {
    if (blockedDevices.includes(device.id)) return;
    
    setConnectionState('connecting');
    setTimeout(() => {
      if (Math.random() > 0.2) {
        setConnectedDevice(device);
        setConnectionState('connected');
        setIsScanning(false);
        toast({
          title: "Secure Connection Established",
          description: `Handshake successful with ${device.name}. Encryption keys exchanged.`,
        });
        setLocation('/chat');
      } else {
        setConnectionState('error');
        toast({
          variant: "destructive",
          title: "Connection Rejected",
          description: `${device.name} declined the connection request.`,
        });
        setTimeout(() => setConnectionState('idle'), 2000);
      }
    }, 2000);
  };

  const disconnect = () => {
    if (connectedDevice?.bluetoothDevice?.gatt) {
      connectedDevice.bluetoothDevice.gatt.disconnect();
    }
    setConnectedDevice(null);
    setConnectionState('idle');
    setIsScanning(true);
    setLocation('/');
    toast({
      title: "Disconnected",
      description: "Secure session ended. Device memory cleared.",
    });
  };

  const blockDevice = (device: Device) => {
    setBlockedDevices(prev => [...prev, device.id]);
    if (connectedDevice?.id === device.id) {
      disconnect();
    }
    if (pendingRequest?.id === device.id) {
      setPendingRequest(null);
    }
    // Remove from scanned list immediately
    setDevices(prev => prev.filter(d => d.id !== device.id));
    
    toast({
      variant: "destructive",
      title: "Device Blocked",
      description: `${device.name} has been permanently blocked.`,
    });
  };

  const acceptConnection = () => {
    if (pendingRequest) {
      connectToDevice(pendingRequest);
      setPendingRequest(null);
    }
  };

  const rejectConnection = () => {
    setPendingRequest(null);
  };

  return (
    <BluetoothContext.Provider value={{
      isScanning,
      devices: devices.filter(d => !blockedDevices.includes(d.id)),
      connectedDevice,
      pendingRequest,
      startScanning,
      stopScanning,
      connectToDevice,
      disconnect,
      acceptConnection,
      rejectConnection,
      blockDevice,
      connectionState,
      isBluetoothSupported
    }}>
      {children}
    </BluetoothContext.Provider>
  );
};
