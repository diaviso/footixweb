import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      toast({ title: 'Inscription réussie', description: 'Un code de vérification a été envoyé à votre email' });
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur d\'inscription',
        description: err.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

      {/* Form panel */}
      <div className="bg-white dark:bg-[#0D1525] rounded-3xl shadow-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden">
        {/* Gold-to-green top accent */}
        <div className="h-1 bg-gradient-to-r from-[#D97706] via-[#C41E3A] to-[#E74C5E]" />

        <div className="p-7 space-y-5">
          {/* Heading */}
          <div>
            <h2 className="text-xl font-black text-[#0A1628] dark:text-[#E2E8F5]">Créer un compte</h2>
            <p className="text-sm text-[#5E7A9A] mt-0.5">Rejoignez des milliers de passionnés du foot</p>
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

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
                  Prénom
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jean"
                    className="pl-10 h-11 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-[#F8FAFC] dark:bg-[#07090F] focus:border-[#C41E3A] dark:focus:border-[#E74C5E] transition-colors"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
                  Nom
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Dupont"
                    className="pl-10 h-11 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-[#F8FAFC] dark:bg-[#07090F] focus:border-[#C41E3A] dark:focus:border-[#E74C5E] transition-colors"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

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
              <Label htmlFor="password" className="text-sm font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
                Mot de passe
              </Label>
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
              <p className="text-xs text-[#5E7A9A]">Minimum 6 caractères</p>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-2xl font-bold text-sm bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] text-white dark:text-black shadow-lg shadow-[#C41E3A]/30 dark:shadow-[#E74C5E]/20 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inscription...</>
              ) : (
                '⚽ Créer mon compte'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-[#5E7A9A]">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-[#C41E3A] dark:text-[#E74C5E] font-bold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
