import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Device, generateMockDevice, simulateScanning } from './mock-bluetooth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Persist blocked devices
  useEffect(() => {
    localStorage.setItem('blocked_devices', JSON.stringify(blockedDevices));
  }, [blockedDevices]);

  // Auto-start scanning on mount
  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, []);

  // Scanning Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning && connectionState === 'idle') {
      interval = setInterval(() => {
        simulateScanning(
          devices,
          (newDevice) => {
            // Only add if not blocked
            if (!blockedDevices.includes(newDevice.id)) {
              setDevices(prev => [...prev, newDevice]);
            }
          },
          (id, updates) => setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
        );
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isScanning, devices, connectionState, blockedDevices]);

  // Random Incoming Connection Request Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Only trigger if not blocked and idle
      if (connectionState === 'idle' && !pendingRequest && Math.random() > 0.95) {
        const stranger = generateMockDevice();
        if (!blockedDevices.includes(stranger.id)) {
          setPendingRequest(stranger);
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [connectionState, pendingRequest, blockedDevices]);

  const startScanning = () => setIsScanning(true);
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
      connectionState
    }}>
      {children}
    </BluetoothContext.Provider>
  );
};
