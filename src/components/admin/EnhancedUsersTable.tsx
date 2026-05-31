import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Building, Clock, TrendingUp, DollarSign, Users, ChevronRight, Bell, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';
import UserDetailPanel from './UserDetailPanel';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, IndianRupee } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';

interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  university: string | null;
  referral_code: string | null;
  is_approved?: boolean;
  created_at: string;
  partnerTier?: {
    id: string;
    name: string;
    color: string;
    commissionPercentage: number;
  } | null;
}

interface Lead {
  id: string;
  client_name: string;
  deal_value: number;
  status: string;
  referred_by: string | null;
  created_at: string;
  commission_percentage?: number;
  commission_rate?: number;
}

interface Commission {
  id: string;
  amount: number;
  status: string;
  referrer_id: string;
  paid_at: string | null;
  created_at: string;
}

interface EnhancedUsersTableProps {
  users: Profile[];
  leads: Lead[];
  commissions: Commission[];
  onBulkNotify?: (userIds: string[]) => void;
  onCreatePayout?: (data: { studentId: string; amount: number; notes: string; password: string }) => Promise<void>;
  isCreatingPayout?: boolean;
}

const EnhancedUsersTable = ({ users, leads, commissions, onBulkNotify, onCreatePayout, isCreatingPayout }: EnhancedUsersTableProps) => {
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [universityFilter, setUniversityFilter] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Payout Dialog State
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [payoutTargetUser, setPayoutTargetUser] = useState<Profile | null>(null);
  const [isBulkPayout, setIsBulkPayout] = useState(false);

  const handleCreatePayout = async () => {
    if (!onCreatePayout || !adminPassword || !payoutAmount) return;

    try {
      const targets = isBulkPayout
        ? users.filter(u => selectedUsers.has(u.id))
        : payoutTargetUser ? [payoutTargetUser] : [];

      // Execute sequentially to avoid race conditions/rate limits if any
      for (const target of targets) {
        await onCreatePayout({
          studentId: target.id,
          amount: Number(payoutAmount),
          notes: payoutNotes,
          password: adminPassword
        });
      }

      setPayoutDialogOpen(false);
      setPayoutAmount('');
      setPayoutNotes('');
      setAdminPassword('');
      setPayoutTargetUser(null);
      setIsBulkPayout(false);
      if (isBulkPayout) setSelectedUsers(new Set());

    } catch (error) {
      // Error handling usually in hook
      console.error("Payout creation failed", error);
    }
  };

  // Calculate user stats
  const getUserStats = (userId: string) => {
    const userLeads = leads.filter(lead => lead.referred_by === userId);
    const totalReferrals = userLeads.length;
    const totalRevenue = userLeads.reduce((sum, lead) => sum + Number(lead.deal_value), 0);
    const totalCommission = userLeads.reduce((sum, lead) => {
      const percentage = lead.commission_rate || lead.commission_percentage || 5;
      return sum + (Number(lead.deal_value) * percentage / 100);
    }, 0);
    const userCommissions = commissions.filter(c => c.referrer_id === userId);
    const totalCommissionPaid = userCommissions
      .filter(c => c.status === 'paid') // Now handled in useAdminData based on payoutId existence
      .reduce((sum, c) => sum + Number(c.amount), 0);

    return { totalReferrals, totalRevenue, totalCommission, totalCommissionPaid };
  };

  const getUserCommissions = (userId: string) => {
    return commissions.filter(c => c.referrer_id === userId);
  };

  const filteredUsers = users.filter((user) => {
    const matchesTier = tierFilter === 'all' || (user.partnerTier?.name || 'Bronze').toLowerCase() === tierFilter.toLowerCase();
    const matchesUniversity = universityFilter === '' || (user.university && user.university.toLowerCase().includes(universityFilter.toLowerCase()));

    return matchesTier && matchesUniversity;
  });

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkNotify = () => {
    if (onBulkNotify && selectedUsers.size > 0) {
      onBulkNotify(Array.from(selectedUsers));
      setSelectedUsers(new Set());
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Filter by university..."
            value={universityFilter}
            onChange={(e) => setUniversityFilter(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="bronze">Bronze</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
              <SelectItem value="gold">Gold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            {selectedUsers.size} user(s) selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={handleBulkNotify}>
              <Bell className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
            <Button size="sm" variant="default" onClick={() => { setIsBulkPayout(true); setPayoutDialogOpen(true); }}>
              <IndianRupee className="h-4 w-4 mr-2" />
              Create Payout
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedUsers(new Set())}>
              Clear
            </Button>
          </div>
        </motion.div>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onCheckedChange={toggleAllUsers}
                />
              </TableHead>
              <TableHead className="min-w-[180px]">User</TableHead>
              <TableHead className="hidden lg:table-cell">University</TableHead>
              <TableHead className="text-center">Referrals</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Commission</TableHead>
              <TableHead className="text-right hidden md:table-cell">Paid</TableHead>
              <TableHead className="text-center hidden sm:table-cell">Level</TableHead>
              <TableHead className="min-w-[80px]">Joined</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No users match the selected filters
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => {
                const stats = getUserStats(user.id);
                const level = user.partnerTier?.name || 'Bronze';
                const levelColor = user.partnerTier?.color || 'bg-amber-600';
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-sm sm:text-base block truncate">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate block">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell cursor-pointer" onClick={() => setSelectedUser(user)}>
                      {user.university ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{user.university}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{stats.totalReferrals}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <span className="font-medium text-green-600">
                        {formatCurrency(stats.totalCommission)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <span className="text-muted-foreground">
                        {formatCurrency(stats.totalCommissionPaid)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <Badge className={`${levelColor} text-white text-xs`}>
                        {level}
                      </Badge>
                    </TableCell>
                    <TableCell className="cursor-pointer" onClick={() => setSelectedUser(user)}>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="whitespace-nowrap">{format(new Date(user.created_at), 'MMM d')}</span>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setPayoutTargetUser(user);
                            setIsBulkPayout(false);
                            setPayoutDialogOpen(true);
                          }}>
                            <IndianRupee className="h-4 w-4 mr-2" />
                            Create Payout
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

      {/* User Detail Panel */}
      <AnimatePresence>
        {selectedUser && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedUser(null)}
            />
            <UserDetailPanel
              userId={selectedUser.id}
              onClose={() => setSelectedUser(null)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Manual Payout Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isBulkPayout ? `Create Payout for ${selectedUsers.size} Users` : `Create Payout for ${payoutTargetUser?.first_name}`}
            </DialogTitle>
            <DialogDescription>
              Create a manual payout record.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (Per User)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Reason for payout..."
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
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
            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreatePayout}
              disabled={!payoutAmount || !adminPassword || isCreatingPayout}
            >
              {isCreatingPayout ? 'Creating...' : 'Confirm Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedUsersTable;
