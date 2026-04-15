const API_BASE = 'http://localhost:8000/api';

export interface Panel {
  id: number;
  name: string;
  max_power_watts: number;
  status: string;
  current_power?: number;
  temperature?: number;
  daily_kwh?: number;
}

export interface Measurement {
  panel_id: number;
  timestamp: string;
  power_watts: number;
  temperature_celsius: number;
  daily_kwh: number;
}

export interface Alarm {
  id: number;
  panel_id: number;
  panel_name: string;
  type: string;
  message: string;
  triggered_at: string;
  status: string;
}

export async function getPanels(): Promise<Panel[]> {
  const response = await fetch(`${API_BASE}/panels`);
  if (!response.ok) throw new Error('Failed to fetch panels');
  return response.json();
}

export async function getMeasurements(panelId: number, hours: number = 24): Promise<Measurement[]> {
  const response = await fetch(`${API_BASE}/measurements/${panelId}?hours=${hours}`);
  if (!response.ok) throw new Error('Failed to fetch measurements');
  return response.json();
}

export async function getStatistics(panelId: number, days: number = 7): Promise<Record<string, any>> {
  const response = await fetch(`${API_BASE}/statistics/${panelId}?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch statistics');
  return response.json();
}

export async function getAlarms(limit: number = 50): Promise<Alarm[]> {
  const response = await fetch(`${API_BASE}/alarms?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch alarms');
  return response.json();
}

export async function acknowledgeAlarm(alarmId: number): Promise<boolean> {
  const response = await fetch(`${API_BASE}/alarms/${alarmId}/acknowledge`, {
    method: 'POST',
  });
  return response.ok;
}
