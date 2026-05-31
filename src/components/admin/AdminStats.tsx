import { motion } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface AdminStatsProps {
  totalUsers: number;
  totalLeadValue: number;
}

const AdminStats = ({ totalUsers, totalLeadValue }: AdminStatsProps) => {
  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Lead Value',
      value: formatCurrency(totalLeadValue),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      isAmount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-card border border-border rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {stat.isAmount ? stat.value : stat.value}
              </p>
            </div>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminStats;