import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  BookOpen,
  Star,
  Trophy,
  RefreshCw,
  User,
  Bug,
  Mail,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { staggerContainer, staggerItem } from '@/lib/animations';

interface HelpSectionProps {
  icon: React.ReactNode;
  title: string;
  content: string;
}

function HelpSection({ icon, title, content }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div variants={staggerItem}>
      <Card className="border-[#DCE6F0] dark:border-[#1B2B40] overflow-hidden bg-white dark:bg-[#0D1525]">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ x: 4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="w-full p-4 flex items-center gap-4 text-left hover:bg-[#F8FAFC] dark:hover:bg-[#111B2E]/50 transition-colors"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#C41E3A]/15 to-[#D4AF37]/10 dark:from-[#C41E3A]/25 dark:to-[#D4AF37]/15 flex items-center justify-center text-[#C41E3A] dark:text-[#E74C5E] border border-[#C41E3A]/10 dark:border-[#E74C5E]/20">
            {icon}
          </div>
          <span className="flex-1 font-semibold text-[#0A1628] dark:text-[#E2E8F5]">
            {title}
          </span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-[#5E7A9A]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#5E7A9A]" />
          )}
        </motion.button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <CardContent className="pt-0 pb-4 px-4 pl-[72px]">
                <div className="text-[#5E7A9A] dark:text-[#8DA4BE] whitespace-pre-line leading-relaxed">
                  {content.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-[#0A1628] dark:text-[#E2E8F5]">{part}</strong> : part
                  )}
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export function HelpPage() {
  return (
    <motion.div
      variants={staggerContainer()}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* ScoreboardHeader */}
      <motion.div variants={staggerItem}>
        <ScoreboardHeader
          title="Centre d'Aide"
          subtitle="FAQ & Support"
          icon={<HelpCircle className="h-6 w-6" />}
        />
      </motion.div>

      {/* Pitch line separator */}
      <div className="pitch-line" />

      {/* Help Sections */}
      <motion.div
        variants={staggerContainer(0.06)}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <HelpSection
          icon={<BookOpen className="h-5 w-5" />}
          title="Qu'est-ce que Footix ?"
          content="Footix est une application dédiée aux passionnés de football. Testez et améliorez vos connaissances sur le football grâce à des quiz interactifs couvrant l'histoire, les compétitions, les joueurs, les clubs, les règles et les tactiques. Grimpez dans le classement et devenez le meilleur expert football !"
        />

        <HelpSection
          icon={<Zap className="h-5 w-5" />}
          title="Les Quiz"
          content={`**Comment fonctionnent les quiz ?**

• Chaque quiz contient plusieurs questions à choix unique ou multiple
• Vous avez un temps limité pour répondre à chaque question
• Un score minimum de 70% est requis pour réussir
• Vous gagnez des étoiles en réussissant les quiz

**Tentatives :**
• Vous disposez de 3 tentatives par quiz
• Les tentatives se rechargent automatiquement après 24h
• Vous pouvez acheter des tentatives supplémentaires avec vos étoiles`}
        />

        {/* Pitch line separator */}
        <div className="pitch-line my-4" />

        <HelpSection
          icon={<BookOpen className="h-5 w-5" />}
          title="Les Thèmes"
          content={`Les quiz sont organisés par thèmes liés au football :

• Coupe du Monde
• Ligue des Champions
• Championnat d'Europe
• Joueurs légendaires
• Règles du jeu
• Et bien d'autres...

Chaque thème contient plusieurs quiz de difficulté progressive (Facile, Moyen, Difficile).`}
        />

        <HelpSection
          icon={<Star className="h-5 w-5" />}
          title="Les Étoiles et le Classement"
          content={`**Comment gagner des étoiles ?**

• Réussissez un quiz pour la première fois : +3 étoiles
• Score parfait (100%) : bonus d'étoiles supplémentaires
• Les étoiles permettent de débloquer certains quiz avancés

**Le classement :**
• Comparez-vous aux autres joueurs
• Le classement affiche les 100 meilleurs
• Votre position est mise à jour en temps réel`}
        />

        {/* Pitch line separator */}
        <div className="pitch-line my-4" />

        <HelpSection
          icon={<RefreshCw className="h-5 w-5" />}
          title="Le Mode Révision"
          content={`Le mode Révision vous permet de :

• Répondre à des questions aléatoires de tous les thèmes
• Renforcer vos connaissances globales sur le football
• Vous entraîner de manière transversale

C'est idéal pour tester votre culture football générale !`}
        />

        <HelpSection
          icon={<Trophy className="h-5 w-5" />}
          title="Le Classement"
          content={`Le classement vous permet de vous mesurer aux autres passionnés :

• Gagnez des étoiles pour grimper dans le classement
• Consultez le top 100 des meilleurs joueurs
• Affichez votre rang et vos statistiques

**Astuce :** Réussissez un maximum de quiz avec un score parfait pour accumuler le plus d'étoiles !`}
        />

        {/* Pitch line separator */}
        <div className="pitch-line my-4" />

        <HelpSection
          icon={<User className="h-5 w-5" />}
          title="Votre Profil"
          content={`Dans votre profil, vous pouvez :

• Modifier vos informations personnelles
• Changer votre photo de profil
• Consulter vos statistiques détaillées
• Voir votre historique de quiz`}
        />

        <HelpSection
          icon={<Bug className="h-5 w-5" />}
          title="Signaler un problème"
          content={`Vous rencontrez un bug ou un problème ?

• Contactez-nous à : footixcontact@gmail.com
• Décrivez le problème en détail
• Joignez une capture d'écran si possible

Nous vous répondrons dans les plus brefs délais.`}
        />
      </motion.div>

      {/* Pitch line separator */}
      <div className="pitch-line" />

      {/* Contact Card */}
      <motion.div variants={staggerItem}>
        <Card className="border-[#1B2B40] bg-gradient-to-r from-[#0A1628] via-[#0D1D35] to-[#0A1628] overflow-hidden relative">
          {/* Spotlight effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-[#E74C5E]/8 blur-2xl rounded-full" />
          <CardContent className="pt-6 text-center relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C41E3A]/30 to-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4 border border-[#C41E3A]/20">
              <Mail className="h-7 w-7 text-[#E74C5E]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Besoin d'aide supplémentaire ?
            </h3>
            <p className="text-white/50 mb-4">
              Contactez notre équipe support
            </p>
            <Button variant="gradient">
              footixcontact@gmail.com
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
