import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({ title: 'Lien invalide', description: 'Le lien de réinitialisation est invalide ou a expiré', variant: 'destructive' });
      navigate('/forgot-password');
    }
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 6 caractères', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: formData.password });
      setIsSuccess(true);
      toast({ title: 'Mot de passe réinitialisé', description: 'Vous pouvez maintenant vous connecter' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({ title: 'Erreur', description: err.response?.data?.message || 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-5">
        <div className="bg-white dark:bg-[#0D1525] rounded-3xl shadow-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#9B1B30] via-[#C41E3A] to-[#E74C5E]" />
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto w-20 h-20 rounded-full bg-[#C41E3A]/10 dark:bg-[#E74C5E]/10 flex items-center justify-center mb-5"
            >
              <CheckCircle className="h-10 w-10 text-[#C41E3A] dark:text-[#E74C5E]" />
            </motion.div>
            <h2 className="text-xl font-black text-[#0A1628] dark:text-[#E2E8F5] mb-2">Mot de passe réinitialisé !</h2>
            <p className="text-sm text-[#5E7A9A] mb-6">
              Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
            </p>
            <Link to="/login">
              <Button className="rounded-2xl bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] text-white dark:text-black">
                ⚽ Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="space-y-5">
        <div className="bg-white dark:bg-[#0D1525] rounded-3xl shadow-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-rose-500 to-rose-700" />
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-5"
            >
              <XCircle className="h-10 w-10 text-rose-500" />
            </motion.div>
            <h2 className="text-xl font-black text-[#0A1628] dark:text-[#E2E8F5] mb-2">Lien invalide</h2>
            <p className="text-sm text-[#5E7A9A] mb-6">Le lien de réinitialisation est invalide ou a expiré.</p>
            <Link to="/forgot-password">
              <Button className="rounded-2xl bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] text-white dark:text-black">
                Demander un nouveau lien
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

      <div className="bg-white dark:bg-[#0D1525] rounded-3xl shadow-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#D97706] via-[#C41E3A] to-[#E74C5E]" />

        <div className="p-7 space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C41E3A]/10 flex items-center justify-center flex-shrink-0">
              <Lock className="h-6 w-6 text-[#C41E3A] dark:text-[#E74C5E]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0A1628] dark:text-[#E2E8F5]">Nouveau mot de passe</h2>
              <p className="text-sm text-[#5E7A9A] mt-0.5">Choisissez un mot de passe sécurisé</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 caractères"
                  className="pl-10 pr-11 h-11 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-[#F8FAFC] dark:bg-[#07090F] focus:border-[#C41E3A] dark:focus:border-[#E74C5E] transition-colors"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Retapez votre mot de passe"
                  className="pl-10 pr-11 h-11 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-[#F8FAFC] dark:bg-[#07090F] focus:border-[#C41E3A] dark:focus:border-[#E74C5E] transition-colors"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5E7A9A] hover:text-[#0A1628] dark:hover:text-[#E2E8F5] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-2xl font-bold text-sm bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] text-white dark:text-black shadow-lg shadow-[#C41E3A]/30 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Réinitialisation...</>
              ) : (
                'Réinitialiser le mot de passe'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-[#5E7A9A] hover:text-[#C41E3A] dark:hover:text-[#E74C5E] transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
