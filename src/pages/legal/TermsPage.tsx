import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Database, FileText, Scale, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreboardHeader } from '@/components/ui/scoreboard-header';
import { staggerContainer, staggerItem } from '@/lib/animations';

function Section({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <motion.div variants={staggerItem}>
      <Card className="border-[#DCE6F0] dark:border-[#1B2B40] bg-white dark:bg-[#0D1525] overflow-hidden">
        <CardContent className="pt-6">
          <motion.div
            className="flex gap-4"
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#C41E3A]/15 to-[#D4AF37]/10 dark:from-[#C41E3A]/25 dark:to-[#D4AF37]/15 flex items-center justify-center text-[#C41E3A] dark:text-[#E74C5E] border border-[#C41E3A]/10 dark:border-[#E74C5E]/20">
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#0A1628] dark:text-[#E2E8F5] mb-3">
                {title}
              </h3>
              <div className="text-[#5E7A9A] dark:text-[#8DA4BE] whitespace-pre-line leading-relaxed">
                {content.split('**').map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="text-[#0A1628] dark:text-[#E2E8F5]">{part}</strong> : part
                )}
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function TermsPage() {
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
          title="Règlement"
          subtitle="Conditions d'utilisation"
          icon={<FileText className="h-6 w-6" />}
        />
      </motion.div>

      {/* Pitch line separator */}
      <div className="pitch-line" />

      {/* Introduction */}
      <motion.div variants={staggerItem}>
        <Card className="border-[#C41E3A]/20 bg-gradient-to-r from-[#C41E3A]/5 to-[#D4AF37]/5 dark:from-[#C41E3A]/10 dark:to-[#D4AF37]/5 dark:border-[#C41E3A]/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#C41E3A]/15 dark:bg-[#C41E3A]/25 flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#C41E3A] dark:text-[#E74C5E]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#0A1628] dark:text-[#E2E8F5] mb-2">
                  Bienvenue sur Footix
                </h2>
                <p className="text-[#5E7A9A] dark:text-[#8DA4BE]">
                  En utilisant cette application, vous acceptez les présentes conditions d'utilisation.
                  Veuillez les lire attentivement avant de continuer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sections */}
      <Section
        icon={<FileText className="h-5 w-5" />}
        title="1. Objet de l'application"
        content="Footix est une application dédiée aux passionnés de football. Elle propose des quiz interactifs couvrant l'histoire du football, les compétitions, les joueurs, les clubs, les règles et les tactiques. Testez vos connaissances, grimpez dans le classement et devenez le meilleur expert football !"
      />

      {/* Pitch line separator */}
      <div className="pitch-line" />

      <Section
        icon={<Database className="h-5 w-5" />}
        title="2. Collecte et utilisation des données personnelles"
        content={`Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, nous collectons et traitons vos données personnelles de manière transparente et sécurisée.

**Données collectées :**
• Informations d'identification : nom, prénom, adresse email
• Données de connexion : identifiants, mot de passe (chiffré)
• Données d'utilisation : progression dans les quiz, scores, historique d'apprentissage
• Données techniques : type d'appareil, système d'exploitation (à des fins de compatibilité)

**Finalités du traitement :**
• Gestion de votre compte utilisateur
• Personnalisation de votre expérience d'apprentissage
• Suivi de votre progression et statistiques
• Communication relative à votre compte et à l'application
• Amélioration continue de nos services`}
      />

      <Section
        icon={<Scale className="h-5 w-5" />}
        title="3. Base légale du traitement"
        content={`Le traitement de vos données repose sur :

• **Votre consentement** : en créant un compte, vous consentez expressément au traitement de vos données
• **L'exécution du contrat** : le traitement est nécessaire pour vous fournir nos services
• **Notre intérêt légitime** : amélioration de l'application et prévention des fraudes`}
      />

      {/* Pitch line separator */}
      <div className="pitch-line" />

      <Section
        icon={<AlertCircle className="h-5 w-5" />}
        title="4. Durée de conservation"
        content={`Vos données personnelles sont conservées pendant toute la durée de votre inscription, puis pendant une durée de 3 ans après la suppression de votre compte, conformément aux obligations légales.

Les données de connexion et logs techniques sont conservés pendant 1 an.`}
      />

      <Section
        icon={<Shield className="h-5 w-5" />}
        title="5. Vos droits"
        content={`Conformément au RGPD, vous disposez des droits suivants :

• **Droit d'accès** : obtenir une copie de vos données personnelles
• **Droit de rectification** : corriger des données inexactes
• **Droit à l'effacement** : demander la suppression de vos données
• **Droit à la portabilité** : recevoir vos données dans un format structuré
• **Droit d'opposition** : vous opposer au traitement de vos données
• **Droit à la limitation** : limiter le traitement de vos données

Pour exercer ces droits, contactez-nous à : footixcontact@gmail.com`}
      />

      {/* Pitch line separator */}
      <div className="pitch-line" />

      <Section
        icon={<Lock className="h-5 w-5" />}
        title="6. Sécurité des données"
        content={`Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :

• Chiffrement des données sensibles (mots de passe, communications)
• Accès restreint aux données personnelles
• Serveurs sécurisés hébergés dans l'Union Européenne
• Audits de sécurité réguliers`}
      />

      <Section
        icon={<Database className="h-5 w-5" />}
        title="7. Partage des données"
        content={`Vos données personnelles ne sont jamais vendues à des tiers.

Elles peuvent être partagées avec :
• Nos prestataires techniques (hébergement, paiement) dans le cadre strict de leurs missions
• Les autorités compétentes sur demande légale

Tout prestataire est soumis à des obligations de confidentialité strictes.`}
      />

      {/* Pitch line separator */}
      <div className="pitch-line" />

      <Section
        icon={<FileText className="h-5 w-5" />}
        title="8. Propriété intellectuelle"
        content="Tous les contenus de l'application (textes, quiz, images, logos) sont protégés par le droit d'auteur. Toute reproduction ou utilisation non autorisée est interdite."
      />

      <Section
        icon={<Mail className="h-5 w-5" />}
        title="9. Contact et réclamations"
        content={`Pour toute question ou réclamation concernant vos données personnelles :

**Email** : footixcontact@gmail.com\n\nVous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) : www.cnil.fr`}
      />

      {/* Pitch line separator */}
      <div className="pitch-line" />

      {/* Footer notice */}
      <motion.div variants={staggerItem}>
        <Card className="border-[#1B2B40] bg-gradient-to-r from-[#0A1628] via-[#0D1D35] to-[#0A1628] overflow-hidden relative">
          {/* Spotlight effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-12 bg-[#E74C5E]/8 blur-2xl rounded-full" />
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C41E3A]/30 to-[#D4AF37]/20 flex items-center justify-center border border-[#C41E3A]/20">
                <Shield className="h-6 w-6 text-[#E74C5E]" />
              </div>
              <p className="text-sm text-white/60">
                En créant un compte ou en utilisant l'application, vous confirmez avoir lu et accepté ces conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
