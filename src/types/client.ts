export interface Client {
  id: string;
  clientName: string;
  companyName: string;
  dealAmount: number;
  commissionPercentage: number;
  earnings: number;
  conversionDate: string;
  paymentStatus: 'Pending' | 'Paid' | 'Processing';
  totalEarnedToDate?: number;
}
