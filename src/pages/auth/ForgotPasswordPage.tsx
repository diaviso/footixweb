import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsEmailSent(true);
      toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte de réception' });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: 'Erreur',
        description: err.response?.data?.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="space-y-5">
        <div className="bg-white dark:bg-[#0D1525] rounded-3xl shadow-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#C41E3A] via-[#E74C5E] to-[#D97706]" />
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto w-20 h-20 rounded-full bg-[#C41E3A]/10 dark:bg-[#E74C5E]/10 flex items-center justify-center mb-5"
            >
              <CheckCircle className="h-10 w-10 text-[#C41E3A] dark:text-[#E74C5E]" />
            </motion.div>
            <h2 className="text-xl font-black text-[#0A1628] dark:text-[#E2E8F5] mb-2">Email envoyé !</h2>
            <p className="text-sm text-[#5E7A9A] mb-1">
              Si un compte existe avec <strong className="text-[#C41E3A] dark:text-[#E74C5E]">{email}</strong>,
              vous recevrez un lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-xs text-[#5E7A9A] mb-6">Pensez à vérifier vos spams.</p>
            <Link to="/login">
              <Button variant="outline" className="gap-2 rounded-2xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] hover:border-[#C41E3A] dark:hover:border-[#E74C5E] transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
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

      {/* Form panel */}
      <div className="bg-white dark:bg-[#0D1525] rounded-3xl shadow-2xl border border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#D97706] via-[#C41E3A] to-[#E74C5E]" />

        <div className="p-7 space-y-5">
          {/* Key icon + heading */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D97706]/10 flex items-center justify-center flex-shrink-0">
              <KeyRound className="h-6 w-6 text-[#D97706]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0A1628] dark:text-[#E2E8F5]">Mot de passe oublié ?</h2>
              <p className="text-sm text-[#5E7A9A] mt-0.5">On vous envoie un lien de réinitialisation</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
                Votre adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5E7A9A]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className="pl-10 h-11 rounded-xl border-2 border-[#DCE6F0] dark:border-[#1B2B40] bg-[#F8FAFC] dark:bg-[#07090F] focus:border-[#C41E3A] dark:focus:border-[#E74C5E] transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-2xl font-bold text-sm bg-[#C41E3A] hover:bg-[#9B1B30] dark:bg-[#E74C5E] dark:hover:bg-[#D43B4F] text-white dark:text-black shadow-lg shadow-[#C41E3A]/30 dark:shadow-[#E74C5E]/20 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi en cours...</>
              ) : (
                <><Mail className="mr-2 h-4 w-4" />Envoyer le lien</>
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
