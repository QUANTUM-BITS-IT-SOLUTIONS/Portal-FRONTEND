import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, 
  Share2, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Copy, 
  Check,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  action: string;
  tip: string;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Copy Your Referral Link',
    description: 'Your unique link is ready! Copy it and start sharing to earn commissions.',
    icon: Link2,
    action: 'Copy Link',
    tip: '💡 Pro tip: Pin your link in your bio for passive referrals',
  },
  {
    id: 2,
    title: 'Share Using Templates',
    description: 'We\'ve prepared proven email and message templates that top partners use.',
    icon: Share2,
    action: 'View Templates',
    tip: '💡 Pro tip: WhatsApp has the highest conversion rate (23%)',
  },
  {
    id: 3,
    title: 'Track Your Earnings',
    description: 'Watch your dashboard update in real-time as referrals convert to paying clients.',
    icon: TrendingUp,
    action: 'See Dashboard',
    tip: '💡 Pro tip: Check analytics weekly to optimize your approach',
  },
];

interface OnboardingFlowProps {
  referralLink: string;
  onComplete: () => void;
  onNavigate: (tab: string) => void;
}

export const OnboardingFlow = ({ referralLink, onComplete, onNavigate }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const step = steps[currentStep];
  const Icon = step.icon;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
    markStepComplete(0);
  };

  const markStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      setCompletedSteps([...completedSteps, stepIndex]);
    }
  };

  const handleStepAction = () => {
    switch (currentStep) {
      case 0:
        handleCopyLink();
        break;
      case 1:
        onNavigate('resources');
        markStepComplete(1);
        break;
      case 2:
        onNavigate('dashboard');
        markStepComplete(2);
        break;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
    toast.success('🎉 Onboarding complete! Start earning!');
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_skipped', 'true');
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Header gradient */}
          <div className="h-2 bg-gradient-accent" />

          {/* Progress section */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-accent">Getting Started</span>
              <span className="text-xs text-muted-foreground ml-auto">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            
            {/* Step indicators */}
            <div className="flex justify-between mt-3">
              {steps.map((s, i) => (
                <div 
                  key={s.id}
                  className={cn(
                    'flex items-center gap-1.5 text-xs font-medium transition-colors',
                    i === currentStep ? 'text-accent' : 
                    completedSteps.includes(i) ? 'text-success' : 'text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    i === currentStep ? 'bg-accent text-accent-foreground' : 
                    completedSteps.includes(i) ? 'bg-success text-success-foreground' : 'bg-muted'
                  )}>
                    {completedSteps.includes(i) ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-accent" />
                </div>
                
                <h2 className="text-xl font-bold text-foreground mb-2 font-display">
                  {step.title}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  {step.description}
                </p>

                {/* Action button */}
                <Button
                  onClick={handleStepAction}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 mb-4"
                >
                  {currentStep === 0 ? (
                    copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  {currentStep === 0 && copied ? 'Copied!' : step.action}
                </Button>

                {/* Tip */}
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {step.tip}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              Skip tour
            </Button>

            <Button
              onClick={handleNext}
              className="gap-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  <PartyPopper className="w-4 h-4" />
                  Let's Go!
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to check if onboarding should show
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    const skipped = localStorage.getItem('onboarding_skipped');
    
    if (!completed && !skipped) {
      // Small delay to let dashboard load first
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_skipped');
    setShowOnboarding(true);
  };

  return { showOnboarding, setShowOnboarding, resetOnboarding };
};
