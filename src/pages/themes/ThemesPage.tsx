import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Play,
  Clock,
  Target,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Trophy,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MiniEditor } from '@/components/editor/MiniEditor';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { staggerContainer, staggerItem } from '@/lib/animations';
import api from '@/lib/api';
import type { Theme, Quiz } from '@/types';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'FACILE':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'MOYEN':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'DIFFICILE':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

/** Returns the left accent band color for podium positions */
const getPodiumAccent = (position: number) => {
  switch (position) {
    case 1:
      return 'border-l-[#D4AF37]'; // Gold
    case 2:
      return 'border-l-[#C0C0C0]'; // Silver
    case 3:
      return 'border-l-[#CD7F32]'; // Bronze
    default:
      return 'border-l-transparent';
  }
};

/** Badge/shield background for podium positions */
const getBadgeBg = (position: number) => {
  switch (position) {
    case 1:
      return 'bg-gradient-to-br from-[#D4AF37] to-[#B8960F] text-white shadow-[0_0_12px_rgba(212,175,55,0.4)]';
    case 2:
      return 'bg-gradient-to-br from-[#C0C0C0] to-[#A0A0A0] text-white shadow-[0_0_12px_rgba(192,192,192,0.3)]';
    case 3:
      return 'bg-gradient-to-br from-[#CD7F32] to-[#A0612B] text-white shadow-[0_0_12px_rgba(205,127,50,0.3)]';
    default:
      return 'bg-[#0A1628] dark:bg-[#1B2B40] text-white';
  }
};

