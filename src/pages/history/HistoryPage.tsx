import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  Trophy,
  Target,
  Star,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Filter,
  ChevronDown,
  Loader2,
  BarChart3,
  Swords,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/lib/animations';
import api from '@/lib/api';

interface QuizAttempt {
  id: string;
  quizId: string;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    difficulty: string;
    theme?: {
      title: string;
    };
  };
  score: number;
  starsEarned: number;
  completedAt: string;
}

interface Stats {
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  totalStars: number;
  averageScore: number;
  bestScore: number;
}

const difficultyColors: Record<string, string> = {
  FACILE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  MOYEN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DIFFICILE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

/* ---- Animated counter component ---- */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    if (isInView) {
      animate(motionVal, value, { duration: 1.2, ease: 'easeOut' });
    }
  }, [isInView, value, motionVal]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = `${v}${suffix}`;
      }
    });
    return unsubscribe;
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ---- Group attempts by date ---- */
function groupByDate(attempts: QuizAttempt[]): { label: string; date: string; items: QuizAttempt[] }[] {
  const groups = new Map<string, QuizAttempt[]>();

  for (const attempt of attempts) {
    const d = new Date(attempt.completedAt);
    const key = d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(attempt);
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return Array.from(groups.entries()).map(([key, items]) => {
    let label: string;
    if (key === fmt(today)) {
      label = "Aujourd'hui";
    } else if (key === fmt(yesterday)) {
      label = 'Hier';
    } else {
      const d = new Date(items[0].completedAt);
      label = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }
    return { label, date: key, items };
  });
}

export function HistoryPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [filteredAttempts, setFilteredAttempts] = useState<QuizAttempt[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get('/quizzes/attempts');
        const attemptsData = response.data;

        setAttempts(attemptsData);

        // Calculate stats
        const passed = attemptsData.filter((a: QuizAttempt) => a.score >= a.quiz.passingScore);
        const failed = attemptsData.filter((a: QuizAttempt) => a.score < a.quiz.passingScore);
        const totalStars = attemptsData.reduce((sum: number, a: QuizAttempt) => sum + a.starsEarned, 0);
        const totalScore = attemptsData.reduce((sum: number, a: QuizAttempt) => sum + a.score, 0);
        const bestScore = attemptsData.length > 0 ? Math.max(...attemptsData.map((a: QuizAttempt) => a.score)) : 0;

        setStats({
          totalAttempts: attemptsData.length,
          passedAttempts: passed.length,
          failedAttempts: failed.length,
          totalStars,
          averageScore: attemptsData.length > 0 ? Math.round(totalScore / attemptsData.length) : 0,
          bestScore,
        });
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredAttempts(attempts);
    } else if (filter === 'passed') {
      setFilteredAttempts(attempts.filter(a => a.score >= a.quiz.passingScore));
    } else {
      setFilteredAttempts(attempts.filter(a => a.score < a.quiz.passingScore));
    }
  }, [filter, attempts]);

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const winRate = stats && stats.totalAttempts > 0
    ? Math.round((stats.passedAttempts / stats.totalAttempts) * 100)
    : 0;

  const dateGroups = groupByDate(filteredAttempts);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C41E3A] via-[#D4AF37] to-[#5E7A9A] blur-xl opacity-30 animate-pulse" />
          <Loader2 className="h-16 w-16 animate-spin text-[#C41E3A] dark:text-[#E74C5E] relative" />
        </div>
        <p className="mt-4 text-[#5E7A9A] dark:text-[#5E7A9A]">Chargement du palmares...</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer(0.06)}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl"
    >
      {/* ===== SCOREBOARD HEADER ===== */}
      <motion.div variants={staggerItem}>
        <ScoreboardHeader
          title="Palmares"
          subtitle="Votre tableau d'honneur -- Tous vos matchs"
          icon={<Trophy className="h-6 w-6" />}
          rightContent={
            stats && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-lg px-2.5 py-1">
                  <Star className="h-3.5 w-3.5 text-[#D4AF37] fill-current" />
                  <span className="text-sm font-black text-[#D4AF37] tabular-nums">{stats.totalStars}</span>
                </div>
              </div>
            )
          }
        />
      </motion.div>

      {/* ===== POST-MATCH SCOREBOARD STATS ===== */}
      {stats && (
        <motion.div variants={staggerItem}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A1628] via-[#0D1D35] to-[#0A1628] dark:from-[#050810] dark:via-[#07090F] dark:to-[#050810] border border-[#1B2B40] p-5">
            {/* Subtle field line pattern */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-white" />
            </div>

            {/* Main stats grid - TV scoreboard layout */}
            <div className="relative z-10">
              {/* Top row: W / D / L style */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {/* Wins */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/15 mb-1.5">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 tabular-nums">
                    <AnimatedCounter value={stats.passedAttempts} />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mt-0.5">Victoires</div>
                </div>

                {/* Total Matches */}
                <div className="text-center border-x border-white/10 px-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 mb-1.5">
                    <Swords className="h-5 w-5 text-white/70" />
                  </div>
                  <div className="text-2xl font-black text-white tabular-nums">
                    <AnimatedCounter value={stats.totalAttempts} />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mt-0.5">Matchs</div>
                </div>

                {/* Losses */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-500/15 mb-1.5">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="text-2xl font-black text-red-400 tabular-nums">
                    <AnimatedCounter value={stats.failedAttempts} />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mt-0.5">Defaites</div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

              {/* Bottom row: Secondary stats */}
              <div className="grid grid-cols-3 gap-3">
                {/* Win rate */}
                <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E74C5E]/15 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-[#E74C5E]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-black text-white tabular-nums leading-tight">
                      <AnimatedCounter value={winRate} suffix="%" />
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-white/35 font-medium">Win rate</div>
                  </div>
                </div>

                {/* Average */}
                <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center">
                    <Target className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-black text-white tabular-nums leading-tight">
                      <AnimatedCounter value={stats.averageScore} suffix="%" />
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-white/35 font-medium">Moyenne</div>
                  </div>
                </div>

                {/* Best score */}
                <div className="flex items-center gap-2.5 bg-white/5 rounded-xl px-3 py-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#D4AF37]/15 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-[#D4AF37]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-black text-white tabular-nums leading-tight">
                      <AnimatedCounter value={stats.bestScore} suffix="%" />
                    </div>
                    <div className="text-[9px] uppercase tracking-wider text-white/35 font-medium">Record</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== FILTER + MATCH LIST ===== */}
      <motion.div variants={staggerItem} className="space-y-4">
        {/* Filter header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0A1628] dark:text-[#E2E8F5] flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#5E7A9A]" />
            Resultats
            {filteredAttempts.length > 0 && (
              <span className="text-xs font-medium text-[#5E7A9A] bg-[#5E7A9A]/10 rounded-full px-2 py-0.5 tabular-nums">
                {filteredAttempts.length}
              </span>
            )}
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40]">
                <Filter className="h-3.5 w-3.5" />
                {filter === 'all' ? 'Tous' : filter === 'passed' ? 'Victoires' : 'Defaites'}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => setFilter('all')}>
                Tous les resultats
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('passed')}>
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                Victoires
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('failed')}>
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Defaites
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {filteredAttempts.length === 0 ? (
          <motion.div
            variants={staggerItem}
            className="text-center py-16 bg-white dark:bg-[#0D1525] border border-[#DCE6F0] dark:border-[#1B2B40] rounded-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#C41E3A]/10 dark:bg-[#E74C5E]/10 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-[#C41E3A] dark:text-[#E74C5E]" />
            </div>
            <h3 className="text-base font-bold text-[#0A1628] dark:text-[#E2E8F5] mb-1">
              {filter === 'all' ? 'Aucun match joue' : filter === 'passed' ? 'Aucune victoire encore' : 'Aucune defaite. Bravo !'}
            </h3>
            <p className="text-sm text-[#5E7A9A] mb-5">
              {filter === 'all' ? "Commencez a jouer pour remplir votre palmares" : ""}
            </p>
            <Link to="/quizzes">
              <Button className="bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] text-white dark:text-black rounded-xl gap-2">
                Decouvrir les quiz
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer(0.04)}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {dateGroups.map((group) => (
              <motion.div key={group.date} variants={staggerItem} className="space-y-2">
                {/* Date section header */}
                <div className="flex items-center gap-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5E7A9A]">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-[#DCE6F0] dark:bg-[#1B2B40]" />
                  <span className="text-[10px] text-[#5E7A9A] tabular-nums">
                    {group.items.length} match{group.items.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Match cards for this date */}
                <div className="space-y-2">
                  {group.items.map((attempt) => {
                    const passed = attempt.score >= attempt.quiz.passingScore;
                    return (
                      <motion.div
                        key={attempt.id}
                        variants={staggerItem}
                        whileHover={{ x: 6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                      >
                        <Link to={`/quizzes/${attempt.quizId}`}>
                          <div className={cn(
                            'group relative flex items-center gap-3 p-3.5 rounded-2xl',
                            'border border-[#DCE6F0] dark:border-[#1B2B40]',
                            'bg-white dark:bg-[#0D1525]',
                            'transition-shadow hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
                            'border-l-[4px]',
                            passed ? 'border-l-emerald-500' : 'border-l-red-500'
                          )}>
                            {/* Result badge */}
                            <div className={cn(
                              'flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center',
                              passed
                                ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                                : 'bg-red-500/10 dark:bg-red-500/15'
                            )}>
                              {passed ? (
                                <Trophy className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                            </div>

                            {/* Quiz info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#0A1628] dark:text-[#E2E8F5] truncate leading-tight">
                                {attempt.quiz.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {attempt.quiz.theme && (
                                  <span className="text-[11px] text-[#5E7A9A] truncate max-w-[120px]">
                                    {attempt.quiz.theme.title}
                                  </span>
                                )}
                                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', difficultyColors[attempt.quiz.difficulty])}>
                                  {attempt.quiz.difficulty}
                                </span>
                                <span className="text-[10px] text-[#5E7A9A] flex items-center gap-0.5">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {getRelativeTime(attempt.completedAt)}
                                </span>
                              </div>
                            </div>

                            {/* Score + Stars */}
                            <div className="flex-shrink-0 flex items-center gap-2.5">
                              <div className="text-right">
                                <span className={cn(
                                  'text-xl font-black tabular-nums block leading-tight',
                                  passed ? 'text-emerald-500' : 'text-red-500'
                                )}>
                                  {attempt.score}%
                                </span>
                                {passed && (
                                  <span className="text-[9px] uppercase tracking-wider text-emerald-500/60 font-bold">
                                    Victoire
                                  </span>
                                )}
                              </div>
                              {attempt.starsEarned > 0 && (
                                <div className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                                  <Star className="h-3.5 w-3.5 text-[#D4AF37] fill-current" />
                                  <span className="text-xs font-black text-[#D4AF37]">+{attempt.starsEarned}</span>
                                </div>
                              )}
                              <ChevronRight className="h-4 w-4 text-[#5E7A9A]/40 group-hover:text-[#5E7A9A] transition-colors" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
