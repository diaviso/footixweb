import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import {
  BookOpen,
  HelpCircle,
  FileText,
  MessageSquare,
  Star,
  Clock,
  BarChart3,
  Dumbbell,
  Swords,
  Trophy,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardStats, Activity, UserProgress } from '@/services/dashboard.service';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { StaminaBar } from '@/components/ui/stamina-bar';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn, getAvatarUrl } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

/* Animated number counter */
function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) motionVal.set(value);
  }, [isInView, value, motionVal]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <span ref={ref} className={className}>{display}</span>;
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activitiesData, progressData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getUserActivity(),
          dashboardService.getUserProgress(),
        ]);
        setStats(statsData);
        setActivities(activitiesData);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = stats ? [
    {
      title: 'Thèmes',
      value: stats.themes,
      subtitle: 'Championnats',
      icon: BookOpen,
      gradient: 'from-[#C41E3A] to-[#9B1B30]',
      bg: 'bg-[#C41E3A]/10 dark:bg-[#E74C5E]/10',
      text: 'text-[#C41E3A] dark:text-[#E74C5E]',
    },
    {
      title: 'Quiz joués',
      value: stats.userQuizAttempts,
      subtitle: `${stats.quizzes} disponibles`,
      icon: HelpCircle,
      gradient: 'from-[#D4AF37] to-[#B8960F]',
      bg: 'bg-[#D4AF37]/10',
      text: 'text-[#D4AF37]',
    },
    {
      title: 'Articles',
      value: stats.blogs,
      subtitle: 'Ressources',
      icon: FileText,
      gradient: 'from-[#3B82F6] to-[#2563EB]',
      bg: 'bg-[#3B82F6]/10',
      text: 'text-[#3B82F6]',
    },
    {
      title: 'Discussions',
      value: stats.discussions,
      subtitle: 'Forum actif',
      icon: MessageSquare,
      gradient: 'from-[#5E7A9A] to-[#456078]',
      bg: 'bg-[#5E7A9A]/10',
      text: 'text-[#5E7A9A]',
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="text-5xl mb-4"
        >
          ⚽
        </motion.div>
        <p className="text-[#5E7A9A] font-medium">Chargement...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-6xl"
    >
      {/* ===== SCOREBOARD HEADER ===== */}
      <motion.div variants={staggerItem}>
        <ScoreboardHeader
          title="Tableau de Bord"
          subtitle="Vue d'ensemble de votre progression"
          icon={<BarChart3 className="h-6 w-6" />}
        />
      </motion.div>

      {/* ===== HERO WELCOME BANNER ===== */}
      <motion.div variants={staggerItem}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1628] via-[#0D1D35] to-[#0A1628] border border-[#1B2B40] p-6 sm:p-8">
          {/* Spotlights */}
          <motion.div
            animate={{ opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/4 w-48 h-32 bg-[#C41E3A] blur-3xl rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-0 right-1/4 w-48 h-32 bg-[#D4AF37] blur-3xl rounded-full"
          />

          <div className="relative z-10 flex items-center gap-5">
            {/* Avatar */}
            <Avatar className="h-16 w-16 ring-3 ring-[#D4AF37]/40 shadow-xl">
              <AvatarImage src={getAvatarUrl(user?.avatar, user?.id)} alt={user?.firstName} />
              <AvatarFallback className="bg-gradient-to-br from-[#C41E3A] to-[#9B1B30] text-white font-black text-xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white truncate">
                Bonjour, {user?.firstName} !
              </h1>
              <p className="text-sm text-[#5E7A9A] mt-0.5">
                Bienvenue sur Footix. Testez vos connaissances et grimpez dans le classement.
              </p>
            </div>

            {/* Stars badge */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
              <Star className="h-5 w-5 text-[#D4AF37] fill-current" />
              <span className="scoreboard-text font-black text-[#D4AF37] text-lg">
                <AnimatedCounter value={(user as any)?.stars || 0} />
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== STATS GRID ===== */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={staggerItem}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0D1525] border border-[#DCE6F0] dark:border-[#1B2B40] p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('p-2.5 rounded-xl', stat.bg)}>
                    <Icon className={cn('h-5 w-5', stat.text)} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5E7A9A]">
                    {stat.subtitle}
                  </span>
                </div>
                <p className="scoreboard-text text-3xl font-black text-[#0A1628] dark:text-[#E2E8F5]">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-xs font-semibold text-[#5E7A9A] mt-1">{stat.title}</p>

                {/* Bottom accent */}
                <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-60 group-hover:opacity-100 transition-opacity', stat.gradient)} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ===== CONTENT GRID ===== */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Activity — 3 cols */}
        <motion.div variants={staggerItem} className="lg:col-span-3">
          <div className="bg-white dark:bg-[#0D1525] rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#DCE6F0] dark:border-[#1B2B40]">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#C41E3A] dark:text-[#E74C5E]" />
                <h3 className="font-bold text-sm text-[#0A1628] dark:text-[#E2E8F5]">Activité récente</h3>
              </div>
              <span className="stat-label">Dernières actions</span>
            </div>

            <div className="p-4 space-y-2">
              {activities.length > 0 ? (
                activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.06 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0A111C] hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E] transition-colors"
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0',
                        activity.type === 'quiz'
                          ? 'bg-[#C41E3A]/10 dark:bg-[#E74C5E]/10 text-[#C41E3A] dark:text-[#E74C5E]'
                          : activity.type === 'article'
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                          : 'bg-[#5E7A9A]/10 text-[#5E7A9A]',
                      )}
                    >
                      {activity.type === 'quiz' ? (
                        <HelpCircle className="h-4 w-4" />
                      ) : activity.type === 'article' ? (
                        <FileText className="h-4 w-4" />
                      ) : (
                        <MessageSquare className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-[#0A1628] dark:text-[#E2E8F5]">{activity.title}</p>
                      <p className="text-xs text-[#5E7A9A]">{activity.time}</p>
                    </div>
                    {activity.score && (
                      <span className="scoreboard-text text-sm font-black text-[#C41E3A] dark:text-[#E74C5E] flex-shrink-0">
                        {activity.score}
                      </span>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="text-3xl mb-2">⚽</div>
                  <p className="font-semibold text-sm text-[#0A1628] dark:text-[#E2E8F5]">Aucune activité récente</p>
                  <p className="text-xs text-[#5E7A9A] mt-0.5">Commencez par jouer un quiz !</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats / Progress — 2 cols */}
        <motion.div variants={staggerItem} className="lg:col-span-2">
          <div className="bg-white dark:bg-[#0D1525] rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden h-full">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-[#DCE6F0] dark:border-[#1B2B40]">
              <Trophy className="h-4 w-4 text-[#D4AF37]" />
              <h3 className="font-bold text-sm text-[#0A1628] dark:text-[#E2E8F5]">Statistiques</h3>
            </div>

            <div className="p-5 space-y-5">
              <StaminaBar
                value={progress?.quizSuccessRate || 0}
                label="Quiz réussis"
                size="md"
                segments={12}
              />
              <div className="pitch-line my-4" />
              <StaminaBar
                value={progress?.quizCompletionRate || 0}
                label="Quiz complétés"
                size="md"
                segments={12}
              />
              <div className="pitch-line my-4" />
              <StaminaBar
                value={progress?.blogReadRate || 0}
                label="Articles lus"
                size="md"
                segments={12}
              />
              <div className="pitch-line my-4" />
              <StaminaBar
                value={progress?.forumParticipationRate || 0}
                label="Participation forum"
                size="md"
                segments={12}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <motion.div variants={staggerItem}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Dumbbell,
              label: 'Entrainement',
              desc: 'Jouez des quiz solo',
              to: '/quizzes',
              gradient: 'from-[#C41E3A] to-[#9B1B30]',
              iconFloat: '⚽',
            },
            {
              icon: Swords,
              label: 'Duels',
              desc: 'Défiez vos amis',
              to: '/duels',
              gradient: 'from-[#D4AF37] to-[#B8960F]',
              iconFloat: '🏆',
            },
            {
              icon: Trophy,
              label: 'Classement',
              desc: 'Ligue Footix',
              to: '/leaderboard',
              gradient: 'from-[#3B82F6] to-[#2563EB]',
              iconFloat: '🏅',
            },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} to={action.to}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative overflow-hidden rounded-2xl p-5 min-h-[120px] flex flex-col justify-between',
                    'bg-gradient-to-br text-white shadow-lg cursor-pointer',
                    action.gradient,
                  )}
                >
                  {/* Floating icon */}
                  <motion.span
                    animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-3 right-4 text-2xl opacity-30"
                  >
                    {action.iconFloat}
                  </motion.span>

                  <Icon className="h-7 w-7 mb-3 opacity-90" />
                  <div>
                    <p className="font-black text-lg">{action.label}</p>
                    <p className="text-xs text-white/70">{action.desc}</p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
