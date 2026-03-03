import { Outlet } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Trophy, Target, Users, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/* Lightweight SVG football field (top view) */
function FootballFieldSVG() {
  return (
    <svg
      viewBox="0 0 500 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full opacity-20"
      preserveAspectRatio="xMidYMid meet"
    >
      <rect x="10" y="10" width="480" height="300" stroke="white" strokeWidth="2" rx="2" />
      <line x1="250" y1="10" x2="250" y2="310" stroke="white" strokeWidth="1.5" />
      <circle cx="250" cy="160" r="50" stroke="white" strokeWidth="1.5" />
      <circle cx="250" cy="160" r="3" fill="white" />
      <rect x="10" y="95" width="80" height="130" stroke="white" strokeWidth="1.5" />
      <rect x="10" y="125" width="28" height="70" stroke="white" strokeWidth="1.5" />
      <circle cx="62" cy="160" r="2.5" fill="white" />
      <path d="M 90 130 A 50 50 0 0 1 90 190" stroke="white" strokeWidth="1.5" fill="none" />
      <rect x="410" y="95" width="80" height="130" stroke="white" strokeWidth="1.5" />
      <rect x="462" y="125" width="28" height="70" stroke="white" strokeWidth="1.5" />
      <circle cx="438" cy="160" r="2.5" fill="white" />
      <path d="M 410 130 A 50 50 0 0 0 410 190" stroke="white" strokeWidth="1.5" fill="none" />
      <rect x="0" y="140" width="10" height="40" stroke="white" strokeWidth="1.5" />
      <rect x="490" y="140" width="10" height="40" stroke="white" strokeWidth="1.5" />
      <path d="M 10 20 A 12 12 0 0 1 22 10" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M 478 10 A 12 12 0 0 1 490 22" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M 490 298 A 12 12 0 0 1 478 310" stroke="white" strokeWidth="1.5" fill="none" />
      <path d="M 22 310 A 12 12 0 0 1 10 298" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/* Football ball SVG */
function FootballSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="45" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
      <polygon points="50,12 65,23 60,40 40,40 35,23" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
      <polygon points="73,35 88,46 83,63 68,63 63,46" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
      <polygon points="27,35 42,46 37,63 17,63 12,46" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

/* Animated counter for stats */
function AnimatedStat({ value, label, icon: Icon, delay }: { value: string; label: string; icon: typeof Trophy; delay: number }) {
  const numericPart = value.replace(/[^0-9.]/g, '');
  const suffix = value.replace(/[0-9.]/g, '');
  const numVal = parseFloat(numericPart) || 0;
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1200;
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(numVal * eased * 10) / 10);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [numVal, delay]);

  const displayStr = numVal % 1 === 0
    ? Math.round(display).toString() + suffix
    : display.toFixed(1) + suffix;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay / 1000 }}
      className="p-4 rounded-2xl bg-white/5 border border-white/8 backdrop-blur-sm hover:bg-white/8 hover:border-[#E74C5E]/20 transition-all group"
    >
      <Icon className="h-5 w-5 text-[#E74C5E] mb-2 group-hover:scale-110 transition-transform" />
      <div className="scoreboard-text text-xl font-black text-white">{displayStr}</div>
      <div className="text-xs text-[#5E7A9A] mt-0.5">{label}</div>
    </motion.div>
  );
}

const stats = [
  { icon: Target, value: '500+', label: 'Quiz football' },
  { icon: Trophy, value: '50+', label: 'Thèmes couverts' },
  { icon: Users, value: '10k+', label: 'Joueurs actifs' },
  { icon: Star, value: '4.9/5', label: 'Note moyenne' },
];

