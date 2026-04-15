from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import asyncio
import random
import math
from typing import List, Dict

app = FastAPI(title="Helios API", description="API для мониторинга солнечных панелей", version="1.0.0")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== СИМУЛЯТОР ==========

class SolarSimulator:
    def __init__(self):
        self.panels = [
            {"id": 1, "name": "Южный склон", "max_power_watts": 5200, "status": "online"},
            {"id": 2, "name": "Западный склон", "max_power_watts": 5000, "status": "online"},
            {"id": 3, "name": "Восточный склон", "max_power_watts": 4900, "status": "online"},
            {"id": 4, "name": "Северный склон", "max_power_watts": 4800, "status": "warning"},
        ]
        self.alarms_history = []
        self.alarm_counter = 1
    
    def get_power_by_hour(self, panel_id: int, hour: int) -> float:
        if hour < 6 or hour > 20:
            return 0
        progress = (hour - 6) / 14
        power = 5000 * math.sin(progress * math.pi)
        cloud_factor = random.uniform(0.7, 1.0)
        power *= cloud_factor
        panel_factors = {1: 1.0, 2: 0.9, 3: 0.85, 4: 0.6}
        power *= panel_factors.get(panel_id, 0.8)
        return round(power, 1)
    
    def get_temperature(self, hour: int, power: float) -> float:
        base_temp = 20 + 10 * math.sin((hour - 12) / 24 * 2 * math.pi)
        temp = base_temp + (power / 5000) * 30
        return round(temp, 1)
    
    def generate_measurement(self, panel_id: int, timestamp: datetime) -> Dict:
        hour = timestamp.hour
        power = self.get_power_by_hour(panel_id, hour)
        temperature = self.get_temperature(hour, power)
        return {
            "panel_id": panel_id,
            "timestamp": timestamp.isoformat(),
            "power_watts": power,
            "temperature_celsius": temperature,
            "daily_kwh": round(power / 1000 * 0.25, 3)
        }
    
    def generate_measurements_for_last_hours(self, panel_id: int, hours: int = 24):
        measurements = []
        now = datetime.now()
        for i in range(hours * 4):
            timestamp = now - timedelta(minutes=15 * i)
            measurements.append(self.generate_measurement(panel_id, timestamp))
        return measurements[::-1]
    
    def get_panels_with_current_data(self):
        now = datetime.now()
        result = []
        for panel in self.panels:
            m = self.generate_measurement(panel["id"], now)
            result.append({
                **panel,
                "current_power": m["power_watts"],
                "temperature": m["temperature_celsius"],
                "daily_kwh": m["daily_kwh"]
            })
        return result

simulator = SolarSimulator()

# ========== REST API ==========

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/api/panels")
async def get_panels():
    return simulator.get_panels_with_current_data()

@app.get("/api/measurements/{panel_id}")
async def get_measurements(panel_id: int, hours: int = 24):
    return simulator.generate_measurements_for_last_hours(panel_id, hours)

@app.get("/api/alarms")
async def get_alarms(limit: int = 50):
    return simulator.alarms_history[-limit:]

@app.get("/api/statistics/{panel_id}")
async def get_statistics(panel_id: int, days: int = 7):
    measurements = simulator.generate_measurements_for_last_hours(panel_id, days * 24)
    daily_stats = {}
    for m in measurements:
        date = datetime.fromisoformat(m["timestamp"]).date().isoformat()
        if date not in daily_stats:
            daily_stats[date] = {"total_kwh": 0, "max_power": 0, "count": 0}
        daily_stats[date]["total_kwh"] += m["daily_kwh"]
        daily_stats[date]["max_power"] = max(daily_stats[date]["max_power"], m["power_watts"])
        daily_stats[date]["count"] += 1
    return daily_stats

# ========== WEB SOCKET ==========

@app.websocket("/ws/live/{panel_id}")
async def websocket_endpoint(websocket: WebSocket, panel_id: int):
    await websocket.accept()
    try:
        while True:
            m = simulator.generate_measurement(panel_id, datetime.now())
            await websocket.send_json({"type": "measurement", "data": m})
            await asyncio.sleep(15)
    except WebSocketDisconnect:
        pass