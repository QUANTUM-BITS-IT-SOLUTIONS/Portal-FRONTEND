import React from 'react';
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
import { ArrowUpRight, ArrowDownLeft, FileText, User, ArrowRight } from 'lucide-react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export interface LedgerEntry {
    id: string;
    type: 'client_payment' | 'student_commission' | 'payout_sent';
    amount: number;
    isPartial: boolean;
    createdAt: string;
    student?: {
        id: string;
        name: string;
        email: string;
    };
    leadsPipeline?: {
        id: string;
        client: {
            businessName: string;
        };
    };
    payout?: {
        id: string;
        status: string;
    };
}

interface LedgerTableProps {
    entries: LedgerEntry[];
    isLoading: boolean;
}

const LedgerTable = ({ entries, isLoading }: LedgerTableProps) => {
    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!entries || entries.length === 0) {
        return (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No ledger entries found</h3>
                <p className="text-muted-foreground">Financial transactions will appear here.</p>
            </div>
        );
    }

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'client_payment':
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <ArrowDownLeft className="h-3 w-3 mr-1" /> Client Payment
                    </Badge>
                );
            case 'payout_sent':
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> Payout Sent
                    </Badge>
                );
            case 'student_commission':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <ArrowRight className="h-3 w-3 mr-1" /> Commission Accrued
                    </Badge>
                );
            default:
                return <Badge variant="outline">{type.replace(/_/g, ' ')}</Badge>;
        }
    };

    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                                {format(new Date(entry.createdAt), 'MMM d, yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getTypeBadge(entry.type)}
                                    {entry.isPartial && <Badge variant="secondary" className="text-xs">Partial</Badge>}
                                </div>
                            </TableCell>
                            <TableCell>
                                {entry.student ? (
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{entry.student.name}</span>
                                        <span className="text-xs text-muted-foreground">{entry.student.email}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                {entry.leadsPipeline ? (
                                    <div className="text-sm">
                                        Client: <span className="font-medium">{entry.leadsPipeline.client.businessName}</span>
                                    </div>
                                ) : entry.payout ? (
                                    <div className="text-sm">
                                        Payout Status: <Badge variant="secondary" className="text-xs lowercase">{entry.payout.status}</Badge>
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                <span className={
                                    entry.type === 'client_payment' ? 'text-green-600 font-bold' :
                                        entry.type === 'payout_sent' ? 'text-red-600 font-bold' :
                                            'text-blue-600'
                                }>
                                    {entry.type === 'payout_sent' ? '-' : '+'}{formatCurrency(entry.amount)}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default LedgerTable;
