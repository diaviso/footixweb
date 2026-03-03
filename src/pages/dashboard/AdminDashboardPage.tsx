import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Users,
  HelpCircle,
  TrendingUp,
  Star,
  Trophy,
  BarChart3,
  UserPlus,
  Shield,
  Zap,
  Swords,
  BookOpen,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { PlayerCard } from '@/components/ui/player-card';
import { StaminaBar } from '@/components/ui/stamina-bar';
import { useAuthStore } from '@/store/auth';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalAttempts: number;
  totalTopics: number;
  globalSuccessRate: number;
  recentUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    stars: number;
  }>;
  topUsers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    stars: number;
  }>;
  attemptsByDay: Array<{
    date: string;
    count: number;
  }>;
}

export function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/dashboard/admin-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
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
          <p className="text-[#5E7A9A] font-medium">Chargement du centre de commande...</p>
        </div>
      </div>
    );
  }

  const maxAttempts = stats?.attemptsByDay.length
    ? Math.max(...stats.attemptsByDay.map((d) => d.count), 1)
    : 1;

  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ===== SCOREBOARD HEADER ===== */}
      <motion.div variants={staggerItem}>
        <ScoreboardHeader
          title="Centre de Commande"
          subtitle={`Bonjour Coach ${user?.firstName}`}
          icon={<Shield className="h-6 w-6" />}
          live
          rightContent={
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-white/30">Joueurs</div>
                <div className="scoreboard-text text-lg font-black text-white">{stats?.totalUsers || 0}</div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs text-white/30">Quiz</div>
                <div className="scoreboard-text text-lg font-black text-[#D4AF37]">{stats?.totalQuizzes || 0}</div>
              </div>
            </div>
          }
        />
      </motion.div>

      {/* ===== STATS GRID ===== */}
      <motion.div variants={staggerItem} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Joueurs', value: stats?.totalUsers || 0, icon: Users, color: '#C41E3A', desc: 'inscrits' },
          { title: 'Quiz', value: stats?.totalQuizzes || 0, icon: HelpCircle, color: '#3B82F6', desc: 'disponibles' },
          { title: 'Matchs joués', value: stats?.totalAttempts || 0, icon: BarChart3, color: '#D4AF37', desc: 'tentatives' },
          { title: 'Réussite', value: `${stats?.globalSuccessRate || 0}%`, icon: TrendingUp, color: '#22C55E', desc: 'taux global' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            whileHover={{ y: -2 }}
            className="relative overflow-hidden rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="stat-label text-[#5E7A9A]">{stat.title}</p>
                <p className="text-3xl font-black text-[#0A1628] dark:text-[#E2E8F5] mt-1 tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-[#5E7A9A] mt-1">{stat.desc}</p>
              </div>
              <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: stat.color, opacity: 0.5 }} />
          </motion.div>
        ))}
      </motion.div>

      {/* ===== CHARTS + TOP USERS ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Chart — improved bar chart */}
        <motion.div variants={staggerItem}>
          <Card className="border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-[#0A1628] dark:text-[#E2E8F5]">
                <BarChart3 className="h-5 w-5 text-[#C41E3A] dark:text-[#E74C5E]" />
                Activité (30j)
              </CardTitle>
              <CardDescription className="text-[#5E7A9A]">Tentatives par jour</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.attemptsByDay && stats.attemptsByDay.length > 0 ? (
                <div className="relative">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-[#5E7A9A] font-mono w-6">
                    <span>{maxAttempts}</span>
                    <span>{Math.round(maxAttempts / 2)}</span>
                    <span>0</span>
                  </div>
                  {/* Chart area with pitch-line grid */}
                  <div className="ml-8">
                    {/* Grid lines */}
                    <div className="absolute left-8 right-0 top-0 h-px bg-[#DCE6F0]/30 dark:bg-[#1B2B40]/30" />
                    <div className="absolute left-8 right-0 top-1/2 h-px bg-[#DCE6F0]/30 dark:bg-[#1B2B40]/30" />
                    {/* Bars */}
                    <div className="h-48 flex items-end gap-0.5">
                      {stats.attemptsByDay.slice(0, 30).reverse().map((day, index) => {
                        const height = (day.count / maxAttempts) * 100;
                        return (
                          <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: index * 0.02, duration: 0.5 }}
                            className="flex-1 rounded-t-sm bg-gradient-to-t from-[#C41E3A] to-[#E74C5E] hover:from-[#E74C5E] hover:to-[#FF6B7A] transition-colors cursor-pointer group relative"
                            style={{ minHeight: day.count > 0 ? '3px' : '0' }}
                          >
                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A1628] text-white text-[9px] px-2 py-1 rounded-lg whitespace-nowrap pointer-events-none z-10">
                              {day.count} matchs
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-[#5E7A9A] mt-2 ml-8">
                    <span>-30j</span>
                    <span>Aujourd'hui</span>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-[#5E7A9A]">
                  Aucune donnée
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Users — mini PlayerCards */}
        <motion.div variants={staggerItem}>
          <Card className="border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-[#0A1628] dark:text-[#E2E8F5]">
                <Trophy className="h-5 w-5 text-[#D4AF37]" />
                Top joueurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topUsers && stats.topUsers.length > 0 ? (
                <div className="space-y-2">
                  {stats.topUsers.map((topUser, index) => {
                    const tierMap = ['gold', 'silver', 'bronze'] as const;
                    const tier = index < 3 ? tierMap[index] : undefined;
                    const tierColors: Record<string, string> = {
                      gold: '#FFB800',
                      silver: '#94A3B8',
                      bronze: '#CD7F32',
                    };

                    return (
                      <motion.div
                        key={topUser.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.08 }}
                        whileHover={{ x: 4 }}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl transition-colors',
                          'bg-[#F8FAFC] dark:bg-[#0A111C] hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E]',
                        )}
                      >
                        {/* Rank */}
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                          style={{
                            backgroundColor: tier ? tierColors[tier] : '#5E7A9A',
                          }}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-[#0A1628] dark:text-[#E2E8F5] truncate">
                            {topUser.firstName} {topUser.lastName}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[#D4AF37]">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="scoreboard-text font-bold text-sm">{topUser.stars}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-[#5E7A9A]">
                  <Trophy className="h-12 w-12 mx-auto opacity-30 mb-3" />
                  <p>Aucun joueur</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ===== QUICK ACTIONS — Coaching style ===== */}
      <motion.div variants={staggerItem}>
        <h2 className="stat-label text-[#5E7A9A] mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/quizzes', label: 'Quiz', icon: Zap, color: '#C41E3A' },
            { to: '/themes', label: 'Thèmes', icon: BookOpen, color: '#3B82F6' },
            { to: '/admin/users', label: 'Joueurs', icon: Users, color: '#D4AF37' },
            { to: '/admin/email', label: 'Email', icon: UserPlus, color: '#8B5CF6' },
          ].map((action, i) => (
            <Link key={i} to={action.to}>
              <motion.div
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 p-4 rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                  <action.icon className="h-5 w-5" style={{ color: action.color }} />
                </div>
                <span className="font-bold text-sm text-[#0A1628] dark:text-[#E2E8F5]">{action.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ===== RECENT USERS TABLE ===== */}
      <motion.div variants={staggerItem}>
        <Card className="border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-[#0A1628] dark:text-[#E2E8F5]">
              <UserPlus className="h-5 w-5 text-[#C41E3A] dark:text-[#E74C5E]" />
              Nouvelles inscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#DCE6F0] dark:border-[#1B2B40]">
                      <th className="text-left py-2.5 px-3 stat-label">Joueur</th>
                      <th className="text-left py-2.5 px-3 stat-label hidden sm:table-cell">Email</th>
                      <th className="text-left py-2.5 px-3 stat-label">Étoiles</th>
                      <th className="text-left py-2.5 px-3 stat-label">Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((recentUser) => (
                      <tr
                        key={recentUser.id}
                        className="border-b border-[#DCE6F0]/50 dark:border-[#1B2B40]/50 hover:bg-[#F8FAFC] dark:hover:bg-[#0A111C] transition-colors"
                      >
                        <td className="py-2.5 px-3 font-medium text-sm text-[#0A1628] dark:text-[#E2E8F5]">
                          {recentUser.firstName} {recentUser.lastName}
                        </td>
                        <td className="py-2.5 px-3 text-sm text-[#5E7A9A] hidden sm:table-cell">{recentUser.email}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1 text-[#D4AF37]">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="scoreboard-text text-sm font-bold">{recentUser.stars}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-sm text-[#5E7A9A]">{getRelativeTime(recentUser.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#5E7A9A]">
                <Users className="h-10 w-10 mx-auto opacity-30 mb-3" />
                <p>Aucun nouvel utilisateur</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
