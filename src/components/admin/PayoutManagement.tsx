import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  MoreHorizontal,
  ExternalLink,
  CheckSquare,
  Download,
  Filter,
  Users,
  Building,
  ArrowRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import { exportPayoutsToCSV } from '@/lib/exportUtils';

interface Payout {
  id: string;
  partner_id: string;
  amount: number;
  status: 'pending' | 'scheduled' | 'processing' | 'completed' | 'failed';
  payment_method?: 'bank_transfer' | 'upi' | 'paypal' | 'other';
  payment_details?: Record<string, unknown>;
  proof_url?: string;
  notes?: string;
  scheduled_date?: string;
  completed_date?: string;
  paid_at?: string;
  created_at: string;
  partner?: {
    first_name: string;
    last_name: string;
    email: string;
    upi_id?: string;
    bank_details?: Record<string, unknown>;
    phoneNumber?: string;
    universityName?: string;
    panNumber?: string;
    panVerified?: boolean;
  };
  ledgerEntries?: any[];
}

interface PayoutManagementProps {
  payouts: Payout[];
  onUpdateStatus: (params: { payoutId: string; status: string; proofUrl?: string; notes?: string }) => void;
  onSchedulePayout: (params: { payoutId: string; scheduledDate: string }) => void;
  onBulkSettle?: (params: { payoutIds: string[]; notes?: string }) => void;
  onCreatePayout?: (data: { studentId: string; amount: number; notes: string; password: string }) => Promise<void>;
  partners?: any[];
  isLoading?: boolean;
  isBulkSettlePending?: boolean;
  isCreatingPayout?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: Calendar },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: CreditCard },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: AlertCircle },
};

