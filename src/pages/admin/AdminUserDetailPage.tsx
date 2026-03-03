import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Star,
  Shield,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  User,
  Bell,
  BellOff,
  Trophy,
  Target,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string | null;
  city: string | null;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  isEmailVerified: boolean;
  googleId: string | null;
  stars: number;
  showInLeaderboard: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  createdAt: string;
  updatedAt: string;
  activity: {
    quizAttempts: {
      id: string;
      score: number;
      starsEarned: number;
      completedAt: string;
      quiz: {
        id: string;
        title: string;
        difficulty: string;
        theme: { title: string };
      };
    }[];
    quizAttemptCount: number;
    avgScore: number;
    bestScore: number;
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getAvatarUrl(avatar: string | null) {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  return `https://res.cloudinary.com/dafmu8csh/${avatar}`;
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role !== 'ADMIN') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/users/${id}/detail`);
        setUserData(response.data);
      } catch {
        toast({ title: 'Erreur', description: 'Impossible de charger les détails de l\'utilisateur', variant: 'destructive' });
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, toast, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-[#C41E3A]" />
      </div>
    );
  }

  if (!userData) return null;

  const u = userData;
  const a = u.activity;

  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ScoreboardHeader with back button */}
      <motion.div variants={staggerItem} className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')} className="flex-shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <ScoreboardHeader
            title={`${u.firstName} ${u.lastName}`}
            subtitle="Profil complet et activité"
            icon={<User className="h-6 w-6" />}
            rightContent={
              <div className="flex items-center gap-2">
                {u.role === 'ADMIN' && (
                  <Badge className="bg-[#C41E3A] text-white text-xs border-0">
                    <Shield className="h-3 w-3 mr-1" />Admin
                  </Badge>
                )}
                {u.isEmailVerified ? (
                  <Badge variant="outline" className="border-[#3B82F6]/50 text-[#3B82F6] text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />Vérifié
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-[#C41E3A]/50 text-[#E74C5E] text-xs">
                    <XCircle className="h-3 w-3 mr-1" />Non vérifié
                  </Badge>
                )}
              </div>
            }
          />
        </div>
      </motion.div>

      {/* Pitch line separator */}
      <div className="pitch-line" />

      {/* Profile Card */}
      <motion.div variants={staggerItem}>
        <Card className="border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden bg-white dark:bg-[#0D1525]">
          <div className="bg-gradient-to-r from-[#C41E3A] via-[#9B1B30] to-[#C41E3A] h-24 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
          </div>
          <CardContent className="relative pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              <Avatar className="h-20 w-20 border-4 border-white dark:border-[#0D1525] shadow-lg">
                <AvatarImage src={getAvatarUrl(u.avatar)} />
                <AvatarFallback className="bg-gradient-to-br from-[#C41E3A] to-[#9B1B30] text-white text-xl font-bold">
                  {u.firstName[0]}{u.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-[#0A1628] dark:text-[#E2E8F5]">{u.firstName} {u.lastName}</h2>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-[#5E7A9A] flex-wrap">
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{u.email}</span>
                  {u.country && <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{u.country}</span>}
                  {u.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{u.city}</span>}
                </div>
              </div>
              <div className="text-right text-sm text-[#5E7A9A]">
                <p className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Inscrit le {formatDate(u.createdAt)}</p>
                <p className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />MAJ {formatDate(u.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pitch line separator */}
      <div className="pitch-line" />

      {/* Stats Overview */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Star, label: 'Étoiles', value: u.stars, color: 'text-[#D4AF37]', bg: 'from-[#D4AF37]/15 to-[#D4AF37]/5 dark:from-[#D4AF37]/25 dark:to-[#D4AF37]/10' },
          { icon: Target, label: 'Quiz tentés', value: a.quizAttemptCount, color: 'text-[#3B82F6]', bg: 'from-[#3B82F6]/15 to-[#3B82F6]/5 dark:from-[#3B82F6]/25 dark:to-[#3B82F6]/10' },
          { icon: TrendingUp, label: 'Score moyen', value: `${a.avgScore}%`, color: 'text-emerald-500', bg: 'from-emerald-500/15 to-emerald-500/5 dark:from-emerald-500/25 dark:to-emerald-500/10' },
          { icon: Trophy, label: 'Meilleur score', value: `${a.bestScore}%`, color: 'text-[#C41E3A] dark:text-[#E74C5E]', bg: 'from-[#C41E3A]/15 to-[#C41E3A]/5 dark:from-[#C41E3A]/25 dark:to-[#C41E3A]/10' },
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ y: -4, scale: 1.02 }}>
            <Card className="text-center border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525]">
              <CardContent className="pt-4 pb-3">
                <div className={cn('w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br', stat.bg)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
                <p className="text-2xl font-bold text-[#0A1628] dark:text-[#E2E8F5]">{stat.value}</p>
                <p className="text-xs text-[#5E7A9A]">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Pitch line separator */}
      <div className="pitch-line" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Details */}
        <motion.div variants={staggerItem}>
          <Card className="border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-[#0A1628] dark:text-[#E2E8F5]">
                <User className="h-5 w-5 text-[#C41E3A] dark:text-[#E74C5E]" />
                Informations détaillées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#111B2E]/50">
                  <div className="text-[#5E7A9A]">ID</div>
                  <div className="font-mono text-xs break-all text-[#0A1628] dark:text-[#E2E8F5]">{u.id}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg">
                  <div className="text-[#5E7A9A]">Connexion Google</div>
                  <div>{u.googleId ? <Badge variant="outline" className="text-xs border-[#3B82F6]/30 text-[#3B82F6]">Oui</Badge> : <span className="text-[#5E7A9A]">Non</span>}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#111B2E]/50">
                  <div className="text-[#5E7A9A]">Classement visible</div>
                  <div className="text-[#0A1628] dark:text-[#E2E8F5]">{u.showInLeaderboard ? 'Oui' : 'Non'}</div>
                </div>

                {/* Pitch line separator */}
                <div className="pitch-line my-1" />

                <div className="pt-2">
                  <p className="font-medium mb-2 flex items-center gap-1.5 text-[#0A1628] dark:text-[#E2E8F5]"><Bell className="h-4 w-4 text-[#D4AF37]" /> Notifications</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={u.emailNotifications ? 'default' : 'outline'} className={cn('text-xs', u.emailNotifications && 'bg-[#C41E3A] hover:bg-[#9B1B30]')}>
                      {u.emailNotifications ? <Bell className="h-3 w-3 mr-1" /> : <BellOff className="h-3 w-3 mr-1" />}
                      Email {u.emailNotifications ? 'activé' : 'désactivé'}
                    </Badge>
                    <Badge variant={u.pushNotifications ? 'default' : 'outline'} className={cn('text-xs', u.pushNotifications && 'bg-[#C41E3A] hover:bg-[#9B1B30]')}>
                      Push {u.pushNotifications ? 'activé' : 'désactivé'}
                    </Badge>
                    <Badge variant={u.marketingEmails ? 'default' : 'outline'} className={cn('text-xs', u.marketingEmails && 'bg-[#C41E3A] hover:bg-[#9B1B30]')}>
                      Marketing {u.marketingEmails ? 'activé' : 'désactivé'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Quiz Attempts */}
        <motion.div variants={staggerItem}>
          <Card className="border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2 text-[#0A1628] dark:text-[#E2E8F5]">
                  <Target className="h-5 w-5 text-[#C41E3A] dark:text-[#E74C5E]" />
                  Quiz récents
                </span>
                <Badge variant="secondary" className="text-xs">{a.quizAttemptCount} total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea>
                <div className="max-h-[350px] space-y-2">
                  {a.quizAttempts.length === 0 ? (
                    <p className="text-center text-sm text-[#5E7A9A] py-4">Aucun quiz tenté</p>
                  ) : (
                    a.quizAttempts.map((attempt) => (
                      <motion.div
                        key={attempt.id}
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                        className="flex items-center gap-3 p-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111B2E]/50 border border-transparent hover:border-[#DCE6F0] dark:hover:border-[#1B2B40]"
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold',
                          attempt.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : attempt.score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          {attempt.score}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[#0A1628] dark:text-[#E2E8F5]">{attempt.quiz.title}</p>
                          <p className="text-xs text-[#5E7A9A]">
                            {attempt.quiz.theme.title} -- {attempt.quiz.difficulty} -- {attempt.starsEarned} etoile(s)
                          </p>
                        </div>
                        <span className="text-xs text-[#5E7A9A] whitespace-nowrap">
                          {formatDateTime(attempt.completedAt)}
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pitch line separator */}
        <div className="pitch-line lg:col-span-2" />

        {/* Activity Summary */}
        <motion.div variants={staggerItem}>
          <Card className="border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-[#0A1628] dark:text-[#E2E8F5]">
                <FileText className="h-5 w-5 text-[#C41E3A] dark:text-[#E74C5E]" />
                Résumé d'activité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: Target, color: 'text-[#3B82F6]', bg: 'from-[#3B82F6]/15 to-[#3B82F6]/5 dark:from-[#3B82F6]/25 dark:to-[#3B82F6]/10', label: 'Quiz tentés', value: a.quizAttemptCount },
                  { icon: TrendingUp, color: 'text-emerald-500', bg: 'from-emerald-500/15 to-emerald-500/5 dark:from-emerald-500/25 dark:to-emerald-500/10', label: 'Score moyen', value: `${a.avgScore}%` },
                  { icon: Trophy, color: 'text-[#D4AF37]', bg: 'from-[#D4AF37]/15 to-[#D4AF37]/5 dark:from-[#D4AF37]/25 dark:to-[#D4AF37]/10', label: 'Meilleur score', value: `${a.bestScore}%` },
                  { icon: Star, color: 'text-[#D4AF37]', bg: 'from-[#D4AF37]/15 to-[#D4AF37]/5 dark:from-[#D4AF37]/25 dark:to-[#D4AF37]/10', label: 'Étoiles', value: u.stars },
                ].map((row) => (
                  <motion.div
                    key={row.label}
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#111B2E]/50 border border-transparent hover:border-[#DCE6F0] dark:hover:border-[#1B2B40]"
                  >
                    <span className="text-sm flex items-center gap-2 text-[#0A1628] dark:text-[#E2E8F5]">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br', row.bg)}>
                        <row.icon className={cn('h-4 w-4', row.color)} />
                      </div>
                      {row.label}
                    </span>
                    <span className="font-bold text-[#0A1628] dark:text-[#E2E8F5]">{row.value}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
