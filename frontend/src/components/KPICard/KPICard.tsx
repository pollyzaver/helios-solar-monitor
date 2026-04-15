import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  trend?: number;
  color?: 'sun' | 'success' | 'danger' | 'default';
}

const colorMap = {
  sun: 'from-helios-sun to-yellow-500',
  success: 'from-helios-success to-emerald-500',
  danger: 'from-helios-danger to-red-500',
  default: 'from-helios-text to-helios-text-secondary',
};

const KPICard = ({ title, value, unit, icon, trend, color = 'default' }: KPICardProps) => {
  return (
    <div className="bg-helios-card/60 backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-helios-sun/30 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-helios-text-secondary text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1">
            {value}
            {unit && <span className="text-sm text-helios-text-secondary ml-1">{unit}</span>}
          </p>
          {trend !== undefined && (
            <p className={`text-sm mt-2 ${trend >= 0 ? 'text-helios-success' : 'text-helios-danger'}`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% к предыдущему
            </p>
          )}
        </div>
        <div className={`text-3xl bg-gradient-to-br ${colorMap[color]} bg-clip-text text-transparent`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
