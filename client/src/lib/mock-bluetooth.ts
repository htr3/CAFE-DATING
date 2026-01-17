export interface Device {
  id: string;
  name: string;
  distance?: number; // optional, estimated if available
  rssi?: number; // optional, signal strength if available
  lastSeen: number;
  status: 'available' | 'connecting' | 'connected' | 'rejected';
  avatar?: string;
  bluetoothDevice?: BluetoothDevice; // Reference to the real BluetoothDevice
}

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jamie', 
  'Quinn', 'Avery', 'Skyler', 'Charlie', 'Dakota', 'Reese', 'Rowan',
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Elijah', 'Sophia', 'Lucas'
];

const LAST_INITIALS = ['A', 'B', 'C', 'M', 'R', 'S', 'T', 'W'];

const DEVICE_NAMES = [
  'Pixel 8', 'Galaxy S24', 'iPhone 15', 'OnePlus 12', 'Xperia 5', 
  'Nothing Phone', 'Moto Edge', 'Zenfone 10'
];

export const generateMockDevice = (): Device => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastInitial = LAST_INITIALS[Math.floor(Math.random() * LAST_INITIALS.length)];
  const deviceName = DEVICE_NAMES[Math.floor(Math.random() * DEVICE_NAMES.length)];
  const name = `${firstName} ${lastInitial}.`;

  return {
    id: crypto.randomUUID(),
    name: name,
    distance: Math.floor(Math.random() * 20) + 1, // 1m to 20m
    rssi: -(Math.floor(Math.random() * 50) + 40), // -40 to -90 dBm
    lastSeen: Date.now(),
    status: 'available',
    avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=transparent`
  };
};

// Simulation of the "Scanning" process
export const simulateScanning = (
  currentDevices: Device[], 
  onFound: (device: Device) => void,
  onUpdate: (deviceId: string, updates: Partial<Device>) => void
) => {
  // Chance to find a new device
  if (Math.random() > 0.7 && currentDevices.length < 8) {
    onFound(generateMockDevice());
  }

  // Update RSSI/Distance of existing devices
  currentDevices.forEach(device => {
    if (Math.random() > 0.5) {
      const newRssi = device.rssi + (Math.random() * 10 - 5);
      onUpdate(device.id, {
        rssi: Math.round(newRssi),
        lastSeen: Date.now()
      });
    }
  });
};
