import { motion } from 'framer-motion';
import { Users, TrendingUp, Clock, CreditCard, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface Lead {
  id: string;
  status: string;
  deal_value: number;
  referred_by: string | null;
  client_email: string;
}

interface Profile {
  id: string;
  is_approved?: boolean;
}

interface AdminKPIsProps {
  totalLeadValue: number;
  leads: Lead[];
  users: Profile[];
}

const AdminKPIs = ({ totalLeadValue, leads, users }: AdminKPIsProps) => {
  // Calculate KPIs
  const totalPartners = users.length;
  const pendingInvoices = leads.filter(l => l.status === 'invoice').length;

  // Count unique clients from leads (using client_email as unique identifier)
  const uniqueClients = new Set(leads.map(l => l.client_email)).size;

  // Calculate conversion rate: (total deals - cancelled deals) / total deals
  const totalDeals = leads.length;
  const cancelledDeals = leads.filter(l => l.status === 'cancelled').length;
  const successfulDeals = totalDeals - cancelledDeals;
  const conversionRate = totalDeals > 0 ? ((successfulDeals / totalDeals) * 100).toFixed(1) : '0';

  // Calculate pending commissions (10% of paid deals - simplified)
  const pendingCommissionValue = leads
    .filter(l => l.status === 'paid')
    .reduce((sum, lead) => sum + (Number(lead.deal_value) * 0.1), 0);

  const stats = [
    {
      label: 'Total Clients',
      value: uniqueClients.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      darkBgColor: 'dark:bg-blue-900/30',
    },
    {
      label: 'Total Partners',
      value: totalPartners.toString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/30',
    },
    {
      label: 'Total Lead Value',
      value: formatCurrency(totalLeadValue),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      darkBgColor: 'dark:bg-purple-900/30',
    },
    {
      label: 'Pending Invoices',
      value: pendingInvoices.toString(),
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      darkBgColor: 'dark:bg-amber-900/30',
    },
    {
      label: 'Pending Commissions',
      value: formatCurrency(pendingCommissionValue),
      icon: DollarSign,
      color: 'text-rose-600',
      bgColor: 'bg-rose-100',
      darkBgColor: 'dark:bg-rose-900/30',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: BarChart3,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
      darkBgColor: 'dark:bg-cyan-900/30',
      subLabel: `${successfulDeals}/${totalDeals} deals`,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-card border border-border rounded-xl p-3 sm:p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.bgColor} ${stat.darkBgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
          <p className="text-lg sm:text-xl font-bold mt-0.5 truncate">{stat.value}</p>
          {stat.subLabel && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.subLabel}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default AdminKPIs;
