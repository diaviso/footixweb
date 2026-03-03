import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    const expired = sessionStorage.getItem('sessionExpired');
    if (expired) {
      setSessionExpiredMessage(true);
      sessionStorage.removeItem('sessionExpired');
    }
  }, []);

  const performLogin = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { token, user } = response.data;
      setAuth(user, token);
      toast({ title: 'Connexion réussie', description: `Bienvenue ${user.firstName} !` });
      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || '';
      if (errorMessage === 'EMAIL_NOT_VERIFIED') {
        toast({ title: 'Vérification requise', description: 'Un code de vérification a été envoyé à votre email' });
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        toast({
          title: 'Erreur de connexion',
          description: errorMessage || 'Email ou mot de passe incorrect',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckingSession(true);
    try {
      const sessionCheck = await api.post('/auth/check-session', { email: formData.email });
      if (sessionCheck.data.hasActiveSession) {
        setShowSessionWarning(true);
      } else {
        await performLogin();
      }
    } catch {
      await performLogin();
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleConfirmLogin = async () => {
    setShowSessionWarning(false);
    await performLogin();
  };

  const handleGoogleLogin = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="space-y-5">
      {/* Mobile branding */}
      <div className="lg:hidden text-center pb-2">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-[#E74C5E] rounded-2xl blur-xl opacity-20" />
            <img src="/logo.svg" alt="Footix" className="relative h-16 w-16 rounded-2xl shadow-xl" />
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#0A1628] dark:text-[#E2E8F5]">
          Foot<span className="text-[#C41E3A] dark:text-[#E74C5E]">ix</span>
        </h1>
        <p className="text-[#5E7A9A] text-xs mt-1">⚽ Quiz football · Classement mondial</p>
      </div>

      {/* Session expired banner */}
      {sessionExpiredMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Session terminée</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
              Vous avez été déconnecté depuis un autre appareil.
            </p>
          </div>
          <button onClick={() => setSessionExpiredMessage(false)} className="text-amber-600 hover:text-amber-800 text-lg leading-none">×</button>
        </motion.div>
      )}

      {/* Form panel */}
      <div className="bg-white dark:bg-[#0D1525] rounded-3xl shadow-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden">
        {/* Green top accent */}
        <div className="h-1 bg-gradient-to-r from-[#9B1B30] via-[#C41E3A] to-[#E74C5E]" />

        <div className="p-7 space-y-5">
          {/* Heading */}
          <div>
            <h2 className="text-xl font-black text-[#0A1628] dark:text-[#E2E8F5]">Connexion</h2>
            <p className="text-sm text-[#5E7A9A] mt-0.5">Rejoignez le terrain</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-2xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-transparent hover:bg-[#F0F4F8] dark:hover:bg-[#111B2E] hover:border-[#C41E3A] dark:hover:border-[#E74C5E] transition-all text-sm font-medium text-[#0A1628] dark:text-[#E2E8F5]"
          >
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#DCE6F0] dark:bg-[#1B2B40]" />
            <span className="text-xs text-[#5E7A9A] font-medium uppercase tracking-wide">ou</span>
            <div className="flex-1 h-px bg-[#DCE6F0] dark:bg-[#1B2B40]" />
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className="pl-10 h-11 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-[#F8FAFC] dark:bg-[#07090F] focus:border-[#C41E3A] dark:focus:border-[#E74C5E] transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
                  Mot de passe
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#C41E3A] dark:text-[#E74C5E] hover:underline font-medium"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-11 h-11 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-[#F8FAFC] dark:bg-[#07090F] focus:border-[#C41E3A] dark:focus:border-[#E74C5E] transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5E7A9A] hover:text-[#0A1628] dark:hover:text-[#E2E8F5] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-2xl font-bold text-sm bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] text-white dark:text-black shadow-lg shadow-[#C41E3A]/30 dark:shadow-[#E74C5E]/20 transition-all"
              disabled={isLoading || isCheckingSession}
            >
              {isLoading || isCheckingSession ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isCheckingSession ? 'Vérification...' : 'Connexion...'}</>
              ) : (
                '⚽ Se connecter'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-[#5E7A9A]">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-[#C41E3A] dark:text-[#E74C5E] font-bold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>

      {/* Session Warning Dialog */}
      <Dialog open={showSessionWarning} onOpenChange={setShowSessionWarning}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <DialogTitle>Session active détectée</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Vous êtes connecté sur un autre appareil. Continuer vous déconnectera de l'autre appareil.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-200">
            Un seul appareil peut être connecté à la fois pour des raisons de sécurité.
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSessionWarning(false)}>Annuler</Button>
            <Button
              onClick={handleConfirmLogin}
              disabled={isLoading}
              className="bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] text-white dark:text-black"
            >
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connexion...</> : 'Continuer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
