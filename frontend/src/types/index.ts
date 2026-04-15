export interface Panel {
  id: number;
  name: string;
  maxPowerWatts: number;
  status: 'online' | 'offline' | 'error' | 'warning';
  currentPower?: number;
  temperature?: number;
  dailyKwh?: number;
}

export interface Measurement {
  panelId: number;
  timestamp: string;
  powerWatts: number;
  temperatureCelsius: number;
  dailyKwh: number;
}

export interface Alarm {
  id: number;
  panelId: number;
  panelName: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  triggeredAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
}