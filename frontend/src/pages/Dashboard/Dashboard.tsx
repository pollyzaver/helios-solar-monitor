import { useState } from 'react';
import KPICard from '../../components/KPICard/KPICard';
import PowerChart from '../../components/PowerChart/PowerChart';
import AlertsList from '../../components/AlertsList/AlertsList';
import PanelList from '../../components/PanelList/PanelList';

const Dashboard = () => {
  const [kpi] = useState({
    currentPower: 5.2,
    dailyKwh: 24.8,
    temperature: 42.3,
    activeAlerts: 2,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <p className="text-helios-text-secondary">Мониторинг солнечных панелей в реальном времени</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard title="Текущая мощность" value={kpi.currentPower} unit="kW" icon="⚡" trend={12} color="sun" />
        <KPICard title="Выработка за день" value={kpi.dailyKwh} unit="kWh" icon="☀️" trend={8} color="success" />
        <KPICard title="Температура панели" value={kpi.temperature} unit="°C" icon="🌡️" trend={-2} color="danger" />
        <KPICard title="Активные алерты" value={kpi.activeAlerts} icon="⚠️" color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PowerChart />
        </div>
        <div className="space-y-6">
          <PanelList />
          <AlertsList />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;