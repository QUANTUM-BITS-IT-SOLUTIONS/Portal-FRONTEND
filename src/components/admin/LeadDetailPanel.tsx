import { motion } from 'framer-motion';
import {
    X,
    User,
    Mail,
    Building,
    Phone,
    Link as LinkIcon,
    DollarSign,
    Calendar,
    CreditCard,
    FileText,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Lead } from '@/types/pipeline';

interface LeadDetailPanelProps {
    lead: Lead;
    onClose: () => void;
}

const LeadDetailPanel = ({ lead, onClose }: LeadDetailPanelProps) => {
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const statusColors: Record<string, string> = {
        'paid': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        // Add other statuses as needed, defaulting to gray
    };

    const getStatusColor = (status: string) => {
        return statusColors[status] || 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-card border-l border-border shadow-xl z-50 overflow-y-auto"
        >
            <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-semibold">{lead.client_name}</h2>
                        <p className="text-xs text-muted-foreground">{lead.company_name || 'No Company'}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div className="p-4 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(lead.status)}>
                        {lead.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        updated {format(new Date(lead.updated_at), 'MMM d, yyyy')}
                    </span>
                </div>

                {/* Key Deal Metrics */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-xs">Deal Value</span>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(lead.deal_value)}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-xs">Est. Commission</span>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                            {formatCurrency(lead.deal_value * ((lead.commission_percentage || 10) / 100))}
                        </p>
                    </div>
                </div>

                <Separator />

                {/* Client Information */}
                <div>
                    <h3 className="text-sm font-semibold mb-3">Client Contact Info</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{lead.client_email}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(lead.client_email, 'Email')}>
                                <FileText className="h-3 w-3" />
                            </Button>
                        </div>
                        {lead.client_phone && (
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{lead.client_phone}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => copyToClipboard(lead.client_phone!, 'Phone')}>
                                    <FileText className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Created {format(new Date(lead.created_at), 'MMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Payment & Invoice Info */}
                <div>
                    <h3 className="text-sm font-semibold mb-3">Billing Details</h3>
                    <div className="space-y-3">
                        {lead.payment_link ? (
                            <div className="bg-muted p-3 rounded-md">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold flex items-center gap-1"><LinkIcon className="h-3 w-3" /> Payment Link</span>
                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(lead.payment_link!, 'Payment Link')}>
                                        <FileText className="h-3 w-3" />
                                    </Button>
                                </div>
                                <a href={lead.payment_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline break-all block">
                                    {lead.payment_link}
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4" /> No payment link generated
                            </div>
                        )}

                        {lead.invoice_number && (
                            <div className="flex items-center justify-between bg-muted/50 p-2 rounded">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Invoice: {lead.invoice_number}</span>
                                </div>
                                {lead.invoice_date && (
                                    <span className="text-xs text-muted-foreground">{format(new Date(lead.invoice_date), 'MMM d')}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Referrer Info */}
                {lead.referrer && (
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Referrer</h3>
                        <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {lead.referrer.first_name[0]}{lead.referrer.last_name[0]}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{lead.referrer.first_name} {lead.referrer.last_name}</p>
                                <p className="text-xs text-muted-foreground">Partner</p>
                            </div>
                        </div>
                    </div>
                )}

                {lead.notes && (
                    <>
                        <Separator />
                        <div>
                            <h3 className="text-sm font-semibold mb-2">Notes</h3>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg italic">
                                "{lead.notes}"
                            </p>
                        </div>
                    </>
                )}

            </div>
        </motion.div>
    );
};

export default LeadDetailPanel;
