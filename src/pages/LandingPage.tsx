import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Trophy,
  Star,
  CheckCircle,
  ArrowRight,
  Users,
  Smartphone,
  Zap,
  Target,
  BarChart3,
  Timer,
  Sparkles,
  Shield,
  Swords,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';

/* Animated counter for hero stats */
function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericPart = value.replace(/[^0-9]/g, '');
  const suffix = value.replace(/[0-9]/g, '');
  const numVal = parseInt(numericPart) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(numVal * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, numVal]);

  return (
    <div ref={ref} className="text-center">
      <div className="scoreboard-text text-2xl font-black text-white">{display.toLocaleString()}{suffix}</div>
      <div className="text-xs text-white/30 mt-0.5 font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}

/* ============================================================
   FOOTBALL SVG COMPONENTS (lightweight, inline)
   ============================================================ */

function FootballFieldLines() {
  return (
    <svg
      viewBox="0 0 1200 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full opacity-[0.04]"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect x="30" y="30" width="1140" height="540" stroke="white" strokeWidth="2" />
      <line x1="600" y1="30" x2="600" y2="570" stroke="white" strokeWidth="1.5" />
      <circle cx="600" cy="300" r="90" stroke="white" strokeWidth="1.5" />
      <circle cx="600" cy="300" r="5" fill="white" />
      {/* Left penalty */}
      <rect x="30" y="165" width="120" height="270" stroke="white" strokeWidth="1.5" />
      <rect x="30" y="225" width="45" height="150" stroke="white" strokeWidth="1.5" />
      <circle cx="120" cy="300" r="3" fill="white" />
      <path d="M 150 220 A 90 90 0 0 1 150 380" stroke="white" strokeWidth="1.5" />
      {/* Right penalty */}
      <rect x="1050" y="165" width="120" height="270" stroke="white" strokeWidth="1.5" />
      <rect x="1125" y="225" width="45" height="150" stroke="white" strokeWidth="1.5" />
      <circle cx="1080" cy="300" r="3" fill="white" />
      <path d="M 1050 220 A 90 90 0 0 0 1050 380" stroke="white" strokeWidth="1.5" />
      {/* Goals */}
      <rect x="0" y="255" width="30" height="90" stroke="white" strokeWidth="1.5" />
      <rect x="1170" y="255" width="30" height="90" stroke="white" strokeWidth="1.5" />
      {/* Corner arcs */}
      <path d="M 30 50 A 20 20 0 0 1 50 30" stroke="white" strokeWidth="1.5" />
      <path d="M 1150 30 A 20 20 0 0 1 1170 50" stroke="white" strokeWidth="1.5" />
      <path d="M 1170 550 A 20 20 0 0 1 1150 570" stroke="white" strokeWidth="1.5" />
      <path d="M 50 570 A 20 20 0 0 1 30 550" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function FootballBall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="60" r="55" fill="white" />
      <circle cx="60" cy="60" r="55" fill="none" stroke="#1B2B40" strokeWidth="2" />
      {/* Pentagon pattern */}
      <polygon points="60,10 85,28 76,56 44,56 35,28" fill="#0A1628" />
      <polygon points="95,40 115,58 108,82 88,82 82,58" fill="#0A1628" />
      <polygon points="25,40 38,58 32,82 12,82 5,58" fill="#0A1628" />
      <polygon points="60,110 80,96 78,72 42,72 40,96" fill="#0A1628" />
      {/* Connecting lines */}
      <line x1="60" y1="10" x2="85" y2="28" stroke="white" strokeWidth="1" />
      <line x1="60" y1="10" x2="35" y2="28" stroke="white" strokeWidth="1" />
      <line x1="85" y1="28" x2="95" y2="40" stroke="white" strokeWidth="1" />
      <line x1="35" y1="28" x2="25" y2="40" stroke="white" strokeWidth="1" />
    </svg>
  );
}

/* ============================================================
   LANDING PAGE
   ============================================================ */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090F] text-white overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07090F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Footix" className="h-9 w-9 rounded-xl" />
              <span className="text-xl font-black tracking-tight">
                Foot<span className="text-[#E74C5E]">ix</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/8">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#E74C5E] hover:bg-[#D43B4F] text-black font-bold shadow-lg shadow-[#E74C5E]/20">
                  Commencer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0">
          {/* Deep gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050810] via-[#07090F] to-[#040608]" />
          {/* Pitch green glow */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#1A0508]/40 to-transparent" />
          {/* Stadium lights */}
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/4 w-[600px] h-64 bg-[#E74C5E]/6 blur-[100px] rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute top-0 right-1/4 w-[500px] h-52 bg-[#E74C5E]/4 blur-[80px] rounded-full"
          />
          {/* Football field lines */}
          <FootballFieldLines />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 bg-[#E74C5E]/10 border border-[#E74C5E]/20 rounded-full px-4 py-1.5 mb-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E74C5E] animate-pulse" />
                  <span className="text-[#E74C5E] text-xs font-bold uppercase tracking-wider">
                    100% Gratuit · Sans carte requise
                  </span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
              >
                Le quiz
                <br />
                <span className="text-[#E74C5E]">football</span>
                <br />
                ultime.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="text-white/50 text-lg leading-relaxed max-w-md mb-8"
              >
                Coupe du Monde, Ligue des Champions, Premier League, La Liga...
                Testez vos connaissances et grimpez au classement mondial.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <Link to="/register">
                  <Button
                    size="xl"
                    className="bg-[#E74C5E] hover:bg-[#D43B4F] text-black font-black shadow-2xl shadow-[#E74C5E]/25 gap-2"
                  >
                    ⚽ Jouer maintenant
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/10 text-white/60 hover:bg-white/5 hover:text-white hover:border-[#E74C5E]/30"
                  >
                    J'ai déjà un compte
                  </Button>
                </Link>
              </motion.div>

              {/* Stats row — animated counters */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-10 flex flex-wrap gap-6"
              >
                <AnimatedStat value="500+" label="Quiz" />
                <AnimatedStat value="5000+" label="Questions" />
                <AnimatedStat value="10000+" label="Joueurs" />
                <div className="text-center">
                  <div className="scoreboard-text text-2xl font-black text-white">4.9★</div>
                  <div className="text-xs text-white/30 mt-0.5 font-medium uppercase tracking-wide">Note</div>
                </div>
              </motion.div>
            </div>

            {/* Right: Football visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-[#E74C5E]/10 blur-3xl scale-110" />
                {/* Outer decorative ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-[#E74C5E]/15"
                  style={{ transform: 'scale(1.3)' }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border border-white/5"
                  style={{ transform: 'scale(1.6)' }}
                />

                {/* Ball — 3D rotation */}
                <motion.div
                  animate={{ y: [0, -12, 0], rotateY: [0, 360] }}
                  transition={{
                    y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                    rotateY: { duration: 8, repeat: Infinity, ease: 'linear' },
                  }}
                  className="relative z-10"
                  style={{ perspective: '600px', transformStyle: 'preserve-3d' }}
                >
                  <FootballBall className="w-56 h-56 drop-shadow-2xl" />
                </motion.div>

                {/* Floating score cards */}
                <motion.div
                  animate={{ y: [0, -8, 0], x: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-8 -right-12 bg-[#0D1525]/90 border border-[#1B2B40] rounded-2xl px-4 py-3 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-[#FFB800]" />
                    <div>
                      <div className="text-xs text-white/40 font-medium">Classement</div>
                      <div className="text-sm font-black text-white">#1 Mondial</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0], x: [0, -4, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -left-10 bg-[#0D1525]/90 border border-[#1B2B40] rounded-2xl px-4 py-3 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-[#FFB800] fill-current" />
                    <div>
                      <div className="text-xs text-white/40 font-medium">Quiz réussi</div>
                      <div className="text-sm font-black text-[#E74C5E]">+15 étoiles</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#07090F] to-transparent" />
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#07090F] via-[#0D0508]/30 to-[#07090F]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-1.5 mb-5">
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Comment ça marche</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              3 étapes pour devenir
              <br />
              <span className="text-[#E74C5E]">expert du ballon rond</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-[#E74C5E]/30 to-transparent" />

            {[
              {
                num: '01',
                icon: Target,
                title: 'Choisissez un thème',
                desc: 'Coupe du Monde, Ligue des Champions, légendes du foot, règles du jeu... Des dizaines de catégories vous attendent.',
                color: '#E74C5E',
              },
              {
                num: '02',
                icon: Zap,
                title: 'Répondez aux quiz',
                desc: 'Questions variées, niveaux Facile à Difficile. Chaque bonne réponse rapporte des étoiles. Le chrono tourne !',
                color: '#FFB800',
              },
              {
                num: '03',
                icon: Trophy,
                title: 'Grimpez au classement',
                desc: 'Affrontez des milliers de joueurs dans le classement mondial. Visez le top 10 !',
                color: '#EF4444',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative group"
              >
                <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/6 hover:bg-white/[0.06] hover:border-[#E74C5E]/20 transition-all duration-300">
                  {/* Step number */}
                  <div className="text-6xl font-black text-white/[0.06] group-hover:text-white/10 transition-colors mb-4 leading-none">
                    {step.num}
                  </div>
                  {/* Icon */}
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${step.color}15` }}
                  >
                    <step.icon className="h-6 w-6" style={{ color: step.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                  <p className="text-white/40 leading-relaxed text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              Tout pour les <span className="text-[#E74C5E]">passionnés</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Des fonctionnalités pensées pour une expérience de quiz exceptionnelle.
            </p>
          </motion.div>

          {/* Bento grid — first item spans 2 cols, last spans full width */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Target, title: 'Quiz variés', desc: 'QCU, QCM sur tous les aspects du football. Des centaines de questions allant de Facile à Difficile.', span: 'sm:col-span-2' },
              { icon: Star, title: 'Système d\'étoiles', desc: 'Gagnez des étoiles à chaque quiz réussi.' },
              { icon: Trophy, title: 'Classement mondial', desc: 'Affrontez les meilleurs, grimpez au top.' },
              { icon: Timer, title: 'Mode Révision', desc: 'Questions aléatoires pour tester vos connaissances.' },
              { icon: BarChart3, title: 'Statistiques', desc: 'Suivez votre progression avec des stats détaillées.' },
              { icon: Users, title: 'Communauté', desc: 'Rejoignez des milliers de passionnés.' },
              { icon: Swords, title: 'Duels en ligne', desc: 'Défiez vos amis en temps réel dans l\'arène.' },
              { icon: Smartphone, title: 'Multi-plateforme', desc: 'Web, Android, iOS — vos données synchronisées partout, tout le temps.', span: 'sm:col-span-2 lg:col-span-2' },
              { icon: Sparkles, title: 'Quiz IA', desc: 'Nouvelles questions générées par intelligence artificielle chaque semaine. Contenu toujours frais !', span: 'sm:col-span-2 lg:col-span-2' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#E74C5E]/25 hover:bg-white/[0.04] transition-all duration-300 group ${(feature as any).span || ''}`}
              >
                <div className="h-10 w-10 rounded-xl bg-[#E74C5E]/10 flex items-center justify-center mb-4 group-hover:bg-[#E74C5E]/15 transition-colors">
                  <feature.icon className="h-5 w-5 text-[#E74C5E]" />
                </div>
                <h3 className="font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== REWARDS SECTION ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#E74C5E]/[0.02] to-transparent" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-5xl font-black mb-6">
                Gagnez des
                <br />
                <span className="text-[#FFB800]">récompenses</span>
              </h2>
              <p className="text-white/40 text-lg mb-10 leading-relaxed">
                Chaque quiz réussi vous rapporte des étoiles. Plus la difficulté est
                élevée, plus vous gagnez. Visez le score parfait pour doubler vos gains !
              </p>
              <ul className="space-y-4">
                {[
                  'Quiz réussi Facile : +3 étoiles ⭐',
                  'Quiz réussi Moyen : +7 étoiles ⭐',
                  'Quiz réussi Difficile : +15 étoiles ⭐',
                  'Score parfait (100%) : bonus x2 🎯',
                  'Classement mondial en temps réel 🌍',
                  'Débloque des quiz avancés avec tes étoiles 🔓',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="h-5 w-5 text-[#E74C5E] flex-shrink-0" />
                    <span className="text-white/65">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#E74C5E]/10 to-[#FFB800]/5 rounded-3xl blur-2xl" />
                <div className="relative rounded-3xl bg-white/[0.03] border border-white/8 p-8 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FFB800] to-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#FFB800]/20">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-black text-white">Système de récompenses</div>
                      <div className="text-white/35 text-xs mt-0.5">Gagnez des étoiles, montez au classement</div>
                    </div>
                  </div>

                  {/* Score table */}
                  {[
                    { label: 'Quiz Facile', value: '+3 ⭐', color: 'bg-[#E74C5E]/8', border: 'border-[#E74C5E]/10' },
                    { label: 'Quiz Moyen', value: '+7 ⭐', color: 'bg-[#E74C5E]/12', border: 'border-[#E74C5E]/15' },
                    { label: 'Quiz Difficile', value: '+15 ⭐', color: 'bg-[#E74C5E]/16', border: 'border-[#E74C5E]/20' },
                    { label: 'Score parfait (100%)', value: 'x2 bonus 🎯', color: 'bg-[#FFB800]/8', border: 'border-[#FFB800]/15' },
                    { label: 'Classement mondial', value: 'Top 100 🌍', color: 'bg-white/[0.03]', border: 'border-white/5' },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl ${row.color} border ${row.border}`}
                    >
                      <span className="font-medium text-white/75 text-sm">{row.label}</span>
                      <span className="font-black text-white text-sm">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE / PLATFORMS ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-1.5 mb-6">
              <Smartphone className="h-3.5 w-3.5 text-[#E74C5E]" />
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Disponible partout</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              Jouez sur <span className="text-[#E74C5E]">tous vos appareils</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto mb-10">
              Application web optimisée pour Android et iOS. Vos données et votre progression
              synchronisées partout, tout le temps.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-[#E74C5E] hover:bg-[#D43B4F] text-black font-black shadow-lg shadow-[#E74C5E]/20">
                  Jouer gratuitement
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-white/25 text-sm">
                <Shield className="h-4 w-4" />
                <span>Android · iOS · Web · Gratuit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-[#E74C5E]/15 p-12 sm:p-16 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E74C5E]/8 via-transparent to-[#E74C5E]/4" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#E74C5E]/10 blur-[60px] rounded-full" />
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-6xl mb-6 inline-block"
                >
                  ⚽
                </motion.div>
                <h2 className="text-3xl sm:text-5xl font-black mb-4">
                  Prêt à relever le <span className="text-[#E74C5E]">défi</span> ?
                </h2>
                <p className="text-lg text-white/40 mb-10 max-w-xl mx-auto">
                  Rejoignez des milliers de passionnés. Inscription gratuite en 30 secondes.
                </p>
                <Link to="/register">
                  <Button
                    size="xl"
                    className="bg-[#E74C5E] hover:bg-[#D43B4F] text-black font-black shadow-2xl shadow-[#E74C5E]/25 gap-2"
                  >
                    Commencer maintenant
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Footix" className="h-8 w-8 rounded-xl" />
              <span className="text-lg font-black tracking-tight">
                Foot<span className="text-[#E74C5E]">ix</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/25">
              <Link to="/help" className="hover:text-[#E74C5E] transition-colors">Aide</Link>
              <Link to="/terms" className="hover:text-[#E74C5E] transition-colors">Conditions</Link>
            </div>
            <p className="text-white/20 text-sm">
              © {new Date().getFullYear()} Footix. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
