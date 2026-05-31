import { motion } from 'framer-motion';
import { Copy, MessageCircle, Mail, BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface QuickActionsBarProps {
  referralLink: string;
  onNavigate?: (tab: string) => void;
  delay?: number;
}

export const QuickActionsBar = ({ referralLink, onNavigate, delay = 0 }: QuickActionsBarProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!referralLink) {
      toast.error('Complete your profile first to get your referral link');
      return;
    }
    
    const fullUrl = `${window.location.origin}/via/${referralLink}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!referralLink) {
      toast.error('Complete your profile first to get your referral link');
      return;
    }
    
    const fullUrl = `${window.location.origin}/via/${referralLink}`;
    const message = encodeURIComponent(
      `Hey! I've been using Qbits for my business needs and it's been great. Check it out: ${fullUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleEmailTemplate = () => {
    if (onNavigate) {
      onNavigate('resources');
    }
    toast.info('Opening email templates...');
  };

  const handleViewResources = () => {
    if (onNavigate) {
      onNavigate('resources');
    }
  };

  const actions = [
    {
      label: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? Check : Copy,
      onClick: handleCopyLink,
      variant: 'default' as const,
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      onClick: handleWhatsAppShare,
      variant: 'outline' as const,
      className: 'text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700',
    },
    {
      label: 'Email',
      icon: Mail,
      onClick: handleEmailTemplate,
      variant: 'outline' as const,
    },
    {
      label: 'Resources',
      icon: BookOpen,
      onClick: handleViewResources,
      variant: 'outline' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-3 sm:p-4 shadow-card"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground">Quick Actions</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.05 * index }}
            >
              <Button
                variant={action.variant}
                size="sm"
                onClick={action.onClick}
                className={`w-full h-auto py-2.5 sm:py-3 flex flex-col items-center gap-1.5 text-xs ${action.className || ''}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs">{action.label}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
