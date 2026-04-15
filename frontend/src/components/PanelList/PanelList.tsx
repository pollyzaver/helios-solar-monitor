// Временно определяем тип прямо здесь
interface Panel {
  id: number;
  name: string;
  max_power_watts: number;
  status: string;
  current_power?: number;
  temperature?: number;
  daily_kwh?: number;
}

interface PanelListProps {
  panels: Panel[];
}

const PanelList = ({ panels }: PanelListProps) => {
  return (
    <div className="bg-[#141B2B]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <h2 className="text-lg font-semibold mb-4">🛰️ Панели</h2>
      <div className="space-y-3">
        {panels.map((panel) => (
          <div key={panel.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${panel.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{panel.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="bg-helios-sun h-full rounded-full" 
                  style={{ width: `${((panel.current_power || 0) / (panel.max_power_watts / 1000)) * 100}%` }} 
                />
              </div>
              <span className="text-sm text-gray-400">{Math.round((panel.current_power || 0) / 1000 * 10) / 10} kW</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelList;