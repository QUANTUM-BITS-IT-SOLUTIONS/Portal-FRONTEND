import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Building,
    Mail,
    Phone,
    User as UserIcon,
    Calendar,
    ExternalLink,
    ChevronRight,
    Filter,
    X
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/currency';

interface Client {
    id: string;
    businessName: string;
    businessType: string;
    email: string | null;
    phone: string | null;
    student: {
        name: string;
        email: string;
    };
    latestLead?: {
        id: string;
        dealAmount: number;
        status: string;
        createdAt: string;
    };
    created_at: string;
    notes?: string | null;
}

interface ClientsTableProps {
    clients: Client[];
    isLoading?: boolean;
}

const ClientsTable = ({ clients, isLoading }: ClientsTableProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const filteredClients = clients.filter(client =>
        client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRowClick = (client: Client) => {
        setSelectedClient(client);
        setIsPanelOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients or partners..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client & Business</TableHead>
                            <TableHead>Partner (Referrer)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Rev.</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No successful clients found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow
                                    key={client.id}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => handleRowClick(client)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Building className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{client.businessName}</p>
                                                <p className="text-xs text-muted-foreground">{client.businessType || 'General'}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{client.student.name}</span>
                                            <span className="text-xs text-muted-foreground">{client.student.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Converted
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold">
                                            {formatCurrency(client.latestLead?.dealAmount || 0)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Client Detail Side Panel */}
            <AnimatePresence>
                {isPanelOpen && selectedClient && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 z-40"
                            onClick={() => setIsPanelOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 400 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 400 }}
                            className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-card border-l border-border shadow-2xl z-50 overflow-y-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-xl font-bold">Client Information</h2>
                                    <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-8">
                                    {/* Client Profile Header */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Building className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold">{selectedClient.businessName}</h3>
                                            <p className="text-muted-foreground">{selectedClient.businessType}</p>
                                        </div>
                                    </div>

                                    <hr className="border-border" />

                                    {/* Contact Details */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Details</h4>
                                        <div className="grid gap-4">
                                            {selectedClient.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span>{selectedClient.email}</span>
                                                </div>
                                            )}
                                            {selectedClient.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    <span>{selectedClient.phone}</span>
                                                </div>
                                            )}

                                        </div>
                                    </div>

                                    {/* Partner Section */}
                                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                                        <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Referred By</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{selectedClient.student.name}</p>
                                                <p className="text-sm text-muted-foreground">{selectedClient.student.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deal History Section */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Latest Deal</h4>
                                        {selectedClient.latestLead ? (
                                            <div className="p-4 rounded-xl border border-border bg-muted/30">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-lg font-bold">{formatCurrency(selectedClient.latestLead.dealAmount)}</p>
                                                    <Badge className="bg-green-100 text-green-800 border-none">
                                                        {selectedClient.latestLead.status.replace(/_/g, ' ')}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Converted on {format(new Date(selectedClient.latestLead.createdAt), 'PPP')}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground italic">No deal data available.</p>
                                        )}
                                    </div>

                                    {/* Notes Section */}
                                    {selectedClient.notes && (
                                        <div className="space-y-4 mb-6">
                                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notes</h4>
                                            <div className="p-4 rounded-xl border border-border bg-muted/30">
                                                <p className="text-sm">{selectedClient.notes}</p>
                                            </div>
                                        </div>
                                    )}

                                    <Button className="w-full h-12 text-lg">
                                        Manage Client
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientsTable;
