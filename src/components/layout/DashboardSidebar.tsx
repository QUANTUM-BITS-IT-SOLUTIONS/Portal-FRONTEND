import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  TrendingUp,
  Link2,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Trophy,
  UserPlus,
  Shield,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { toast } from 'sonner';

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
  badge?: number;
}

// Badge counts - in real app, these would come from database/context
const getBadgeCounts = () => ({
  notifications: 5, // Unread notifications
});

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Conversions', id: 'clients' },
  { icon: DollarSign, label: 'Earnings', id: 'earnings' },
  { icon: Link2, label: 'Referral Link', id: 'referral' },
  { icon: UserPlus, label: 'Referral Stats', id: 'referral-stats' },
  { icon: Trophy, label: 'Leaderboard', id: 'leaderboard' },
  { icon: FileText, label: 'Resources', id: 'resources' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-sidebar text-sidebar-foreground"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position on desktop */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-sidebar z-40",
          "flex flex-col transition-transform duration-300 overflow-y-auto",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center">
              <span className="text-xl font-bold text-sidebar-primary-foreground font-display">Q</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground font-display">Qbits</h1>
              <p className="text-xs text-sidebar-foreground/60">Partner Portal</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              onClick={() => {
                onTabChange(item.id);
                setIsMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "text-sm font-medium relative",
                activeTab === item.id
                  ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {/* Active indicator bar */}
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-semibold min-w-[1.25rem] text-center"
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-sidebar-border space-y-1">
          {/* {isAdmin && (
            <button
              onClick={handleAdminClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:text-primary hover:bg-primary/10 transition-all duration-200 text-sm font-medium"
            >
              <Shield size={20} />
              <span>Admin Panel</span>
            </button>
          )} */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
