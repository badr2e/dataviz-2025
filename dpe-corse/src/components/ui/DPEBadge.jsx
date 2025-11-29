import { motion } from 'framer-motion';
import { DPE_COLORS, DPE_TEXT_COLORS, DPE_LABELS } from '../../utils/colors';

export const DPEBadge = ({
  dpeClass,
  size = 'md',
  showLabel = false,
  animated = true,
  delay = 0,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-lg',
    lg: 'w-14 h-14 text-2xl',
    xl: 'w-20 h-20 text-3xl',
  };

  const bgColor = DPE_COLORS[dpeClass] || '#999';
  const textColor = DPE_TEXT_COLORS[dpeClass] || '#fff';

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: 'spring', stiffness: 500, damping: 30, delay },
      }
    : {};

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <Wrapper
        {...wrapperProps}
        className={`
          ${sizeClasses[size]}
          rounded-xl
          font-bold
          flex items-center justify-center
          shadow-md
          transition-transform duration-200
          hover:scale-110
        `}
        style={{
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {dpeClass}
      </Wrapper>
      {showLabel && (
        <span className="text-xs text-surface-500 font-medium">
          {DPE_LABELS[dpeClass]}
        </span>
      )}
    </div>
  );
};

export const DPEScale = ({ highlight, size = 'md' }) => {
  const classes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  return (
    <div className="flex gap-1">
      {classes.map((dpeClass, index) => (
        <DPEBadge
          key={dpeClass}
          dpeClass={dpeClass}
          size={size}
          animated={true}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
};

export const DPEBar = ({ dpeClass, value, maxValue, showPercentage = true }) => {
  const bgColor = DPE_COLORS[dpeClass] || '#999';
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3"
    >
      <DPEBadge dpeClass={dpeClass} size="sm" animated={false} />
      <div className="flex-1 h-8 bg-surface-100 rounded-lg overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-lg"
          style={{ backgroundColor: bgColor }}
        />
        <span className="absolute inset-0 flex items-center justify-end pr-3 text-sm font-semibold text-surface-700">
          {value.toLocaleString('fr-FR')}
          {showPercentage && (
            <span className="text-surface-400 ml-1">
              ({((value / maxValue) * 100).toFixed(1)}%)
            </span>
          )}
        </span>
      </div>
    </motion.div>
  );
};

export default DPEBadge;
