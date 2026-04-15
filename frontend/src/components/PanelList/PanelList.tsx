const mockPanels = [
  { id: 1, name: 'Южный склон', power: 5.2, status: 'online' as const },
  { id: 2, name: 'Западный склон', power: 2.1, status: 'online' as const },
  { id: 3, name: 'Восточный склон', power: 3.4, status: 'online' as const },
  { id: 4, name: 'Северный склон', power: 1.2, status: 'warning' as const },
];

const PanelList = () => {
  return (
    <div className="bg-helios-card/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <h2 className="text-lg font-semibold mb-4">Панели</h2>
      <div className="space-y-3">
        {mockPanels.map((panel) => (
          <div key={panel.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${panel.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{panel.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="bg-helios-sun h-full rounded-full" style={{ width: `${(panel.power / 5.2) * 100}%` }} />
              </div>
              <span className="text-sm text-helios-text-secondary">{panel.power} kW</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelList;