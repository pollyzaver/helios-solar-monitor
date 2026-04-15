import { useState, useEffect } from 'react';
import * as echarts from 'echarts';

interface Panel {
  id: number;
  name: string;
  max_power_watts: number;
  status: string;
}

interface Measurement {
  panel_id: number;
  timestamp: string;
  power_watts: number;
  temperature_celsius: number;
  daily_kwh: number;
}

// API функции
const getPanels = async (): Promise<Panel[]> => {
  const response = await fetch('http://localhost:8000/api/panels');
  if (!response.ok) throw new Error('Failed to fetch panels');
  return response.json();
};

const getMeasurements = async (panelId: number, hours: number = 168): Promise<Measurement[]> => {
  const response = await fetch(`http://localhost:8000/api/measurements/${panelId}?hours=${hours}`);
  if (!response.ok) throw new Error('Failed to fetch measurements');
  return response.json();
};

type Period = '7days' | '14days' | '30days';

const Charts = () => {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [selectedPanels, setSelectedPanels] = useState<number[]>([1, 2]);
  const [period, setPeriod] = useState<Period>('7days');
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<Record<number, Measurement[]>>({});

  useEffect(() => {
    loadPanels();
  }, []);

  useEffect(() => {
    if (selectedPanels.length > 0) {
      loadChartData();
    }
  }, [selectedPanels, period]);

  const loadPanels = async () => {
    try {
      const data = await getPanels();
      setPanels(data);
    } catch (error) {
      console.error('Failed to load panels:', error);
    }
  };

  const loadChartData = async () => {
    setLoading(true);
    try {
      const hours = period === '7days' ? 168 : period === '14days' ? 336 : 720;
      const data: Record<number, Measurement[]> = {};
      
      for (const panelId of selectedPanels) {
        data[panelId] = await getMeasurements(panelId, hours);
      }
      setChartData(data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePanel = (panelId: number) => {
    setSelectedPanels(prev => {
      if (prev.includes(panelId)) {
        return prev.filter(id => id !== panelId);
      } else {
        return [...prev, panelId];
      }
    });
  };

  const getPeriodLabel = () => {
    switch (period) {
      case '7days': return '7 дней';
      case '14days': return '14 дней';
      case '30days': return '30 дней';
    }
  };

  // Рендер графика после загрузки данных
  useEffect(() => {
    if (loading || Object.keys(chartData).length === 0) return;
    
    const chartDom = document.getElementById('comparison-chart');
    if (!chartDom) return;
    
    const chart = echarts.init(chartDom);
    
    // Группируем по дням
    const daysMap: Map<string, number[]> = new Map();
    const panelNames: Record<number, string> = {};
    
    // Собираем все даты
    Object.entries(chartData).forEach(([panelId, measurements]) => {
      const pId = Number(panelId);
      const panel = panels.find(p => p.id === pId);
      panelNames[pId] = panel?.name || `Панель ${pId}`;
      
      const dailyTotal: Record<string, number> = {};
      measurements.forEach(m => {
        const date = new Date(m.timestamp).toLocaleDateString();
        dailyTotal[date] = (dailyTotal[date] || 0) + m.daily_kwh;
      });
      
      Object.entries(dailyTotal).forEach(([date, value]) => {
        if (!daysMap.has(date)) {
          daysMap.set(date, []);
        }
      });
    });
    
    // Сортируем даты
    const sortedDates = Array.from(daysMap.keys()).sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });
    
    // Формируем ряды данных для каждой панели
    const seriesData: Record<number, number[]> = {};
    selectedPanels.forEach(panelId => {
      seriesData[panelId] = new Array(sortedDates.length).fill(0);
    });
    
    Object.entries(chartData).forEach(([panelId, measurements]) => {
      const pId = Number(panelId);
      const dailyTotal: Record<string, number> = {};
      measurements.forEach(m => {
        const date = new Date(m.timestamp).toLocaleDateString();
        dailyTotal[date] = (dailyTotal[date] || 0) + m.daily_kwh;
      });
      
      sortedDates.forEach((date, idx) => {
        seriesData[pId][idx] = Math.round((dailyTotal[date] || 0) * 10) / 10;
      });
    });
    
    const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];
    
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'axis',
        backgroundColor: '#141B2B',
        borderColor: '#F59E0B',
        textStyle: { color: '#E2E8F0' }
      },
      legend: { 
        data: selectedPanels.map(id => panelNames[id]),
        textStyle: { color: '#E2E8F0' },
        top: 0
      },
      grid: { left: '3%', right: '4%', top: '15%', bottom: '3%', containLabel: true },
      xAxis: { 
        type: 'category', 
        data: sortedDates, 
        axisLabel: { color: '#94A3B8', rotate: 45, interval: Math.floor(sortedDates.length / 7) },
        axisLine: { lineStyle: { color: '#2D3748' } }
      },
      yAxis: { 
        type: 'value', 
        name: 'Выработка (kWh/день)', 
        nameTextStyle: { color: '#94A3B8' }, 
        axisLabel: { color: '#94A3B8' },
        splitLine: { lineStyle: { color: '#2D3748' } }
      },
      series: selectedPanels.map((panelId, idx) => ({
        name: panelNames[panelId],
        type: 'line',
        data: seriesData[panelId],
        smooth: true,
        lineStyle: { width: 2, color: colors[idx % colors.length] },
        symbol: 'circle',
        symbolSize: 6,
        areaStyle: { opacity: 0.1, color: colors[idx % colors.length] }
      }))
    });
    
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [chartData, loading, panels, selectedPanels]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📈 Графики и аналитика</h1>
        <p className="text-gray-400">Сравнение выработки солнечных панелей</p>
      </div>
      
      {/* Панель управления */}
      <div className="bg-[#141B2B]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Выберите панели:</h3>
            <div className="flex flex-wrap gap-2">
              {panels.map(panel => (
                <button
                  key={panel.id}
                  onClick={() => togglePanel(panel.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                    selectedPanels.includes(panel.id)
                      ? 'bg-helios-sun/20 text-helios-sun border border-helios-sun/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {panel.name}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Период:</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('7days')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                  period === '7days'
                    ? 'bg-helios-sun/20 text-helios-sun border border-helios-sun/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                7 дней
              </button>
              <button
                onClick={() => setPeriod('14days')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                  period === '14days'
                    ? 'bg-helios-sun/20 text-helios-sun border border-helios-sun/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                14 дней
              </button>
              <button
                onClick={() => setPeriod('30days')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                  period === '30days'
                    ? 'bg-helios-sun/20 text-helios-sun border border-helios-sun/50'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                30 дней
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* График */}
      <div className="bg-[#141B2B]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
        {loading ? (
          <div className="h-[450px] flex items-center justify-center">
            <p className="text-gray-400">Загрузка данных...</p>
          </div>
        ) : selectedPanels.length === 0 ? (
          <div className="h-[450px] flex items-center justify-center">
            <p className="text-gray-400">Выберите хотя бы одну панель для отображения</p>
          </div>
        ) : (
          <div id="comparison-chart" style={{ height: '450px', width: '100%' }} />
        )}
      </div>
      
      {/* Итоговая таблица */}
      {!loading && Object.keys(chartData).length > 0 && selectedPanels.length > 0 && (
        <div className="bg-[#141B2B]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
          <h3 className="text-lg font-semibold mb-4">📊 Итоговая выработка за {getPeriodLabel()}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-gray-400 font-medium">Панель</th>
                  <th className="text-right py-3 text-gray-400 font-medium">Суммарная выработка (kWh)</th>
                  <th className="text-right py-3 text-gray-400 font-medium">Средняя в день (kWh)</th>
                </tr>
              </thead>
              <tbody>
                {selectedPanels.map(panelId => {
                  const measurements = chartData[panelId] || [];
                  const totalKwh = measurements.reduce((sum, m) => sum + m.daily_kwh, 0);
                  const avgKwh = measurements.length > 0 ? totalKwh / (measurements.length / 96) : 0;
                  const panel = panels.find(p => p.id === panelId);
                  
                  return (
                    <tr key={panelId} className="border-b border-white/5">
                      <td className="py-3">{panel?.name || `Панель ${panelId}`}</td>
                      <td className="text-right py-3">{Math.round(totalKwh * 10) / 10} kWh</td>
                      <td className="text-right py-3">{Math.round(avgKwh * 10) / 10} kWh</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;