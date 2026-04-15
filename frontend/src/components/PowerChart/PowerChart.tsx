import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const PowerChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    const hours = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    const powers = [0.2, 0.8, 1.8, 3.2, 4.5, 5.1, 5.2, 5.0, 4.8, 4.2, 3.1, 1.8, 0.9, 0.3, 0.1];
    chart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: hours, axisLabel: { color: '#94A3B8' } },
      yAxis: { type: 'value', name: 'Мощность (kW)', nameTextStyle: { color: '#94A3B8' }, axisLabel: { color: '#94A3B8' } },
      series: [{
        data: powers, type: 'line', smooth: true, symbol: 'circle', symbolSize: 8,
        lineStyle: { width: 3, color: '#F59E0B' },
        areaStyle: { opacity: 0.3 },
        itemStyle: { color: '#F59E0B', borderColor: '#fff', borderWidth: 2 }
      }]
    });
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-helios-card/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
      <h2 className="text-lg font-semibold mb-4">Выработка за сегодня</h2>
      <div ref={chartRef} style={{ height: '350px', width: '100%' }} />
    </div>
  );
};

export default PowerChart;