export function AuthLayout() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // Parallax transforms for floating balls
  const ball1X = useTransform(smoothX, [-1, 1], [-15, 15]);
  const ball1Y = useTransform(smoothY, [-1, 1], [-10, 10]);
  const ball2X = useTransform(smoothX, [-1, 1], [10, -10]);
  const ball2Y = useTransform(smoothY, [-1, 1], [8, -8]);
  const ball3X = useTransform(smoothX, [-1, 1], [-8, 8]);
  const ball3Y = useTransform(smoothY, [-1, 1], [-12, 12]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    const el = containerRef.current;
    if (el) el.addEventListener('mousemove', handleMouseMove);
    return () => { if (el) el.removeEventListener('mousemove', handleMouseMove); };
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT SIDE — Stadium Night ===== */}
      <div ref={containerRef} className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050810] via-[#07090F] to-[#0A1420]" />
        {/* Red glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#1A0508]/60 to-transparent" />
        {/* Stadium lights glow top */}
        <motion.div
          animate={{ opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-1/4 w-96 h-48 bg-[#E74C5E]/8 blur-[80px] rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute top-0 right-1/4 w-80 h-40 bg-[#D4AF37]/6 blur-[60px] rounded-full"
        />
        {/* Jersey stripes overlay */}
        <div className="absolute inset-0 jersey-pattern opacity-60" />

        {/* Football field positioned at bottom half */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 px-8 pb-8 opacity-30">
          <FootballFieldSVG />
        </div>

        {/* Parallax floating balls */}
        <motion.div
          style={{ x: ball1X, y: ball1Y }}
          animate={{ rotate: [0, 360] }}
          transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' } }}
          className="absolute top-28 right-16 w-20 h-20 opacity-15"
        >
          <FootballSVG className="w-full h-full" />
        </motion.div>
        <motion.div
          style={{ x: ball2X, y: ball2Y }}
          animate={{ rotate: [0, -360] }}
          transition={{ rotate: { duration: 25, repeat: Infinity, ease: 'linear' } }}
          className="absolute top-2/3 left-12 w-14 h-14 opacity-10"
        >
          <FootballSVG className="w-full h-full" />
        </motion.div>
        <motion.div
          style={{ x: ball3X, y: ball3Y }}
          animate={{ rotate: [0, 360] }}
          transition={{ rotate: { duration: 30, repeat: Infinity, ease: 'linear' } }}
          className="absolute top-1/3 left-1/3 w-10 h-10 opacity-8"
        >
          <FootballSVG className="w-full h-full" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#E74C5E] rounded-xl blur-lg opacity-25" />
              <img
                src="/logo.svg"
                alt="Footix"
                className="relative h-12 w-12 rounded-xl shadow-2xl border border-[#E74C5E]/20"
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Foot<span className="text-[#E74C5E]">ix</span>
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-auto mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-[#E74C5E]/10 border border-[#E74C5E]/20 rounded-full px-4 py-1.5 mb-6">
              <span className="live-dot" />
              <span className="text-[#E74C5E] text-xs font-bold uppercase tracking-wider">Quiz Football</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
              Deviens le
              <br />
              <span className="text-[#E74C5E]">champion</span>
              <br />
              du quiz foot
            </h1>
            <p className="text-[#5E7A9A] text-base leading-relaxed max-w-sm">
              Des centaines de quiz sur la Coupe du Monde, la Ligue des Champions,
              les légendes du football et bien plus encore.
            </p>
          </motion.div>

          {/* Stats grid with animated counters */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
              <AnimatedStat
                key={i}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                delay={400 + i * 100}
              />
            ))}
          </div>

          {/* Bottom tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-xs text-[#5E7A9A] text-center border-t border-white/5 pt-4"
          >
            Rejoignez des milliers de passionnés du ballon rond
          </motion.p>
        </div>
      </div>

      {/* ===== RIGHT SIDE — Auth Form with tunnel entry ===== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#F0F4F8] dark:bg-[#07090F] relative overflow-hidden">
        {/* Subtle radial spotlight on dark mode */}
        <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_center,_rgba(196,30,58,0.04)_0%,_transparent_70%)]" />

        {/* Tunnel entry animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="w-full max-w-md relative z-10"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  );
}
