import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Trophy,
  Target,
  TrendingUp,
  ChevronRight,
  Award,
  Zap,
  Swords,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { StaminaBar } from '@/components/ui/stamina-bar';
import { useAuthStore } from '@/store/auth';
import { cn, getAvatarUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { staggerContainer, staggerItem, scoreReveal } from '@/lib/animations';
import api from '@/lib/api';

interface UserStats {
  totalStars: number;
  rank: number;
  totalUsers: number;
  quizzesCompleted: number;
  quizzesPassed: number;
  totalQuizzes: number;
  averageScore: number;
  totalAttempts: number;
}

interface RecentAttempt {
  id: string;
  quizTitle: string;
  score: number;
  passed: boolean;
  starsEarned: number;
  completedAt: string;
}

/* Football pitch SVG (mini, decorative) */
function MiniPitchSVG() {
  return (
    <svg viewBox="0 0 200 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10">
      <rect x="5" y="5" width="190" height="120" stroke="white" strokeWidth="1.5" rx="1" />
      <line x1="100" y1="5" x2="100" y2="125" stroke="white" strokeWidth="1" />
      <circle cx="100" cy="65" r="25" stroke="white" strokeWidth="1" />
      <circle cx="100" cy="65" r="2" fill="white" />
      <rect x="5" y="30" width="28" height="70" stroke="white" strokeWidth="1" />
      <rect x="167" y="30" width="28" height="70" stroke="white" strokeWidth="1" />
    </svg>
  );
}

/* Animated counter */
function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = value / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display}</>;
}