const PayoutManagement = ({
  payouts,
  onUpdateStatus,
  onSchedulePayout,
  onBulkSettle,
  onCreatePayout,
  partners = [],
  isLoading,
  isBulkSettlePending,
  isCreatingPayout
}: PayoutManagementProps) => {
  const { toast } = useToast();
  const [markPaidDialogOpen, setMarkPaidDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  // Manual Payout State
  const [manualPayoutDialogOpen, setManualPayoutDialogOpen] = useState(false);
  const [manualStudentId, setManualStudentId] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkNotes, setBulkNotes] = useState('');
  const [bulkSettleDialogOpen, setBulkSettleDialogOpen] = useState(false);

  const filteredPayouts = useMemo(() => {
    return payouts.filter(p => {
      // Date Filter
      if (dateFrom && new Date(p.created_at) < new Date(dateFrom)) return false;
      if (dateTo) {
        const nextDay = new Date(dateTo);
        nextDay.setDate(nextDay.getDate() + 1);
        if (new Date(p.created_at) >= nextDay) return false;
      }

      // Payment Method Filter
      if (paymentMethodFilter !== 'all' && p.payment_method !== paymentMethodFilter) return false;

      return true;
    });
  }, [payouts, dateFrom, dateTo, paymentMethodFilter]);

  const handleMarkAsPaid = () => {
    if (selectedPayout) {
      onUpdateStatus({
        payoutId: selectedPayout.id,
        status: 'completed',
        proofUrl: proofUrl || undefined,
        notes: notes || undefined
      });
      setMarkPaidDialogOpen(false);
      setSelectedPayout(null);
      setProofUrl('');
      setNotes('');
    }
  };

  const handleBulkSettle = () => {
    if (onBulkSettle && selectedIds.size > 0) {
      onBulkSettle({
        payoutIds: Array.from(selectedIds),
        notes: bulkNotes || undefined
      });
      setBulkSettleDialogOpen(false);
      setBulkNotes('');
      setSelectedIds(new Set());
    }
  };

  const handleSchedule = () => {
    if (selectedPayout && scheduledDate) {
      onSchedulePayout({ payoutId: selectedPayout.id, scheduledDate });
      setScheduleDialogOpen(false);
      setSelectedPayout(null);
      setScheduledDate('');
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredPayouts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPayouts.map(p => p.id)));
    }
  };

  const handleExport = () => {
    const payoutsToExport = filteredPayouts.filter(p => selectedIds.size === 0 || selectedIds.has(p.id));
    exportPayoutsToCSV(payoutsToExport);
    toast({ title: "Export Started", description: `Exporting ${payoutsToExport.length} payouts.` });
  };

  const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'processing');
  const scheduledPayouts = payouts.filter(p => p.status === 'scheduled');
  const completedPayouts = payouts.filter(p => p.status === 'completed');

  const totalPending = pendingPayouts.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalScheduled = scheduledPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

  const [payoutDetailOpen, setPayoutDetailOpen] = useState(false);
  const [detailPayout, setDetailPayout] = useState<Payout | null>(null);

  const openPayoutDetail = (payout: Payout) => {
    setDetailPayout(payout);
    setPayoutDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Pending Processing</span>
          </div>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-muted-foreground mt-1">{pendingPayouts.length} payout(s)</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Scheduled</span>
          </div>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalScheduled)}</p>
          <p className="text-xs text-muted-foreground mt-1">{scheduledPayouts.length} payout(s)</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Completed This Month</span>
          </div>
          <p className="text-2xl font-bold mt-2">{formatCurrency(completedPayouts.reduce((sum, p) => sum + Number(p.amount), 0))}</p>
          <p className="text-xs text-muted-foreground mt-1">{completedPayouts.length} payout(s)</p>
        </div>
      </div>



      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between bg-card p-4 rounded-lg border border-border">
        <div className="flex flex-wrap gap-4 items-center w-full sm:w-auto">
          <div className="grid gap-1.5">
            <Label htmlFor="dateFrom" className="text-xs">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              className="h-8 w-36"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dateTo" className="text-xs">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              className="h-8 w-36"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="paymentMethod" className="text-xs">Payment Method</Label>
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger id="paymentMethod" className="h-8 w-36">
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Manual Payout Button */}
        <div className="flex justify-end">
          <Button onClick={() => setManualPayoutDialogOpen(true)}>
            <IndianRupee className="h-4 w-4 mr-2" />
            Create Manual Payout
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between gap-3"
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              {selectedIds.size} payout(s) selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button size="sm" onClick={() => setBulkSettleDialogOpen(true)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payouts Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === filteredPayouts.length && filteredPayouts.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Partner</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No payouts found based on filters
                </TableCell>
              </TableRow>
            ) : (
              filteredPayouts.map((payout, index) => {
                const StatusIcon = statusConfig[payout.status]?.icon || Clock;
                return (
                  <motion.tr
                    key={payout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border last:border-0"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(payout.id)}
                        onCheckedChange={() => toggleSelection(payout.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {payout.partner?.first_name} {payout.partner?.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{payout.partner?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatCurrency(payout.amount)}
                    </TableCell>
                    <TableCell>
                      {payout.payment_method ? (
                        <div className="text-sm">
                          <p className="capitalize">{payout.payment_method.replace('_', ' ')}</p>
                          {payout.partner?.upi_id && (
                            <p className="text-xs text-muted-foreground">{payout.partner.upi_id}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[payout.status]?.color || 'bg-gray-100'}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[payout.status]?.label || payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => openPayoutDetail(payout)}>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {payout.paid_at
                            ? `Paid ${format(new Date(payout.paid_at), 'MMM d')}`
                            : format(new Date(payout.created_at), 'MMM d')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {(payout.status === 'pending' || payout.status === 'processing') && (
                            <>
                              <DropdownMenuItem onClick={() => {
                                setSelectedPayout(payout);
                                setScheduleDialogOpen(true);
                              }}>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Payout
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedPayout(payout);
                                setMarkPaidDialogOpen(true);
                              }}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            </>
                          )}
                          {payout.status === 'scheduled' && (
                            <DropdownMenuItem onClick={() => {
                              setSelectedPayout(payout);
                              setMarkPaidDialogOpen(true);
                            }}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          {payout.proof_url && (
                            <DropdownMenuItem asChild>
                              <a href={payout.proof_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Proof
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onUpdateStatus({ payoutId: payout.id, status: 'failed' })} className="text-red-600">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Mark as Failed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Payout Detail Panel */}
      <AnimatePresence>
        {payoutDetailOpen && detailPayout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setPayoutDetailOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-card border-l border-border shadow-xl z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10 glass-effect">
                <h2 className="font-semibold">Payout Details</h2>
                <Button variant="ghost" size="icon" onClick={() => setPayoutDetailOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Summary Info */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Payout Amount</p>
                  <p className="text-4xl font-bold text-primary">{formatCurrency(detailPayout.amount)}</p>
                  <Badge className={`mt-4 ${statusConfig[detailPayout.status]?.color}`}>
                    {statusConfig[detailPayout.status]?.label}
                  </Badge>
                </div>

                {/* Referrer (Partner) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Referrer (Partner)
                  </h3>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                    <p className="font-medium">{detailPayout.partner?.first_name} {detailPayout.partner?.last_name}</p>
                    <p className="text-sm text-muted-foreground">{detailPayout.partner?.email}</p>
                    {detailPayout.partner?.phoneNumber && (
                      <p className="text-sm text-muted-foreground mt-1">{detailPayout.partner.phoneNumber}</p>
                    )}
                  </div>
                </div>

                {/* Linked Items (Clients/Leads) */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" /> Linked Commissions
                  </h3>
                  <div className="space-y-2">
                    {detailPayout.ledgerEntries && detailPayout.ledgerEntries.length > 0 ? (
                      detailPayout.ledgerEntries.map((entry: any) => (
                        <div key={entry.id} className="bg-muted/30 rounded-lg p-3 border border-border/50 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {entry.leadsPipeline?.client?.businessName || 'Manual Adjustment'}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              {entry.type.replace('_', ' ')}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-green-600">
                            +{formatCurrency(entry.amount)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic bg-muted/20 p-4 rounded-lg border border-dashed border-border text-center">
                        This payout was created manually or has no linked leads.
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Metadata */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created Date</span>
                    <span>{format(new Date(detailPayout.created_at), 'PPP')}</span>
                  </div>
                  {detailPayout.scheduled_date && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scheduled For</span>
                      <span>{format(new Date(detailPayout.scheduled_date), 'PPP')}</span>
                    </div>
                  )}
                  {detailPayout.paid_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground text-green-600 font-medium">Money Sent On</span>
                      <span className="text-green-600 font-medium">{format(new Date(detailPayout.paid_at), 'PPP')}</span>
                    </div>
                  )}
                  {detailPayout.payment_method && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="capitalize">{detailPayout.payment_method.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>

                {/* Notes & Proof */}
                {detailPayout.notes && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Notes</p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-200/50 text-sm italic">
                      {detailPayout.notes}
                    </div>
                  </div>
                )}

                {detailPayout.proof_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={detailPayout.proof_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> View Payment Proof
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mark as Paid Dialog (Single) */}
      <Dialog open={markPaidDialogOpen} onOpenChange={setMarkPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payout as Paid</DialogTitle>
            <DialogDescription>
              Confirm payment of {selectedPayout && formatCurrency(selectedPayout.amount)} to {selectedPayout?.partner?.first_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="proofUrl">Proof of Payment (URL)</Label>
              <Input
                id="proofUrl"
                placeholder="https://..."
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Transaction ID, reference number, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMarkAsPaid} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Settle Dialog */}
      <Dialog open={bulkSettleDialogOpen} onOpenChange={setBulkSettleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Settle Payouts</DialogTitle>
            <DialogDescription>
              Mark {selectedIds.size} payouts as paid?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bulkNotes">Notes (Optional)</Label>
              <Textarea
                id="bulkNotes"
                placeholder="Batch Reference ID..."
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm">
              <span className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                This will mark all selected payouts as Completed.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkSettleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkSettle} disabled={isBulkSettlePending} className="bg-green-600 hover:bg-green-700">
              {isBulkSettlePending ? 'Processing...' : `Confirm ${selectedIds.size} Payments`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog (unchanged structure) */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Payout</DialogTitle>
            <DialogDescription>
              Schedule payment of {selectedPayout && formatCurrency(selectedPayout.amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Payout Dialog */}
      <Dialog open={manualPayoutDialogOpen} onOpenChange={setManualPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Manual Payout</DialogTitle>
            <DialogDescription>
              Manually create a payout record for a partner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Partner</Label>
              <Select value={manualStudentId} onValueChange={setManualStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner: any) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.first_name} {partner.last_name} ({partner.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Reason for payout..."
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-red-500">Admin Password (Required)</Label>
              <Input
                type="password"
                placeholder="Enter your password to confirm"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="border-red-200 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setManualPayoutDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (onCreatePayout) {
                  try {
                    await onCreatePayout({
                      studentId: manualStudentId,
                      amount: Number(manualAmount),
                      notes: manualNotes,
                      password: adminPassword
                    });
                    setManualPayoutDialogOpen(false);
                    setManualStudentId('');
                    setManualAmount('');
                    setManualNotes('');
                    setAdminPassword('');
                  } catch (e) {
                    // Toast handled in hook
                  }
                }
              }}
              disabled={!manualStudentId || !manualAmount || !adminPassword || isCreatingPayout}
            >
              {isCreatingPayout ? 'Creating...' : 'Create Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayoutManagement;
