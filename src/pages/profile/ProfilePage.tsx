import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Camera,
  Save,
  MapPin,
  Loader2,
  Crown,
  XCircle,
  Gem,
  Pencil,
} from 'lucide-react';
import { cn, getAvatarUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlayerCard } from '@/components/ui/player-card';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { staggerContainer, staggerItem } from '@/lib/animations';
import api from '@/lib/api';


export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    country: user?.country || '',
    city: user?.city || '',
  });

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image valide.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5 Mo.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/auth/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(response.data.user);
      toast({
        title: 'Photo mise à jour',
        description: 'Votre photo de profil a été modifiée avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Impossible de mettre à jour la photo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch('/auth/profile', formData);
      updateUser(response.data.user);
      setIsEditing(false);
      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été sauvegardées avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue lors de la mise à jour.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user) return;
    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Vous conserverez l\'accès premium jusqu\'à la fin de la période en cours.')) {
      return;
    }
    setIsCancelling(true);
    try {
      const response = await api.post('/stripe/cancel-subscription');
      updateUser({ ...user, autoRenew: false });
      toast({
        title: 'Abonnement annulé',
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.response?.data?.message || 'Une erreur est survenue.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const playerStats = [
    { label: 'Etoiles', value: user?.stars || 0 },
    { label: 'Statut', value: user?.isPremium ? 'VIP' : 'STD' },
  ];

  const playerTier = user?.isPremium ? 'gold' as const : 'default' as const;

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-5xl"
    >
      {/* ===== SCOREBOARD HEADER ===== */}
      <motion.div variants={staggerItem}>
        <ScoreboardHeader
          title="Fiche Joueur"
          subtitle="Votre carte de footballeur Footix"
          icon={<User className="h-6 w-6" />}
        />
      </motion.div>

      {/* ===== HERO: Player Card ===== */}
      <motion.div
        variants={staggerItem}
        className="relative overflow-hidden rounded-2xl border border-[#1B2B40] bg-gradient-to-b from-[#0A1628] via-[#0D1D35] to-[#0A1628]"
      >
        {/* Stadium spotlight effects */}
        <div className="absolute top-0 left-1/4 w-48 h-48 bg-[#E74C5E]/5 blur-3xl rounded-full" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#D4AF37]/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-[#E74C5E]/3 blur-3xl rounded-full" />

        {/* Pitch pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px), repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)',
        }} />

        <div className="relative z-10 flex flex-col items-center py-10 px-6">
          {/* Player Card with flip animation */}
          <motion.div
            whileHover={{ rotateY: 12, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ perspective: 800 }}
          >
            <PlayerCard
              name={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Joueur'}
              avatar={(user as any)?.avatar}
              userId={user?.id}
              stars={user?.stars || 0}
              stats={playerStats}
              tier={playerTier}
              size="lg"
              showFlip={false}
            />
          </motion.div>

          {/* Upload photo button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
            accept="image/*"
            className="hidden"
          />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5"
          >
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-white/60 hover:text-white hover:border-white/30 bg-white/5 hover:bg-white/10 gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
            >
              {isUploadingPhoto ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              Changer la photo
            </Button>
          </motion.div>

          {/* Role badge */}
          <div className="mt-3">
            <span className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide gap-1.5',
              user?.role === 'ADMIN'
                ? 'bg-[#D4AF37]/20 text-[#E5C158] border border-[#D4AF37]/30'
                : 'bg-[#E74C5E]/20 text-[#E74C5E] border border-[#E74C5E]/30'
            )}>
              <Shield className="h-3 w-3" />
              {user?.role === 'ADMIN' ? 'ADMINISTRATEUR' : 'JOUEUR'}
            </span>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E74C5E]/40 to-transparent" />
      </motion.div>

      {/* ===== INFORMATIONS PERSONNELLES ===== */}
      <motion.div variants={staggerItem}>
        <div className="rounded-2xl border border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#EFF3F7] dark:bg-[#111B2E]">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#C41E3A]/10 dark:bg-[#E74C5E]/10 flex items-center justify-center">
                <User className="h-4 w-4 text-[#C41E3A] dark:text-[#E74C5E]" />
              </div>
              <div>
                <h2 className="text-sm font-black text-[#0A1628] dark:text-[#EFF3F7] uppercase tracking-wider">
                  Informations personnelles
                </h2>
                <p className="text-xs text-[#5E7A9A]">Modifiez vos informations de profil</p>
              </div>
            </div>
            <Button
              variant={isEditing ? 'ghost' : 'outline'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-1.5"
            >
              {isEditing ? (
                'Annuler'
              ) : (
                <>
                  <Pencil className="h-3.5 w-3.5" />
                  Modifier
                </>
              )}
            </Button>
          </div>

          <div className="p-6 space-y-5">
            {/* Identity fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5E7A9A]">
                  <User className="h-3.5 w-3.5" />
                  Prenom
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5E7A9A]">
                  <User className="h-3.5 w-3.5" />
                  Nom
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  className="h-11"
                />
              </div>
            </div>

            {/* Pitch line separator */}
            <div className="pitch-line my-5" />

            {/* Contact field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5E7A9A]">
                <Mail className="h-3.5 w-3.5" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="h-11"
              />
            </div>

            {/* Pitch line separator */}
            <div className="pitch-line my-5" />

            {/* Location fields */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5E7A9A]">
                  <MapPin className="h-3.5 w-3.5" />
                  Pays
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Ex: France"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5E7A9A]">
                  <MapPin className="h-3.5 w-3.5" />
                  Ville
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Ex: Paris"
                  className="h-11"
                />
              </div>
            </div>

            {/* Pitch line separator */}
            <div className="pitch-line my-5" />

            {/* Member since */}
            <div className="flex items-center justify-between text-sm px-1">
              <div className="flex items-center gap-2 text-[#5E7A9A]">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Membre depuis</span>
              </div>
              <span className="font-black text-[#0A1628] dark:text-[#EFF3F7]">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Non disponible'}
              </span>
            </div>

            {/* Save button */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end pt-4"
              >
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ===== LOGE VIP — Subscription Management ===== */}
      {user?.isPremium && (
        <motion.div variants={staggerItem}>
          <div className="relative rounded-2xl overflow-hidden border border-[#D4AF37]/30 dark:border-[#D4AF37]/20">
            {/* Gold gradient header band */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

            {/* VIP Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#D4AF37]/5 dark:from-[#D4AF37]/3 dark:to-[#D4AF37]/3" />
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(212, 175, 55, 0.3) 10px, rgba(212, 175, 55, 0.3) 20px)',
            }} />

            <div className="relative z-10 bg-white/80 dark:bg-[#0D1525]/90 backdrop-blur-sm">
              {/* Section header */}
              <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#D4AF37]/10 via-transparent to-[#D4AF37]/10 dark:from-[#D4AF37]/5 dark:to-[#D4AF37]/5">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#0A1628] dark:text-[#E5C158]">
                    Loge VIP
                  </h2>
                  <p className="text-xs text-[#5E7A9A]">Gestion de votre abonnement Premium</p>
                </div>
                <Gem className="ml-auto h-5 w-5 text-[#D4AF37]" />
              </div>

              <div className="p-6 space-y-5">
                {/* Subscription Status */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#D4AF37]/10 to-[#B8960F]/10 dark:from-[#D4AF37]/10 dark:to-[#B8960F]/10 border border-[#D4AF37]/20">
                  <div>
                    <p className="font-bold text-[#B8960F] dark:text-[#E5C158] flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      Statut : Actif
                    </p>
                    <p className="text-sm text-[#5E7A9A] mt-0.5">
                      {user.premiumExpiresAt
                        ? `Expire le ${new Date(user.premiumExpiresAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`
                        : 'Abonnement actif'}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#FFB800] to-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Pitch line separator */}
                <div className="pitch-line my-5" />

                {/* Cancel subscription */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-900/10">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    <div>
                      <p className="font-bold text-red-800 dark:text-red-300 text-sm">Annuler l'abonnement</p>
                      <p className="text-xs text-red-600/70 dark:text-red-400/70">
                        Vous conserverez l'acces jusqu'a la fin de la periode en cours
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelSubscription}
                    disabled={isCancelling}
                    className="w-full sm:w-auto shrink-0"
                  >
                    {isCancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Annuler'
                    )}
                  </Button>
                </div>

                {/* Price info */}
                <p className="text-center text-sm text-[#5E7A9A]">
                  Abonnement mensuel : <span className="font-black text-[#D4AF37]">9,99 EUR/mois</span>
                </p>
              </div>
            </div>

            {/* Bottom gold accent */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
