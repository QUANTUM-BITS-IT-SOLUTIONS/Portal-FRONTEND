import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ReferralLinkCard } from '@/components/dashboard/ReferralLinkCard';
import { ClientsTable } from '@/components/dashboard/ClientsTable';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { ResourcesSection } from '@/components/dashboard/ResourcesSection';
import { SettingsSection } from '@/components/dashboard/SettingsSection';
import { ReferralStatsSection } from '@/components/dashboard/ReferralStatsSection';
import { NextBestAction } from '@/components/dashboard/NextBestAction';
import { QuickActionsBar } from '@/components/dashboard/QuickActionsBar';
import { PartnerLevelSystem } from '@/components/dashboard/PartnerLevelSystem';
import { BestPlacesToShare } from '@/components/dashboard/BestPlacesToShare';
import { LinkPerformanceStats } from '@/components/dashboard/LinkPerformanceStats';
import { PayoutSection } from '@/components/dashboard/PayoutSection';
import { TrustIndicator } from '@/components/dashboard/TrustIndicators';
import { OnboardingFlow, useOnboarding } from '@/components/dashboard/OnboardingFlow';
import { useAuth } from '@/hooks/useAuth';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/dashboard/PullToRefresh';

import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Wallet,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

import { useEarnings, useClients } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);
  const { profile, refreshProfile } = useAuth();
  const { showOnboarding, setShowOnboarding } = useOnboarding();

  // Fetch real data
  const { data: earningsData, refetch: refetchEarnings } = useEarnings();
  const { data: clientsData, refetch: refetchClients } = useClients();

  const realPerformanceStats = {
    totalClients: clientsData?.length || 0,
    totalEarnings: earningsData?.total_commission_earned || 0,
    availableBalance: earningsData?.wallet_balance || 0, // Balance in wallet
    pendingEarnings: earningsData?.total_requests_pending || 0, // Payouts in 'pending' status
    futureEarnings: earningsData?.pending_amount || 0, // Leads in pipeline (potential)
    paidEarnings: earningsData?.total_withdrawn || 0, // Actually withdrawn/completed payouts
    currentMonthEarnings: earningsData?.current_month_earnings || 0,
    conversionRate: clientsData?.length ? ((earningsData?.total_paid_leads || 0) / clientsData.length) * 100 : 0,
    averageDealSize: (earningsData?.total_paid_leads || 0) > 0 ? (earningsData?.lifetime_deal_value || 0) / earningsData!.total_paid_leads : 0,
    monthlyBreakdown: earningsData?.monthly_breakdown || []
  };

  const chartData = realPerformanceStats.monthlyBreakdown.length > 0
    ? realPerformanceStats.monthlyBreakdown
    : []; // Fallback only if empty (but backend should return 0s)

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      refreshProfile(),
      refetchEarnings(),
      refetchClients()
    ]);
    setRefreshKey(prev => prev + 1);
    toast.success('Data refreshed!');
  }, [refreshProfile, refetchEarnings, refetchClients]);

  const {
    containerRef,
    pullDistance,
    isRefreshing,
    progress,
    shouldRefresh,
  } = usePullToRefresh({ onRefresh: handleRefresh });

  // Use profile data or fallback to empty for new users
  const firstName = profile?.first_name || '';
  const lastName = profile?.last_name || '';
  const university = profile?.university || '';
  const referralCode = profile?.referral_code || '';
  const referralLink = referralCode
    ? `join.qbits.com/via/${referralCode}`
    : '';

  // Mock referral count - in production this would come from the database
  const totalReferrals = 0; // This would be fetched from useReferralStats

  const handleShareLink = async () => {
    if (!referralCode) {
      toast.error('Complete your profile first to get your referral link');
      return;
    }
    const fullUrl = `${window.location.origin}/via/${referralCode}`;
    if (navigator.share) {
      await navigator.share({
        title: 'Join via my Qbits referral link',
        url: fullUrl,
      });
    } else {
      await navigator.clipboard.writeText(fullUrl);
      toast.success('Referral link copied to clipboard!');
    }
  };
  const renderContent = () => {
    switch (activeTab) {
      case 'clients':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-foreground">Client Conversions</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage and track all your converted clients</p>
            </div>
            <ClientsTable clients={clientsData || []} />
          </div>
        );

      case 'earnings':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-foreground">Earnings</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Track your income and payment history</p>
                </div>
                <TrustIndicator variant="calculated" />
              </div>
            </div>


            <PayoutSection
              pendingAmount={realPerformanceStats.pendingEarnings}
              paidAmount={realPerformanceStats.paidEarnings}
              totalEarnings={realPerformanceStats.totalEarnings}
              delay={0}
            />
            {/* Partner Level System */}
            <PartnerLevelSystem currentEarnings={realPerformanceStats.totalEarnings} delay={0} />
          </div>
        );



      case 'referral':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-foreground">Your Referral Link</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Share your unique link to earn commissions</p>
            </div>
            <ReferralLinkCard referralLink={referralLink} />
            {/* <LinkPerformanceStats delay={0.1} /> */}
            <BestPlacesToShare referralLink={referralCode} delay={0.2} />
            <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">How It Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-2 sm:mb-3 font-bold font-display text-sm sm:text-base">1</div>
                  <h4 className="font-medium text-foreground mb-1 text-sm sm:text-base">Share Your Link</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Send your unique link to potential clients</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-2 sm:mb-3 font-bold font-display text-sm sm:text-base">2</div>
                  <h4 className="font-medium text-foreground mb-1 text-sm sm:text-base">Client Signs Up</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">We Schedule a call with client</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-2 sm:mb-3 font-bold font-display text-sm sm:text-base">2</div>
                  <h4 className="font-medium text-foreground mb-1 text-sm sm:text-base">We Call & close Client</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">We close the client</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-2 sm:mb-3 font-bold font-display text-sm sm:text-base">3</div>
                  <h4 className="font-medium text-foreground mb-1 text-sm sm:text-base">Earn Commission</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">We pay you</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-foreground">Partner Leaderboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">See how you stack up against other partners</p>
            </div>
            <Leaderboard delay={0.1} />
          </div>
        );

      case 'referral-stats':
        return <ReferralStatsSection delay={0.1} />;

      case 'resources':
        return <ResourcesSection delay={0.1} />;

      case 'settings':
        return <SettingsSection delay={0.1} />;

      default:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h1 className="text-base sm:text-2xl md:text-3xl font-bold font-display text-foreground leading-tight break-words">
                    Welcome{firstName ? `, ${firstName}` : ''}! 👋
                  </h1>
                  <p className="text-[11px] sm:text-sm md:text-base text-muted-foreground mt-0.5 sm:mt-1">
                    Here's your performance overview for {format(new Date(), 'MMMM yyyy')}
                  </p>
                </div>
                <TrustIndicator variant="synced" />
              </div>
            </motion.div>

            {/* Next Best Action */}
            <NextBestAction
              totalReferrals={totalReferrals}
              hasReferralCode={!!referralCode}
              onShareLink={handleShareLink}
              onNavigate={setActiveTab}
              delay={0.05}
            />

            {/* Quick Actions Bar */}
            {/* <QuickActionsBar
              referralLink={referralCode}
              onNavigate={setActiveTab}
              delay={0.1}
            /> */}

            {/* Referral Link */}
            <ReferralLinkCard referralLink={referralLink} delay={0.15} />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" key={refreshKey}>
              <StatsCard
                title="Total Referrals"
                value={realPerformanceStats.totalClients}
                icon={Users}
                trend={{ value: 18, isPositive: true }}
                delay={0.2}
              />
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(realPerformanceStats.totalEarnings)}
                icon={DollarSign}
                variant="success"
                trend={{ value: 24, isPositive: true }}
                delay={0.25}
              />
              <StatsCard
                title="Pending Payment"
                value={formatCurrency(realPerformanceStats.pendingEarnings)}
                icon={Clock}
                variant="warning"
                delay={0.3}
              />
              <StatsCard
                title="This Month"
                value={formatCurrency(realPerformanceStats.currentMonthEarnings)}
                icon={TrendingUp}
                variant="accent"
                trend={{ value: 42, isPositive: true }}
                delay={0.35}
              />
            </div>


            {/* Activity  */}
            <RecentActivity delay={0.5} />
          </div>
        );
    }
  };

  const fullReferralLink = referralCode ? `${window.location.origin}/via/${referralCode}` : '';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* First-time Onboarding Flow */}
      {showOnboarding && referralCode && (
        <OnboardingFlow
          referralLink={fullReferralLink}
          onComplete={() => setShowOnboarding(false)}
          onNavigate={(tab) => {
            setShowOnboarding(false);
            setActiveTab(tab);
          }}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content - offset by sidebar width on desktop */}
      <main className="flex-1 lg:ml-64 w-full h-full overflow-y-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
            <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}

            <div className="flex-1" />

            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationsPanel />

              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-accent">
                  <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                  <AvatarFallback className="bg-accent text-accent-foreground font-semibold text-xs sm:text-sm">
                    {firstName?.[0] || 'U'}{lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">
                    {firstName || 'User'} {lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{university || 'Update your profile'}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Pull to Refresh */}
        <div
          ref={containerRef}
          className="p-4 sm:p-6 lg:p-8"
        >
          {/* Pull to refresh indicator - only on mobile */}
          <div className="lg:hidden">
            <PullToRefreshIndicator
              pullDistance={pullDistance}
              isRefreshing={isRefreshing}
              progress={progress}
              shouldRefresh={shouldRefresh}
            />
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
