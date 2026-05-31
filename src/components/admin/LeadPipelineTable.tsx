import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Phone,
  Handshake,
  Receipt,
  CreditCard,
  IndianRupee,
  ThumbsUp,
  CheckCircle2,
  Link as LinkIcon,
  ExternalLink,
  ChevronDown,
  FileText,
  Download,
  ArrowRight,
  Calculator,
  Pause,
  XCircle,
  MoreHorizontal,
  CheckSquare,
  MessageSquare // Added
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import { downloadInvoice } from '@/lib/invoiceGenerator';
import { LeadStatus, Lead, Commission, CommissionStatus } from '@/types/pipeline';
import LeadDetailPanel from './LeadDetailPanel'; // Added

interface LeadPipelineTableProps {
  leads: Lead[];
  onStatusChange: (params: { leadId: string; status: LeadStatus; dealValue?: number; transactionId?: string; paymentType?: 'full' | 'partial'; paymentPercentage?: number; notes?: string }) => void;
  onPaymentLinkUpdate: (params: { leadId: string; paymentLink: string }) => void;
  onGenerateInvoice: (params: { leadId: string; invoiceNumber: string }) => void;
  onCommissionStatusChange?: (params: { leadId: string; status: CommissionStatus; reason?: string }) => void;
  onBulkAction?: (params: { leadIds: string[]; action: string }) => void;
  onCompletePartialPayment?: (params: { leadId: string }) => void;
  isGeneratingInvoice?: boolean;
}

// Pipeline stages in order with proper business flow
const pipelineStages: { status: LeadStatus; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'lead_added', label: 'Lead Received', icon: UserPlus, color: 'bg-slate-500' },
  { status: 'team_approval', label: 'Contacted', icon: Phone, color: 'bg-blue-500' },
  { status: 'negotiating', label: 'Negotiating', icon: MessageSquare, color: 'bg-indigo-500' }, // Added
  { status: 'payment_link', label: 'Deal Closed', icon: Handshake, color: 'bg-purple-500' },
  { status: 'client_pays', label: 'Payment Received', icon: IndianRupee, color: 'bg-green-500' },
  { status: 'invoice', label: 'Invoice Sent', icon: Receipt, color: 'bg-orange-500' },
  { status: 'commission_approved', label: 'Commission Approved', icon: ThumbsUp, color: 'bg-emerald-500' },
  { status: 'work_starts', label: 'Work Starts', icon: CheckCircle2, color: 'bg-blue-600' },
];

const commissionStatusConfig: Record<CommissionStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  held: { label: 'On Hold', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
};

