import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, Check, Share2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ReferralLinkCardProps {
  referralLink: string;
  delay?: number;
}

export const ReferralLinkCard = ({ referralLink, delay = 0 }: ReferralLinkCardProps) => {
  const [copied, setCopied] = useState(false);

  // Extract just the referral code from the link or use as-is
  const referralCode = referralLink.includes('/via/')
    ? referralLink.split('/via/')[1]
    : referralLink;

  // Build the full URL using the current origin
  const fullUrl = referralCode
    ? `${window.location.origin}/via/${referralCode}`
    : '';

  const handleCopy = async () => {
    if (!fullUrl) {
      toast.error('No referral link available. Update your profile first.');
      return;
    }
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!fullUrl) {
      toast.error('No referral link available. Update your profile first.');
      return;
    }
    if (navigator.share) {
      await navigator.share({
        title: 'Join via my Qbits referral link',
        url: fullUrl,
      });
    } else {
      handleCopy();
    }
  };

  if (!referralCode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4, ease: 'easeOut' }}
        className="p-4 sm:p-5 md:p-6 rounded-xl border border-border bg-muted/50 shadow-card"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-muted flex-shrink-0">
            <Link2 className="text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base text-foreground font-display">Your Referral Link</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Complete your profile to get your referral link</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="p-4 sm:p-5 md:p-6 rounded-xl border border-accent/30 bg-accent/5 shadow-card"
    >
      <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
        <div className="p-2 sm:p-2.5 rounded-lg bg-accent/20 flex-shrink-0">
          <Link2 className="text-accent w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base text-foreground font-display">Your Referral Link</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Share to earn commissions</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 sm:gap-3">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-background border border-border font-mono text-[11px] sm:text-xs md:text-sm text-foreground break-all">
          {fullUrl}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 sm:gap-2 flex-1 text-xs sm:text-sm h-9 sm:h-10"
            size="sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="gap-1.5 sm:gap-2 flex-1 text-xs sm:text-sm h-9 sm:h-10"
            size="sm"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Share
          </Button>
        </div>
      </div>

      {/* <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
        <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
        <span>QR code available in Resources</span>
      </div> */}
    </motion.div>
  );
};
