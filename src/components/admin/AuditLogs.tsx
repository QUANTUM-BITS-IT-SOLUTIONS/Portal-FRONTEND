import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  FileText,
  User,
  IndianRupee,
  Filter,
  Download,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import AuditLogViewer from './AuditLogViewer';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface AuditLogsProps {
  logs: AuditLog[];
  onExport: () => void;
  isLoading?: boolean;
}

const actionConfig: Record<string, { label: string; color: string }> = {
  // Security Events
  LOGIN_FAILED: { label: 'Login Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  ADMIN_LOGIN_FAILED: { label: 'Admin Login Failed', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },

  // Student Operations
  STUDENT_SIGNUP: { label: 'Student Signup', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  UPDATE_PROFILE: { label: 'Profile Updated', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  CHANGE_PASSWORD: { label: 'Password Changed', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  UPDATE_PAYOUT_METHODS: { label: 'Payment Method Updated', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  UPLOAD_AVATAR: { label: 'Avatar Uploaded', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },

  // Payout Operations
  REQUEST_PAYOUT: { label: 'Payout Requested', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  SETTLE_PAYOUT: { label: 'Payout Settled', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  BULK_SETTLE_PAYOUTS: { label: 'Bulk Payouts Settled', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },

  // Lead/Commission Operations
  UPDATE_LEAD_STATUS: { label: 'Lead Status Updated', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  MARK_LEAD_PAID: { label: 'Lead Marked Paid', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  COMPLETE_PARTIAL_PAYMENT: { label: 'Partial Payment Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
};

const entityConfig: Record<string, { label: string; icon: React.ElementType }> = {
  leads: { label: 'Lead', icon: FileText },
  LeadsPipeline: { label: 'Lead', icon: FileText },
  payouts: { label: 'Payout', icon: IndianRupee },
  StudentPayout: { label: 'Payout', icon: IndianRupee },
  commissions: { label: 'Commission', icon: IndianRupee },
  profiles: { label: 'Profile', icon: User },
  Student: { label: 'Student', icon: User },
  Admin: { label: 'Admin', icon: User },
};

const AuditLogs = ({ logs, onExport, isLoading }: AuditLogsProps) => {
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter(log => {
    if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const newValuesStr = JSON.stringify(log.new_values || {}).toLowerCase();
      const oldValuesStr = JSON.stringify(log.old_values || {}).toLowerCase();
      if (!newValuesStr.includes(searchLower) && !oldValuesStr.includes(searchLower)) {
        return false;
      }
    }
    // Date filtering
    if (startDate || endDate) {
      const logDate = new Date(log.created_at);
      if (startDate && logDate < new Date(startDate)) return false;
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999); // Include entire end date
        if (logDate > endDateTime) return false;
      }
    }
    return true;
  });

  const getChangeDescription = (log: AuditLog): string => {
    if (log.action === 'INSERT') {
      const newVals = log.new_values as Record<string, unknown> | null;
      if (log.entity_type === 'leads' && newVals) {
        return `Created lead for ${newVals.client_name || 'Unknown'}`;
      }
      if (log.entity_type === 'payouts' && newVals) {
        return `Created payout of ₹${newVals.amount || 0}`;
      }
      return `Created new ${entityConfig[log.entity_type]?.label || log.entity_type}`;
    }

    if (log.action === 'UPDATE') {
      const oldVals = log.old_values as Record<string, unknown> | null;
      const newVals = log.new_values as Record<string, unknown> | null;
      if (log.entity_type === 'leads' && oldVals && newVals) {
        if (oldVals.status !== newVals.status) {
          return `Status changed: ${oldVals.status} → ${newVals.status}`;
        }
        if (oldVals.commission_status !== newVals.commission_status) {
          return `Commission: ${oldVals.commission_status} → ${newVals.commission_status}`;
        }
        if (!oldVals.invoice_number && newVals.invoice_number) {
          return `Invoice generated: ${newVals.invoice_number}`;
        }
      }
      if (log.entity_type === 'payouts' && oldVals && newVals) {
        if (oldVals.status !== newVals.status) {
          return `Payout status: ${oldVals.status} → ${newVals.status}`;
        }
      }
      return `Updated ${entityConfig[log.entity_type]?.label || log.entity_type}`;
    }

    if (log.action === 'DELETE') {
      return `Deleted ${entityConfig[log.entity_type]?.label || log.entity_type}`;
    }

    return log.action;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-2">
        {/* Main Filters Row */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search in logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              <SelectItem value="LeadsPipeline">Leads</SelectItem>
              <SelectItem value="StudentPayout">Payouts</SelectItem>
              <SelectItem value="Student">Students</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="LOGIN_FAILED">Failed Login</SelectItem>
              <SelectItem value="ADMIN_LOGIN_FAILED">Admin Failed Login</SelectItem>
              <SelectItem value="REQUEST_PAYOUT">Payout Requested</SelectItem>
              <SelectItem value="SETTLE_PAYOUT">Payout Settled</SelectItem>
              <SelectItem value="BULK_SETTLE_PAYOUTS">Bulk Payouts</SelectItem>
              <SelectItem value="UPDATE_LEAD_STATUS">Lead Updated</SelectItem>
              <SelectItem value="MARK_LEAD_PAID">Lead Paid</SelectItem>
              <SelectItem value="COMPLETE_PARTIAL_PAYMENT">Partial Payment</SelectItem>
              <SelectItem value="UPDATE_PROFILE">Profile Updated</SelectItem>
              <SelectItem value="UPDATE_PAYOUT_METHODS">Payment Method</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-[150px]"
          />
          <Input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full sm:w-[150px]"
          />
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="whitespace-nowrap"
            >
              Clear Dates
            </Button>
          )}
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No audit logs found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.slice(0, 100).map((log, index) => {
                const EntityIcon = entityConfig[log.entity_type]?.icon || FileText;
                return (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-border last:border-0"
                  >
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge className={actionConfig[log.action]?.color || 'bg-gray-100'}>
                        {actionConfig[log.action]?.label || log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <EntityIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{entityConfig[log.entity_type]?.label || log.entity_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {getChangeDescription(log)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setViewerOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </motion.tr>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Micro-copy */}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <History className="h-3 w-3" />
        All changes are automatically logged for audit and compliance purposes.
      </p>

      <AuditLogViewer log={selectedLog} open={viewerOpen} onOpenChange={setViewerOpen} />
    </div>
  );
};

export default AuditLogs;
