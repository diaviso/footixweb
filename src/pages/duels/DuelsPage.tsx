import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Plus,
  LogIn,
  Copy,
  Check,
  ArrowLeft,
  Users,
  Star,
  Trophy,
  Clock,
  Play,
  Crown,
  Medal,
  Loader2,
  XCircle,
  CheckCircle,
  AlertCircle,
  Shield,
  Ticket,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { UserAvatar } from '@/components/ui/user-avatar';
import { useAuthStore } from '@/store/auth';
import { duelService } from '@/services/duel.service';
import type { Duel, DuelListItem, DuelQuestion } from '@/services/duel.service';
import { cn } from '@/lib/utils';
import {
  staggerContainer,
  staggerItem,
  scoreReveal,
  podiumRise,
} from '@/lib/animations';

const DIFFICULTY_CONFIG = {
  FACILE: { label: 'Facile', cost: 5, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: 'from-blue-500 to-blue-400' },
  MOYEN: { label: 'Moyen', cost: 10, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', gradient: 'from-yellow-500 to-yellow-400' },
  DIFFICILE: { label: 'Difficile', cost: 20, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', gradient: 'from-red-500 to-red-400' },
  ALEATOIRE: { label: 'Aleatoire', cost: 12, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', gradient: 'from-purple-500 to-purple-400' },
};

const STATUS_LABELS: Record<string, string> = {
  WAITING: 'En attente',
  READY: 'Pret',
  PLAYING: 'En cours',
  FINISHED: 'Termine',
  CANCELLED: 'Annule',
};

const OPTION_BADGES = ['A', 'B', 'C', 'D'];

type View = 'list' | 'create' | 'join' | 'lobby' | 'play' | 'results';

export function DuelsPage() {
  const { user } = useAuthStore();
  const [view, setView] = useState<View>('list');
  const [duels, setDuels] = useState<DuelListItem[]>([]);
  const [currentDuel, setCurrentDuel] = useState<Duel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDuels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await duelService.getMyDuels();
      setDuels(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDuels();
  }, [loadDuels]);

  const handleBack = () => {
    setError('');
    setCurrentDuel(null);
    setView('list');
    loadDuels();
  };

  const handleDuelCreated = (duel: Duel) => {
    setCurrentDuel(duel);
    setView('lobby');
  };

  const handleJoined = (duel: Duel) => {
    setCurrentDuel(duel);
    if (duel.status === 'PLAYING') setView('play');
    else if (duel.status === 'FINISHED') setView('results');
    else setView('lobby');
  };

  const handleOpenDuel = async (duelId: string) => {
    try {
      setLoading(true);
      const duel = await duelService.getDuel(duelId);
      setCurrentDuel(duel);
      if (duel.status === 'PLAYING') setView('play');
      else if (duel.status === 'FINISHED') setView('results');
      else setView('lobby');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <DuelListView
            key="list"
            duels={duels}
            loading={loading}
            onCreateClick={() => { setError(''); setView('create'); }}
            onJoinClick={() => { setError(''); setView('join'); }}
            onOpenDuel={handleOpenDuel}
          />
        )}
        {view === 'create' && (
          <CreateDuelView
            key="create"
            userStars={user?.stars || 0}
            onBack={handleBack}
            onCreated={handleDuelCreated}
          />
        )}
        {view === 'join' && (
          <JoinDuelView
            key="join"
            onBack={handleBack}
            onJoined={handleJoined}
          />
        )}
        {view === 'lobby' && currentDuel && (
          <LobbyView
            key="lobby"
            duel={currentDuel}
            userId={user?.id || ''}
            onBack={handleBack}
            onStarted={() => setView('play')}
            onDuelUpdate={setCurrentDuel}
          />
        )}
        {view === 'play' && currentDuel && (
          <PlayView
            key="play"
            duel={currentDuel}
            onFinished={() => setView('results')}
            onDuelUpdate={setCurrentDuel}
          />
        )}
        {view === 'results' && currentDuel && (
          <ResultsView
            key="results"
            duel={currentDuel}
            userId={user?.id || ''}
            onBack={handleBack}
            onDuelUpdate={setCurrentDuel}
          />
        )}
      </AnimatePresence>
      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   LIST VIEW — "Arene" with ScoreboardHeader + VS-style cards
   ================================================================ */

function DuelListView({
  duels,
  loading,
  onCreateClick,
  onJoinClick,
  onOpenDuel,
}: {
  duels: DuelListItem[];
  loading: boolean;
  onCreateClick: () => void;
  onJoinClick: () => void;
  onOpenDuel: (id: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {/* Scoreboard Header */}
      <ScoreboardHeader
        title="Arene"
        subtitle="Affrontez d'autres joueurs en temps reel"
        icon={<Swords className="h-6 w-6" />}
        rightContent={
          <div className="flex gap-2">
            <Button onClick={onJoinClick} variant="outline" size="sm" className="gap-1.5 border-[#1B2B40] text-white hover:text-white hover:bg-white/10 hover:border-[#E74C5E]/50">
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Rejoindre</span>
            </Button>
            <Button onClick={onCreateClick} size="sm" className="gap-1.5 bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F]">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Creer</span>
            </Button>
          </div>
        }
      />

      {/* Duels list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#C41E3A] dark:text-[#E74C5E]" />
        </div>
      ) : duels.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] py-16 text-center">
            {/* Stadium field pattern behind */}
            <div className="absolute inset-0 pitch-grid-pattern opacity-30" />
            <div className="relative z-10">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-[#C41E3A]/10 to-[#E74C5E]/5 dark:from-[#E74C5E]/10 dark:to-[#E74C5E]/5 flex items-center justify-center">
                <Swords className="h-10 w-10 text-[#C41E3A]/30 dark:text-[#E74C5E]/30" />
              </div>
              <p className="text-lg font-bold text-[#0A1628] dark:text-[#E2E8F5]">L'arene est vide</p>
              <p className="text-sm text-[#5E7A9A] mt-1">Creez un match ou rejoignez-en un avec un code</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="visible"
          className="grid gap-3 mt-6"
        >
          {duels.map((duel) => {
            const diff = DIFFICULTY_CONFIG[duel.difficulty as keyof typeof DIFFICULTY_CONFIG];
            const p1 = duel.participants?.[0];
            const p2 = duel.participants?.[1];
            const isFinished = duel.status === 'FINISHED';

            return (
              <motion.div key={duel.id} variants={staggerItem}>
                <Card
                  className="cursor-pointer border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] hover:border-[#C41E3A]/40 dark:hover:border-[#E74C5E]/40 transition-all group"
                  onClick={() => onOpenDuel(duel.id)}
                >
                  <CardContent className="p-4">
                    {/* Top row: code + badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs tracking-wider px-2 py-0.5 rounded-md bg-[#0A1628] dark:bg-white/10 text-white">
                          {duel.code}
                        </span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', diff?.bg, diff?.color)}>
                          {diff?.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          isFinished
                            ? 'bg-[#EFF3F7] dark:bg-[#111B2E] text-[#5E7A9A]'
                            : 'bg-[#C41E3A]/10 text-[#C41E3A] dark:bg-[#E74C5E]/10 dark:text-[#E74C5E]',
                        )}>
                          {STATUS_LABELS[duel.status] || duel.status}
                        </span>
                        {duel.isCreator && (
                          <Shield className="h-3.5 w-3.5 text-[#D4AF37]" />
                        )}
                      </div>
                    </div>

                    {/* VS Card: 2 avatars with VS badge */}
                    <div className="flex items-center justify-center gap-4">
                      {/* Player 1 */}
                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        {p1 ? (
                          <>
                            <UserAvatar user={{ id: p1.id, firstName: p1.firstName, lastName: p1.lastName, avatar: p1.avatar }} size="lg" />
                            <span className="text-xs font-semibold text-[#0A1628] dark:text-[#E2E8F5] truncate max-w-full">
                              {p1.firstName}
                            </span>
                            {isFinished && p1.rank != null && (
                              <span className="text-xs text-[#5E7A9A]">{p1.score}%</span>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#DCE6F0] dark:border-[#1B2B40] flex items-center justify-center">
                              <Clock className="h-4 w-4 text-[#5E7A9A]/50" />
                            </div>
                            <span className="text-xs text-[#5E7A9A]">En attente</span>
                          </>
                        )}
                      </div>

                      {/* VS Badge */}
                      <div className="flex-shrink-0 relative">
                        <div className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center font-black text-xs',
                          isFinished
                            ? 'bg-[#EFF3F7] dark:bg-[#111B2E] text-[#5E7A9A]'
                            : 'bg-gradient-to-br from-[#C41E3A] to-[#9B1B30] dark:from-[#E74C5E] dark:to-[#D43B4F] text-white shadow-lg shadow-[#C41E3A]/20 dark:shadow-[#E74C5E]/20',
                        )}>
                          VS
                        </div>
                      </div>

                      {/* Player 2 */}
                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        {p2 ? (
                          <>
                            <UserAvatar user={{ id: p2.id, firstName: p2.firstName, lastName: p2.lastName, avatar: p2.avatar }} size="lg" />
                            <span className="text-xs font-semibold text-[#0A1628] dark:text-[#E2E8F5] truncate max-w-full">
                              {p2.firstName}
                            </span>
                            {isFinished && p2.rank != null && (
                              <span className="text-xs text-[#5E7A9A]">{p2.score}%</span>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="h-12 w-12 rounded-full border-2 border-dashed border-[#DCE6F0] dark:border-[#1B2B40] flex items-center justify-center">
                              <Clock className="h-4 w-4 text-[#5E7A9A]/50" />
                            </div>
                            <span className="text-xs text-[#5E7A9A]">En attente</span>
                          </>
                        )}
                      </div>

                      {/* Extra participants indicator (for 3-4 player duels) */}
                      {duel.participantCount > 2 && (
                        <div className="absolute -right-2 -top-1 bg-[#D4AF37] text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow">
                          +{duel.participantCount - 2}
                        </div>
                      )}
                    </div>

                    {/* Bottom row: stats */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#DCE6F0]/50 dark:border-[#1B2B40]/50">
                      <div className="flex items-center gap-3 text-xs text-[#5E7A9A]">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {duel.participantCount}/{duel.maxParticipants}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-[#D4AF37]" /> {duel.starsCost}
                        </span>
                      </div>
                      {isFinished && duel.myRank && (
                        <span className={cn(
                          'flex items-center gap-1 text-xs font-bold',
                          duel.myRank === 1 ? 'text-[#D4AF37]' : 'text-[#C41E3A] dark:text-[#E74C5E]',
                        )}>
                          {duel.myRank === 1 ? <Crown className="h-3 w-3" /> : <Medal className="h-3 w-3" />}
                          #{duel.myRank}
                          {duel.myStarsWon > 0 && <span className="text-[#D4AF37] ml-1">+{duel.myStarsWon}</span>}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ================================================================
   CREATE VIEW — Ticket perfore (perforated ticket) style
   ================================================================ */

function CreateDuelView({
  userStars,
  onBack,
  onCreated,
}: {
  userStars: number;
  onBack: () => void;
  onCreated: (duel: Duel) => void;
}) {
  const [participants, setParticipants] = useState<number>(2);
  const [difficulty, setDifficulty] = useState<string>('FACILE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cost = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.cost || 5;
  const canAfford = userStars >= cost;
  const diff = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG];

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError('');
      const duel = await duelService.create({ maxParticipants: participants, difficulty });
      onCreated(duel);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#5E7A9A] hover:text-[#C41E3A] dark:hover:text-[#E74C5E] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour a l'arene
      </button>

      <ScoreboardHeader
        title="Nouveau Match"
        subtitle="Configurez votre duel"
        icon={<Ticket className="h-5 w-5" />}
        className="mb-6"
      />

      {/* Participants */}
      <div className="mb-6">
        <label className="text-xs font-bold text-[#5E7A9A] uppercase tracking-wider mb-3 block">Nombre de joueurs</label>
        <div className="grid grid-cols-3 gap-3">
          {[2, 3, 4].map((n) => (
            <motion.button
              key={n}
              whileTap={{ scale: 0.95 }}
              onClick={() => setParticipants(n)}
              className={cn(
                'relative p-4 rounded-xl border-2 text-center transition-all overflow-hidden',
                participants === n
                  ? 'border-[#C41E3A] dark:border-[#E74C5E] bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5'
                  : 'border-[#DCE6F0] dark:border-[#1B2B40] hover:border-[#C41E3A]/30'
              )}
            >
              {participants === n && (
                <motion.div
                  layoutId="participant-selected"
                  className="absolute inset-0 bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <div className="relative z-10">
                <Users className={cn('h-6 w-6 mx-auto mb-1', participants === n ? 'text-[#C41E3A] dark:text-[#E74C5E]' : 'text-[#5E7A9A]')} />
                <span className={cn('text-2xl font-black', participants === n ? 'text-[#C41E3A] dark:text-[#E74C5E]' : 'text-[#0A1628] dark:text-[#E2E8F5]')}>{n}</span>
                <p className="text-[10px] uppercase tracking-wider font-bold text-[#5E7A9A] mt-0.5">joueurs</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="mb-6">
        <label className="text-xs font-bold text-[#5E7A9A] uppercase tracking-wider mb-3 block">Difficulte</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDifficulty(key)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all',
                difficulty === key
                  ? `${config.border} ${config.bg}`
                  : 'border-[#DCE6F0] dark:border-[#1B2B40] hover:border-[#C41E3A]/30'
              )}
            >
              <span className={cn('font-bold', config.color)}>{config.label}</span>
              <p className="text-xs text-[#5E7A9A] mt-1 flex items-center gap-1">
                <Star className="h-3 w-3 text-[#D4AF37]" /> {config.cost} etoiles
              </p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Perforated Ticket Summary Card */}
      <div className="relative mb-6">
        {/* Top section */}
        <div className="bg-gradient-to-r from-[#0A1628] via-[#0D1D35] to-[#0A1628] dark:from-[#050810] dark:via-[#07090F] dark:to-[#050810] rounded-t-2xl px-5 py-4 border border-b-0 border-[#1B2B40]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Billet d'entree</p>
              <p className="text-white font-black text-lg mt-0.5">Match {diff?.label}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Joueurs</p>
              <p className="text-white font-black text-lg mt-0.5">{participants}v{participants > 2 ? participants - 1 : participants === 2 ? '1' : ''}</p>
            </div>
          </div>
        </div>

        {/* Perforation line */}
        <div className="relative h-4 flex items-center">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#F0F4F8] dark:bg-[#07090F]" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-[#F0F4F8] dark:bg-[#07090F]" />
          <div className="w-full border-t-2 border-dashed border-[#1B2B40]/50 mx-5" />
        </div>

        {/* Bottom section */}
        <div className="bg-white dark:bg-[#0D1525] rounded-b-2xl px-5 py-4 border border-t-0 border-[#DCE6F0] dark:border-[#1B2B40]">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5E7A9A] font-medium">Votre mise</span>
              <span className="font-bold text-[#0A1628] dark:text-[#E2E8F5] flex items-center gap-1">
                <Star className="h-4 w-4 text-[#D4AF37]" /> {cost}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5E7A9A] font-medium">Pot total</span>
              <span className="font-black text-[#C41E3A] dark:text-[#E74C5E] flex items-center gap-1">
                <Star className="h-4 w-4 text-[#D4AF37]" /> {cost * participants}
              </span>
            </div>
            <div className="h-px bg-[#DCE6F0] dark:bg-[#1B2B40]" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5E7A9A] font-medium">Vos etoiles</span>
              <span className={cn('font-bold flex items-center gap-1', canAfford ? 'text-[#0A1628] dark:text-[#E2E8F5]' : 'text-red-500')}>
                <Star className="h-4 w-4 text-[#D4AF37]" /> {userStars}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}

      <Button
        onClick={handleCreate}
        disabled={loading || !canAfford}
        className="w-full gap-2 bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] dark:text-black"
        size="lg"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
        {canAfford ? 'Lancer le match' : 'Etoiles insuffisantes'}
      </Button>
    </motion.div>
  );
}

/* ================================================================
   JOIN VIEW — Stadium entry / tunnel feel
   ================================================================ */

function JoinDuelView({
  onBack,
  onJoined,
}: {
  onBack: () => void;
  onJoined: (duel: Duel) => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (code.length !== 6) { setError('Le code doit contenir 6 caracteres'); return; }
    try {
      setLoading(true);
      setError('');
      const duel = await duelService.join(code);
      onJoined(duel);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#5E7A9A] hover:text-[#C41E3A] dark:hover:text-[#E74C5E] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour a l'arene
      </button>

      <ScoreboardHeader
        title="Rejoindre"
        subtitle="Entrez le code du match"
        icon={<LogIn className="h-5 w-5" />}
        className="mb-8"
      />

      {/* Code input — jersey number style */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#C41E3A]/5 to-transparent dark:from-[#E74C5E]/5 rounded-2xl" />
          <div className="relative p-8 rounded-2xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525]">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Hash className="h-4 w-4 text-[#5E7A9A]" />
              <p className="text-xs font-bold text-[#5E7A9A] uppercase tracking-widest">Code du match</p>
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className="w-full text-center text-4xl font-black tracking-[0.4em] text-[#C41E3A] dark:text-[#E74C5E] bg-transparent focus:outline-none placeholder:text-[#DCE6F0] dark:placeholder:text-[#1B2B40] py-2"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
            {/* Character indicators */}
            <div className="flex justify-center gap-2 mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 w-6 rounded-full transition-all',
                    i < code.length
                      ? 'bg-[#C41E3A] dark:bg-[#E74C5E]'
                      : 'bg-[#DCE6F0] dark:bg-[#1B2B40]'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}

      <Button
        onClick={handleJoin}
        disabled={loading || code.length !== 6}
        className="w-full gap-2 bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] dark:text-black"
        size="lg"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Entrer dans l'arene
      </Button>
    </motion.div>
  );
}

/* ================================================================
   LOBBY VIEW — Tunnel metaphor with sliding avatars
   ================================================================ */

function LobbyView({
  duel,
  userId: _userId,
  onBack,
  onStarted,
  onDuelUpdate,
}: {
  duel: Duel;
  userId: string;
  onBack: () => void;
  onStarted: () => void;
  onDuelUpdate: (d: Duel) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Poll for updates every 3 seconds
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const updated = await duelService.getDuel(duel.id);
        onDuelUpdate(updated);
        if (updated.status === 'PLAYING') {
          onStarted();
        }
      } catch {
        // silent
      }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [duel.id, onDuelUpdate, onStarted]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(duel.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunch = async () => {
    try {
      setLoading(true);
      setError('');
      await duelService.launch(duel.id);
      onStarted();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    try {
      setLoading(true);
      await duelService.leave(duel.id);
      onBack();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const diff = DIFFICULTY_CONFIG[duel.difficulty as keyof typeof DIFFICULTY_CONFIG];
  const isFull = duel.participants.length >= duel.maxParticipants;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#5E7A9A] hover:text-[#C41E3A] dark:hover:text-[#E74C5E] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      {/* Tunnel Header — dark corridor effect */}
      <div className="relative overflow-hidden rounded-2xl mb-6">
        <div className="bg-gradient-to-b from-[#0A1628] via-[#0D1D35] to-[#111B2E] dark:from-[#050810] dark:via-[#07090F] dark:to-[#0D1525] px-6 py-8 border border-[#1B2B40]">
          {/* Stadium light glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#E74C5E]/10 blur-3xl rounded-full" />
          <div className="absolute inset-0 pitch-grid-pattern opacity-20" />

          <div className="relative z-10 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-1">Tunnel des joueurs</p>
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              Salle d'attente
            </h2>
            <p className="text-xs text-white/50 mt-1">
              {diff?.label} -- {duel.starsCost} etoiles par joueur
            </p>
          </div>
        </div>
      </div>

      {/* Code display — jersey number style */}
      <div className="relative mb-6">
        <div className="bg-white dark:bg-[#0D1525] rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] p-6 text-center jersey-pattern">
          <p className="text-[10px] font-bold text-[#5E7A9A] uppercase tracking-[0.2em] mb-2">
            Numero de maillot
          </p>
          <div className="flex items-center justify-center gap-3">
            <motion.span
              className="scoreboard-text text-5xl font-black tracking-[0.3em] text-[#C41E3A] dark:text-[#E74C5E]"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {duel.code}
            </motion.span>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl hover:bg-[#EFF3F7] dark:hover:bg-[#111B2E] transition-colors"
            >
              {copied ? <Check className="h-5 w-5 text-blue-500" /> : <Copy className="h-5 w-5 text-[#5E7A9A]" />}
            </button>
          </div>
          <p className="text-[10px] text-[#5E7A9A] mt-2 uppercase tracking-wider">Partagez ce code</p>
        </div>
      </div>

      {/* Participants — sliding entrance */}
      <div className="mb-6">
        <p className="text-xs font-bold text-[#5E7A9A] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="h-3.5 w-3.5" />
          Joueurs ({duel.participants.length}/{duel.maxParticipants})
        </p>
        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {duel.participants.map((p, idx) => (
            <motion.div
              key={p.id}
              variants={staggerItem}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#EFF3F7] dark:bg-[#111B2E] border border-[#DCE6F0]/50 dark:border-[#1B2B40]/50"
            >
              <UserAvatar user={{ id: p.id, firstName: p.firstName, lastName: p.lastName, avatar: p.avatar }} size="md" />
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-sm text-[#0A1628] dark:text-[#E2E8F5]">{p.firstName} {p.lastName}</span>
                {p.id === duel.creatorId && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                    <Shield className="h-3 w-3" /> Capitaine
                  </span>
                )}
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 + 0.3, type: 'spring' }}
              >
                <CheckCircle className="h-5 w-5 text-blue-500" />
              </motion.div>
            </motion.div>
          ))}
          {Array.from({ length: duel.maxParticipants - duel.participants.length }).map((_, i) => (
            <motion.div
              key={`empty-${i}`}
              variants={staggerItem}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-[#DCE6F0] dark:border-[#1B2B40]"
            >
              <div className="h-10 w-10 rounded-full bg-[#EFF3F7] dark:bg-[#111B2E] flex items-center justify-center">
                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Clock className="h-4 w-4 text-[#5E7A9A]" />
                </motion.div>
              </div>
              <span className="text-sm text-[#5E7A9A] italic">En attente d'un joueur...</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {error}</p>}

      <div className="space-y-3">
        {duel.isCreator && isFull && (
          <Button
            onClick={handleLaunch}
            disabled={loading}
            className="w-full gap-2 bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] dark:text-black"
            size="lg"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Coup d'envoi !
          </Button>
        )}
        {duel.isCreator && !isFull && (
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center p-4 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#E5C158] text-sm font-medium"
          >
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            En attente des joueurs...
          </motion.div>
        )}
        {!duel.isCreator && !isFull && (
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center p-4 rounded-xl bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5 text-[#C41E3A] dark:text-[#E74C5E] text-sm font-medium"
          >
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            En attente des autres joueurs...
          </motion.div>
        )}
        {!duel.isCreator && isFull && (
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center p-4 rounded-xl bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5 text-[#C41E3A] dark:text-[#E74C5E] text-sm font-medium"
          >
            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
            Le capitaine prepare le coup d'envoi...
          </motion.div>
        )}
        <Button onClick={handleLeave} disabled={loading} variant="outline" className="w-full gap-2 text-red-500 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10">
          <XCircle className="h-4 w-4" />
          Quitter le tunnel
        </Button>
      </div>
    </motion.div>
  );
}

/* ================================================================
   PLAY VIEW — HUD style scoreboard + 2x2 grid options
   ================================================================ */

function PlayView({
  duel,
  onFinished,
  onDuelUpdate,
}: {
  duel: Duel;
  onFinished: () => void;
  onDuelUpdate: (d: Duel) => void;
}) {
  const [questions, setQuestions] = useState<DuelQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingQ, setLoadingQ] = useState(true);
  const [rippleKey, setRippleKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const pollRef2 = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const submittedRef = useRef(false);
  const submittingRef = useRef(false);

  // Load questions
  useEffect(() => {
    const load = async () => {
      try {
        const data = await duelService.getQuestions(duel.id);
        setQuestions(data.questions);
        // Calculate remaining time
        if (data.startedAt) {
          const elapsed = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000);
          setTimeLeft(Math.max(0, data.timeLimit - elapsed));
        }
      } catch {
        // silent
      } finally {
        setLoadingQ(false);
      }
    };
    load();
  }, [duel.id]);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current || submittedRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await duelService.submit(duel.id, answers);
      submittedRef.current = true;
      setSubmitted(true);
    } catch { /* silent */ }
    submittingRef.current = false;
    setSubmitting(false);
  }, [duel.id, answers]);

  // Timer
  useEffect(() => {
    if (loadingQ || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loadingQ, submitted, handleSubmit]);

  // Poll for duel status (to detect finish)
  useEffect(() => {
    if (!submitted) return;
    pollRef2.current = setInterval(async () => {
      try {
        const updated = await duelService.getDuel(duel.id);
        onDuelUpdate(updated);
        if (updated.status === 'FINISHED') {
          clearInterval(pollRef2.current);
          onFinished();
        }
      } catch { /* silent */ }
    }, 3000);
    return () => clearInterval(pollRef2.current);
  }, [submitted, duel.id, onDuelUpdate, onFinished]);

  const handleSelectOption = (questionId: string, optionId: string, type: string) => {
    setRippleKey((k) => k + 1);
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      if (type === 'QCU') {
        return { ...prev, [questionId]: [optionId] };
      }
      // QCM: toggle
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
      }
      return { ...prev, [questionId]: [...current, optionId] };
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const question = questions[currentIndex];
  const isUrgent = timeLeft <= 30;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loadingQ) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-10 w-10 text-[#C41E3A] dark:text-[#E74C5E]" />
        </motion.div>
        <p className="text-[#5E7A9A] mt-4 font-medium">Chargement des questions...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#C41E3A] to-[#9B1B30] dark:from-[#E74C5E] dark:to-[#D43B4F] shadow-lg shadow-[#C41E3A]/20 dark:shadow-[#E74C5E]/20 mb-6"
        >
          <CheckCircle className="h-10 w-10 text-white" />
        </motion.div>
        <h2 className="text-xl font-black text-[#0A1628] dark:text-[#E2E8F5] mb-2 uppercase tracking-wide">Reponses soumises</h2>
        <p className="text-[#5E7A9A] mb-6">En attente du sifflet final...</p>
        <Loader2 className="h-6 w-6 animate-spin text-[#C41E3A] dark:text-[#E74C5E] mx-auto" />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto">
      {/* HUD Scoreboard Bar */}
      <div className={cn(
        'rounded-2xl mb-4 overflow-hidden border transition-colors',
        isUrgent
          ? 'border-red-500/50 bg-gradient-to-r from-red-950 via-red-900 to-red-950'
          : 'border-[#1B2B40] bg-gradient-to-r from-[#0A1628] via-[#0D1D35] to-[#0A1628] dark:from-[#050810] dark:via-[#07090F] dark:to-[#050810]',
      )}>
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Question counter */}
          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-lg px-2.5 py-1">
              <span className="scoreboard-text text-sm font-black text-white">
                Q{currentIndex + 1}
              </span>
            </div>
            <span className="text-white/40 text-xs font-medium">/ {questions.length}</span>
          </div>

          {/* Timer */}
          <motion.div
            animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
            transition={isUrgent ? { duration: 1, repeat: Infinity } : {}}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono font-black text-sm',
              isUrgent ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white',
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </motion.div>

          {/* Type badge */}
          {question && (
            <div className={cn(
              'text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider',
              question.type === 'QCU'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-purple-500/20 text-purple-400',
            )}>
              {question.type === 'QCU' ? '1 reponse' : 'Multiple'}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <motion.div
            className={cn('h-full', isUrgent ? 'bg-red-500' : 'bg-[#E74C5E]')}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>
      </div>

      {question && (
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Question Card */}
            <div className="bg-white dark:bg-[#0D1525] rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] p-5 mb-4 shadow-lg">
              <p className="text-[#0A1628] dark:text-[#E2E8F5] font-semibold leading-relaxed text-base">
                {question.content}
              </p>
            </div>

            {/* Options — 2x2 grid with A/B/C/D badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {question.options.map((opt, idx) => {
                const isSelected = (answers[question.id] || []).includes(opt.id);
                const badge = OPTION_BADGES[idx] || String.fromCharCode(65 + idx);
                const badgeColors = [
                  'from-blue-500 to-blue-600',
                  'from-[#C41E3A] to-[#9B1B30]',
                  'from-[#D4AF37] to-[#B8960F]',
                  'from-purple-500 to-purple-600',
                ];

                return (
                  <motion.button
                    key={opt.id}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectOption(question.id, opt.id, question.type)}
                    className={cn(
                      'relative w-full p-4 rounded-xl border-2 text-left transition-all overflow-hidden group',
                      isSelected
                        ? 'border-[#C41E3A] dark:border-[#E74C5E] bg-[#C41E3A]/5 dark:bg-[#E74C5E]/5 shadow-lg shadow-[#C41E3A]/10'
                        : 'border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] hover:border-[#C41E3A]/30 dark:hover:border-[#E74C5E]/30',
                    )}
                  >
                    {/* Ripple effect on select */}
                    {isSelected && (
                      <motion.div
                        key={`ripple-${rippleKey}`}
                        initial={{ scale: 0, opacity: 0.3 }}
                        animate={{ scale: 4, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#C41E3A] dark:bg-[#E74C5E]"
                        style={{ originX: 0.5, originY: 0.5 }}
                      />
                    )}

                    <div className="relative z-10 flex items-start gap-3">
                      {/* Badge */}
                      <div className={cn(
                        'flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-sm',
                        isSelected
                          ? 'bg-gradient-to-br ' + badgeColors[idx % badgeColors.length]
                          : 'bg-[#EFF3F7] dark:bg-[#111B2E] text-[#5E7A9A]',
                      )}>
                        {isSelected ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          >
                            {badge}
                          </motion.span>
                        ) : (
                          <span className={cn(isSelected ? 'text-white' : 'text-[#5E7A9A]')}>{badge}</span>
                        )}
                      </div>
                      {/* Content */}
                      <span className={cn(
                        'text-sm font-medium pt-1',
                        isSelected ? 'text-[#C41E3A] dark:text-[#E74C5E]' : 'text-[#0A1628] dark:text-[#E2E8F5]',
                      )}>
                        {opt.content}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {currentIndex > 0 && (
                <Button
                  onClick={() => setCurrentIndex((i) => i - 1)}
                  variant="outline"
                  className="flex-1 border-[#DCE6F0] dark:border-[#1B2B40]"
                >
                  Precedent
                </Button>
              )}
              {currentIndex < questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="flex-1 bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] dark:text-black"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#C41E3A] to-[#9B1B30] dark:from-[#E74C5E] dark:to-[#D43B4F] text-white gap-2"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Sifflet final
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}

/* ================================================================
   RESULTS VIEW — "RESULTAT DU MATCH" with animated trophy + scoreboard
   ================================================================ */

function ResultsView({
  duel,
  userId,
  onBack,
  onDuelUpdate,
}: {
  duel: Duel;
  userId: string;
  onBack: () => void;
  onDuelUpdate: (d: Duel) => void;
}) {
  const pollRef3 = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // If duel is still PLAYING, poll until finished
  useEffect(() => {
    if (duel.status === 'FINISHED') return;
    pollRef3.current = setInterval(async () => {
      try {
        const updated = await duelService.getDuel(duel.id);
        onDuelUpdate(updated);
        if (updated.status === 'FINISHED') clearInterval(pollRef3.current);
      } catch { /* silent */ }
    }, 3000);
    return () => clearInterval(pollRef3.current);
  }, [duel.id, duel.status, onDuelUpdate]);

  if (duel.status !== 'FINISHED') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto text-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-10 w-10 text-[#C41E3A] dark:text-[#E74C5E] mx-auto" />
        </motion.div>
        <h2 className="text-xl font-black text-[#0A1628] dark:text-[#E2E8F5] mb-2 mt-4 uppercase tracking-wide">
          Calcul des resultats...
        </h2>
        <p className="text-[#5E7A9A]">Le VAR analyse les reponses</p>
      </motion.div>
    );
  }

  const diff = DIFFICULTY_CONFIG[duel.difficulty as keyof typeof DIFFICULTY_CONFIG];
  const sorted = [...duel.participants].sort((a, b) => (a.rank || 99) - (b.rank || 99));
  const winner = sorted[0];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#5E7A9A] hover:text-[#C41E3A] dark:hover:text-[#E74C5E] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour a l'arene
      </button>

      {/* RESULTAT DU MATCH header */}
      <div className="relative overflow-hidden rounded-2xl mb-6">
        <div className="bg-gradient-to-b from-[#0A1628] via-[#0D1D35] to-[#111B2E] dark:from-[#050810] dark:via-[#07090F] dark:to-[#0D1525] px-6 py-8 border border-[#1B2B40] text-center">
          {/* Stadium spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-60 h-20 bg-[#D4AF37]/10 blur-3xl rounded-full" />
          <div className="absolute inset-0 pitch-grid-pattern opacity-20" />

          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-3">
              Sifflet final
            </p>

            {/* Animated trophy */}
            <motion.div
              variants={scoreReveal}
              initial="hidden"
              animate="visible"
              className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#B8960F] shadow-lg shadow-[#D4AF37]/30 mb-4"
            >
              <motion.div
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
              >
                <Trophy className="h-10 w-10 text-white drop-shadow-lg" />
              </motion.div>
            </motion.div>

            <h2 className="scoreboard-text text-2xl font-black text-white uppercase tracking-wider">
              Resultat du match
            </h2>
            <p className="text-xs text-white/50 mt-2">
              {diff?.label} -- Pot : {duel.starsCost * duel.participants.length} etoiles
            </p>
          </div>
        </div>
      </div>

      {/* Scoreboard ranking */}
      <motion.div
        variants={staggerContainer(0.15)}
        initial="hidden"
        animate="visible"
        className="space-y-3 mb-8"
      >
        {sorted.map((p, i) => {
          const isMe = p.id === userId;
          const isWinner = i === 0;
          const isSecond = i === 1;
          const isThird = i === 2;

          const rankGradients = [
            'from-[#D4AF37] to-[#B8960F]',     // Gold
            'from-gray-300 to-gray-400',         // Silver
            'from-amber-600 to-amber-700',       // Bronze
          ];

          return (
            <motion.div
              key={p.id}
              variants={podiumRise(i * 0.15)}
              initial="hidden"
              animate="visible"
            >
              <div className={cn(
                'relative rounded-2xl border-2 overflow-hidden transition-all',
                isMe ? 'border-[#C41E3A] dark:border-[#E74C5E]' : 'border-[#DCE6F0] dark:border-[#1B2B40]',
                isWinner ? 'bg-gradient-to-r from-[#D4AF37]/5 via-white to-[#D4AF37]/5 dark:from-[#D4AF37]/10 dark:via-[#0D1525] dark:to-[#D4AF37]/10' : 'bg-white dark:bg-[#0D1525]',
              )}>
                {/* Winner shimmer */}
                {isWinner && (
                  <div className="absolute inset-0 shimmer-border opacity-20" />
                )}

                <div className="relative p-4 flex items-center gap-4">
                  {/* Rank badge */}
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0',
                    (isWinner || isSecond || isThird)
                      ? `bg-gradient-to-br ${rankGradients[i] || rankGradients[2]} text-white shadow-md`
                      : 'bg-[#EFF3F7] dark:bg-[#111B2E] text-[#5E7A9A]',
                  )}>
                    {isWinner ? <Crown className="h-6 w-6" /> : `#${i + 1}`}
                  </div>

                  {/* Player info with avatar */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <UserAvatar user={{ id: p.id, firstName: p.firstName, lastName: p.lastName, avatar: p.avatar }} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'font-bold text-sm truncate',
                          isMe ? 'text-[#C41E3A] dark:text-[#E74C5E]' : 'text-[#0A1628] dark:text-[#E2E8F5]',
                        )}>
                          {p.firstName} {p.lastName}
                        </span>
                        {isMe && (
                          <span className="text-[10px] bg-[#C41E3A]/10 text-[#C41E3A] dark:bg-[#E74C5E]/10 dark:text-[#E74C5E] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                            Vous
                          </span>
                        )}
                      </div>
                      {/* Score comparison bar */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-[#EFF3F7] dark:bg-[#111B2E] overflow-hidden max-w-[120px]">
                          <motion.div
                            className={cn(
                              'h-full rounded-full',
                              isWinner ? 'bg-[#D4AF37]' : 'bg-[#C41E3A] dark:bg-[#E74C5E]',
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${p.score}%` }}
                            transition={{ delay: i * 0.2 + 0.5, duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-xs text-[#5E7A9A] font-medium">
                          {p.correctCount}/10 -- {p.score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stars result */}
                  <div className="text-right flex-shrink-0">
                    {p.starsWon > 0 ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.2 + 0.8, type: 'spring' }}
                        className="flex items-center gap-1 font-black text-[#D4AF37]"
                      >
                        +{p.starsWon} <Star className="h-4 w-4" />
                      </motion.span>
                    ) : (
                      <span className="text-xs text-[#5E7A9A] font-medium">
                        -{duel.starsCost} <Star className="h-3 w-3 inline text-[#5E7A9A]" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <Button
        onClick={onBack}
        className="w-full gap-2 bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] dark:text-black"
        size="lg"
      >
        <Swords className="h-4 w-4" />
        Retour a l'arene
      </Button>
    </motion.div>
  );
}
