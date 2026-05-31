import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  GitBranch,
  LogOut,
  ChevronRight,
  Menu,
  IndianRupee,
  Bell,
  Download,
  Building2,
  History as HistoryIcon,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useAdminData } from '@/hooks/useAdminData';
import AdminKPIs from '@/components/admin/AdminKPIs';
import EnhancedUsersTable from '@/components/admin/EnhancedUsersTable';
import LeadPipelineTable from '@/components/admin/LeadPipelineTable';
import PipelineFilters, { PipelineFilters as PipelineFiltersType } from '@/components/admin/PipelineFilters';
import PayoutManagement from '@/components/admin/PayoutManagement';
import AuditLogs from '@/components/admin/AuditLogs';
import NotificationManager from '@/components/admin/NotificationManager';
import ClientsTable from '@/components/admin/ClientsTable';
import LedgerTable from '@/components/admin/LedgerTable';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination';
import { exportLeadsToCSV, exportPartnersToCSV, exportAuditLogsToCSV } from '@/lib/exportUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminDashboard = () => {
  const navigate = useNavigate();
  // const { signOut } = useAuth();
  const { isAdmin, isAdminLoading, logout } = useAdminAuth();
  const {
    allUsers,
    usersTotal,
    usersTotalPages,
    fetchUsers,
    leads,
    leadsTotal,
    leadsTotalPages,
    fetchLeads,
    commissions,
    payouts,
    payoutsTotal,
    payoutsTotalPages,
    fetchPayouts,
    clients,
    clientsTotal,
    clientsTotalPages,
    fetchClients,
    auditLogs,
    notifications,
    allUsersLoading,
    leadsLoading,
    commissionsLoading,
    payoutsLoading,
    clientsLoading,
    auditLogsLoading,
    notificationsLoading,
    updateLeadStatus,
    updatePaymentLink,
    generateInvoice,
    isGeneratingInvoice,
    updateCommissionStatus,
    bulkAction,
    updatePayoutStatus,
    schedulePayoutDate,
    bulkSettlePayouts,
    isBulkSettlePending,
    completePartialPayment,
    createNotification,
    deleteNotification,
    createManualPayout,
    isCreatingPayout,
    auditLogsTotal,
    auditLogsTotalPages,
    fetchAuditLogs,
    notificationsTotal,
    notificationsTotalPages,
    fetchNotifications,
    ledgerEntries,
    ledgerTotal,
    ledgerTotalPages,
    fetchLedger,
    ledgerLoading,
  } = useAdminData();

  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(20);
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsLimit, setLeadsLimit] = useState(20);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [payoutsLimit, setPayoutsLimit] = useState(20);
  const [clientsPage, setClientsPage] = useState(1);
  const [clientsLimit, setClientsLimit] = useState(20);
  const [auditPage, setAuditPage] = useState(1);
  const [auditLimit, setAuditLimit] = useState(50);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsLimit, setNotificationsLimit] = useState(50);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerLimit, setLedgerLimit] = useState(20);
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');

  const [activeTab, setActiveTab] = useState('users');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pipelineFilters, setPipelineFilters] = useState<PipelineFiltersType>({
    search: '',
    partnerId: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    dealValueMin: '',
    dealValueMax: '',
  });

  // Bulk notification state
  const [bulkNotifyDialog, setBulkNotifyDialog] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifDescription, setNotifDescription] = useState('');
  const [notifType, setNotifType] = useState('system');
  const [isSendingBulk, setIsSendingBulk] = useState(false);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (pipelineFilters.search) count++;
    if (pipelineFilters.status !== 'all') count++;
    if (pipelineFilters.partnerId !== 'all') count++;
    if (pipelineFilters.dateFrom) count++;
    if (pipelineFilters.dateTo) count++;
    if (pipelineFilters.dealValueMin) count++;
    if (pipelineFilters.dealValueMax) count++;
    return count;
  }, [pipelineFilters]);

  const handleSignOut = async () => {
    logout();
    navigate('/admin-auth');
  };

  const totalUsers = allUsers?.length || 0;
  const totalLeadValue = leads?.reduce((sum, lead) => sum + Number(lead.deal_value), 0) || 0;

  // Filter leads based on pipeline filters
  const filteredLeads = useMemo(() => {
    if (!leads) return [];

    return leads.filter(lead => {
      // Search filter
      if (pipelineFilters.search) {
        const searchLower = pipelineFilters.search.toLowerCase();
        const matchesSearch =
          lead.client_name.toLowerCase().includes(searchLower) ||
          lead.client_email.toLowerCase().includes(searchLower) ||
          (lead.company_name?.toLowerCase().includes(searchLower) ?? false);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (pipelineFilters.status !== 'all' && lead.status !== pipelineFilters.status) {
        return false;
      }

      // Partner filter
      if (pipelineFilters.partnerId !== 'all' && lead.referred_by !== pipelineFilters.partnerId) {
        return false;
      }

      // Date range filter
      if (pipelineFilters.dateFrom) {
        if (new Date(lead.created_at) < new Date(pipelineFilters.dateFrom)) return false;
      }
      if (pipelineFilters.dateTo) {
        if (new Date(lead.created_at) > new Date(pipelineFilters.dateTo)) return false;
      }

      // Deal value range
      if (pipelineFilters.dealValueMin) {
        if (Number(lead.deal_value) < Number(pipelineFilters.dealValueMin)) return false;
      }
      if (pipelineFilters.dealValueMax) {
        if (Number(lead.deal_value) > Number(pipelineFilters.dealValueMax)) return false;
      }

      return true;
    });
  }, [leads, pipelineFilters]);

  const handleBulkNotify = (userIds: string[]) => {
    setSelectedUserIds(userIds);
    setBulkNotifyDialog(true);
  };

  const sendBulkNotification = async () => {
    if (!notifTitle || !notifDescription) return;

    setIsSendingBulk(true);
    try {
      // Send notification to each selected user
      for (const userId of selectedUserIds) {
        await createNotification({
          title: notifTitle,
          description: notifDescription,
          type: notifType,
          studentId: userId,
        });
      }

      // Reset and close
      setNotifTitle('');
      setNotifDescription('');
      setNotifType('system');
      setSelectedUserIds([]);
      setBulkNotifyDialog(false);
    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
    } finally {
      setIsSendingBulk(false);
    }
  };


  // Redirect if not admin
  if (!isAdminLoading && !isAdmin) {
    navigate('/admin-auth');
    return null;
  }

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-lg">Admin Dashboard</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Qbits Partner Portal</p>
              </div>
            </div>

            {/* Desktop navigation */}
            <div className="hidden sm:flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden py-3 border-t border-border space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                Partner Dashboard
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <AdminKPIs totalLeadValue={totalLeadValue} leads={leads || []} users={allUsers || []} />
        </motion.div>



        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto flex flex-wrap">
            <TabsTrigger value="users" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <GitBranch className="h-3 w-3 sm:h-4 sm:w-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="payouts" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <IndianRupee className="h-3 w-3 sm:h-4 sm:w-4" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="ledger" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              Ledger
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <HistoryIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold">All Users</h2>
                <Button variant="outline" size="sm" onClick={() => {
                  const leadsData: { [key: string]: { referrals: number; revenue: number; commission: number } } = {};
                  allUsers?.forEach(user => {
                    const userLeads = leads?.filter(l => l.referred_by === user.id) || [];
                    leadsData[user.id] = {
                      referrals: userLeads.length,
                      revenue: userLeads.reduce((s, l) => s + Number(l.deal_value), 0),
                      commission: userLeads.reduce((s, l) => s + Number(l.deal_value) * 0.1, 0),
                    };
                  });
                  exportPartnersToCSV(allUsers || [], leadsData);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              {allUsersLoading || commissionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <EnhancedUsersTable
                  users={allUsers || []}
                  leads={leads || []}
                  commissions={commissions || []}
                  onBulkNotify={handleBulkNotify}
                  onCreatePayout={createManualPayout}
                  isCreatingPayout={isCreatingPayout}
                />
              )}

              {!allUsersLoading && (usersTotalPages > 1 || allUsers.length > 0) && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>
                    <Select
                      value={usersLimit.toString()}
                      onValueChange={(val) => {
                        setUsersLimit(Number(val));
                        setUsersPage(1);
                        fetchUsers({ page: 1, limit: Number(val) });
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={usersLimit} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 50, 100].map(limit => (
                          <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); if (usersPage > 1) { setUsersPage(p => p - 1); fetchUsers({ page: usersPage - 1, limit: usersLimit }); } }}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm border rounded px-3 py-1.5 bg-background">
                          Page {usersPage} of {usersTotalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); if (usersPage < usersTotalPages) { setUsersPage(p => p + 1); fetchUsers({ page: usersPage + 1, limit: usersLimit }); } }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="pipeline">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Lead Pipeline Management</h2>
                <Button variant="outline" size="sm" onClick={() => exportLeadsToCSV(filteredLeads)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              <PipelineFilters users={allUsers || []} onFiltersChange={setPipelineFilters} activeFiltersCount={activeFiltersCount} />
              <div className="mt-4">
                {leadsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <LeadPipelineTable
                    leads={filteredLeads}
                    onStatusChange={updateLeadStatus}
                    onPaymentLinkUpdate={updatePaymentLink}
                    onGenerateInvoice={generateInvoice}
                    onCommissionStatusChange={updateCommissionStatus}
                    onBulkAction={bulkAction}
                    onCompletePartialPayment={completePartialPayment}
                    isGeneratingInvoice={isGeneratingInvoice}
                  />
                )}

                {!leadsLoading && (leadsTotalPages > 1 || leads.length > 0) && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Rows per page</span>
                      <Select
                        value={leadsLimit.toString()}
                        onValueChange={(val) => {
                          setLeadsLimit(Number(val));
                          setLeadsPage(1);
                          fetchLeads({ page: 1, limit: Number(val), ...pipelineFilters });
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={leadsLimit} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 20, 50, 100].map(limit => (
                            <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (leadsPage > 1) {
                                setLeadsPage(p => p - 1);
                                fetchLeads({ page: leadsPage - 1, limit: leadsLimit, ...pipelineFilters });
                              }
                            }}
                          />
                        </PaginationItem>
                        <PaginationItem>
                          <span className="text-sm border rounded px-3 py-1.5 bg-background">
                            Page {leadsPage} of {leadsTotalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (leadsPage < leadsTotalPages) {
                                setLeadsPage(p => p + 1);
                                fetchLeads({ page: leadsPage + 1, limit: leadsLimit, ...pipelineFilters });
                              }
                            }}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="payouts">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4">Payout Management</h2>
              {payoutsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PayoutManagement
                  payouts={payouts || []}
                  onUpdateStatus={updatePayoutStatus}
                  onSchedulePayout={schedulePayoutDate}
                  onBulkSettle={bulkSettlePayouts}
                  onCreatePayout={createManualPayout}
                  partners={allUsers || []}
                  isLoading={payoutsLoading}
                  isBulkSettlePending={isBulkSettlePending}
                  isCreatingPayout={isCreatingPayout}
                />
              )}

              {!payoutsLoading && (payoutsTotalPages > 1 || (payouts?.length || 0) > 0) && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>
                    <Select
                      value={payoutsLimit.toString()}
                      onValueChange={(val) => {
                        setPayoutsLimit(Number(val));
                        setPayoutsPage(1);
                        fetchPayouts({ page: 1, limit: Number(val) });
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={payoutsLimit} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 50, 100].map(limit => (
                          <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); if (payoutsPage > 1) { setPayoutsPage(p => p - 1); fetchPayouts({ page: payoutsPage - 1, limit: payoutsLimit }); } }}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm border rounded px-3 py-1.5 bg-background">
                          Page {payoutsPage} of {payoutsTotalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); if (payoutsPage < payoutsTotalPages) { setPayoutsPage(p => p + 1); fetchPayouts({ page: payoutsPage + 1, limit: payoutsLimit }); } }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="audit">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4">Audit Logs</h2>
              <AuditLogs logs={auditLogs || []} onExport={() => exportAuditLogsToCSV(auditLogs || [])} isLoading={auditLogsLoading} />

              {!auditLogsLoading && (auditLogsTotalPages > 1 || (auditLogs?.length || 0) > 0) && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>
                    <Select
                      value={auditLimit.toString()}
                      onValueChange={(val) => {
                        setAuditLimit(Number(val));
                        setAuditPage(1);
                        fetchAuditLogs({ page: 1, limit: Number(val) });
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={auditLimit} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[20, 50, 100].map(limit => (
                          <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (auditPage > 1) {
                              setAuditPage(p => p - 1);
                              fetchAuditLogs({ page: auditPage - 1, limit: auditLimit });
                            }
                          }}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm border rounded px-3 py-1.5 bg-background">
                          Page {auditPage} of {auditLogsTotalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (auditPage < auditLogsTotalPages) {
                              setAuditPage(p => p + 1);
                              fetchAuditLogs({ page: auditPage + 1, limit: auditLimit });
                            }
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="clients">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-semibold">Clients</h2>
                <Button variant="outline" size="sm" onClick={() => {
                  // Export function for clients if needed
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>

              {clientsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ClientsTable
                  clients={clients || []}
                  isLoading={clientsLoading}
                />
              )}

              {!clientsLoading && (clientsTotalPages > 1 || (clients?.length || 0) > 0) && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>
                    <Select
                      value={clientsLimit.toString()}
                      onValueChange={(val) => {
                        setClientsLimit(Number(val));
                        setClientsPage(1);
                        fetchClients({ page: 1, limit: Number(val) });
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={clientsLimit} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 50, 100].map(limit => (
                          <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (clientsPage > 1) {
                              setClientsPage(p => p - 1);
                              fetchClients({ page: clientsPage - 1, limit: clientsLimit });
                            }
                          }}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm border rounded px-3 py-1.5 bg-background">
                          Page {clientsPage} of {clientsTotalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (clientsPage < clientsTotalPages) {
                              setClientsPage(p => p + 1);
                              fetchClients({ page: clientsPage + 1, limit: clientsLimit });
                            }
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="notifications">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <NotificationManager
                notifications={notifications || []}
                users={(allUsers || []).map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}`, email: u.email }))}
                onCreateNotification={async (data) => {
                  createNotification(data);
                }}
                onDeleteNotification={async (id) => {
                  deleteNotification(id);
                }}
                isLoading={notificationsLoading}
              />

              {!notificationsLoading && (notificationsTotalPages > 1 || (notifications?.length || 0) > 0) && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>
                    <Select
                      value={notificationsLimit.toString()}
                      onValueChange={(val) => {
                        setNotificationsLimit(Number(val));
                        setNotificationsPage(1);
                        fetchNotifications({ page: 1, limit: Number(val) });
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={notificationsLimit} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[20, 50, 100].map(limit => (
                          <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (notificationsPage > 1) {
                              setNotificationsPage(p => p - 1);
                              fetchNotifications({ page: notificationsPage - 1, limit: notificationsLimit });
                            }
                          }}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm border rounded px-3 py-1.5 bg-background">
                          Page {notificationsPage} of {notificationsTotalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (notificationsPage < notificationsTotalPages) {
                              setNotificationsPage(p => p + 1);
                              fetchNotifications({ page: notificationsPage + 1, limit: notificationsLimit });
                            }
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="ledger">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-base sm:text-lg font-semibold">Financial Ledger</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filter:</span>
                  <Select
                    value={ledgerTypeFilter}
                    onValueChange={(val) => {
                      setLedgerTypeFilter(val);
                      setLedgerPage(1);
                      fetchLedger({ page: 1, limit: ledgerLimit, type: val });
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="client_payment">Client Payment</SelectItem>
                      <SelectItem value="student_commission">Commission</SelectItem>
                      <SelectItem value="payout_sent">Payout Sent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <LedgerTable entries={ledgerEntries} isLoading={ledgerLoading} />

              {!ledgerLoading && (ledgerTotalPages > 1 || (ledgerEntries?.length || 0) > 0) && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Rows per page</span>
                    <Select
                      value={ledgerLimit.toString()}
                      onValueChange={(val) => {
                        setLedgerLimit(Number(val));
                        setLedgerPage(1);
                        fetchLedger({ page: 1, limit: Number(val), type: ledgerTypeFilter });
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={ledgerLimit} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[20, 50, 100].map(limit => (
                          <SelectItem key={limit} value={limit.toString()}>{limit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (ledgerPage > 1) {
                              setLedgerPage(p => p - 1);
                              fetchLedger({ page: ledgerPage - 1, limit: ledgerLimit, type: ledgerTypeFilter });
                            }
                          }}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="text-sm border rounded px-3 py-1.5 bg-background">
                          Page {ledgerPage} of {ledgerTotalPages}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (ledgerPage < ledgerTotalPages) {
                              setLedgerPage(p => p + 1);
                              fetchLedger({ page: ledgerPage + 1, limit: ledgerLimit, type: ledgerTypeFilter });
                            }
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bulk Notification Dialog */}
      <Dialog open={bulkNotifyDialog} onOpenChange={setBulkNotifyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Bulk Notification</DialogTitle>
            <DialogDescription>
              Send a notification to {selectedUserIds.length} selected user(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="Notification title"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Notification message"
                value={notifDescription}
                onChange={(e) => setNotifDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={notifType} onValueChange={setNotifType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="conversion">Conversion</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="achievement">Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkNotifyDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={sendBulkNotification}
              disabled={!notifTitle || !notifDescription || isSendingBulk}
            >
              <Bell className="h-4 w-4 mr-2" />
              {isSendingBulk ? 'Sending...' : 'Send Notification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
