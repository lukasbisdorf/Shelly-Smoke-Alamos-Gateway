export interface ShellySmokeEvent {
  component: string;
  id: number;
  event: 'alarm' | 'alarm_stopped';
  ts: number;
  smoke: boolean;
  temperature: number;
}

export interface ShellyBatteryEvent {
  component: string;
  id: number;
  event: 'low_battery';
  ts: number;
  batteryLevel: number;
}

export interface ShellyDevice {
  id: string;
  name: string;
  location: {
    street: string;
    house: string;
    city: string;
    coordinates: [number, number];
  };
  unit: string; // FE2 unit address for smoke alarm
}
