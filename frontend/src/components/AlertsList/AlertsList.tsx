import { useState, useEffect } from 'react';

// Временно определяем типы прямо здесь
interface Alarm {
  id: number;
  panel_id: number;
  panel_name: string;
  type: string;
  message: string;
  triggered_at: string;
  status: string;
}

// Функция для получения алертов
const getAlarms = async (limit: number = 50): Promise<Alarm[]> => {
  const response = await fetch('http://localhost:8000/api/alarms?limit=' + limit);
  if (!response.ok) throw new Error('Failed to fetch alarms');
  return response.json();
};

const AlertsList = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlarms = async () => {
      try {
        const data = await getAlarms(5);
        setAlarms(data);
      } catch (error) {
        console.error('Failed to load alarms:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAlarms();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#141B2B]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
        <h2 className="text-lg font-semibold mb-4">🔔 Последние оповещения</h2>
        <p className="text-gray-400 text-center">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#141B2B]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <h2 className="text-lg font-semibold mb-4">🔔 Последние оповещения</h2>
      <div className="space-y-3">
        {alarms.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Нет активных оповещений</p>
        ) : (
          alarms.map((alarm) => (
            <div key={alarm.id} className="p-3 rounded-xl bg-white/5 border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{alarm.panel_name}</p>
                  <p className="text-sm text-gray-400">{alarm.message}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(alarm.triggered_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsList;