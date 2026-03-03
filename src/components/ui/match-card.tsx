import * as React from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Target, Lock, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const difficultyAccent: Record<string, string> = {
  FACILE: '#3B82F6',
  MOYEN: '#D4AF37',
  DIFFICILE: '#EF4444',
};

const difficultyLabel: Record<string, string> = {
  FACILE: 'Facile',
  MOYEN: 'Moyen',
  DIFFICILE: 'Difficile',
};

export interface MatchCardProps {
  title: string;
  subtitle?: string;
  difficulty?: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  score?: number | null;
  stars?: number;
  timeLimit?: number;
  passingScore?: number;
  questionCount?: number;
  isPremium?: boolean;
  isLocked?: boolean;
  isPassed?: boolean;
  isFeatured?: boolean;
  ribbon?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function MatchCard({
  title,
  subtitle,
  difficulty,
  score,
  stars,
  timeLimit,
  passingScore,
  questionCount,
  isPremium,
  isLocked,
  isPassed,
  isFeatured,
  ribbon,
  onClick,
  children,
  className,
}: MatchCardProps) {
  const accent = difficulty ? difficultyAccent[difficulty] : '#C41E3A';

  return (
    <motion.div
      whileHover={!isLocked ? { y: -6, boxShadow: `0 12px 32px ${accent}22` } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] cursor-pointer group',
        isFeatured && 'col-span-full',
        isLocked && 'opacity-70 grayscale cursor-not-allowed',
        isPremium && !isLocked && 'animate-shimmer',
        className,
      )}
      style={{ perspective: '800px' }}
    >
      {/* Left difficulty accent band */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
        style={{ backgroundColor: accent }}
      />

      {/* Premium shimmer overlay */}
      {isPremium && !isLocked && (
        <div className="absolute inset-0 pointer-events-none shimmer-border opacity-30 rounded-2xl" />
      )}

      {/* Corner ribbon */}
      {ribbon && (
        <div className="absolute top-3 right-3 z-10">
          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
            style={{ backgroundColor: accent }}
          >
            {ribbon}
          </div>
        </div>
      )}

      {/* Premium badge */}
      {isPremium && !isLocked && !ribbon && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C9A030] text-white text-[10px] font-bold shadow-lg">
            <Crown className="h-3 w-3" />
            VIP
          </div>
        </div>
      )}

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0A1628]/70 dark:bg-[#050810]/85 backdrop-blur-sm rounded-2xl">
          <Lock className="h-8 w-8 text-white/60 mb-2" />
          <p className="text-white font-bold text-sm">Verrouill&eacute;</p>
        </div>
      )}

      {/* Card body */}
      <div className={cn('pl-5 pr-4 py-4', isFeatured && 'flex gap-6 items-center')}>
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {difficulty && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                style={{ backgroundColor: accent }}
              >
                {difficultyLabel[difficulty]}
              </span>
            )}
            {isPassed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Réussi
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={cn(
            'font-black text-[#0A1628] dark:text-[#E2E8F5] truncate',
            isFeatured ? 'text-xl' : 'text-base',
          )}>
            {title}
          </h3>

          {subtitle && (
            <p className="text-xs text-[#5E7A9A] mt-0.5 truncate">{subtitle}</p>
          )}

          {/* Meta row */}
          {(timeLimit || passingScore || questionCount) && (
            <div className="flex items-center gap-3 mt-3 text-xs text-[#5E7A9A]">
              {timeLimit && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {timeLimit} min
                </span>
              )}
              {passingScore && (
                <span className="flex items-center gap-1">
                  <Target className="h-3.5 w-3.5" /> {passingScore}%
                </span>
              )}
              {questionCount !== undefined && (
                <span className="flex items-center gap-1">
                  {questionCount} Q
                </span>
              )}
            </div>
          )}

          {children}
        </div>

        {/* Featured right side — big score */}
        {isFeatured && score !== undefined && score !== null && (
          <div className="flex-shrink-0 text-center">
            <div className="scoreboard-text text-4xl font-black" style={{ color: accent }}>
              {score}%
            </div>
            {stars !== undefined && stars > 0 && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Star className="h-4 w-4 text-[#D4AF37] fill-current" />
                <span className="text-sm font-bold text-[#D4AF37]">+{stars}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom score bar */}
      {score !== undefined && score !== null && !isFeatured && (
        <div className="h-1 bg-[#EFF3F7] dark:bg-[#111B2E]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(score, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="h-full rounded-r-full"
            style={{ backgroundColor: accent }}
          />
        </div>
      )}
    </motion.div>
  );
}
