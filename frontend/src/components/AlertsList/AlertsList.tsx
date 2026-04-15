const mockAlerts = [
  { id: 1, panel: 'Южный склон', message: 'Резкое падение мощности', time: '14:32', type: 'critical' },
  { id: 2, panel: 'Западный склон', message: 'Температура выше 80°C', time: '13:45', type: 'warning' },
];

const AlertsList = () => {
  return (
    <div className="bg-helios-card/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <h2 className="text-lg font-semibold mb-4">🔔 Последние оповещения</h2>
      <div className="space-y-3">
        {mockAlerts.map((alert) => (
          <div key={alert.id} className="p-3 rounded-xl bg-white/5 border-l-4 border-helios-danger">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{alert.panel}</p>
                <p className="text-sm text-helios-text-secondary">{alert.message}</p>
              </div>
              <span className="text-xs text-helios-text-secondary">{alert.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsList;