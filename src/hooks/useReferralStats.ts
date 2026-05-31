import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { API_URL } from '@/lib/api';

interface ReferralStats {
  totalReferrals: number;
  totalCommissions: number;
  pendingCommissions: number;
  paidCommissions: number;
  walletBalance: number;
  conversionRate: number;
  oneTimeEarnings: number;
  subscriptionEarnings: number;
}

interface Referral {
  id: string;
  referredUser: {
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
  commissions: {
    amount: number;
    type: 'one_time' | 'subscription';
    status: 'pending' | 'approved' | 'paid' | 'cancelled';
  }[];
  commissionRate: number;
  createdAt: string;
}

interface Commission {
  id: string;
  amount: number;
  commission_type: 'one_time' | 'subscription';
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  description: string | null;
  created_at: string;
  paid_at: string | null;
}

export const useReferralStats = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalCommissions: 0,
    pendingCommissions: 0,
    paidCommissions: 0,
    walletBalance: 0,
    conversionRate: 0,
    oneTimeEarnings: 0,
    subscriptionEarnings: 0,
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [earningsRes, clientsRes] = await Promise.all([
          fetch(`${API_URL}/students/me/earnings`, { headers }),
          fetch(`${API_URL}/students/me/clients`, { headers })
        ]);

        if (!earningsRes.ok) {
          console.error(`Earnings fetch failed: ${earningsRes.status} ${earningsRes.statusText}`);
          const text = await earningsRes.text();
          console.error("Earnings response:", text);
          throw new Error(`Failed to fetch earnings: ${earningsRes.status}`);
        }
        if (!clientsRes.ok) {
          console.error(`Clients fetch failed: ${clientsRes.status} ${clientsRes.statusText}`);
          const text = await clientsRes.text();
          console.error("Clients response:", text);
          throw new Error(`Failed to fetch clients: ${clientsRes.status}`);
        }

        const earningsData = await earningsRes.json();
        const clientsData = await clientsRes.json();

        // Map Clients to Referrals
        const mappedReferrals: Referral[] = clientsData.map((client: any) => ({
          id: client.id,
          referredUser: {
            firstName: client.businessName, // Using business name as name
            lastName: `(${client.businessType})`,
            email: client.email,
            createdAt: client.createdAt,
          },
          commissions: client.leads.map((lead: any) => {
            const dealAmount = Number(lead.dealAmount) || 0;
            const commissionPercent = lead.commissionRate || client.commission_percent || 5;
            const commission = Math.floor((Number(dealAmount) * Number(commissionPercent)) / 100);
            return {
              amount: commission,
              type: 'one_time',
              status: lead.status === 'payment_sent' ? 'pending' : lead.status, // Mapping statuses
            };
          }),
          commissionRate: client.commission_percent || 5,
          createdAt: client.createdAt,
        }));

        // Flatten commissions for the list
        const allCommissions: Commission[] = clientsData.flatMap((client: any) =>
          client.leads.map((lead: any) => {
            const dealAmount = Number(lead.dealAmount) || 0;
            const commissionPercent = lead.commissionRate || client.commission_percent || 5;
            const commission = Math.floor((Number(dealAmount) * Number(commissionPercent)) / 100);
            return {
              id: lead.id,
              amount: commission,
              commission_type: 'one_time',
              status: lead.status === 'payment_sent' ? 'pending' : lead.status,
              description: `Lead for ${client.businessName}`,
              created_at: lead.createdAt,
              paid_at: lead.paidAt,
            };
          })
        );

        setReferrals(mappedReferrals);
        setCommissions(allCommissions);

        // Calculate total leads count from all clients
        const totalLeadsCount = clientsData.reduce((sum: number, client: any) =>
          sum + (client.leads?.length || 0), 0);

        setStats({
          totalReferrals: clientsData.length,
          totalCommissions: earningsData.total_commission_earned,
          pendingCommissions: earningsData.total_requests_pending, // Payouts in 'pending' status
          paidCommissions: earningsData.total_withdrawn, // Payouts in 'completed' status
          walletBalance: earningsData.wallet_balance, // Withdrawable funds
          conversionRate: totalLeadsCount > 0
            ? (Number(earningsData.total_paid_leads) / Number(totalLeadsCount)) * 100
            : 0,
          oneTimeEarnings: earningsData.total_commission_earned,
          subscriptionEarnings: 0,
        });

      } catch (err: any) {
        console.error("Error fetching referral stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile?.id]);

  return { stats, referrals, commissions, loading, error };
};
