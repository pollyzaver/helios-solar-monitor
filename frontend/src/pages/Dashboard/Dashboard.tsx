import { useState, useEffect } from 'react';
import KPICard from '../../components/KPICard/KPICard';
import PowerChart from '../../components/PowerChart/PowerChart';
import AlertsList from '../../components/AlertsList/AlertsList';
import PanelList from '../../components/PanelList/PanelList';

interface Panel {
  id: number;
  name: string;
  max_power_watts: number;
  status: string;
  current_power?: number;
  temperature?: number;
  daily_kwh?: number;
}

const getPanels = async (): Promise<Panel[]> => {
  const response = await fetch('http://localhost:8000/api/panels');
  if (!response.ok) throw new Error('Failed to fetch panels');
  return response.json();
};

const Dashboard = () => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState({
    currentPower: 0,
    dailyKwh: 0,
    temperature: 0,
    activeAlerts: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const panelsData = await getPanels();
      setPanels(panelsData);
      
      const totalPower = panelsData.reduce((sum, p) => sum + (p.current_power || 0), 0);
      const totalDaily = panelsData.reduce((sum, p) => sum + (p.daily_kwh || 0), 0);
      const avgTemp = panelsData.reduce((sum, p) => sum + (p.temperature || 0), 0) / panelsData.length;
      const alertsCount = panelsData.filter(p => p.status === 'warning' || p.status === 'error').length;
      
      setKpi({
        currentPower: Math.round(totalPower / 1000 * 10) / 10,
        dailyKwh: Math.round(totalDaily * 10) / 10,
        temperature: Math.round(avgTemp * 10) / 10,
        activeAlerts: alertsCount,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-gray-400">Мониторинг солнечных панелей в реальном времени</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard title="Общая мощность" value={kpi.currentPower} unit="kW" icon="⚡" trend={12} color="sun" />
        <KPICard title="Выработка за день" value={kpi.dailyKwh} unit="kWh" icon="☀️" trend={8} color="success" />
        <KPICard title="Средняя температура" value={kpi.temperature} unit="°C" icon="🌡️" trend={-2} color="danger" />
        <KPICard title="Активные алерты" value={kpi.activeAlerts} icon="⚠️" color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PowerChart panelId={1} />
        </div>
        <div className="space-y-6">
          <PanelList panels={panels} />
          <AlertsList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;