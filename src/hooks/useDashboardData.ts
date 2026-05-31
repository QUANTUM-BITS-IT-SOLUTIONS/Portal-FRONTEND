import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Client } from '@/types/client';

export interface EarningsData {
    total_commission_earned: number;
    current_month_earnings: number;
    total_paid_leads: number;
    lifetime_deal_value: number;
    pending_amount: number;
    wallet_balance: number;
    total_withdrawn: number;
    total_requests_pending: number;
    monthly_breakdown: { month: string; total: number }[];
}

export interface Payout {
    id: string;
    amount: string;
    status: 'pending' | 'processed' | 'completed' | 'rejected' | 'scheduled';
    createdAt: string;
    paymentMethod?: string;
}

const mapStatus = (status: string | undefined): 'Pending' | 'Paid' | 'Processing' => {
    if (!status) return 'Pending';
    // Normalize status
    const s = status.toLowerCase();

    if (s === 'paid' || s === 'commission_approved' || s === 'payment_received' || s === 'won') {
        return 'Paid';
    }
    if (s === 'payment_sent' || s === 'client_pays' || s === 'processing') {
        return 'Processing';
    }
    return 'Pending';
};

// Helper to transform API client data to the format expected by UI
const transformClientData = (apiClients: any[]): Client[] => {
    if (!Array.isArray(apiClients)) return [];

    return apiClients.map(client => {
        // Backend now returns calculated_earnings and deal_amount
        const dealAmount = client.deal_amount || 0;
        const earnings = client.calculated_earnings || 0;
        const commissionPercent = client.commission_percent || 5;

        return {
            id: client.id,
            clientName: client.businessName,
            companyName: client.businessType,
            dealAmount: dealAmount,
            commissionPercentage: commissionPercent,
            earnings: earnings,
            conversionDate: client.createdAt,
            paymentStatus: mapStatus(client.payment_status),
            totalEarnedToDate: earnings,
            dealType: 'one-time' // Legacy field for table compatibility if needed, else ignore
        };
    });
};

export const useEarnings = () => {
    return useQuery({
        queryKey: ['earnings'],
        queryFn: async () => {
            const { data } = await api.get<EarningsData>('/students/me/earnings');
            // Ensure numbers if backed sends strings for decimals
            return {
                ...data,
                wallet_balance: Number(data.wallet_balance),
                total_withdrawn: Number(data.total_withdrawn),
                total_requests_pending: Number(data.total_requests_pending),
                pending_amount: Number(data.pending_amount),
                total_commission_earned: Number(data.total_commission_earned),
                current_month_earnings: Number(data.current_month_earnings) || 0,
                monthly_breakdown: data.monthly_breakdown || []
            };
        },
    });
};

export const useClients = () => {
    return useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const { data } = await api.get('/students/me/clients');
            return transformClientData(data);
        },
    });
};

export const usePayouts = () => {
    return useQuery({
        queryKey: ['payouts'],
        queryFn: async () => {
            const { data } = await api.get<Payout[]>('/students/me/payouts');
            return data;
        },
    });
};

export const useRequestPayout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (amount: number) => {
            const { data } = await api.post('/students/me/payouts/request', { amount });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['earnings'] });
            queryClient.invalidateQueries({ queryKey: ['payouts'] });
        },
    });
};
