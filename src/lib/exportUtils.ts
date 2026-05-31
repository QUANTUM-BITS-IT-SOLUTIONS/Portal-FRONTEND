import { format } from 'date-fns';

interface Lead {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  company_name: string | null;
  deal_value: number;
  status: string;
  invoice_number: string | null;
  invoice_date: string | null;
  commission_status?: string;
  commission_percentage?: number;
  created_at: string;
  referrer?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  university: string | null;
  referral_code: string | null;
  is_approved: boolean | null;
  created_at: string;
}

interface Payout {
  id: string;
  partner_id: string;
  amount: number;
  status: string;
  payment_method?: string;
  scheduled_date?: string;
  completed_date?: string;
  created_at: string;
  partner?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const escapeCSV = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportLeadsToCSV = (leads: Lead[]) => {
  const headers = [
    'Client Name',
    'Client Email',
    'Client Phone',
    'Company Name',
    'Deal Value',
    'Status',
    'Invoice Number',
    'Invoice Date',
    'Commission Status',
    'Commission %',
    'Referrer',
    'Created Date'
  ];

  const rows = leads.map(lead => [
    escapeCSV(lead.client_name),
    escapeCSV(lead.client_email),
    escapeCSV(lead.client_phone),
    escapeCSV(lead.company_name),
    lead.deal_value,
    escapeCSV(lead.status),
    escapeCSV(lead.invoice_number),
    lead.invoice_date ? format(new Date(lead.invoice_date), 'yyyy-MM-dd') : '',
    escapeCSV(lead.commission_status || 'pending'),
    lead.commission_percentage || 10,
    lead.referrer ? `${lead.referrer.first_name} ${lead.referrer.last_name}` : '',
    format(new Date(lead.created_at), 'yyyy-MM-dd')
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csvContent, `leads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

export const exportPartnersToCSV = (
  partners: Profile[], 
  leadsData: { [partnerId: string]: { referrals: number; revenue: number; commission: number } }
) => {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'University',
    'Referral Code',
    'Is Approved',
    'Total Referrals',
    'Total Revenue',
    'Total Commission',
    'Joined Date'
  ];

  const rows = partners.map(partner => {
    const stats = leadsData[partner.id] || { referrals: 0, revenue: 0, commission: 0 };
    return [
      escapeCSV(partner.first_name),
      escapeCSV(partner.last_name),
      escapeCSV(partner.email),
      escapeCSV(partner.university),
      escapeCSV(partner.referral_code),
      partner.is_approved ? 'Yes' : 'No',
      stats.referrals,
      stats.revenue,
      stats.commission,
      format(new Date(partner.created_at), 'yyyy-MM-dd')
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csvContent, `partners-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

export const exportPayoutsToCSV = (payouts: Payout[]) => {
  const headers = [
    'Partner Name',
    'Partner Email',
    'Amount',
    'Status',
    'Payment Method',
    'Scheduled Date',
    'Completed Date',
    'Created Date'
  ];

  const rows = payouts.map(payout => [
    payout.partner ? `${payout.partner.first_name} ${payout.partner.last_name}` : '',
    escapeCSV(payout.partner?.email),
    payout.amount,
    escapeCSV(payout.status),
    escapeCSV(payout.payment_method),
    payout.scheduled_date ? format(new Date(payout.scheduled_date), 'yyyy-MM-dd') : '',
    payout.completed_date ? format(new Date(payout.completed_date), 'yyyy-MM-dd') : '',
    format(new Date(payout.created_at), 'yyyy-MM-dd')
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csvContent, `payouts-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
};

export const exportAuditLogsToCSV = (logs: { created_at: string; action: string; entity_type: string; old_values: unknown; new_values: unknown }[]) => {
  const headers = [
    'Timestamp',
    'Action',
    'Entity Type',
    'Old Values',
    'New Values'
  ];

  const rows = logs.map(log => [
    format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
    escapeCSV(log.action),
    escapeCSV(log.entity_type),
    escapeCSV(JSON.stringify(log.old_values)),
    escapeCSV(JSON.stringify(log.new_values))
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  downloadCSV(csvContent, `audit-logs-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
};