const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}-${random}`;
};

const LeadPipelineTable = ({
  leads,
  onStatusChange,
  onPaymentLinkUpdate,
  onGenerateInvoice,
  onCommissionStatusChange,
  onBulkAction,
  onCompletePartialPayment,
  isGeneratingInvoice,
}: LeadPipelineTableProps) => {
  const [paymentLinkDialog, setPaymentLinkDialog] = useState<string | null>(null);
  const [paymentLink, setPaymentLink] = useState('');

  // Payment Dialog States (consolidated - deal value + transaction ID in one dialog)
  const [paymentDialog, setPaymentDialog] = useState<string | null>(null);
  const [dealValue, setDealValue] = useState('');
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [paymentPercentage, setPaymentPercentage] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  // Keep transactionIdDialog for backward compatibility but it's now part of payment dialog
  const [transactionIdDialog, setTransactionIdDialog] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');

  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null); // Added

  const handleStatusChangeRequest = (leadId: string, status: LeadStatus) => {
    // Intercept "Payment Received" (client_pays) - show consolidated payment dialog
    if (status === 'client_pays') {
      setPaymentDialog(leadId);
      setDealValue('');
      setPaymentType('full');
      setPaymentPercentage('');
      setPaymentNotes('');
      setTransactionId('');
      return;
    }

    // Default - proceed with status change
    onStatusChange({ leadId, status });
  };

  const handlePaymentDialogSubmit = () => {
    if (paymentDialog && dealValue && transactionId && paymentNotes) {
      onStatusChange({
        leadId: paymentDialog,
        status: 'client_pays',
        dealValue: parseFloat(dealValue),
        transactionId: transactionId,
        paymentType: paymentType,
        paymentPercentage: paymentType === 'partial' ? parseFloat(paymentPercentage) : 100,
        notes: paymentNotes
      });
      setPaymentDialog(null);
      setDealValue('');
      setPaymentType('full');
      setPaymentPercentage('');
      setPaymentNotes('');
      setTransactionId('');
    }
  };

  const handlePaymentLinkSubmit = (leadId: string) => {
    if (paymentLink.trim()) {
      onPaymentLinkUpdate({ leadId, paymentLink: paymentLink.trim() });
      setPaymentLinkDialog(null);
      setPaymentLink('');
    }
  };

  const handleGenerateInvoice = (lead: Lead) => {
    const invoiceNumber = generateInvoiceNumber();
    const referrerName = lead.referrer
      ? `${lead.referrer.first_name} ${lead.referrer.last_name}`
      : 'Direct';

    downloadInvoice({
      invoiceNumber,
      invoiceDate: new Date(),
      clientName: lead.client_name,
      clientEmail: lead.client_email,
      clientPhone: lead.client_phone,
      companyName: lead.company_name,
      dealValue: Number(lead.deal_value),
      notes: lead.notes,
      referrerName,
    });

    onGenerateInvoice({ leadId: lead.id, invoiceNumber });
  };

  const handleDownloadExistingInvoice = (lead: Lead) => {
    if (!lead.invoice_number || !lead.invoice_date) return;

    const referrerName = lead.referrer
      ? `${lead.referrer.first_name} ${lead.referrer.last_name}`
      : 'Direct';

    downloadInvoice({
      invoiceNumber: lead.invoice_number,
      invoiceDate: new Date(lead.invoice_date),
      clientName: lead.client_name,
      clientEmail: lead.client_email,
      clientPhone: lead.client_phone,
      companyName: lead.company_name,
      dealValue: Number(lead.deal_value),
      notes: lead.notes,
      referrerName,
    });
  };

  const handleCommissionAction = (leadId: string, action: CommissionStatus) => {
    if (action === 'rejected') {
      setSelectedLeadId(leadId);
      setRejectionDialogOpen(true);
    } else if (onCommissionStatusChange) {
      onCommissionStatusChange({ leadId, status: action });
    }
  };

  const handleRejectionSubmit = () => {
    if (selectedLeadId && onCommissionStatusChange) {
      onCommissionStatusChange({ leadId: selectedLeadId, status: 'rejected', reason: rejectionReason });
      setRejectionDialogOpen(false);
      setRejectionReason('');
      setSelectedLeadId(null);
    }
  };

  const toggleLeadSelection = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const toggleAllLeads = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(l => l.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedLeads.size > 0) {
      onBulkAction({ leadIds: Array.from(selectedLeads), action });
      setSelectedLeads(new Set());
    }
  };

  const getStageIndex = (status: LeadStatus) => {
    return pipelineStages.findIndex(s => s.status === status);
  };

  const getNextStage = (currentStatus: LeadStatus) => {
    const currentIndex = getStageIndex(currentStatus);
    if (currentIndex < pipelineStages.length - 1) {
      const nextStage = pipelineStages[currentIndex + 1];
      // Prevent manual transition to blocked stages
      if (nextStage.status === 'work_starts') {
        return null;
      }
      return nextStage;
    }
    return null;
  };

  const calculateCommission = (dealValue: any, percentage: any = 10) => {
    return (Number(dealValue) * Number(percentage)) / 100;
  };

  const getCurrentStage = (status: LeadStatus) => {
    return pipelineStages.find(s => s.status === status) || pipelineStages[0];
  };

  // Check if status has passed payment received (client_pays) - cancel should be hidden
  const hasPassedPaymentReceived = (status: LeadStatus) => {
    const paymentReceivedIndex = getStageIndex('client_pays');
    const currentIndex = getStageIndex(status);
    return currentIndex >= paymentReceivedIndex;
  };

  // Sort leads by status (pipeline order - most progressed first)
  const sortedLeads = [...leads].sort((a, b) => {
    return getStageIndex(b.status) - getStageIndex(a.status);
  });

  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No leads found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedLeads.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            {selectedLeads.size} lead(s) selected
          </span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('generate_invoices')}>
              <Receipt className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Generate</span> Invoices
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('mark_paid')}>
              <IndianRupee className="h-4 w-4 mr-1 sm:mr-2" />
              Mark Paid
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('approve_commissions')}>
              <ThumbsUp className="h-4 w-4 mr-1 sm:mr-2" />
              Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedLeads(new Set())}>
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {sortedLeads.map((lead, index) => {
          const stage = getCurrentStage(lead.status);
          const StageIcon = stage.icon;
          const nextStage = getNextStage(lead.status);
          const commissionAmount = calculateCommission(lead.deal_value, lead.commission_percentage || 10);
          const commissionStatus = lead.commission_status || 'pending';

          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedLeads.has(lead.id)}
                    onCheckedChange={() => toggleLeadSelection(lead.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{lead.client_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.company_name || lead.client_email}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Details
                    </DropdownMenuItem>
                    {!hasPassedPaymentReceived(lead.status) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleStatusChangeRequest(lead.id, 'cancelled')}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Deal
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setPaymentLinkDialog(lead.id)}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Add Payment Link
                    </DropdownMenuItem>
                    {!lead.invoice_number ? (
                      <DropdownMenuItem onClick={() => handleGenerateInvoice(lead)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Invoice
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleDownloadExistingInvoice(lead)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Pipeline Stage */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${stage.color} text-white text-xs`}>
                  <StageIcon className="h-3 w-3 mr-1" />
                  {stage.label}
                </Badge>
                {nextStage && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs px-2"
                    onClick={() => handleStatusChangeRequest(lead.id, nextStage.status)}
                  >
                    <ArrowRight className="h-3 w-3 mr-1" />
                    {nextStage.label}
                  </Button>
                )}
              </div>

              {/* Deal Value & Commission */}
              <TooltipProvider>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/50 rounded p-2">
                    <p className="text-muted-foreground text-xs">Deal Value</p>
                    <p className="font-semibold">{formatCurrency(lead.deal_value)}</p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-green-50 dark:bg-green-950/30 rounded p-2 cursor-help">
                        <p className="text-muted-foreground text-xs flex items-center gap-1">
                          <Calculator className="h-3 w-3" />
                          Commission ({lead.commission_percentage || 10}%)
                        </p>
                        <p className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(commissionAmount)}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{formatCurrency(lead.deal_value)} × {lead.commission_percentage || 10}% = {formatCurrency(commissionAmount)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>

              {/* Commission Status & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Badge className={commissionStatusConfig[commissionStatus].color}>
                  {commissionStatusConfig[commissionStatus].label}
                </Badge>
                {commissionStatus === 'pending' && lead.status === 'client_pays' && onCommissionStatusChange && (
                  <div className="flex gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-green-600"
                            onClick={() => handleCommissionAction(lead.id, 'approved')}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Approve</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-orange-600"
                            onClick={() => handleCommissionAction(lead.id, 'held')}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Hold</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-600"
                            onClick={() => handleCommissionAction(lead.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reject</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              {/* Referrer */}
              {lead.referrer && (
                <p className="text-xs text-muted-foreground">
                  Referred by: {lead.referrer.first_name} {lead.referrer.last_name}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="rounded-lg border border-border overflow-x-auto hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedLeads.size === leads.length && leads.length > 0}
                  onCheckedChange={toggleAllLeads}
                />
              </TableHead>
              <TableHead className="min-w-[150px]">Client</TableHead>
              <TableHead className="min-w-[140px]">Pipeline Stage</TableHead>
              <TableHead className="min-w-[100px] text-right">Deal Value</TableHead>
              <TableHead className="min-w-[130px] text-right">Commission</TableHead>
              <TableHead className="min-w-[150px]">Commission Status</TableHead>
              <TableHead className="min-w-[120px]">Referrer</TableHead>
              <TableHead className="text-right min-w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads.map((lead, index) => {
              const stage = getCurrentStage(lead.status);
              const StageIcon = stage.icon;
              const nextStage = getNextStage(lead.status);
              const commissionAmount = calculateCommission(lead.deal_value, lead.commission_percentage || 10);
              const commissionStatus = lead.commission_status || 'pending';

              return (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-muted/30"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={() => toggleLeadSelection(lead.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{lead.client_name}</p>
                      <p className="text-xs text-muted-foreground">{lead.company_name || lead.client_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={`${stage.color} text-white text-xs`}>
                        <StageIcon className="h-3 w-3 mr-1" />
                        {stage.label}
                      </Badge>
                      {nextStage && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleStatusChangeRequest(lead.id, nextStage.status)}
                              >
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Move to {nextStage.label}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-medium">{formatCurrency(lead.deal_value)}</span>
                      {lead.payment_type && (
                        <Badge
                          variant={lead.payment_type === 'partial' ? 'outline' : 'secondary'}
                          className={`text-xs ${lead.payment_type === 'partial' ? 'text-orange-600 border-orange-600' : 'text-green-600 border-green-600'}`}
                        >
                          {lead.payment_type === 'partial' ? `Partial (${lead.payment_percentage || 0}%)` : 'Full'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium cursor-help">
                            <Calculator className="h-3 w-3" />
                            {formatCurrency(commissionAmount)}
                            <span className="text-xs text-muted-foreground">({lead.commission_percentage || 10}%)</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono">
                            {formatCurrency(lead.deal_value)} × {lead.commission_percentage || 10}% = {formatCurrency(commissionAmount)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge className={commissionStatusConfig[commissionStatus].color}>
                        {commissionStatusConfig[commissionStatus].label}
                      </Badge>
                      {commissionStatus === 'pending' && lead.status === 'client_pays' && onCommissionStatusChange && (
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                                  onClick={() => handleCommissionAction(lead.id, 'approved')}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Approve Commission</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
                                  onClick={() => handleCommissionAction(lead.id, 'held')}
                                >
                                  <Pause className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Hold Commission</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                                  onClick={() => handleCommissionAction(lead.id, 'rejected')}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reject Commission</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.referrer ? (
                      <span className="text-sm">{lead.referrer.first_name} {lead.referrer.last_name}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Details
                        </DropdownMenuItem>
                        {!hasPassedPaymentReceived(lead.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChangeRequest(lead.id, 'cancelled')}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Deal
                            </DropdownMenuItem>
                          </>
                        )}
                        {lead.payment_type === 'partial' && onCompletePartialPayment && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onCompletePartialPayment({ leadId: lead.id })}
                              className="text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950/20"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Complete Payment ({100 - (Number(lead.payment_percentage) || 0)}% remaining)
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        {lead.payment_link ? (
                          <DropdownMenuItem asChild>
                            <a href={lead.payment_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Payment Link
                            </a>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setPaymentLinkDialog(lead.id)}>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Add Payment Link
                          </DropdownMenuItem>
                        )}
                        {!lead.invoice_number ? (
                          <DropdownMenuItem
                            onClick={() => handleGenerateInvoice(lead)}
                            disabled={isGeneratingInvoice}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Invoice
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleDownloadExistingInvoice(lead)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Invoice
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Payment Link Dialog */}
      <Dialog open={paymentLinkDialog !== null} onOpenChange={(open) => {
        if (!open) {
          setPaymentLinkDialog(null);
          setPaymentLink('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Link</DialogTitle>
            <DialogDescription>Enter the payment link for this lead</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="https://payment-link.com/..."
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentLinkDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => paymentLinkDialog && handlePaymentLinkSubmit(paymentLinkDialog)}>
              Save Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consolidated Payment Dialog (Deal Amount + Payment Type + Transaction ID) */}
      <Dialog open={!!paymentDialog} onOpenChange={(open) => !open && setPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Received - Enter Details</DialogTitle>
            <DialogDescription>Please enter the payment details to mark this as received.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Deal Amount (₹)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Payment Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="full"
                    checked={paymentType === 'full'}
                    onChange={() => setPaymentType('full')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Full Payment</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="partial"
                    checked={paymentType === 'partial'}
                    onChange={() => setPaymentType('partial')}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Partial Payment</span>
                </label>
              </div>
            </div>
            {paymentType === 'partial' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Percentage (%)</label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  min="1"
                  max="99"
                  value={paymentPercentage}
                  onChange={(e) => setPaymentPercentage(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-2 block">Transaction ID</label>
              <Input
                placeholder="Enter transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Service Summary & Notes <span className="text-red-500">*</span></label>
              <Textarea
                placeholder="Summary of services client will take..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(null)}>Cancel</Button>
            <Button
              onClick={handlePaymentDialogSubmit}
              disabled={!dealValue || !transactionId || !paymentNotes || (paymentType === 'partial' && !paymentPercentage)}
            >
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Panel */}
      <AnimatePresence>
        {selectedLead && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedLead(null)}
            />
            <LeadDetailPanel
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Commission</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this commission</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectionSubmit}>
              Reject Commission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadPipelineTable;
