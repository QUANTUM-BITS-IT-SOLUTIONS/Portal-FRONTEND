export type LeadStatus =
    | 'lead_added'
    | 'team_approval'
    | 'negotiating'
    | 'payment_link'
    | 'invoice'
    | 'client_pays'
    | 'work_starts'
    | 'paid'
    | 'commission_approved'
    | 'pending'
    | 'payment_sent'
    | 'cancelled';

export type CommissionStatus = 'pending' | 'approved' | 'held' | 'rejected' | 'paid';

export interface Lead {
    id: string;
    client_name: string;
    client_email: string;
    client_phone: string | null;
    company_name: string | null;
    deal_value: number;
    status: LeadStatus;
    referred_by: string | null;
    payment_link: string | null;
    notes: string | null;
    invoice_number: string | null;
    invoice_date: string | null;
    invoice_url: string | null;
    created_at: string;
    updated_at: string;
    commission_status?: CommissionStatus;
    commission_percentage?: number;
    commission_rejection_reason?: string | null;
    payment_type?: 'full' | 'partial';
    payment_percentage?: number;
    referrer?: {
        first_name: string;
        last_name: string;
    } | null;
}

export interface Commission {
    id: string;
    amount: number;
    status: string;
    referrer_id: string;
    paid_at: string | null;
    created_at: string;
}

export interface PipelineStage {
    status: LeadStatus;
    label: string;
    color: string;
}
