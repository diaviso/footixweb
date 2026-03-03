import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface StaminaBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  segments?: number;
  className?: string;
}

function getColor(value: number): string {
  if (value >= 70) return '#22C55E'; // green
  if (value >= 40) return '#D4AF37'; // gold
  return '#EF4444'; // red
}

export function StaminaBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  segments = 10,
  className,
}: StaminaBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const color = getColor(pct);
  const filledSegments = Math.round((pct / 100) * segments);

  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' };

  return (
    <div className={cn('w-full', className)}>
      {/* Label row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
              {label}
            </span>
          )}
          {showValue && (
            <span
              className="text-xs font-black tabular-nums"
              style={{ color }}
            >
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}

      {/* Segmented bar */}
      <div className={cn('flex gap-0.5 rounded-full overflow-hidden', heights[size])}>
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filledSegments;
          return (
            <motion.div
              key={i}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
                delay: i * 0.03,
              }}
              className={cn(
                'flex-1 rounded-sm origin-bottom',
                isFilled ? '' : 'bg-[#EFF3F7] dark:bg-[#111B2E]',
              )}
              style={isFilled ? { backgroundColor: color } : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