export function ThemesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: 0,
    isActive: true,
  });

  const fetchThemes = async () => {
    try {
      const response = await api.get(isAdmin ? '/themes' : '/themes?active=true');
      setThemes(response.data);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les thèmes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const handleOpenDialog = (theme?: Theme) => {
    if (theme) {
      setEditingTheme(theme);
      setFormData({
        title: theme.title,
        description: theme.description,
        position: theme.position,
        isActive: theme.isActive ?? true,
      });
    } else {
      setEditingTheme(null);
      setFormData({
        title: '',
        description: '',
        position: themes.length + 1,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTheme) {
        await api.patch(`/themes/${editingTheme.id}`, formData);
        toast({ title: 'Thème modifié avec succès' });
      } else {
        await api.post('/themes', formData);
        toast({ title: 'Thème créé avec succès' });
      }
      setIsDialogOpen(false);
      fetchThemes();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce thème ?')) return;

    try {
      await api.delete(`/themes/${id}`);
      toast({ title: 'Thème supprimé avec succès' });
      fetchThemes();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le thème',
        variant: 'destructive',
      });
    }
  };

  const toggleThemeActive = async (theme: Theme) => {
    try {
      await api.patch(`/themes/${theme.id}`, { isActive: !theme.isActive });
      toast({
        title: theme.isActive ? 'Thème désactivé' : 'Thème activé',
        description: `Le thème "${theme.title}" a été ${theme.isActive ? 'désactivé' : 'activé'}`,
      });
      fetchThemes();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut du thème',
        variant: 'destructive',
      });
    }
  };

  const moveQuiz = async (themeId: string, quizIndex: number, direction: 'up' | 'down') => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme?.quizzes) return;
    const quizzes = [...theme.quizzes];
    const newIndex = direction === 'up' ? quizIndex - 1 : quizIndex + 1;
    if (newIndex < 0 || newIndex >= quizzes.length) return;
    // Swap
    [quizzes[quizIndex], quizzes[newIndex]] = [quizzes[newIndex], quizzes[quizIndex]];
    const quizIds = quizzes.map(q => q.id);
    try {
      await api.patch(`/themes/${themeId}/reorder-quizzes`, { quizIds });
      toast({ title: 'Ordre des quiz mis à jour' });
      fetchThemes();
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de réordonner les quiz', variant: 'destructive' });
    }
  };

  const toggleQuizActive = async (quiz: Quiz) => {
    try {
      await api.patch(`/quizzes/${quiz.id}`, { isActive: !quiz.isActive });
      toast({
        title: quiz.isActive ? 'Quiz désactivé' : 'Quiz activé',
        description: `Le quiz "${quiz.title}" a été ${quiz.isActive ? 'désactivé' : 'activé'}`,
      });
      fetchThemes();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut du quiz',
        variant: 'destructive',
      });
    }
  };

  const toggleExpanded = (themeId: string) => {
    setExpandedThemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(themeId)) {
        newSet.delete(themeId);
      } else {
        newSet.add(themeId);
      }
      return newSet;
    });
  };

  const filteredThemes = themes.filter(
    (theme) =>
      theme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      theme.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Scoreboard Header */}
      <ScoreboardHeader
        title="Championnat"
        subtitle={isAdmin ? 'Gestion des thèmes de quiz football' : 'Explorez les thèmes de quiz football'}
        icon={<Trophy className="h-6 w-6" />}
        rightContent={
          isAdmin ? (
            <Button onClick={() => handleOpenDialog()} variant="gradient" size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Nouveau thème
            </Button>
          ) : undefined
        }
      />

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un thème..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* League Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] flex flex-col items-center justify-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-bold text-[#0A1628] dark:text-[#E2E8F5]">Aucun thème trouvé</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? 'Essayez une autre recherche' : 'Commencez par créer un thème'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden bg-white dark:bg-[#0D1525] shadow-sm">
          {/* Table Header */}
          <div className="bg-[#0A1628] dark:bg-[#050810] px-4 py-3 flex items-center gap-4 text-[10px] uppercase tracking-[0.15em] font-bold text-white/50">
            <span className="w-10 text-center">#</span>
            <span className="flex-1">Club / Thème</span>
            <span className="w-16 text-center hidden sm:block">Quiz</span>
            <span className="w-16 text-center hidden sm:block">Statut</span>
            <span className="w-24 text-right shrink-0">Actions</span>
          </div>

          {/* League Rows */}
          <motion.div
            variants={staggerContainer(0.06)}
            initial="hidden"
            animate="visible"
          >
            {filteredThemes.map((theme, index) => {
              const pos = theme.position;
              const isTop3 = pos >= 1 && pos <= 3;
              const isExpanded = expandedThemes.has(theme.id);

              return (
                <motion.div key={theme.id} variants={staggerItem}>
                  {/* Row */}
                  <div
                    className={[
                      'group relative border-l-4 transition-all duration-200',
                      getPodiumAccent(pos),
                      !theme.isActive ? 'opacity-50' : '',
                      index !== filteredThemes.length - 1
                        ? 'border-b border-[#DCE6F0] dark:border-[#1B2B40]'
                        : '',
                      'hover:bg-[#FDF2F3] dark:hover:bg-[#111B2E]',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-4 px-4 py-3">
                      {/* Position Badge (ecusson) */}
                      <div
                        className={[
                          'relative flex-shrink-0 w-10 h-10 flex items-center justify-center font-black text-sm',
                          isTop3 ? 'rounded-none' : 'rounded-full',
                          getBadgeBg(pos),
                        ].join(' ')}
                        style={isTop3 ? {
                          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        } : undefined}
                      >
                        {pos}
                      </div>

                      {/* Theme Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-sm sm:text-base text-[#0A1628] dark:text-[#E2E8F5] truncate">
                            {theme.title}
                          </h3>
                          {!theme.isActive && (
                            <Badge variant="secondary" className="text-[10px]">Inactif</Badge>
                          )}
                          {isTop3 && theme.isActive && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#D4AF37]">
                              <Shield className="h-3 w-3" />
                              {pos === 1 ? 'Champion' : pos === 2 ? 'Vice-champion' : 'Podium'}
                            </span>
                          )}
                        </div>
                        <div
                          className="text-xs text-[#5E7A9A] mt-0.5 line-clamp-1 prose prose-sm dark:prose-invert max-w-none [&>*]:m-0 [&>*]:text-xs [&>*]:text-[#5E7A9A]"
                          dangerouslySetInnerHTML={{ __html: theme.description }}
                        />
                      </div>

                      {/* Quiz Count */}
                      <div className="w-16 text-center hidden sm:flex flex-col items-center">
                        <span className="text-base font-black text-[#0A1628] dark:text-[#E2E8F5]">
                          {theme.quizzes?.length || 0}
                        </span>
                        <span className="text-[10px] text-[#5E7A9A]">quiz</span>
                      </div>

                      {/* Status */}
                      <div className="w-16 text-center hidden sm:flex justify-center">
                        {isAdmin ? (
                          <Switch
                            checked={theme.isActive ?? true}
                            onCheckedChange={() => toggleThemeActive(theme)}
                          />
                        ) : (
                          <span className={`inline-block w-2 h-2 rounded-full ${theme.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                        )}
                      </div>

                      {/* Actions */}
                      <div className="w-24 flex items-center justify-end gap-1 shrink-0">
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[#5E7A9A] hover:text-[#C41E3A]"
                              onClick={() => handleOpenDialog(theme)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-[#5E7A9A] hover:text-destructive"
                              onClick={() => handleDelete(theme.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleExpanded(theme.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded: Horizontal Scrollable Quiz Band */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[#DCE6F0] dark:border-[#1B2B40] bg-[#F8FAFC] dark:bg-[#0A111C] px-4 py-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5E7A9A] mb-3 flex items-center gap-1.5">
                              <BookOpen className="h-3 w-3" />
                              Matchs disponibles
                            </h4>

                            {theme.quizzes && theme.quizzes.length > 0 ? (
                              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#DCE6F0] dark:scrollbar-thumb-[#1B2B40] scrollbar-track-transparent">
                                {theme.quizzes.map((quiz, quizIndex) => (
                                  <div
                                    key={quiz.id}
                                    className={[
                                      'relative flex-shrink-0 w-56 rounded-xl border border-[#DCE6F0] dark:border-[#1B2B40]',
                                      'bg-white dark:bg-[#0D1525] hover:shadow-md transition-all duration-200',
                                      'hover:border-[#C41E3A]/30 dark:hover:border-[#E74C5E]/30',
                                      !quiz.isActive ? 'opacity-50' : '',
                                    ].join(' ')}
                                  >
                                    {/* Quiz card top accent */}
                                    <div className="h-1 rounded-t-xl bg-gradient-to-r from-[#C41E3A] to-[#D4AF37]" />

                                    <div className="p-3">
                                      {/* Admin reorder / active toggle row */}
                                      {isAdmin && (
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => moveQuiz(theme.id, quizIndex, 'up')}
                                              disabled={quizIndex === 0}
                                              className="p-0.5 rounded hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E] disabled:opacity-30"
                                            >
                                              <ArrowUp className="h-3 w-3" />
                                            </button>
                                            <GripVertical className="h-3 w-3 text-[#5E7A9A]" />
                                            <button
                                              onClick={() => moveQuiz(theme.id, quizIndex, 'down')}
                                              disabled={quizIndex === (theme.quizzes?.length ?? 0) - 1}
                                              className="p-0.5 rounded hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E] disabled:opacity-30"
                                            >
                                              <ArrowDown className="h-3 w-3" />
                                            </button>
                                          </div>
                                          <Switch
                                            checked={quiz.isActive ?? true}
                                            onCheckedChange={() => toggleQuizActive(quiz)}
                                          />
                                        </div>
                                      )}

                                      {/* Quiz title */}
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <h5 className="font-bold text-sm text-[#0A1628] dark:text-[#E2E8F5] truncate">
                                          {quiz.title}
                                        </h5>
                                        {!quiz.isActive && (
                                          <Badge variant="secondary" className="text-[9px] shrink-0">Off</Badge>
                                        )}
                                      </div>

                                      {/* Stats row */}
                                      <div className="flex items-center gap-2 flex-wrap mb-3">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                                          {quiz.difficulty}
                                        </span>
                                        <span className="text-[10px] text-[#5E7A9A] flex items-center gap-0.5">
                                          <Clock className="h-2.5 w-2.5" />{quiz.timeLimit}min
                                        </span>
                                        <span className="text-[10px] text-[#5E7A9A] flex items-center gap-0.5">
                                          <Target className="h-2.5 w-2.5" />{quiz.passingScore}%
                                        </span>
                                        {quiz.isFree && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#C41E3A]/10 text-[#C41E3A] dark:text-[#E74C5E]">
                                            Gratuit
                                          </span>
                                        )}
                                      </div>

                                      {/* Play button */}
                                      <Button
                                        size="sm"
                                        className="w-full h-8 rounded-lg bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] text-white dark:text-black text-xs font-bold"
                                        onClick={() => navigate(`/quizzes/${quiz.id}`)}
                                        disabled={!quiz.isActive && !isAdmin}
                                      >
                                        <Play className="h-3 w-3 mr-1" />
                                        Jouer
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Aucun quiz dans ce thème
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Table Footer */}
          <div className="bg-[#0A1628] dark:bg-[#050810] px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-white/40 font-medium tracking-wide">
              {filteredThemes.length} thème{filteredThemes.length > 1 ? 's' : ''} au classement
            </span>
            <span className="text-[10px] text-white/40 font-medium tracking-wide">
              Saison 2025-2026
            </span>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTheme ? 'Modifier le thème' : 'Nouveau thème'}
            </DialogTitle>
            <DialogDescription>
              {editingTheme
                ? 'Modifiez les informations du thème'
                : 'Créez un nouveau thème d\'apprentissage'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: JavaScript Fondamentaux"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <MiniEditor
                  content={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  placeholder="Description du thème..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  type="number"
                  min="1"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Activer le thème</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="gradient" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingTheme ? 'Modification...' : 'Création...'}
                  </>
                ) : editingTheme ? (
                  'Modifier'
                ) : (
                  'Créer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
