import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface Measurement {
  panel_id: number;
  timestamp: string;
  power_watts: number;
  temperature_celsius: number;
  daily_kwh: number;
}

const getMeasurements = async (panelId: number, hours: number = 24): Promise<Measurement[]> => {
  const response = await fetch(`http://localhost:8000/api/measurements/${panelId}?hours=${hours}`);
  if (!response.ok) throw new Error('Failed to fetch measurements');
  return response.json();
};

interface PowerChartProps {
  panelId?: number;
}

const PowerChart = ({ panelId = 1 }: PowerChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [panelId]);

  const loadChartData = async () => {
    try {
      const data = await getMeasurements(panelId, 24);
      renderChart(data);
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (data: Measurement[]) => {
    if (!chartRef.current) return;
    
    const chart = echarts.init(chartRef.current);
    
    const hourlyData: Record<string, { sum: number; count: number }> = {};
    data.forEach(m => {
      const hour = new Date(m.timestamp).getHours();
      const hourKey = `${hour}:00`;
      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = { sum: 0, count: 0 };
      }
      hourlyData[hourKey].sum += m.power_watts / 1000;
      hourlyData[hourKey].count++;
    });
    
    const hours = Object.keys(hourlyData).sort();
    const powers = hours.map(h => Math.round(hourlyData[h].sum / hourlyData[h].count * 10) / 10);
    
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: hours, axisLabel: { color: '#94A3B8' } },
      yAxis: { type: 'value', name: 'Мощность (kW)', nameTextStyle: { color: '#94A3B8' }, axisLabel: { color: '#94A3B8' } },
      series: [{
        data: powers,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, color: '#F59E0B' },
        areaStyle: { opacity: 0.3, color: '#F59E0B' },
        itemStyle: { color: '#F59E0B', borderColor: '#fff', borderWidth: 2 }
      }]
    });
    
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };

  if (loading) {
    return (
      <div className="bg-[#141B2B]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
        <h2 className="text-lg font-semibold mb-4">📈 Выработка за сегодня</h2>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-400">Загрузка графика...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141B2B]/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <h2 className="text-lg font-semibold mb-4">📈 Выработка за сегодня</h2>
      <div ref={chartRef} style={{ height: '350px', width: '100%' }} />
    </div>
  );
};

export default PowerChart;