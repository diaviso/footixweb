import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Target,
  Star,
  Play,
  Edit,
  Trash2,
  Loader2,
  Sparkles,
  Wand2,
  CheckCircle,
  XCircle,
  RotateCcw,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { MatchCard } from '@/components/ui/match-card';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { MiniEditor } from '@/components/editor/MiniEditor';
import { staggerContainer, staggerItem } from '@/lib/animations';
import type { Theme } from '@/types';

interface UserStatus {
  isUnlocked: boolean;
  requiredStars: number;
  hasPassed: boolean;
  isCompleted: boolean;
  remainingAttempts: number;
  totalAttempts: number;
  bestScore: number | null;
  canPurchaseAttempt: boolean;
  extraAttemptCost: number;
}

interface QuizWithCount {
  id: string;
  themeId: string;
  title: string;
  description: string;
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  timeLimit: number;
  passingScore: number;
  requiredStars: number;
  isFree: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  theme?: { id: string; title: string };
  _count?: { questions: number };
  userStatus?: UserStatus;
}

export function QuizzesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [quizzes, setQuizzes] = useState<QuizWithCount[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterTheme, setFilterTheme] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizWithCount | null>(null);
  const [aiFormData, setAiFormData] = useState({
    themeId: '',
    difficulty: 'MOYEN' as 'FACILE' | 'MOYEN' | 'DIFFICILE',
    numberOfQuestions: 5,
    instructions: '',
  });
  const [formData, setFormData] = useState({
    themeId: '',
    title: '',
    description: '',
    difficulty: 'FACILE' as 'FACILE' | 'MOYEN' | 'DIFFICILE',
    timeLimit: 30,
    passingScore: 70,
    isFree: true,
  });

  const fetchData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const quizzesPromise = user ? api.get('/quizzes/with-status') : api.get('/quizzes');
      const [quizzesRes, themesRes] = await Promise.all([
        quizzesPromise,
        api.get(isAdmin ? '/themes' : '/themes?active=true'),
      ]);
      const quizzesData = Array.isArray(quizzesRes.data) ? quizzesRes.data : quizzesRes.data.data;
      setQuizzes(quizzesData);
      setThemes(themesRes.data);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenDialog = (quiz?: QuizWithCount) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        themeId: quiz.themeId,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        isFree: quiz.isFree,
      });
    } else {
      setEditingQuiz(null);
      setFormData({ themeId: themes[0]?.id || '', title: '', description: '', difficulty: 'FACILE', timeLimit: 30, passingScore: 70, isFree: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingQuiz) {
        await api.patch(`/quizzes/${editingQuiz.id}`, formData);
        toast({ title: 'Quiz modifié avec succès' });
      } else {
        await api.post('/quizzes', formData);
        toast({ title: 'Quiz créé avec succès' });
      }
      setIsDialogOpen(false);
      fetchData(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({ title: 'Erreur', description: err.response?.data?.message || 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce quiz ?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      toast({ title: 'Quiz supprimé avec succès' });
      fetchData(false);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer le quiz', variant: 'destructive' });
    }
  };

  const handleOpenAIDialog = () => {
    setAiFormData({ themeId: themes[0]?.id || '', difficulty: 'MOYEN', numberOfQuestions: 5, instructions: '' });
    setIsAIDialogOpen(true);
  };

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiFormData.themeId) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un thème', variant: 'destructive' });
      return;
    }
    setIsGenerating(true);
    try {
      const response = await api.post('/quizzes/generate', aiFormData);
      toast({ title: 'Quiz généré avec succès !', description: `Le quiz "${response.data.title}" a été créé avec ${response.data.questions?.length || 0} questions.` });
      setIsAIDialogOpen(false);
      fetchData(false);
      navigate(`/quizzes/${response.data.id}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({ title: 'Erreur de génération', description: err.response?.data?.message || 'Impossible de générer le quiz.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || quiz.title.toLowerCase().includes(searchLower) || (quiz.description || '').toLowerCase().includes(searchLower);
    const matchesDifficulty = !filterDifficulty || quiz.difficulty === filterDifficulty;
    const matchesTheme = !filterTheme || quiz.themeId === filterTheme;
    return matchesSearch && matchesDifficulty && matchesTheme;
  });

  // All quizzes go into the same grid — no featured card separation
  const restQuizzes = filteredQuizzes;

  return (
    <div className="space-y-6">
      {/* Scoreboard Header */}
      <ScoreboardHeader
        title="Centre d'Entrainement"
        subtitle="Testez vos connaissances football"
        icon={<Target className="h-6 w-6" />}
        rightContent={
          isAdmin && (
            <div className="flex gap-2">
              <Button onClick={handleOpenAIDialog} size="sm" variant="outline" className="gap-1.5 border-[#1B2B40] text-white/60 hover:text-white hover:bg-white/5">
                <Wand2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">IA</span>
                <Sparkles className="h-3 w-3 text-[#D4AF37]" />
              </Button>
              <Button onClick={() => handleOpenDialog()} size="sm" className="gap-1.5 bg-[#E74C5E] hover:bg-[#D43B4F] text-black font-bold">
                <Plus className="h-3.5 w-3.5" /> Nouveau
              </Button>
            </div>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un quiz..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <select
            className="h-10 rounded-xl border-2 border-input bg-background px-3 text-sm min-w-[180px]"
            value={filterTheme}
            onChange={(e) => setFilterTheme(e.target.value)}
          >
            <option value="">Tous les thèmes</option>
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id}>{theme.title}</option>
            ))}
          </select>
        </div>
        {/* Difficulty filter — badge-style buttons with glow */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: '', label: 'Tous', color: '#5E7A9A' },
            { key: 'FACILE', label: 'Facile', color: '#3B82F6' },
            { key: 'MOYEN', label: 'Moyen', color: '#D4AF37' },
            { key: 'DIFFICILE', label: 'Difficile', color: '#EF4444' },
          ].map((d) => (
            <button
              key={d.key}
              onClick={() => setFilterDifficulty(d.key)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all',
                filterDifficulty === d.key
                  ? 'text-white border-transparent shadow-lg'
                  : 'text-[#5E7A9A] border-[#DCE6F0] dark:border-[#1B2B40] bg-transparent hover:border-current',
              )}
              style={filterDifficulty === d.key ? { backgroundColor: d.color, boxShadow: `0 4px 14px ${d.color}40` } : undefined}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} className="text-4xl mb-3">⚽</motion.div>
          <p className="text-[#5E7A9A] text-sm">Chargement des quiz...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#0D1525] rounded-2xl border border-dashed border-[#DCE6F0] dark:border-[#1B2B40]">
          <div className="text-4xl mb-3">⚽</div>
          <p className="text-lg font-medium text-[#0A1628] dark:text-[#E2E8F5]">Aucun quiz trouvé</p>
          <p className="text-[#5E7A9A]">{searchQuery ? 'Essayez une autre recherche' : 'Commencez par créer un quiz'}</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="visible" className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {restQuizzes.map((quiz) => {
              const status = quiz.userStatus;
              const isLocked = status && !status.isUnlocked;
              const hasPassed = status?.hasPassed;
              const isPremiumValid = user?.isPremium && (!user?.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date());
              const needsPremium = !quiz.isFree && !isPremiumValid && !isAdmin;

              return (
                <motion.div key={quiz.id} variants={staggerItem}>
                  <MatchCard
                    title={quiz.title}
                    subtitle={quiz.theme?.title}
                    difficulty={quiz.difficulty}
                    score={status?.bestScore}
                    timeLimit={quiz.timeLimit}
                    passingScore={quiz.passingScore}
                    questionCount={quiz._count?.questions || 0}
                    isPremium={needsPremium}
                    isLocked={!!isLocked}
                    isPassed={hasPassed}
                    onClick={() => {
                      if (needsPremium) navigate('/premium');
                      else navigate(`/quizzes/${quiz.id}`);
                    }}
                  >
                    {/* Status info */}
                    {status && !isLocked && !needsPremium && (
                      <div className="flex items-center justify-between text-[10px] mt-3 px-2 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-[#0A111C]">
                        {hasPassed ? (
                          <>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" /> Réussi · {status.bestScore}%
                            </span>
                          </>
                        ) : status?.isCompleted ? (
                          <>
                            <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                              <XCircle className="h-3 w-3" /> {status.bestScore}%
                            </span>
                            <span className="text-[#5E7A9A]">0 tentative</span>
                          </>
                        ) : (
                          <>
                            {status?.bestScore !== null && <span className="text-[#5E7A9A]">Meilleur: {status.bestScore}%</span>}
                            <span className="text-[#C41E3A] dark:text-[#E74C5E] font-medium">
                              {status?.remainingAttempts} tentative{(status?.remainingAttempts || 0) > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Action button */}
                    <div className="mt-3">
                      {needsPremium ? (
                        <Button size="sm" className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C9A030] hover:from-[#C9A030] hover:to-[#D4AF37] text-white text-xs" onClick={(e) => { e.stopPropagation(); navigate('/premium'); }}>
                          <Crown className="mr-1.5 h-3.5 w-3.5" /> Premium
                        </Button>
                      ) : status?.canPurchaseAttempt ? (
                        <Button size="sm" variant="outline" className="w-full text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/quizzes/${quiz.id}`); }}>
                          <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Acheter ({status?.extraAttemptCost} <Star className="h-3 w-3 inline" />)
                        </Button>
                      ) : hasPassed ? (
                        <Button size="sm" variant="outline" className="w-full text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/quizzes/${quiz.id}`); }}>
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Voir
                        </Button>
                      ) : (
                        <Button size="sm" variant="gradient" className="w-full text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/quizzes/${quiz.id}`); }} disabled={!!isLocked}>
                          <Play className="mr-1.5 h-3.5 w-3.5" /> {status?.totalAttempts ? 'Continuer' : 'Jouer'}
                        </Button>
                      )}
                    </div>

                    {/* Admin controls */}
                    {isAdmin && (
                      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleOpenDialog(quiz); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(quiz.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </MatchCard>
                </motion.div>
              );
            })}
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Modifier le quiz' : 'Nouveau quiz'}</DialogTitle>
            <DialogDescription>{editingQuiz ? 'Modifiez les informations du quiz' : 'Créez un nouveau quiz interactif'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="themeId">Thème</Label>
                <select id="themeId" className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm" value={formData.themeId} onChange={(e) => setFormData({ ...formData, themeId: e.target.value })} required>
                  <option value="">Sélectionner un thème</option>
                  {themes.map((theme) => (<option key={theme.id} value={theme.id}>{theme.title}</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Coupe du Monde 2022" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <MiniEditor content={formData.description} onChange={(content) => setFormData({ ...formData, description: content })} placeholder="Description du quiz..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <select id="difficulty" className="flex h-11 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}>
                    <option value="FACILE">Facile</option>
                    <option value="MOYEN">Moyen</option>
                    <option value="DIFFICILE">Difficile</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Temps (min)</Label>
                  <Input id="timeLimit" type="number" min="1" value={formData.timeLimit} onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Score requis (%)</Label>
                  <Input id="passingScore" type="number" min="0" max="100" value={formData.passingScore} onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant={formData.isFree ? 'default' : 'outline'} size="sm" onClick={() => setFormData({ ...formData, isFree: true })}>Gratuit</Button>
                    <Button type="button" variant={!formData.isFree ? 'default' : 'outline'} size="sm" onClick={() => setFormData({ ...formData, isFree: false })}>Premium</Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit" variant="gradient" disabled={isSubmitting}>
                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />{editingQuiz ? 'Modification...' : 'Création...'}</>) : editingQuiz ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Generation Dialog */}
      <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#C41E3A] to-[#D4AF37]">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              Générer un quiz par IA
            </DialogTitle>
            <DialogDescription>L'IA va créer un quiz complet avec des questions football pertinentes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerateQuiz}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ai-themeId">Thème *</Label>
                <select id="ai-themeId" className="flex h-11 w-full rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#07090F] text-[#0A1628] dark:text-[#EFF3F7] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C41E3A]/20 focus:border-[#C41E3A]/30" value={aiFormData.themeId} onChange={(e) => setAiFormData({ ...aiFormData, themeId: e.target.value })} required disabled={isGenerating}>
                  <option value="">Sélectionner un thème</option>
                  {themes.map((theme) => (<option key={theme.id} value={theme.id}>{theme.title}</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-difficulty">Difficulté</Label>
                  <select id="ai-difficulty" className="flex h-11 w-full rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#07090F] text-[#0A1628] dark:text-[#EFF3F7] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C41E3A]/20 focus:border-[#C41E3A]/30" value={aiFormData.difficulty} onChange={(e) => setAiFormData({ ...aiFormData, difficulty: e.target.value as any })} disabled={isGenerating}>
                    <option value="FACILE">Facile</option>
                    <option value="MOYEN">Moyen</option>
                    <option value="DIFFICILE">Difficile</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-questions">Nb. questions</Label>
                  <Input id="ai-questions" type="number" min="3" max="20" value={aiFormData.numberOfQuestions} onChange={(e) => setAiFormData({ ...aiFormData, numberOfQuestions: parseInt(e.target.value) || 5 })} disabled={isGenerating} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-instructions">Instructions <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
                <textarea id="ai-instructions" className="flex min-h-[80px] w-full rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#07090F] text-[#0A1628] dark:text-[#EFF3F7] px-4 py-3 text-sm placeholder:text-[#5E7A9A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C41E3A]/20 focus-visible:border-[#C41E3A]/30 resize-none" value={aiFormData.instructions} onChange={(e) => setAiFormData({ ...aiFormData, instructions: e.target.value })} placeholder="Ex: Inclure des questions sur les finales, se concentrer sur les joueurs historiques..." disabled={isGenerating} />
              </div>

              {/* Generation animation */}
              {isGenerating && (
                <div className="p-4 rounded-xl bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5 border border-[#C41E3A]/20">
                  <div className="flex items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="text-2xl">⚽</motion.div>
                    <div>
                      <p className="text-sm font-bold text-[#C41E3A] dark:text-[#E74C5E]">Génération en cours...</p>
                      <p className="text-xs text-[#5E7A9A]">L'IA prépare vos questions football</p>
                    </div>
                  </div>
                </div>
              )}

              {!isGenerating && (
                <div className="p-3 rounded-lg bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5 border border-[#C41E3A]/10">
                  <div className="flex gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <p className="text-[#5E7A9A] text-xs">
                      <span className="font-medium text-[#C41E3A] dark:text-[#E74C5E]">Info :</span>{' '}
                      Questions variées (QCU, QCM, Vrai/Faux) avec 2 à 4 réponses possibles.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAIDialogOpen(false)} disabled={isGenerating}>Annuler</Button>
              <Button type="submit" disabled={isGenerating || !aiFormData.themeId} className="bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] text-white hover:opacity-90">
                {isGenerating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Génération...</>) : (<><Wand2 className="mr-2 h-4 w-4" />Générer</>)}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
