import * as React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn, getAvatarUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Tier = 'gold' | 'silver' | 'bronze' | 'default';

const tierGradient: Record<Tier, string> = {
  gold: 'from-[#FFB800] via-[#D4AF37] to-[#B8960F]',
  silver: 'from-[#C0C0C0] via-[#94A3B8] to-[#64748B]',
  bronze: 'from-[#CD7F32] via-[#B87333] to-[#A0522D]',
  default: 'from-[#C41E3A] via-[#9B1B30] to-[#7A1525]',
};

const tierBorder: Record<Tier, string> = {
  gold: 'border-[#FFB800]',
  silver: 'border-[#94A3B8]',
  bronze: 'border-[#CD7F32]',
  default: 'border-[#C41E3A] dark:border-[#E74C5E]',
};

export interface PlayerCardProps {
  name: string;
  avatar?: string | null;
  userId?: string;
  rank?: number;
  stars?: number;
  stats?: { label: string; value: string | number }[];
  tier?: Tier;
  size?: 'sm' | 'md' | 'lg';
  showFlip?: boolean;
  className?: string;
}

export function PlayerCard({
  name,
  avatar,
  userId,
  rank,
  stars,
  stats,
  tier = 'default',
  size = 'md',
  showFlip = false,
  className,
}: PlayerCardProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeConfig = {
    sm: { card: 'w-28', avatar: 'h-14 w-14', name: 'text-xs', stat: 'text-[10px]' },
    md: { card: 'w-40', avatar: 'h-20 w-20', name: 'text-sm', stat: 'text-xs' },
    lg: { card: 'w-52', avatar: 'h-24 w-24', name: 'text-base', stat: 'text-sm' },
  }[size];

  const card = (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        sizeConfig.card,
        'aspect-[3/4]',
        'border-2',
        tierBorder[tier],
        'bg-gradient-to-b from-[#0D1525] to-[#07090F]',
        'flex flex-col items-center justify-center gap-2 p-3',
        className,
      )}
    >
      {/* Top gradient accent */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1/3 opacity-30 bg-gradient-to-b',
          tierGradient[tier],
        )}
      />

      {/* Rank badge */}
      {rank !== undefined && (
        <div className="absolute top-2 left-2">
          <span className="scoreboard-text text-lg font-black text-white/80">
            #{rank}
          </span>
        </div>
      )}

      {/* Stars badge */}
      {stars !== undefined && (
        <div className="absolute top-2 right-2 flex items-center gap-0.5">
          <Star className="h-3 w-3 text-[#FFB800] fill-current" />
          <span className="text-[10px] font-bold text-[#FFB800]">{stars}</span>
        </div>
      )}

      {/* Avatar */}
      <div className="relative z-10">
        <Avatar className={cn(sizeConfig.avatar, 'ring-2 shadow-xl', tierBorder[tier])}>
          <AvatarImage src={getAvatarUrl(avatar, userId)} alt={name} />
          <AvatarFallback className={cn('bg-gradient-to-br text-white font-black', tierGradient[tier])}>
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Name */}
      <p className={cn('font-black text-white text-center truncate w-full relative z-10', sizeConfig.name)}>
        {name}
      </p>

      {/* Stats grid */}
      {stats && stats.length > 0 && (
        <div className={cn(
          'grid gap-1 w-full relative z-10',
          stats.length <= 2 ? 'grid-cols-2' : 'grid-cols-2',
        )}>
          {stats.slice(0, 4).map((s, i) => (
            <div key={i} className="text-center bg-white/5 rounded-lg py-1 px-1">
              <div className={cn('font-black text-white', sizeConfig.stat)}>{s.value}</div>
              <div className="text-[8px] text-white/40 uppercase tracking-wider font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!showFlip) return card;

  return (
    <motion.div
      whileHover={{ rotateY: 12, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{ perspective: 800 }}
    >
      {card}
    </motion.div>
  );
}
