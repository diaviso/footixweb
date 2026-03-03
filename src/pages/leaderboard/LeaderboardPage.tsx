import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Crown,
} from 'lucide-react';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn, getAvatarUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { staggerContainer, staggerItem, podiumRise } from '@/lib/animations';
import api from '@/lib/api';
import type { LeaderboardEntry, UserPosition } from '@/types';

export function LeaderboardPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, positionRes] = await Promise.all([
          api.get('/leaderboard'),
          api.get('/leaderboard/me'),
        ]);
        setLeaderboard(leaderboardRes.data);
        setUserPosition(positionRes.data);
      } catch {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le classement',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const isUserInTop100 = userPosition && userPosition.rank <= 100;

  const podiumConfig = [
    { rank: 2, entry: leaderboard[1], size: 'h-20 w-20', pillarH: 'h-20', bg: 'from-[#94A3B8] to-[#64748B]', ring: 'ring-[#94A3B8]' },
    { rank: 1, entry: leaderboard[0], size: 'h-24 w-24', pillarH: 'h-28', bg: 'from-[#FFB800] to-[#D4AF37]', ring: 'ring-[#FFB800]' },
    { rank: 3, entry: leaderboard[2], size: 'h-16 w-16', pillarH: 'h-14', bg: 'from-[#CD7F32] to-[#A0522D]', ring: 'ring-[#CD7F32]' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="text-5xl mb-4"
        >
          ⚽
        </motion.div>
        <p className="text-[#5E7A9A] font-medium">Chargement du classement...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.04)}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl"
    >
      {/* ===== SCOREBOARD HEADER ===== */}
      <motion.div variants={staggerItem}>
        <ScoreboardHeader
          title="Ligue Footix"
          subtitle="Top 100 joueurs par nombre d'étoiles"
          icon={<Trophy className="h-6 w-6" />}
          live
        />
      </motion.div>

      {/* ===== YOUR POSITION (if outside top 100) ===== */}
      {userPosition && !isUserInTop100 && (
        <motion.div variants={staggerItem}>
          <div className="p-4 rounded-2xl border-2 border-[#C41E3A]/30 dark:border-[#E74C5E]/30 bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#5E7A9A] mb-3">Votre position</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-[#C41E3A]/10 dark:bg-[#E74C5E]/10 flex items-center justify-center">
                  <span className="scoreboard-text text-2xl font-black text-[#C41E3A] dark:text-[#E74C5E]">
                    {userPosition.rank}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-[#0A1628] dark:text-[#E2E8F5]">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-[#5E7A9A]">
                    {userPosition.rank === 1 ? '1er' : `${userPosition.rank}ème`} sur {userPosition.totalUsers} joueurs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                <Star className="h-4 w-4 text-[#D4AF37] fill-current" />
                <span className="scoreboard-text font-black text-[#D4AF37]">{userPosition.stars}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== PODIUM — 3D Pillars with spotlights ===== */}
      {leaderboard.length >= 3 && (
        <motion.div variants={staggerItem}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1628] via-[#0D1D35] to-[#0A1628] dark:from-[#050810] dark:via-[#07090F] dark:to-[#050810] border border-[#1B2B40]"
            style={{ perspective: '600px' }}
          >
            {/* Animated spotlights */}
            <motion.div
              animate={{ opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 left-1/4 w-48 h-32 bg-[#94A3B8] blur-3xl rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.1, 0.18, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 bg-[#FFB800] blur-3xl rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.06, 0.12, 0.06] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute top-0 right-1/4 w-48 h-32 bg-[#CD7F32] blur-3xl rounded-full"
            />

            <div className="relative z-10 px-8 pt-6 pb-2">
              <div className="text-center mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/25">Podium</span>
              </div>

              {/* Podium row */}
              <div className="flex items-end justify-center gap-3 sm:gap-6">
                {podiumConfig.map(({ rank, entry, size, pillarH, bg, ring }) => {
                  if (!entry) return null;
                  const isFirst = rank === 1;
                  return (
                    <motion.div
                      key={rank}
                      variants={podiumRise(rank === 1 ? 0.1 : rank === 2 ? 0.25 : 0.4)}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col items-center"
                    >
                      {/* Crown for #1 */}
                      {isFirst && (
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="mb-2"
                        >
                          <Crown className="h-7 w-7 text-[#FFB800] drop-shadow-lg" />
                        </motion.div>
                      )}

                      {/* Avatar */}
                      <Avatar className={cn(size, 'ring-4 shadow-2xl', ring, isFirst && 'shadow-[#FFB800]/20')}>
                        <AvatarImage src={getAvatarUrl(entry.avatar, entry.userId)} alt={entry.firstName} />
                        <AvatarFallback className={cn('bg-gradient-to-br font-black text-white', bg, isFirst ? 'text-xl' : 'text-base')}>
                          {entry.firstName?.[0]}{entry.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="text-center mt-3">
                        <p className="font-black text-white text-sm sm:text-base">
                          {entry.firstName} {entry.lastName.charAt(0)}.
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Star className="h-3 w-3 text-[#FFB800] fill-current" />
                          <span className="scoreboard-text text-xs font-bold text-[#FFB800]">{entry.stars}</span>
                        </div>
                      </div>

                      {/* 3D Pillar */}
                      <div
                        className={cn(
                          'mt-3 rounded-t-2xl flex items-center justify-center font-black text-white shadow-lg',
                          isFirst ? 'w-20 text-2xl' : rank === 2 ? 'w-16 text-xl' : 'w-14 text-lg',
                          pillarH,
                          `bg-gradient-to-b ${bg}`,
                        )}
                        style={{
                          transform: 'rotateX(5deg)',
                          transformOrigin: 'bottom',
                        }}
                      >
                        {rank}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== LEAGUE TABLE ===== */}
      <motion.div variants={staggerItem}>
        <div className="bg-white dark:bg-[#0D1525] rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-[#DCE6F0] dark:border-[#1B2B40]">
            <div className="w-10 text-center"><span className="stat-label">#</span></div>
            <div className="flex-1"><span className="stat-label">Joueur</span></div>
            <div className="w-24 text-right"><span className="stat-label">Étoiles</span></div>
          </div>

          {/* Rows */}
          {leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🏆</div>
              <p className="font-semibold text-[#0A1628] dark:text-[#E2E8F5]">Aucun joueur pour l'instant</p>
              <p className="text-sm text-[#5E7A9A] mt-1">Soyez le premier à jouer !</p>
            </div>
          ) : (
            <div>
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.userId === user?.id;
                const isTop3 = entry.rank <= 3;

                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.015 }}
                    whileHover={{ x: 4 }}
                    className={cn(
                      'flex items-center gap-4 px-5 py-3.5 border-b border-[#DCE6F0]/50 dark:border-[#1B2B40]/50 last:border-0 transition-colors',
                      isCurrentUser
                        ? 'bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5 border-l-4 border-l-[#C41E3A] dark:border-l-[#E74C5E]'
                        : index % 2 === 0
                        ? 'bg-white dark:bg-[#0D1525]'
                        : 'bg-[#F8FAFC] dark:bg-[#0A111C]',
                      !isCurrentUser && 'hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]',
                    )}
                  >
                    {/* Rank — colored dot */}
                    <div className="w-10 flex-shrink-0 flex items-center justify-center gap-1.5">
                      {entry.rank <= 3 && (
                        <div className={cn(
                          'h-2.5 w-2.5 rounded-full',
                          entry.rank === 1 ? 'bg-[#FFB800]' : entry.rank === 2 ? 'bg-[#94A3B8]' : 'bg-[#CD7F32]',
                        )} />
                      )}
                      {entry.rank === 1 ? (
                        <Crown className="h-5 w-5 text-[#FFB800]" />
                      ) : (
                        <span className={cn(
                          'text-sm font-bold',
                          isCurrentUser ? 'text-[#C41E3A] dark:text-[#E74C5E]'
                            : isTop3 ? 'text-[#0A1628] dark:text-[#E2E8F5] font-black'
                            : 'text-[#5E7A9A]'
                        )}>
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className={cn(
                      'h-9 w-9 flex-shrink-0',
                      isTop3 ? 'ring-2' : '',
                      entry.rank === 1 ? 'ring-[#FFB800]' : entry.rank === 2 ? 'ring-[#94A3B8]' : entry.rank === 3 ? 'ring-[#CD7F32]' : '',
                    )}>
                      <AvatarImage src={getAvatarUrl(entry.avatar, entry.userId)} alt={entry.firstName} />
                      <AvatarFallback className={cn(
                        'text-xs font-bold',
                        isCurrentUser
                          ? 'bg-[#C41E3A] dark:bg-[#E74C5E] text-white dark:text-black'
                          : 'bg-[#EFF3F7] dark:bg-[#111B2E] text-[#5E7A9A]',
                      )}>
                        {entry.firstName?.[0]}{entry.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'font-semibold text-sm truncate',
                          isCurrentUser ? 'text-[#C41E3A] dark:text-[#E74C5E]' : 'text-[#0A1628] dark:text-[#E2E8F5]',
                        )}>
                          {entry.firstName} {entry.lastName}
                        </p>
                        {isCurrentUser && (
                          <span className="flex-shrink-0 text-[10px] font-bold bg-[#C41E3A]/10 dark:bg-[#E74C5E]/10 text-[#C41E3A] dark:text-[#E74C5E] px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Vous
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stars — scoreboard text */}
                    <div className={cn(
                      'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl',
                      isTop3 ? 'bg-[#D4AF37]/10 dark:bg-[#FFB800]/10' : 'bg-[#EFF3F7] dark:bg-[#111B2E]',
                    )}>
                      <Star className={cn(
                        'h-3.5 w-3.5 fill-current',
                        isTop3 ? 'text-[#D4AF37] dark:text-[#FFB800]' : 'text-[#5E7A9A]',
                      )} />
                      <span className={cn(
                        'scoreboard-text font-black text-sm',
                        isTop3 ? 'text-[#D4AF37] dark:text-[#FFB800]' : 'text-[#5E7A9A]',
                      )}>
                        {entry.stars}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
