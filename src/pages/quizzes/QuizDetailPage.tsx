import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Clock,
  Target,
  Star,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  Play,
  Search,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Circle,
  PartyPopper,
  Lock,
  RotateCcw,
  XCircle,
  Lightbulb,
  Wand2,
  Eye,
  FileWarning,
  Copy,
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { fireThemeCompletion, fireTrophyCelebration } from '@/components/ui/confetti';
import { staggerContainer, staggerItem, scoreReveal, countdownPulse } from '@/lib/animations';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { StaminaBar } from '@/components/ui/stamina-bar';

interface Option {
  id?: string;
  content: string;
  isCorrect: boolean;
  explanation?: string;
}

interface Question {
  id: string;
  content: string;
  type: 'QCM' | 'QCU';
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'FACILE' | 'MOYEN' | 'DIFFICILE';
  timeLimit: number;
  passingScore: number;
  requiredStars: number;
  isFree: boolean;
  theme?: { title: string };
  questions: Question[];
}

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

const optionBgColors = [
  'from-[#C41E3A]/10 to-[#C41E3A]/5 dark:from-[#C41E3A]/20 dark:to-[#C41E3A]/10',
  'from-[#3B82F6]/10 to-[#3B82F6]/5 dark:from-[#3B82F6]/20 dark:to-[#3B82F6]/10',
  'from-[#D4AF37]/10 to-[#D4AF37]/5 dark:from-[#D4AF37]/20 dark:to-[#D4AF37]/10',
  'from-[#22C55E]/10 to-[#22C55E]/5 dark:from-[#22C55E]/20 dark:to-[#22C55E]/10',
];

const optionBadgeColors = [
  'bg-[#C41E3A] text-white',
  'bg-[#3B82F6] text-white',
  'bg-[#D4AF37] text-white',
  'bg-[#22C55E] text-white',
];

