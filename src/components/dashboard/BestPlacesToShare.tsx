import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Mail, 
  Users, 
  Presentation,
  MessageSquare,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface BestPlacesToShareProps {
  referralLink: string;
  delay?: number;
}

const shareChannels = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Groups',
    description: 'Share in college & startup groups',
    icon: MessageCircle,
    color: 'bg-success/10 text-success',
    successRate: 42,
    action: 'share',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Post to your network',
    icon: Briefcase,
    color: 'bg-accent/10 text-accent',
    successRate: 35,
    action: 'share',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Personalized outreach works best',
    icon: Mail,
    color: 'bg-warning/10 text-warning',
    successRate: 28,
    action: 'template',
  },
  {
    id: 'college',
    name: 'College Events',
    description: 'Fests, seminars, workshops',
    icon: Presentation,
    color: 'bg-chart-2/10 text-chart-2',
    successRate: 55,
    action: 'tip',
  },
  {
    id: 'startup',
    name: 'Startup Communities',
    description: 'Discord, Slack, Telegram channels',
    icon: MessageSquare,
    color: 'bg-primary/10 text-primary',
    successRate: 38,
    action: 'share',
  },
  {
    id: 'network',
    name: 'Personal Network',
    description: 'Friends running businesses',
    icon: Users,
    color: 'bg-destructive/10 text-destructive',
    successRate: 65,
    action: 'tip',
  },
];

export const BestPlacesToShare = ({ referralLink, delay = 0 }: BestPlacesToShareProps) => {
  const handleShare = (channel: typeof shareChannels[0]) => {
    if (!referralLink) {
      toast.error('Complete your profile first to get your referral link');
      return;
    }
    
    const fullUrl = `${window.location.origin}/via/${referralLink}`;
    const message = `Hey! Check out Qbits - they help businesses with amazing solutions. Sign up using my link: ${fullUrl}`;
    
    switch (channel.id) {
      case 'whatsapp':
        // Using WhatsApp API with proper URL encoding
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        toast.success('Opening WhatsApp...');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`, '_blank', 'noopener,noreferrer');
        toast.success('Opening LinkedIn...');
        break;
      case 'email':
        const subject = encodeURIComponent('Check out Qbits - Amazing Business Solutions');
        const body = encodeURIComponent(message);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
        toast.success('Opening email client...');
        break;
      case 'startup':
        navigator.clipboard.writeText(message);
        toast.success('Message copied! Paste in your community channels.');
        break;
      case 'college':
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied! Share at your college events.');
        break;
      case 'network':
        navigator.clipboard.writeText(message);
        toast.success('Message copied! Share with your network.');
        break;
      default:
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied! Share it with your network.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-display text-foreground">Best Places to Share</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Top partners use these channels</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {shareChannels.map((channel, index) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.05 * index }}
            className="group p-3 sm:p-4 rounded-lg border border-border bg-background hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer"
            onClick={() => handleShare(channel)}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${channel.color} flex-shrink-0`}>
                <channel.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm text-foreground truncate">{channel.name}</h4>
                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{channel.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${channel.successRate}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{channel.successRate}% success</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/20">
        <p className="text-xs sm:text-sm text-muted-foreground">
          💡 <span className="font-medium text-foreground">Pro tip:</span> Personalized outreach to warm contacts has the highest conversion rate. Combine multiple channels for best results!
        </p>
      </div>
    </motion.div>
  );
};
