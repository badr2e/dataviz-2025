import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const AnimatedNumber = ({ value, duration = 1.5, decimals = 0, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(easeOut * value);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString('fr-FR');

  return <>{formattedValue}{suffix}</>;
};

export const StatCard = ({
  title,
  value,
  suffix = '',
  decimals = 0,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'corsica',
  delay = 0,
}) => {
  const colorClasses = {
    corsica: 'from-corsica-500 to-corsica-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="
        relative overflow-hidden
        bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl
        border border-white/20 dark:border-surface-700/30
        shadow-glass dark:shadow-none
        rounded-2xl
        p-6
        transition-all duration-300
        hover:shadow-glass-lg dark:hover:shadow-none
      "
    >
      {/* Background gradient decoration */}
      <div
        className={`
          absolute -top-12 -right-12
          w-32 h-32
          rounded-full
          bg-gradient-to-br ${colorClasses[color]}
          opacity-10
          blur-2xl
        `}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-surface-500 dark:text-surface-400">{title}</span>
          {Icon && (
            <div className={`p-2 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white`}>
              <Icon size={18} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-surface-900 dark:text-white">
            {typeof value === 'string' ? (
              <>{value}{suffix}</>
            ) : (
              <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
            )}
          </span>
          {trend !== undefined && (
            <span
              className={`
                text-sm font-medium
                ${trend >= 0 ? 'text-green-600' : 'text-red-600'}
              `}
            >
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>

        {/* Subtitle / Trend label */}
        {(subtitle || trendLabel) && (
          <p className="text-sm text-surface-400 dark:text-surface-500 mt-2">
            {subtitle || trendLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