export function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isAdmin = user?.role === 'ADMIN';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [questionForm, setQuestionForm] = useState({
    content: '',
    type: 'QCU' as 'QCM' | 'QCU',
    options: [
      { content: '', isCorrect: false, explanation: '' },
      { content: '', isCorrect: false, explanation: '' },
      { content: '', isCorrect: false, explanation: '' },
      { content: '', isCorrect: false, explanation: '' },
    ] as Option[],
  });

  // Quiz taking state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownTime, setCountdownTime] = useState(15);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    starsEarned: number;
    totalStars: number;
    remainingAttempts: number;
    canViewCorrection: boolean;
    themeCompleted: boolean;
    themeName: string;
  } | null>(null);

  // Attempt tracking state
  const [attemptInfo, setAttemptInfo] = useState<{
    remainingAttempts: number;
    canViewCorrection: boolean;
    hasPassed: boolean;
    isCompleted: boolean;
    failedAttempts: number;
    canPurchaseAttempt: boolean;
    extraAttemptCost: number;
    extraAttemptsPurchased: number;
  } | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    spelling: {
      original: string;
      corrected: string;
      hasCorrections: boolean;
      correctedOptions?: string[];
      corrections: {
        field: 'content' | 'option';
        optionIndex?: number;
        original: string;
        corrected: string;
        explanation?: string;
      }[];
    };
    redundancy: {
      hasSimilarQuestions: boolean;
      similarQuestions: {
        id: string;
        content: string;
        similarityScore: number;
        type?: string;
        options?: { content: string; isCorrect: boolean }[];
      }[];
    };
  } | null>(null);
  const [showSimilarQuestions, setShowSimilarQuestions] = useState(false);

  // AI Question Generation state
  const [isGenerateQuestionsModalOpen, setIsGenerateQuestionsModalOpen] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [generateQuestionsForm, setGenerateQuestionsForm] = useState({
    numberOfQuestions: 3,
    type: 'MIXTE' as 'QCU' | 'QCM' | 'MIXTE',
  });

  const fetchQuiz = async () => {
    try {
      // Admin users get the full quiz with explanations
      const endpoint = isAdmin ? `/quizzes/${id}/admin` : `/quizzes/${id}`;
      const response = await api.get(endpoint);
      setQuiz(response.data);
      setTimeLeft(response.data.timeLimit * 60);

      // Check if quiz is locked due to star requirement
      if (response.data.requiredStars > 0 && user) {
        setIsLocked((user.stars || 0) < response.data.requiredStars);
      }

      // Fetch attempt info for non-admin users
      if (!isAdmin && user) {
        try {
          const attemptRes = await api.get(`/quizzes/${id}/attempts`);
          setAttemptInfo({
            remainingAttempts: attemptRes.data.remainingAttempts,
            canViewCorrection: attemptRes.data.canViewCorrection,
            hasPassed: attemptRes.data.hasPassed,
            isCompleted: attemptRes.data.isCompleted,
            failedAttempts: attemptRes.data.failedAttempts,
            canPurchaseAttempt: attemptRes.data.canPurchaseAttempt,
            extraAttemptCost: attemptRes.data.extraAttemptCost,
            extraAttemptsPurchased: attemptRes.data.extraAttemptsPurchased,
          });
        } catch {
          // If no attempts yet, set default values
          setAttemptInfo({
            remainingAttempts: 3,
            canViewCorrection: false,
            hasPassed: false,
            isCompleted: false,
            failedAttempts: 0,
            canPurchaseAttempt: false,
            extraAttemptCost: 10,
            extraAttemptsPurchased: 0,
          });
        }
      }
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le quiz',
        variant: 'destructive',
      });
      navigate('/quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAdmin]);

  // Timer for quiz
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, timeLeft]);

  // Countdown timer before quiz starts
  useEffect(() => {
    if (!isCountdown || countdownTime <= 0) return;

    const timer = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 1) {
          setIsCountdown(false);
          setIsPlaying(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCountdown, countdownTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOpenQuestionDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        content: question.content,
        type: question.type,
        options: question.options.map((o) => ({ content: o.content, isCorrect: o.isCorrect, explanation: o.explanation || '' })),
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        content: '',
        type: 'QCU',
        options: [
          { content: '', isCorrect: false, explanation: '' },
          { content: '', isCorrect: false, explanation: '' },
          { content: '', isCorrect: false, explanation: '' },
          { content: '', isCorrect: false, explanation: '' },
        ],
      });
    }
    setIsQuestionDialogOpen(true);
  };

  const validateQuestionForm = () => {
    const filteredOptions = questionForm.options.filter((o) => o.content.trim());
    const correctCount = filteredOptions.filter((o) => o.isCorrect).length;

    if (questionForm.type === 'QCU' && correctCount !== 1) {
      toast({
        title: 'Erreur',
        description: 'Une question QCU doit avoir exactement une bonne réponse',
        variant: 'destructive',
      });
      return false;
    }

    if (questionForm.type === 'QCM' && correctCount < 1) {
      toast({
        title: 'Erreur',
        description: 'Une question QCM doit avoir au moins une bonne réponse',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleAnalyzeQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateQuestionForm()) return;

    // For editing, skip analysis and submit directly
    if (editingQuestion) {
      await handleFinalSubmit();
      return;
    }

    setIsAnalyzing(true);
    const filteredOptions = questionForm.options.filter((o) => o.content.trim());

    try {
      const response = await api.post('/quizzes/questions/analyze', {
        quizId: id,
        content: questionForm.content,
        options: filteredOptions,
      });

      setAnalysisResult(response.data);
      setIsQuestionDialogOpen(false);
      setIsAnalysisModalOpen(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur d\'analyse',
        description: err.response?.data?.message || 'Impossible d\'analyser la question',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyCorrections = () => {
    if (!analysisResult) return;

    // Apply corrected content
    const newForm = { ...questionForm };
    newForm.content = analysisResult.spelling.corrected;

    // Apply corrected options if available
    if (analysisResult.spelling.correctedOptions) {
      newForm.options = questionForm.options.map((opt, idx) => ({
        ...opt,
        content: analysisResult.spelling.correctedOptions?.[idx] || opt.content,
      }));
    }

    setQuestionForm(newForm);
    toast({ title: 'Corrections appliquées' });
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const filteredOptions = questionForm.options.filter((o) => o.content.trim());

    try {
      if (editingQuestion) {
        // Update: don't send quizId
        const updatePayload = {
          content: questionForm.content,
          type: questionForm.type,
          options: filteredOptions,
        };
        await api.patch(`/quizzes/questions/${editingQuestion.id}`, updatePayload);
        toast({ title: 'Question modifiée avec succès' });
      } else {
        // Create: include quizId
        const createPayload = {
          quizId: id,
          content: questionForm.content,
          type: questionForm.type,
          options: filteredOptions,
        };
        await api.post('/quizzes/questions', createPayload);
        toast({ title: 'Question ajoutée avec succès' });
      }

      setIsQuestionDialogOpen(false);
      setIsAnalysisModalOpen(false);
      setAnalysisResult(null);
      fetchQuiz();
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

  const handleGenerateQuestions = async () => {
    setIsGeneratingQuestions(true);

    try {
      const response = await api.post('/quizzes/questions/generate', {
        quizId: id,
        numberOfQuestions: generateQuestionsForm.numberOfQuestions,
        type: generateQuestionsForm.type,
      });

      toast({
        title: 'Questions générées !',
        description: response.data.message,
      });

      setIsGenerateQuestionsModalOpen(false);
      fetchQuiz();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur de génération',
        description: err.response?.data?.message || 'Impossible de générer les questions',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;

    try {
      await api.delete(`/quizzes/questions/${questionId}`);
      toast({ title: 'Question supprimée avec succès' });
      fetchQuiz();
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la question',
        variant: 'destructive',
      });
    }
  };

  const handlePurchaseAttempt = async () => {
    if (!quiz || isPurchasing) return;

    setIsPurchasing(true);
    try {
      const response = await api.post('/quizzes/purchase-attempt', { quizId: quiz.id });

      toast({
        title: 'Tentative achetée !',
        description: response.data.message,
      });

      // Update user stars in auth store
      if (user) {
        useAuthStore.setState({
          user: { ...user, stars: response.data.remainingStars },
        });
      }

      // Refresh attempt info
      fetchQuiz();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Impossible d\'acheter une tentative',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleStartQuiz = () => {
    if (isAdmin) {
      toast({
        title: 'Action non autorisée',
        description: 'Les administrateurs ne peuvent pas participer aux quiz',
        variant: 'destructive',
      });
      return;
    }
    if (!quiz || quiz.questions.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Ce quiz ne contient aucune question',
        variant: 'destructive',
      });
      return;
    }
    // Check premium access for non-free quizzes
    if (!quiz.isFree) {
      const userAny = user as { isPremium?: boolean; premiumExpiresAt?: string };
      const isPremiumValid = userAny?.isPremium &&
        (!userAny?.premiumExpiresAt || new Date(userAny.premiumExpiresAt) > new Date());

      if (!isPremiumValid) {
        toast({
          title: 'Quiz Premium',
          description: 'Ce quiz est réservé aux membres Premium. Souscrivez à un abonnement pour y accéder.',
          variant: 'destructive',
        });
        navigate('/premium');
        return;
      }
    }
    if (attemptInfo && attemptInfo.remainingAttempts <= 0 && !attemptInfo.hasPassed) {
      toast({
        title: 'Tentatives épuisées',
        description: 'Vous avez utilisé vos 3 tentatives. Consultez la correction.',
        variant: 'destructive',
      });
      return;
    }
    // Start countdown
    setIsCountdown(true);
    setCountdownTime(15);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeLeft(quiz.timeLimit * 60);
    setQuizResult(null);
  };

  const handleViewCorrection = async () => {
    setQuizResult(null);
    try {
      // Load quiz with corrections (includes explanations)
      const response = await api.get(`/quizzes/${id}/correction`);
      setQuiz(response.data);
      setShowCorrection(true);
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la correction',
        variant: 'destructive',
      });
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    const question = quiz?.questions.find((q) => q.id === questionId);
    if (!question) return;

    if (question.type === 'QCU') {
      setAnswers({ ...answers, [questionId]: [optionId] });
    } else {
      const current = answers[questionId] || [];
      if (current.includes(optionId)) {
        setAnswers({ ...answers, [questionId]: current.filter((id) => id !== optionId) });
      } else {
        setAnswers({ ...answers, [questionId]: [...current, optionId] });
      }
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    try {
      const response = await api.post('/quizzes/submit', {
        quizId: quiz.id,
        answers: Object.entries(answers).map(([questionId, selectedOptionIds]) => ({
          questionId,
          selectedOptionIds,
        })),
      });

      const result = {
        score: response.data.score,
        passed: response.data.passed,
        starsEarned: response.data.starsEarned,
        totalStars: response.data.totalStars,
        remainingAttempts: response.data.remainingAttempts,
        canViewCorrection: response.data.canViewCorrection,
        themeCompleted: response.data.themeCompleted || false,
        themeName: response.data.themeName || '',
      };

      setQuizResult(result);

      // Update user stars in auth store
      if (user && result.totalStars !== undefined) {
        useAuthStore.setState({
          user: { ...user, stars: result.totalStars },
        });
      }

      // Update attempt info
      setAttemptInfo((prev) => prev ? {
        ...prev,
        remainingAttempts: response.data.remainingAttempts,
        canViewCorrection: response.data.canViewCorrection,
        hasPassed: response.data.passed,
        failedAttempts: response.data.passed ? prev.failedAttempts : prev.failedAttempts + 1,
      } : null);

      setIsPlaying(false);

      // Trigger confetti on success
      if (result.passed) {
        if (result.themeCompleted) {
          // Grand celebration for completing all quizzes of a theme
          setTimeout(() => fireThemeCompletion(), 300);
        } else {
          // Standard celebration for passing a quiz
          setTimeout(() => fireTrophyCelebration(), 300);
        }
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Impossible de soumettre le quiz',
        variant: 'destructive',
      });
    }
  };

  const filteredQuestions = quiz?.questions.filter(
    (q) => q.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // ================================================================
  // LOADING STATE
  // ================================================================
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C41E3A] via-[#D4AF37] to-[#5E7A9A] blur-xl opacity-30 animate-pulse" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="relative text-5xl"
          >
            <span role="img" aria-label="football">&#9917;</span>
          </motion.div>
        </div>
        <p className="mt-6 text-[#5E7A9A] font-semibold tracking-wide uppercase text-sm">Chargement du match...</p>
      </div>
    );
  }

  if (!quiz) return null;

  // ================================================================
  // RESULT VIEW — Scoreboard
  // ================================================================
  if (quizResult) {
    const isSuccess = quizResult.passed;
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          {/* Scoreboard card */}
          <div className="relative overflow-hidden rounded-2xl border border-[#1B2B40] bg-gradient-to-b from-[#0A1628] via-[#0D1525] to-[#0A1628] shadow-2xl">
            {/* Stadium spotlight */}
            <div className="stadium-spotlight absolute inset-0 pointer-events-none" />

            {/* Top accent bar */}
            <motion.div
              className={cn(
                'h-1.5',
                isSuccess
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#FFB800] to-[#D4AF37]'
                  : 'bg-gradient-to-r from-[#C41E3A] via-[#E74C5E] to-[#C41E3A]'
              )}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ transformOrigin: 'left' }}
            />

            <div className="relative z-10 pt-10 pb-10 px-6 text-center">
              {/* Header label */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6"
              >
                <span className="scoreboard-text text-xs font-bold tracking-[0.3em] text-white/50 uppercase">
                  Resultat du Match
                </span>
                <div className="pitch-line mt-3" />
              </motion.div>

              {/* Victory / Defeat title */}
              <motion.div
                variants={scoreReveal}
                initial="hidden"
                animate="visible"
                className="mb-6"
              >
                {quizResult.themeCompleted ? (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="inline-block"
                  >
                    <h2 className="scoreboard-text text-4xl font-black text-[#D4AF37] drop-shadow-[0_0_24px_rgba(212,175,55,0.5)]">
                      CHAMPION !
                    </h2>
                  </motion.div>
                ) : isSuccess ? (
                  <h2 className="scoreboard-text text-4xl font-black text-[#D4AF37] drop-shadow-[0_0_24px_rgba(212,175,55,0.5)]">
                    VICTOIRE !
                  </h2>
                ) : (
                  <motion.h2
                    animate={{ x: [0, -3, 3, -2, 0] }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="scoreboard-text text-4xl font-black text-[#E74C5E] drop-shadow-[0_0_16px_rgba(231,76,94,0.4)]"
                  >
                    DEFAITE
                  </motion.h2>
                )}
              </motion.div>

              {/* Theme completion badge */}
              {quizResult.themeCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFB800] text-[#0A1628] font-black text-sm shadow-lg shadow-[#D4AF37]/30">
                    <PartyPopper className="h-4 w-4" />
                    <span>Theme Complete !</span>
                    <PartyPopper className="h-4 w-4" />
                  </div>
                </motion.div>
              )}

              {/* Big scoreboard score display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="mb-6"
              >
                {/* Score vs Required — like a match scoreline */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Vous</p>
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                      className={cn(
                        'scoreboard-text text-6xl font-black',
                        isSuccess ? 'text-[#D4AF37]' : 'text-[#E74C5E]'
                      )}
                    >
                      {quizResult.score}%
                    </motion.span>
                  </div>
                  <div className="text-white/20 text-3xl font-black">|</div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-bold mb-1">Requis</p>
                    <span className="scoreboard-text text-6xl font-black text-white/60">
                      {quiz.passingScore}%
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Progress bar */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                transition={{ delay: 0.8 }}
                className="mb-6 px-2"
              >
                <div className="h-2 bg-[#111B2E] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${quizResult.score}%` }}
                    transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      isSuccess
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFB800]'
                        : 'bg-gradient-to-r from-[#C41E3A] to-[#E74C5E]'
                    )}
                  />
                </div>
              </motion.div>

              {/* Stars earned */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                  >
                    <Star className="h-7 w-7 text-[#D4AF37] fill-[#D4AF37]" />
                  </motion.div>
                  <div className="text-left">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.1 }}
                      className="scoreboard-text text-2xl font-black text-[#D4AF37]"
                    >
                      +{quizResult.starsEarned}
                    </motion.span>
                    <span className="text-[#D4AF37] ml-1 text-sm font-bold">
                      etoile{quizResult.starsEarned > 1 ? 's' : ''}
                    </span>
                    <p className="text-xs text-[#D4AF37]/60 font-medium">
                      Total: {quizResult.totalStars} etoiles
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Remaining attempts info */}
              {!isSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, type: 'spring' }}
                  className="mb-6"
                >
                  {quizResult.remainingAttempts > 0 ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111B2E] border border-[#1B2B40]">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Play className="h-4 w-4 text-[#E74C5E]" />
                      </motion.div>
                      <p className="text-white/60 text-sm">
                        Il vous reste <span className="font-bold text-white">{quizResult.remainingAttempts}</span> tentative{quizResult.remainingAttempts > 1 ? 's' : ''}
                      </p>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                      <AlertCircle className="h-4 w-4 text-[#D4AF37]" />
                      <p className="text-[#D4AF37] font-medium text-sm">
                        Vous avez utilise vos 3 tentatives
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Subtitle message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/40 text-sm mb-6"
              >
                {quizResult.themeCompleted ? (
                  <span>
                    Vous avez termine tous les quiz du theme{' '}
                    <span className="font-bold text-[#D4AF37]">"{quizResult.themeName}"</span> !
                  </span>
                ) : isSuccess
                  ? 'Vous avez brillamment reussi ce quiz !'
                  : 'Ne baisse pas les bras, tu peux y arriver !'}
              </motion.p>

              <div className="pitch-line mb-6" />

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="flex flex-col sm:flex-row gap-3 justify-center"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/quizzes')}
                  className="border-[#1B2B40] text-white/70 hover:text-white hover:bg-[#1B2B40]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
                {quizResult.remainingAttempts > 0 && !isSuccess && (
                  <motion.div
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Button
                      size="lg"
                      onClick={handleStartQuiz}
                      className="bg-gradient-to-r from-[#C41E3A] to-[#E74C5E] text-white hover:from-[#9B1B30] hover:to-[#C41E3A] shadow-lg shadow-[#C41E3A]/25 font-bold"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      REJOUER ({quizResult.remainingAttempts} restante{quizResult.remainingAttempts > 1 ? 's' : ''})
                    </Button>
                  </motion.div>
                )}
                {quizResult.canViewCorrection && (
                  <Button
                    size="lg"
                    onClick={handleViewCorrection}
                    className="bg-[#D4AF37] hover:bg-[#C9A030] text-[#0A1628] font-bold"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Voir la correction
                  </Button>
                )}
              </motion.div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E74C5E]/40 to-transparent" />
          </div>
        </motion.div>
      </div>
    );
  }

  // ================================================================
  // COUNTDOWN VIEW — Tunnel animation
  // ================================================================
  if (isCountdown) {
    const countdownLabel =
      countdownTime > 10 ? 'A VOS MARQUES' :
      countdownTime > 5 ? 'PRET' :
      countdownTime > 1 ? 'PARTEZ !' : 'GO !';

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Dark tunnel background with radial light */}
        <div className="absolute inset-0 bg-[#050810]" />
        <div className="absolute inset-0 bg-radial-gradient" style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(231,76,94,0.12) 0%, rgba(212,175,55,0.06) 30%, transparent 70%)',
        }} />
        {/* Animated tunnel rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            className="absolute rounded-full border border-white/5"
            style={{
              width: `${ring * 30}%`,
              height: `${ring * 30}%`,
              left: `${50 - (ring * 15)}%`,
              top: `${50 - (ring * 15)}%`,
            }}
            animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: ring * 0.3 }}
          />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-2xl text-center"
        >
          {/* Quiz title & difficulty */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h3 className="scoreboard-text text-lg font-bold text-white/70 tracking-wider mb-2">{quiz.title}</h3>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: difficultyAccent[quiz.difficulty] }}
            >
              {difficultyLabel[quiz.difficulty]}
            </span>
          </motion.div>

          {/* Big countdown number */}
          <div className="relative mb-10 h-48 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={countdownTime}
                variants={countdownPulse}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute"
              >
                <span className="scoreboard-text text-[120px] font-black text-white drop-shadow-[0_0_40px_rgba(231,76,94,0.4)]">
                  {countdownTime}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Phase label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={countdownLabel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="scoreboard-text text-2xl font-black tracking-[0.25em] mb-8 text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,175,55,0.3)]"
            >
              {countdownLabel}
            </motion.p>
          </AnimatePresence>

          {/* Rules panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-[#0A1628]/80 border border-[#1B2B40] p-6 mb-6 text-left backdrop-blur-sm"
          >
            <h4 className="scoreboard-text text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-4 text-center">
              Regles du match
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#C41E3A]/20 text-[#E74C5E] text-xs font-bold">1</div>
                <p className="text-white/50 pt-0.5 text-sm">
                  <span className="font-bold text-white/80">{quiz.questions.length} questions</span> a repondre en <span className="font-bold text-white/80">{quiz.timeLimit} minutes</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold">2</div>
                <p className="text-white/50 pt-0.5 text-sm">
                  Score minimum requis : <span className="font-bold text-white/80">{quiz.passingScore}%</span> pour la victoire
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-bold">3</div>
                <p className="text-white/50 pt-0.5 text-sm">
                  Gagnez des <span className="font-bold text-[#D4AF37]">etoiles</span> selon votre performance
                </p>
              </div>
              {attemptInfo && attemptInfo.remainingAttempts < 3 && (
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E74C5E]/20 text-[#E74C5E] text-xs font-bold">!</div>
                  <p className="text-[#E74C5E] pt-0.5 text-sm font-medium">
                    Tentative <span className="font-bold">{4 - attemptInfo.remainingAttempts}</span> sur 3
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 justify-center"
          >
            <Button
              variant="outline"
              onClick={() => {
                setIsCountdown(false);
                setCountdownTime(15);
              }}
              className="border-[#1B2B40] text-white/60 hover:text-white hover:bg-[#1B2B40]"
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                setIsCountdown(false);
                setIsPlaying(true);
              }}
              className="bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] hover:from-[#9B1B30] hover:to-[#C9A030] text-white font-bold shadow-lg shadow-[#C41E3A]/25"
            >
              <Play className="mr-2 h-4 w-4" />
              Commencer maintenant
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ================================================================
  // CORRECTION VIEW
  // ================================================================
  if (showCorrection) {
    return (
      <div className="space-y-6">
        <ScoreboardHeader
          title={`Correction : ${quiz.title}`}
          subtitle={quiz.theme?.title}
          icon={<HelpCircle className="h-5 w-5" />}
          rightContent={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCorrection(false)}
              className="text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
          }
        />

        {/* Info banner */}
        <div className="rounded-xl bg-[#C41E3A]/5 dark:bg-[#E74C5E]/10 border border-[#C41E3A]/20 dark:border-[#E74C5E]/20 px-5 py-3">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-[#C41E3A] dark:text-[#E74C5E] flex-shrink-0" />
            <p className="text-[#C41E3A] dark:text-[#E74C5E] text-sm">
              Voici les reponses correctes pour chaque question. Etudiez-les attentivement pour mieux vous preparer.
            </p>
          </div>
        </div>

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {quiz.questions.map((question, index) => (
            <motion.div key={question.id} variants={staggerItem}>
              <div className="relative overflow-hidden rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] shadow-md">
                {/* Left accent band */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                  style={{ backgroundColor: difficultyAccent[quiz.difficulty] }}
                />

                <div className="pl-5 pr-4 py-5">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A1628] dark:bg-[#E74C5E] text-white font-black text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider">
                        {question.type === 'QCU' ? 'Choix unique' : 'Choix multiple'}
                      </Badge>
                      <p className="text-base font-bold text-[#0A1628] dark:text-[#E2E8F5] leading-snug">{question.content}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 ml-14">
                    {question.options.map((option, idx) => (
                      <div
                        key={option.id}
                        className={cn(
                          'p-3.5 rounded-xl border-2 text-sm',
                          option.isCorrect
                            ? 'border-[#3B82F6] bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10 dark:border-[#3B82F6]/60'
                            : 'border-[#E74C5E]/20 bg-[#E74C5E]/3 dark:bg-[#E74C5E]/5 dark:border-[#E74C5E]/20'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                            option.isCorrect
                              ? 'bg-[#3B82F6] text-white'
                              : 'bg-[#E74C5E]/20 dark:bg-[#E74C5E]/30 text-[#E74C5E]'
                          )}>
                            {['A', 'B', 'C', 'D', 'E', 'F'][idx]}
                          </span>
                          <span className="flex-1 font-medium text-[#0A1628] dark:text-[#E2E8F5]">{option.content}</span>
                          {option.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-[#E74C5E]/50 flex-shrink-0" />
                          )}
                        </div>
                        {option.explanation && (
                          <div className={cn(
                            'mt-3 pt-3 border-t text-sm',
                            option.isCorrect
                              ? 'border-[#3B82F6]/20'
                              : 'border-[#E74C5E]/10'
                          )}>
                            <div className="flex items-start gap-2">
                              <Lightbulb className={cn(
                                'h-4 w-4 mt-0.5 flex-shrink-0',
                                option.isCorrect
                                  ? 'text-[#3B82F6]'
                                  : 'text-[#E74C5E]/60'
                              )} />
                              <p className={cn(
                                'text-sm',
                                option.isCorrect
                                  ? 'text-[#3B82F6] dark:text-[#60A5FA]'
                                  : 'text-[#E74C5E]/70'
                              )}>
                                {option.explanation}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex justify-center pt-4">
          <Button
            size="lg"
            onClick={() => {
              setShowCorrection(false);
              navigate('/quizzes');
            }}
            className="bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] text-white hover:from-[#9B1B30] hover:to-[#C9A030] font-bold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux quiz
          </Button>
        </div>
      </div>
    );
  }

  // ================================================================
  // QUIZ PLAYING VIEW — Football HUD
  // ================================================================
  if (isPlaying) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedOptions = answers[currentQuestion.id] || [];
    const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-5xl mx-auto space-y-3 pb-2">
        {/* ---- TOP SCOREBOARD BAR ---- */}
        <div className="sticky top-0 z-10 pt-1 pb-2">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0A1628] via-[#0D1D35] to-[#0A1628] border border-[#1B2B40] px-3 sm:px-5 py-2.5">
            {/* Subtle spotlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-6 bg-[#E74C5E]/8 blur-xl rounded-full" />

            <div className="relative z-10 flex items-center justify-between gap-2">
              {/* Left: Quit + Title */}
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors text-xs shrink-0"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Quitter</span>
                </button>
                <div className="hidden md:block h-4 w-px bg-white/10" />
                <span className="hidden md:block text-xs font-bold text-white/50 truncate max-w-[160px]">{quiz.title}</span>
              </div>

              {/* Center: Question counter */}
              <div className="flex items-center gap-2">
                <span className="scoreboard-text text-sm font-black text-white tracking-wider">
                  Q.{currentQuestionIndex + 1}/{quiz.questions.length}
                </span>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[10px] text-white/40 font-bold uppercase">
                  {answeredCount}/{quiz.questions.length} rep.
                </span>
              </div>

              {/* Right: Timer */}
              <div className={cn(
                'scoreboard-text flex items-center gap-1.5 px-3 py-1 rounded-lg font-black text-sm',
                timeLeft <= 60
                  ? 'bg-[#E74C5E]/20 text-[#E74C5E] animate-pulse'
                  : 'bg-white/5 text-white/80'
              )}>
                <Clock className="h-3.5 w-3.5" />
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E74C5E]/30 to-transparent" />
          </div>

          {/* ---- PITCH PROGRESS INDICATOR ---- */}
          <div className="mt-1.5 relative h-2.5 bg-[#111B2E] dark:bg-[#0A1628] rounded-full overflow-hidden border border-[#1B2B40]/50">
            {/* Goal markers */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 rounded-l-full" />
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#D4AF37]/30 rounded-r-full" />
            {/* Progress fill */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#C41E3A] to-[#E74C5E] rounded-full"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            {/* Ball indicator */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              initial={false}
              animate={{ left: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md shadow-black/30 flex items-center justify-center text-[8px]">
                &#9917;
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* ---- QUESTION NAVIGATION SIDEBAR (desktop) ---- */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <div className="sticky top-28 rounded-2xl border border-[#1B2B40] bg-[#0D1525] p-4">
              <p className="scoreboard-text text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">Formation</p>
              <div className="grid grid-cols-5 gap-1.5">
                {quiz.questions.map((q, idx) => {
                  const isAnswered = answers[q.id]?.length > 0;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={cn(
                        'w-full aspect-square rounded-lg text-xs font-bold transition-all border',
                        isCurrent
                          ? 'bg-[#C41E3A] text-white border-[#E74C5E] shadow-md shadow-[#C41E3A]/30 scale-110'
                          : isAnswered
                            ? 'bg-[#C41E3A]/15 text-[#E74C5E] border-[#C41E3A]/30'
                            : 'bg-[#111B2E] text-white/30 border-[#1B2B40] hover:bg-[#1B2B40] hover:text-white/60'
                      )}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Score summary in sidebar */}
              <div className="mt-4 pt-3 border-t border-[#1B2B40]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/30">Repondu</span>
                  <span className="scoreboard-text font-bold text-white/60">{answeredCount}/{quiz.questions.length}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ---- MAIN QUESTION AREA ---- */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
              >
                {/* Question card */}
                <div className="relative overflow-hidden rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] shadow-lg">
                  {/* Top difficulty stripe */}
                  <div className="h-1" style={{ backgroundColor: difficultyAccent[quiz.difficulty] }} />

                  <div className="px-4 sm:px-6 pt-5 pb-4">
                    {/* Question number badge + type */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-black text-sm"
                        style={{ backgroundColor: difficultyAccent[quiz.difficulty] }}
                      >
                        {currentQuestionIndex + 1}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1628]/5 dark:bg-white/5 text-[#5E7A9A] dark:text-white/40 border border-[#DCE6F0] dark:border-[#1B2B40] uppercase tracking-wider">
                        {currentQuestion.type === 'QCU' ? 'Choix unique' : 'Choix multiple'}
                      </span>
                    </div>

                    {/* Question text */}
                    <h3 className="text-base sm:text-lg leading-snug font-bold text-[#0A1628] dark:text-[#E2E8F5] mb-2">
                      {currentQuestion.content}
                    </h3>

                    {currentQuestion.type === 'QCM' && (
                      <p className="text-xs text-[#5E7A9A] flex items-center gap-1 mb-1">
                        <HelpCircle className="h-3.5 w-3.5" />
                        Selectionnez toutes les reponses correctes
                      </p>
                    )}
                  </div>

                  {/* Answer options — 2x2 grid on desktop, stacked on mobile */}
                  <div className="px-4 sm:px-6 pb-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedOptions.includes(option.id!);
                        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

                        return (
                          <motion.button
                            key={option.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleSelectOption(currentQuestion.id, option.id!)}
                            className={cn(
                              'w-full px-4 py-3.5 text-left rounded-xl border-2 transition-all duration-150 flex items-center gap-3 min-h-[3.5rem]',
                              isSelected
                                ? 'border-[#C41E3A] dark:border-[#E74C5E] bg-[#C41E3A] dark:bg-[#E74C5E] shadow-md'
                                : cn(
                                    'border-[#DCE6F0] dark:border-[#1B2B40] bg-gradient-to-br',
                                    optionBgColors[idx % 4],
                                    'hover:border-[#C41E3A]/40 dark:hover:border-[#E74C5E]/40'
                                  )
                            )}
                          >
                            <div className={cn(
                              'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-all',
                              isSelected
                                ? 'bg-white/20 text-white'
                                : optionBadgeColors[idx % 4]
                            )}>
                              {letters[idx]}
                            </div>
                            <span className={cn(
                              'flex-1 text-sm sm:text-base font-medium leading-snug',
                              isSelected ? 'text-white' : 'text-[#0A1628] dark:text-[#E2E8F5]'
                            )}>{option.content}</span>
                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                                <CheckCircle className="h-5 w-5 text-white/80" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="h-12 px-4 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] dark:text-white/60"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>

                  {/* Mobile dot indicator */}
                  <div className="flex-1 flex items-center justify-center gap-1 lg:hidden overflow-hidden">
                    {quiz.questions.slice(
                      Math.max(0, currentQuestionIndex - 4),
                      Math.min(quiz.questions.length, currentQuestionIndex + 5)
                    ).map((q, idx) => {
                      const realIdx = Math.max(0, currentQuestionIndex - 4) + idx;
                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(realIdx)}
                          className={cn(
                            'rounded-full transition-all',
                            realIdx === currentQuestionIndex
                              ? 'w-5 h-2 bg-[#C41E3A] dark:bg-[#E74C5E]'
                              : answers[q.id]?.length > 0
                                ? 'w-2 h-2 bg-[#C41E3A]/40 dark:bg-[#E74C5E]/40'
                                : 'w-2 h-2 bg-[#DCE6F0] dark:bg-[#1B2B40]'
                          )}
                        />
                      );
                    })}
                  </div>

                  {currentQuestionIndex < quiz.questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="h-12 px-5 rounded-xl bg-gradient-to-r from-[#C41E3A] to-[#E74C5E] hover:from-[#9B1B30] hover:to-[#C41E3A] text-white font-bold shadow-md shadow-[#C41E3A]/20"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Button
                        onClick={handleSubmitQuiz}
                        className="h-12 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFB800] hover:from-[#C9A030] hover:to-[#D4AF37] text-[#0A1628] font-black shadow-md shadow-[#D4AF37]/25"
                      >
                        <Trophy className="h-4 w-4 mr-1.5" />
                        TERMINER
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // QUIZ DETAIL VIEW (Admin question list / Player start screen)
  // ================================================================
  return (
    <div className="space-y-6">
      {/* ---- HEADER ---- */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/quizzes')}
          className="rounded-xl"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A1628] dark:text-[#E2E8F5]">{quiz.title}</h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: difficultyAccent[quiz.difficulty] }}
            >
              {difficultyLabel[quiz.difficulty]}
            </span>
          </div>
          <p className="text-[#5E7A9A] text-sm">{quiz.theme?.title}</p>
        </div>
        {!isAdmin && (
          <div className="flex items-center gap-3 flex-wrap">
            {attemptInfo?.canViewCorrection && (
              <Button
                size="lg"
                variant="outline"
                onClick={handleViewCorrection}
                className="gap-2 border-[#1B2B40]"
              >
                <Eye className="h-5 w-5" />
                Voir la correction
              </Button>
            )}
            {/* Quiz locked by stars */}
            {isLocked ? (
              <Button
                size="lg"
                disabled
                className="gap-2 bg-[#D4AF37]/10 text-[#D4AF37] cursor-not-allowed border border-[#D4AF37]/30"
              >
                <Lock className="h-5 w-5" />
                {quiz.requiredStars} <Star className="h-4 w-4 fill-current" /> requises
              </Button>
            ) : attemptInfo?.hasPassed ? (
              <Button
                size="lg"
                onClick={handleStartQuiz}
                className="gap-2 bg-[#3B82F6] text-white hover:bg-[#2563EB] font-bold"
              >
                <RotateCcw className="h-5 w-5" />
                Rejouer (sans etoiles)
              </Button>
            ) : attemptInfo?.canPurchaseAttempt ? (
              <Button
                size="lg"
                onClick={handlePurchaseAttempt}
                disabled={isPurchasing || (user?.stars || 0) < (attemptInfo?.extraAttemptCost || 10)}
                className="gap-2 bg-gradient-to-r from-[#D4AF37] to-[#FFB800] text-[#0A1628] hover:from-[#C9A030] hover:to-[#D4AF37] font-bold"
              >
                {isPurchasing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RotateCcw className="h-5 w-5" />
                )}
                Acheter une tentative ({attemptInfo?.extraAttemptCost} <Star className="h-4 w-4 fill-current" />)
              </Button>
            ) : attemptInfo && attemptInfo.remainingAttempts > 0 ? (
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Button
                  size="lg"
                  onClick={handleStartQuiz}
                  className="gap-2 bg-gradient-to-r from-[#C41E3A] to-[#E74C5E] hover:from-[#9B1B30] hover:to-[#C41E3A] text-white font-black shadow-lg shadow-[#C41E3A]/25 uppercase tracking-wider"
                >
                  <Play className="h-5 w-5" />
                  {attemptInfo.failedAttempts > 0 ? `Rejouer (${attemptInfo.remainingAttempts}/3)` : 'JOUER'}
                </Button>
              </motion.div>
            ) : (
              <Button
                size="lg"
                disabled
                className="gap-2 bg-[#111B2E] text-[#5E7A9A] cursor-not-allowed border border-[#1B2B40]"
              >
                <XCircle className="h-5 w-5" />
                0 tentatives
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ---- LOCKED BY STARS INFO ---- */}
      {!isAdmin && isLocked && quiz.requiredStars > 0 && (
        <div className="rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-5 py-4">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-[#D4AF37]" />
            <p className="text-[#D4AF37] text-sm">
              Ce quiz necessite <span className="font-bold">{quiz.requiredStars}</span> etoiles pour etre debloque.
              Vous avez actuellement <span className="font-bold">{user?.stars || 0}</span> etoiles.
            </p>
          </div>
        </div>
      )}

      {/* ---- ATTEMPT STATUS ---- */}
      {!isAdmin && !isLocked && attemptInfo && (attemptInfo.failedAttempts > 0 || attemptInfo.hasPassed || attemptInfo.canPurchaseAttempt) && (
        <div className={cn(
          'rounded-xl border px-5 py-4',
          attemptInfo.hasPassed
            ? 'bg-[#3B82F6]/5 border-[#3B82F6]/20'
            : attemptInfo.canPurchaseAttempt
              ? 'bg-[#D4AF37]/5 border-[#D4AF37]/20'
              : attemptInfo.canViewCorrection
                ? 'bg-[#E74C5E]/5 border-[#E74C5E]/20'
                : 'bg-[#3B82F6]/5 border-[#3B82F6]/20'
        )}>
          <div className="flex items-center gap-3">
            {attemptInfo.hasPassed ? (
              <>
                <Trophy className="h-5 w-5 text-[#3B82F6]" />
                <p className="text-[#3B82F6] font-medium text-sm">
                  Vous avez reussi ce quiz !
                </p>
              </>
            ) : attemptInfo.canPurchaseAttempt ? (
              <>
                <RotateCcw className="h-5 w-5 text-[#D4AF37]" />
                <div>
                  <p className="text-[#D4AF37] font-medium text-sm">
                    Tentatives epuisees ({3 + attemptInfo.extraAttemptsPurchased} utilisees)
                  </p>
                  <p className="text-xs text-[#D4AF37]/70">
                    Achetez une tentative supplementaire pour {attemptInfo.extraAttemptCost} etoiles
                    {(user?.stars || 0) < attemptInfo.extraAttemptCost &&
                      ` (vous avez ${user?.stars || 0} etoiles)`
                    }
                  </p>
                </div>
              </>
            ) : attemptInfo.canViewCorrection ? (
              <>
                <AlertCircle className="h-5 w-5 text-[#E74C5E]" />
                <p className="text-[#E74C5E] text-sm">
                  3 tentatives echouees. La correction est disponible.
                </p>
              </>
            ) : (
              <>
                <Target className="h-5 w-5 text-[#3B82F6]" />
                <p className="text-[#3B82F6] text-sm">
                  {attemptInfo.failedAttempts} tentative{attemptInfo.failedAttempts > 1 ? 's' : ''} echouee{attemptInfo.failedAttempts > 1 ? 's' : ''} — {attemptInfo.remainingAttempts} restante{attemptInfo.remainingAttempts > 1 ? 's' : ''}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---- QUIZ INFO CARDS ---- */}
      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { icon: Clock, label: 'Duree', value: `${quiz.timeLimit} min`, color: '#3B82F6' },
          { icon: Target, label: 'Score requis', value: `${quiz.passingScore}%`, color: '#E74C5E' },
          { icon: HelpCircle, label: 'Questions', value: `${quiz.questions.length}`, color: '#D4AF37' },
          { icon: Trophy, label: 'Acces', value: quiz.isFree ? 'Gratuit' : 'Premium', color: quiz.isFree ? '#3B82F6' : '#D4AF37' },
        ].map(({ icon: Icon, label, value, color }) => (
          <motion.div key={label} variants={staggerItem}>
            <div className="relative overflow-hidden rounded-xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] p-4">
              <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: color }}
              />
              <div className="pl-2">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <p className="scoreboard-text text-xl font-black text-[#0A1628] dark:text-[#E2E8F5]">{value}</p>
                <p className="text-xs text-[#5E7A9A]">{label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ---- ATTEMPT TRACKER (StaminaBar) ---- */}
      {!isAdmin && attemptInfo && !attemptInfo.hasPassed && (
        <div className="rounded-xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] p-4">
          <StaminaBar
            value={attemptInfo.remainingAttempts}
            max={3}
            label="Tentatives restantes"
            segments={3}
            size="lg"
          />
        </div>
      )}

      {/* ---- DESCRIPTION ---- */}
      <div className="rounded-xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] p-5">
        <div
          className="text-[#5E7A9A] leading-relaxed prose prose-sm dark:prose-invert max-w-none [&>*]:m-0"
          dangerouslySetInnerHTML={{ __html: quiz.description }}
        />
      </div>

      {/* ---- QUESTIONS SECTION (Admin only) ---- */}
      {isAdmin && (
        <>
          <ScoreboardHeader
            title={`Questions (${quiz.questions.length})`}
            subtitle={quiz.title}
            icon={<HelpCircle className="h-5 w-5" />}
            rightContent={
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleOpenQuestionDialog()}
                  className="gap-1.5 bg-[#C41E3A] hover:bg-[#9B1B30] text-white text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsGenerateQuestionsModalOpen(true)}
                  className="gap-1.5 bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] text-white text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  IA
                </Button>
              </div>
            }
          />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
            <Input
              placeholder="Rechercher une question..."
              className="pl-10 border-[#DCE6F0] dark:border-[#1B2B40]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#1B2B40] bg-[#0D1525]/50 py-16 flex flex-col items-center justify-center">
              {searchQuery ? (
                <>
                  <Search className="h-12 w-12 text-[#5E7A9A] mb-4" />
                  <p className="text-lg font-bold text-[#E2E8F5]">Aucune question trouvee</p>
                  <p className="text-[#5E7A9A] text-sm">Essayez une autre recherche</p>
                </>
              ) : (
                <>
                  <HelpCircle className="h-12 w-12 text-[#5E7A9A] mb-4" />
                  <p className="text-lg font-bold text-[#0A1628] dark:text-[#E2E8F5]">Aucune question</p>
                  <p className="text-[#5E7A9A] text-sm mb-4">Ajoutez des questions pour ce quiz</p>
                  <Button onClick={() => handleOpenQuestionDialog()} className="gap-2 bg-[#C41E3A] hover:bg-[#9B1B30] text-white">
                    <Plus className="h-4 w-4" />
                    Ajouter une question
                  </Button>
                </>
              )}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer(0.05)}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {filteredQuestions.map((question) => (
                <motion.div key={question.id} variants={staggerItem}>
                  <div className="group relative overflow-hidden rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] shadow-md hover:shadow-lg transition-shadow">
                    {/* Left accent band */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                      style={{ backgroundColor: difficultyAccent[quiz.difficulty] }}
                    />

                    <div className="pl-5 pr-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A1628] dark:bg-[#E74C5E] text-white font-black text-sm shrink-0">
                            {quiz.questions.indexOf(question) + 1}
                          </div>
                          <div className="min-w-0">
                            <Badge variant="outline" className="mb-1.5 text-[10px] uppercase tracking-wider">
                              {question.type === 'QCU' ? 'Choix unique' : 'Choix multiple'}
                            </Badge>
                            <p className="text-base font-bold text-[#0A1628] dark:text-[#E2E8F5]">{question.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 hover:bg-[#C41E3A]/10 hover:text-[#C41E3A]"
                            onClick={() => handleOpenQuestionDialog(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2 mt-3 ml-13">
                        {question.options.map((option, idx) => (
                          <div
                            key={option.id}
                            className={cn(
                              'p-3 rounded-xl border-2 text-sm',
                              option.isCorrect
                                ? 'border-[#3B82F6]/40 bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10 dark:border-[#3B82F6]/30'
                                : 'border-[#DCE6F0] dark:border-[#1B2B40] bg-[#EFF3F7]/50 dark:bg-[#111B2E]/50'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                                option.isCorrect
                                  ? 'bg-[#3B82F6] text-white'
                                  : 'bg-[#EFF3F7] dark:bg-[#1B2B40] text-[#5E7A9A]'
                              )}>
                                {['A', 'B', 'C', 'D'][idx]}
                              </span>
                              <span className="flex-1 text-[#0A1628] dark:text-[#E2E8F5]">{option.content}</span>
                              {option.isCorrect && (
                                <CheckCircle className="h-5 w-5 text-[#3B82F6] flex-shrink-0" />
                              )}
                            </div>
                            {option.explanation && (
                              <div className="mt-2 ml-10 flex items-start gap-2 text-xs text-[#5E7A9A]">
                                <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-[#D4AF37]" />
                                <span>{option.explanation}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* ================================================================
          DIALOGS
          ================================================================ */}

      {/* Question Dialog */}
      <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[#1B2B40]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#C41E3A] to-[#D4AF37]">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              {editingQuestion ? 'Modifier la question' : 'Nouvelle question'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? 'Modifiez les informations de la question'
                : 'Ajoutez une nouvelle question au quiz'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAnalyzeQuestion}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="content">Question</Label>
                <textarea
                  id="content"
                  className="flex min-h-[100px] w-full rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-background px-4 py-3 text-sm focus:border-[#C41E3A] focus:outline-none transition-colors"
                  value={questionForm.content}
                  onChange={(e) => setQuestionForm({ ...questionForm, content: e.target.value })}
                  placeholder="Entrez votre question..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    className="flex h-11 w-full rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-background px-4 py-2 text-sm focus:border-[#C41E3A] focus:outline-none transition-colors"
                    value={questionForm.type}
                    onChange={(e) =>
                      setQuestionForm({ ...questionForm, type: e.target.value as 'QCM' | 'QCU' })
                    }
                  >
                    <option value="QCU">Choix unique (QCU)</option>
                    <option value="QCM">Choix multiple (QCM)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Options de reponse</Label>
                <p className="text-xs text-[#5E7A9A]">
                  {questionForm.type === 'QCU'
                    ? 'Cochez la seule bonne reponse'
                    : 'Cochez toutes les bonnes reponses'}
                </p>
                {questionForm.options.map((option, index) => (
                  <div key={index} className="space-y-2 p-3 rounded-xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-[#EFF3F7]/50 dark:bg-[#111B2E]/50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                        option.isCorrect ? 'bg-[#3B82F6] text-white' : 'bg-[#EFF3F7] dark:bg-[#1B2B40] text-[#5E7A9A]'
                      )}>
                        {['A', 'B', 'C', 'D'][index]}
                      </div>
                      <input
                        type={questionForm.type === 'QCU' ? 'radio' : 'checkbox'}
                        name="correctOption"
                        checked={option.isCorrect}
                        onChange={() => {
                          if (questionForm.type === 'QCU') {
                            setQuestionForm({
                              ...questionForm,
                              options: questionForm.options.map((o, i) => ({
                                ...o,
                                isCorrect: i === index,
                              })),
                            });
                          } else {
                            setQuestionForm({
                              ...questionForm,
                              options: questionForm.options.map((o, i) =>
                                i === index ? { ...o, isCorrect: !o.isCorrect } : o
                              ),
                            });
                          }
                        }}
                        className="h-5 w-5 accent-[#3B82F6]"
                      />
                      <Input
                        value={option.content}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            options: questionForm.options.map((o, i) =>
                              i === index ? { ...o, content: e.target.value } : o
                            ),
                          })
                        }
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 border-[#DCE6F0] dark:border-[#1B2B40]"
                      />
                    </div>
                    <div className="ml-11">
                      <Input
                        value={option.explanation || ''}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            options: questionForm.options.map((o, i) =>
                              i === index ? { ...o, explanation: e.target.value } : o
                            ),
                          })
                        }
                        placeholder="Explication (affichee lors de la correction)"
                        className="text-sm border-[#DCE6F0] dark:border-[#1B2B40]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsQuestionDialogOpen(false)} className="border-[#1B2B40]">
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || isAnalyzing} className="bg-[#C41E3A] hover:bg-[#9B1B30] text-white">
                {isAnalyzing ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="inline-block mr-2"
                    >
                      &#9917;
                    </motion.span>
                    Analyse IA...
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingQuestion ? 'Modification...' : 'Ajout...'}
                  </>
                ) : editingQuestion ? (
                  'Modifier'
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Analyser et ajouter
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Modal */}
      <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto border-[#1B2B40]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#C41E3A] to-[#D4AF37]">
                <Wand2 className="h-5 w-5 text-white" />
              </div>
              Analyse IA de la question
            </DialogTitle>
            <DialogDescription>
              Verifiez les suggestions de l'IA avant de creer la question
            </DialogDescription>
          </DialogHeader>

          {analysisResult && (
            <div className="space-y-6 py-4">
              {/* Spelling Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileWarning className="h-5 w-5 text-[#D4AF37]" />
                  <h3 className="font-semibold text-[#0A1628] dark:text-[#E2E8F5]">Orthographe et grammaire</h3>
                  {analysisResult.spelling.hasCorrections ? (
                    <Badge variant="outline" className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30">
                      Corrections suggerees
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aucune erreur
                    </Badge>
                  )}
                </div>

                {analysisResult.spelling.hasCorrections ? (
                  <div className="space-y-3">
                    <div className="grid gap-3">
                      <div className="p-3 rounded-lg bg-[#E74C5E]/5 dark:bg-[#E74C5E]/10 border border-[#E74C5E]/20">
                        <p className="text-xs text-[#E74C5E] font-medium mb-1">Texte original</p>
                        <p className="text-sm text-[#0A1628] dark:text-[#E2E8F5]">{analysisResult.spelling.original}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                        <p className="text-xs text-[#3B82F6] font-medium mb-1">Texte corrige</p>
                        <p className="text-sm text-[#0A1628] dark:text-[#E2E8F5]">{analysisResult.spelling.corrected}</p>
                      </div>
                    </div>

                    {analysisResult.spelling.corrections.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[#5E7A9A]">Detail des corrections :</p>
                        {analysisResult.spelling.corrections.map((correction, idx) => (
                          <div key={idx} className="p-2 rounded bg-[#EFF3F7] dark:bg-[#111B2E] text-sm">
                            <span className="line-through text-[#E74C5E]">{correction.original}</span>
                            {' -> '}
                            <span className="text-[#3B82F6] font-medium">{correction.corrected}</span>
                            {correction.explanation && (
                              <p className="text-xs text-[#5E7A9A] mt-1">{correction.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleApplyCorrections}
                        className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Appliquer les corrections
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#1B2B40]">
                        Ignorer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#5E7A9A]">
                    La question est bien redigee, aucune correction necessaire.
                  </p>
                )}
              </div>

              {/* Redundancy Section */}
              <div className="space-y-3 border-t border-[#DCE6F0] dark:border-[#1B2B40] pt-4">
                <div className="flex items-center gap-2">
                  <Copy className="h-5 w-5 text-[#3B82F6]" />
                  <h3 className="font-semibold text-[#0A1628] dark:text-[#E2E8F5]">Verification de redondance</h3>
                  {analysisResult.redundancy.hasSimilarQuestions ? (
                    <Badge variant="outline" className="bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30">
                      Questions similaires detectees
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aucune redondance
                    </Badge>
                  )}
                </div>

                {analysisResult.redundancy.hasSimilarQuestions ? (
                  <div className="space-y-3">
                    <p className="text-sm text-[#D4AF37]">
                      Des questions similaires existent deja dans ce quiz :
                    </p>

                    {showSimilarQuestions ? (
                      <div className="space-y-3">
                        {analysisResult.redundancy.similarQuestions.map((q, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-[#1B2B40] bg-[#EFF3F7] dark:bg-[#111B2E] space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-[#D4AF37]/10 text-[#D4AF37]">
                                  Similarite : {Math.round(q.similarityScore * 100)}%
                                </Badge>
                                {q.type && (
                                  <Badge variant="outline">{q.type}</Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-medium text-[#0A1628] dark:text-[#E2E8F5]">{q.content}</p>
                            {q.options && q.options.length > 0 && (
                              <div className="space-y-1 pl-3 border-l-2 border-[#1B2B40]">
                                <p className="text-xs text-[#5E7A9A] font-medium">Options :</p>
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={cn(
                                      "text-sm flex items-center gap-2",
                                      opt.isCorrect && "text-[#3B82F6] font-medium"
                                    )}
                                  >
                                    {opt.isCorrect ? (
                                      <CheckCircle className="h-3 w-3 text-[#3B82F6]" />
                                    ) : (
                                      <Circle className="h-3 w-3 text-[#5E7A9A]" />
                                    )}
                                    {opt.content}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowSimilarQuestions(false)}
                          className="text-[#5E7A9A]"
                        >
                          Masquer
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSimilarQuestions(true)}
                        className="border-[#1B2B40]"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les questions similaires ({analysisResult.redundancy.similarQuestions.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#5E7A9A]">
                    Cette question est unique et n'a pas de similarite avec les questions existantes.
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#C41E3A]/5 to-[#D4AF37]/5 border border-[#C41E3A]/20">
                <h4 className="font-medium mb-2 text-[#0A1628] dark:text-[#E2E8F5]">Resume de la question a creer</h4>
                <p className="text-sm mb-2 text-[#5E7A9A]"><strong className="text-[#0A1628] dark:text-[#E2E8F5]">Question :</strong> {questionForm.content}</p>
                <p className="text-sm mb-2 text-[#5E7A9A]"><strong className="text-[#0A1628] dark:text-[#E2E8F5]">Type :</strong> {questionForm.type}</p>
                <p className="text-sm text-[#5E7A9A]"><strong className="text-[#0A1628] dark:text-[#E2E8F5]">Options :</strong></p>
                <ul className="text-sm list-disc list-inside text-[#5E7A9A]">
                  {questionForm.options.filter(o => o.content.trim()).map((opt, idx) => (
                    <li key={idx} className={opt.isCorrect ? 'text-[#3B82F6] font-medium' : ''}>
                      {opt.content} {opt.isCorrect && '(correct)'}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAnalysisModalOpen(false);
                setIsQuestionDialogOpen(true);
              }}
              className="border-[#1B2B40]"
            >
              Retour au formulaire
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] text-white hover:from-[#9B1B30] hover:to-[#C9A030]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creation...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Creer la question
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Question Generation Modal */}
      <Dialog open={isGenerateQuestionsModalOpen} onOpenChange={setIsGenerateQuestionsModalOpen}>
        <DialogContent className="max-w-md border-[#1B2B40]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#C41E3A] to-[#D4AF37]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              Generer des questions par IA
            </DialogTitle>
            <DialogDescription>
              L'IA va generer des questions pertinentes pour ce quiz
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre de questions</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={generateQuestionsForm.numberOfQuestions}
                onChange={(e) => setGenerateQuestionsForm({
                  ...generateQuestionsForm,
                  numberOfQuestions: parseInt(e.target.value) || 1,
                })}
                className="border-[#DCE6F0] dark:border-[#1B2B40]"
              />
            </div>

            <div className="space-y-2">
              <Label>Type de question</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={generateQuestionsForm.type === 'QCU' ? 'default' : 'outline'}
                  className={cn(
                    generateQuestionsForm.type === 'QCU' ? 'bg-[#C41E3A] hover:bg-[#9B1B30] text-white' : 'border-[#1B2B40]'
                  )}
                  onClick={() => setGenerateQuestionsForm({ ...generateQuestionsForm, type: 'QCU' })}
                >
                  QCU (Choix unique)
                </Button>
                <Button
                  type="button"
                  variant={generateQuestionsForm.type === 'QCM' ? 'default' : 'outline'}
                  className={cn(
                    generateQuestionsForm.type === 'QCM' ? 'bg-[#C41E3A] hover:bg-[#9B1B30] text-white' : 'border-[#1B2B40]'
                  )}
                  onClick={() => setGenerateQuestionsForm({ ...generateQuestionsForm, type: 'QCM' })}
                >
                  QCM (Choix multiple)
                </Button>
                <Button
                  type="button"
                  variant={generateQuestionsForm.type === 'MIXTE' ? 'default' : 'outline'}
                  className={cn(
                    generateQuestionsForm.type === 'MIXTE' ? 'bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] text-white' : 'border-[#1B2B40]'
                  )}
                  onClick={() => setGenerateQuestionsForm({ ...generateQuestionsForm, type: 'MIXTE' })}
                >
                  Mixte (QCU + QCM)
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#EFF3F7] dark:bg-[#111B2E] border border-[#DCE6F0] dark:border-[#1B2B40] text-sm text-[#5E7A9A]">
              <p className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                L'IA utilisera le contexte du quiz et les documents de reference pour generer des questions pertinentes.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateQuestionsModalOpen(false)} className="border-[#1B2B40]">
              Annuler
            </Button>
            <Button
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions}
              className="bg-gradient-to-r from-[#C41E3A] to-[#D4AF37] text-white hover:from-[#9B1B30] hover:to-[#C9A030]"
            >
              {isGeneratingQuestions ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block mr-2"
                  >
                    &#9917;
                  </motion.span>
                  Generation...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generer {generateQuestionsForm.numberOfQuestions} question(s)
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
