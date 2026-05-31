import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpDown,
  Filter,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  RefreshCw,
  FileText,
  Calculator,
  Repeat,
  Info
} from 'lucide-react';
import { Client } from '@/types/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ClientsTableProps {
  clients: Client[];
}

type SortField = 'clientName' | 'dealAmount' | 'earnings' | 'conversionDate';
type SortOrder = 'asc' | 'desc';

// Mock deal notes - in production these would come from the database
const dealNotes: Record<string, string> = {
  'CLI001': 'Enterprise deal closed after 3 demos. CEO was impressed with automation features.',
  'CLI002': 'Monthly subscription. Client is using for team collaboration. Renewal expected.',
  'CLI003': 'One-time project for cloud migration. Potential for follow-up work.',
  'CLI004': 'Growing startup, likely to upgrade plan next quarter.',
  'CLI005': 'Referred by existing client. Smooth onboarding process.',
  'CLI006': 'Financial services client with strict compliance requirements.',
  'CLI007': 'Healthcare digital transformation project. High-value deal.',
  'CLI008': 'Small business package. Very satisfied with support.',
  'CLI009': 'Logistics optimization project. Still in processing.',
  'CLI010': 'EdTech startup. High growth potential.',
};

export const ClientsTable = ({ clients }: ClientsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('conversionDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const filteredAndSortedClients = useMemo(() => {
    // Filter strictly for Paid clients as per requirement
    let result = clients.filter(c => c.paymentStatus === 'Paid');

    if (searchTerm) {
      result = result.filter(
        (client) =>
          client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let aVal: string | number = a[sortField];
      let bVal: string | number = b[sortField];

      if (sortField === 'conversionDate') {
        aVal = new Date(a.conversionDate).getTime();
        bVal = new Date(b.conversionDate).getTime();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [clients, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleExpanded = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Paid: 'bg-success/10 text-success border-success/20',
      Pending: 'bg-warning/10 text-warning border-warning/20',
      Processing: 'bg-accent/10 text-accent border-accent/20',
    };
    return (
      <Badge variant="outline" className={cn('font-medium', variants[status])}>
        {status}
      </Badge>
    );
  };

  const handleExport = () => {
    const csvContent = [
      ['Client', 'Company', 'Deal Amount', 'Commission %', 'Earnings', 'Date', 'Status'],
      ...filteredAndSortedClients.map((c) => [
        c.clientName,
        c.companyName,
        c.dealAmount,
        c.commissionPercentage,
        c.earnings,
        c.conversionDate,
        c.paymentStatus,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qbits-clients.csv';
    a.click();
  };

  const renderExpandedContent = (client: Client) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-4 pb-4 pt-2 border-t border-border bg-muted/20"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Deal Notes */}
        <div className="p-3 rounded-lg bg-background border border-border">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Deal Notes</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {dealNotes[client.id] || 'No notes available for this deal.'}
          </p>
        </div>

        {/* Commission Math */}
        <div className="p-3 rounded-lg bg-background border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Commission Breakdown</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deal Amount:</span>
              <span className="text-foreground">{formatCurrency(client.dealAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deal Amount:</span>
              <span className="text-foreground">{formatCurrency(client.dealAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your Rate:</span>
              <span className="text-foreground">{client.commissionPercentage}%</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 mt-1.5">
              <span className="text-muted-foreground font-medium">Your Earnings:</span>
              <span className="text-success font-bold">{formatCurrency(client.earnings)}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              {formatCurrency(client.dealAmount)} × {client.commissionPercentage}% = {formatCurrency(client.earnings)}
            </p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="p-3 rounded-lg bg-background border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">
              Payment Details
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              {getStatusBadge(client.paymentStatus)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Commission is paid after client payment is processed.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-card rounded-xl border border-border shadow-card"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">Client Conversions</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {filteredAndSortedClients.length} of {clients.length} clients • Click row to expand details
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleExport} className="gap-2 flex-1 sm:flex-none text-sm">
                <Download size={14} />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-3 space-y-3">
        {filteredAndSortedClients.map((client, index) => (
          <Collapsible
            key={client.id}
            open={expandedClients.has(client.id)}
            onOpenChange={() => toggleExpanded(client.id)}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-muted/30 rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger className="w-full p-4 text-left">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <Building2 size={14} className="text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{client.clientName}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.companyName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(client.paymentStatus)}
                    {expandedClients.has(client.id) ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Deal Amount</p>
                    <p className="font-semibold text-foreground">{formatCurrency(client.dealAmount)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Earnings</p>
                  <p className="font-semibold text-success">{formatCurrency(client.earnings)}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border mt-3">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground ml-2">{client.commissionPercentage}% rate</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar size={12} />
                    <span>{formatDate(client.conversionDate)}</span>
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <AnimatePresence>
                  {expandedClients.has(client.id) && renderExpandedContent(client)}
                </AnimatePresence>
              </CollapsibleContent>
            </motion.div>
          </Collapsible>
        ))}
      </div >

      {/* Desktop Table */}
      < div className="hidden md:block overflow-x-auto" >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8"></TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors min-w-[180px]"
                onClick={() => handleSort('clientName')}
              >
                <div className="flex items-center gap-2">
                  Client
                  <ArrowUpDown size={14} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('dealAmount')}
              >
                <div className="flex items-center gap-2">
                  Deal Amount
                  <ArrowUpDown size={14} />
                </div>
              </TableHead>
              <TableHead>Commission</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('earnings')}
              >
                <div className="flex items-center gap-2">
                  Your Earnings
                  <ArrowUpDown size={14} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={() => handleSort('conversionDate')}
              >
                <div className="flex items-center gap-2">
                  Date
                  <ArrowUpDown size={14} />
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedClients.map((client, index) => (
              <Collapsible
                key={client.id}
                open={expandedClients.has(client.id)}
                onOpenChange={() => toggleExpanded(client.id)}
                asChild
              >
                <>
                  <CollapsibleTrigger asChild>
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="group hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <TableCell className="w-8">
                        {expandedClients.has(client.id) ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Building2 size={18} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{client.clientName}</p>
                            <p className="text-sm text-muted-foreground">{client.companyName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(client.dealAmount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{client.commissionPercentage}%</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-success">{formatCurrency(client.earnings)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar size={14} />
                          <span>{formatDate(client.conversionDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(client.paymentStatus)}</TableCell>
                    </motion.tr>
                  </CollapsibleTrigger>
                  <CollapsibleContent asChild>
                    <tr>
                      <td colSpan={8} className="p-0">
                        <AnimatePresence>
                          {expandedClients.has(client.id) && renderExpandedContent(client)}
                        </AnimatePresence>
                      </td>
                    </tr>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
          </TableBody>
        </Table >
      </div >

      {
        filteredAndSortedClients.length === 0 && (
          <div className="p-8 sm:p-12 text-center">
            <p className="text-muted-foreground">No clients found matching your criteria.</p>
          </div>
        )
      }
    </motion.div >
  );
};