export function UserDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<RecentAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, attemptsRes, positionRes] = await Promise.all([
          api.get('/dashboard/user-stats'),
          api.get('/quizzes/attempts'),
          api.get('/leaderboard/me'),
        ]);

        const attemptsData = attemptsRes.data.slice(0, 5).map((a: any) => ({
          id: a.id,
          quizTitle: a.quiz?.title || 'Quiz',
          score: a.score,
          passed: a.score >= (a.quiz?.passingScore || 70),
          starsEarned: a.starsEarned || 0,
          completedAt: a.completedAt,
        }));

        setStats({
          totalStars: user?.stars || 0,
          rank: positionRes.data.rank,
          totalUsers: positionRes.data.totalUsers,
          quizzesCompleted: statsRes.data.uniqueQuizzesCompleted || 0,
          quizzesPassed: statsRes.data.quizzesPassed || 0,
          totalQuizzes: statsRes.data.totalQuizzes || 0,
          averageScore: statsRes.data.averageScore || 0,
          totalAttempts: statsRes.data.totalAttempts || 0,
        });
        setRecentAttempts(attemptsData);
      } catch (error) {
        console.error('Failed to fetch user dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.stars]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="text-5xl mb-4 inline-block"
          >
            ⚽
          </motion.div>
          <p className="text-[#5E7A9A] font-medium">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  const successRate =
    stats && stats.totalAttempts > 0
      ? Math.round((stats.quizzesPassed / stats.totalAttempts) * 100)
      : 0;

  const completionRate =
    stats && stats.totalQuizzes > 0
      ? Math.round((stats.quizzesCompleted / stats.totalQuizzes) * 100)
      : 0;

  // Timeline progress (out of 90 minutes — maps completion to match time)
  const matchMinute = Math.round((completionRate / 100) * 90);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ====== HERO: MATCH DAY SCOREBOARD ====== */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A1628] via-[#0D1D35] to-[#0A1628] dark:from-[#050810] dark:via-[#07090F] dark:to-[#050810] p-6 sm:p-8 text-white border border-[#1B2B40]"
      >
        {/* Pitch lines decoration */}
        <div className="absolute inset-0"><MiniPitchSVG /></div>
        {/* Stadium spotlights */}
        <div className="absolute top-0 left-1/4 w-48 h-32 bg-[#E74C5E]/8 blur-3xl rounded-full" />
        <div className="absolute top-0 right-1/4 w-40 h-28 bg-[#D4AF37]/6 blur-3xl rounded-full" />

        <div className="relative z-10">
          {/* Top bar: MATCH DAY */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">Match Day</span>
            </div>
            <span className="scoreboard-text text-xs text-white/30">{matchMinute}'</span>
          </div>

          {/* Main content: Avatar | Name + Rank | Stars */}
          <div className="flex items-center gap-5 sm:gap-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-[#E74C5E]/30 shadow-2xl shadow-[#E74C5E]/10">
                <AvatarImage src={getAvatarUrl((user as any)?.avatar, user?.id)} alt={user?.firstName} />
                <AvatarFallback className="bg-gradient-to-br from-[#C41E3A] to-[#9B1B30] text-white text-2xl font-black">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Name + rank */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black truncate">
                {user?.firstName} {user?.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/5">
                  <Trophy className="h-3.5 w-3.5 text-[#FFB800]" />
                  <span className="text-xs font-bold">Rang #{stats?.rank || '-'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/5">
                  <Target className="h-3.5 w-3.5 text-white/60" />
                  <span className="text-xs font-bold">{successRate}% réussite</span>
                </div>
              </div>
            </div>

            {/* Stars counter */}
            <motion.div
              variants={scoreReveal}
              initial="hidden"
              animate="visible"
              className="flex-shrink-0 text-center"
            >
              <div className="flex items-center gap-2 bg-[#D4AF37]/15 border border-[#D4AF37]/25 rounded-2xl px-5 py-3">
                <Star className="h-6 w-6 text-[#FFB800] fill-current" />
                <span className="scoreboard-text text-2xl sm:text-3xl font-black text-[#FFB800]">
                  <AnimatedCounter value={stats?.totalStars || 0} />
                </span>
              </div>
              <span className="text-[10px] text-white/30 mt-1 block uppercase tracking-wider">étoiles</span>
            </motion.div>
          </div>

          {/* Timeline bar: 0' → 90' */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-[10px] text-white/25 mb-1.5 font-mono">
              <span>0'</span>
              <span>45'</span>
              <span>90'</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-[#E74C5E] to-[#FFB800]"
              />
            </div>
            <p className="text-[10px] text-white/30 mt-1">
              {stats?.quizzesCompleted || 0} / {stats?.totalQuizzes || 0} quiz complétés
            </p>
          </div>
        </div>
      </motion.div>

      {/* ====== STATS: 2-COLUMN ASYMMETRIC ====== */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left: 4 stats + StaminaBar */}
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-[#0D1525] rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] p-5 shadow-sm"
        >
          <h2 className="stat-label text-[#5E7A9A] mb-4">Statistiques du joueur</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Étoiles', value: stats?.totalStars || 0, icon: Star, color: '#D4AF37' },
              { label: 'Quiz joués', value: stats?.quizzesCompleted || 0, icon: Award, color: '#C41E3A' },
              { label: 'Victoires', value: stats?.quizzesPassed || 0, icon: Trophy, color: '#3B82F6' },
              { label: 'Score moy.', value: `${stats?.averageScore || 0}%`, icon: TrendingUp, color: '#8B5CF6' },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A111C] border border-[#DCE6F0]/50 dark:border-[#1B2B40]/50"
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${s.color}15` }}
                >
                  <s.icon className="h-5 w-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-lg font-black text-[#0A1628] dark:text-[#E2E8F5] leading-none">
                    {s.value}
                  </p>
                  <p className="text-[10px] text-[#5E7A9A] font-medium mt-0.5">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <StaminaBar
            value={completionRate}
            label="Progression globale"
            size="md"
            segments={12}
          />
        </motion.div>

        {/* Right: Conic gradient success rate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#0D1525] rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] p-5 shadow-sm flex flex-col items-center justify-center"
        >
          <h2 className="stat-label text-[#5E7A9A] mb-4">Taux de réussite</h2>

          {/* Conic gradient circle */}
          <div className="relative w-36 h-36 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="#EFF3F7" strokeWidth="8"
                className="dark:stroke-[#111B2E]" />
              {/* Progress circle */}
              <motion.circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke={successRate >= 70 ? '#22C55E' : successRate >= 40 ? '#D4AF37' : '#EF4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - successRate / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="scoreboard-text text-3xl font-black text-[#0A1628] dark:text-[#E2E8F5]">
                {successRate}%
              </span>
            </div>
          </div>

          <p className="text-xs text-[#5E7A9A]">
            {stats?.quizzesPassed || 0} victoires / {stats?.totalAttempts || 0} matchs
          </p>
        </motion.div>
      </div>

      {/* ====== DERNIERS MATCHS — Horizontal scroll ====== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-[#0A1628] dark:text-[#E2E8F5] uppercase tracking-wide">
            Derniers matchs
          </h2>
          <Link to="/history" className="text-xs text-[#C41E3A] dark:text-[#E74C5E] font-bold hover:underline flex items-center gap-1">
            Tout voir <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentAttempts.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin -mx-1 px-1">
            {recentAttempts.map((attempt, index) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex-shrink-0 snap-start w-56"
              >
                <div className={cn(
                  'relative rounded-2xl border-l-4 border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] p-4',
                  attempt.passed ? 'border-l-[#22C55E]' : 'border-l-[#EF4444]',
                )}>
                  {/* Score */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      'scoreboard-text text-2xl font-black',
                      attempt.passed ? 'text-[#22C55E]' : 'text-[#EF4444]',
                    )}>
                      {attempt.score}%
                    </span>
                    {attempt.starsEarned > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 text-[#D4AF37] fill-current" />
                        <span className="text-xs font-bold text-[#D4AF37]">+{attempt.starsEarned}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#0A1628] dark:text-[#E2E8F5] truncate">
                    {attempt.quizTitle}
                  </p>
                  <p className="text-[10px] text-[#5E7A9A] mt-1">{getRelativeTime(attempt.completedAt)}</p>

                  {/* Result bar */}
                  <div className="h-1 rounded-full bg-[#EFF3F7] dark:bg-[#111B2E] mt-3 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', attempt.passed ? 'bg-[#22C55E]' : 'bg-[#EF4444]')}
                      style={{ width: `${attempt.score}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-[#0D1525] rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40]">
            <div className="text-4xl mb-3">⚽</div>
            <p className="font-semibold text-[#0A1628] dark:text-[#E2E8F5] mb-1">Aucun quiz joué</p>
            <p className="text-sm text-[#5E7A9A] mb-4">Commencez votre première partie !</p>
            <Link to="/quizzes">
              <Button variant="outline" size="sm">Choisir un quiz</Button>
            </Link>
          </div>
        )}
      </div>

      {/* ====== QUICK ACTIONS — 3 big gradient blocks ====== */}
      <div>
        <h2 className="text-base font-black text-[#0A1628] dark:text-[#E2E8F5] mb-4 uppercase tracking-wide">
          Accès rapide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              to: '/quizzes',
              icon: Zap,
              label: 'Entrainement',
              desc: 'Quiz & challenges',
              gradient: 'from-[#C41E3A] to-[#9B1B30]',
              shadowColor: 'shadow-[#C41E3A]/20',
            },
            {
              to: '/duels',
              icon: Swords,
              label: 'Duels',
              desc: 'Défiez vos amis',
              gradient: 'from-[#D4AF37] to-[#B8960F]',
              shadowColor: 'shadow-[#D4AF37]/20',
            },
            {
              to: '/leaderboard',
              icon: Trophy,
              label: 'Classement',
              desc: 'Top 100 mondial',
              gradient: 'from-[#3B82F6] to-[#1D4ED8]',
              shadowColor: 'shadow-[#3B82F6]/20',
            },
          ].map((action, i) => (
            <Link key={i} to={action.to}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                  'relative overflow-hidden rounded-2xl p-5 min-h-[120px] flex flex-col justify-between text-white shadow-lg cursor-pointer',
                  `bg-gradient-to-br ${action.gradient} ${action.shadowColor}`,
                )}
              >
                {/* Floating icon */}
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                  className="mb-3"
                >
                  <action.icon className="h-8 w-8 text-white/80" />
                </motion.div>
                <div>
                  <h3 className="font-black text-lg">{action.label}</h3>
                  <p className="text-white/60 text-xs">{action.desc}</p>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-white/5" />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
