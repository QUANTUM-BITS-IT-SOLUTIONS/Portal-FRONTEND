import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    Plus,
    Trash2,
    Users,
    User,
    Send,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface Notification {
    id: string;
    studentId: string;
    type: string;
    title: string;
    description: string;
    read: boolean;
    amount: number | null;
    createdAt: string;
    student: {
        id: string;
        name: string;
        email: string;
    };
}

interface User {
    id: string;
    name: string;
    email: string;
}

interface NotificationManagerProps {
    notifications: Notification[];
    users: User[];
    onCreateNotification: (data: {
        title: string;
        description: string;
        type: string;
        studentId?: string;
        amount?: number;
    }) => Promise<void>;
    onDeleteNotification: (id: string) => Promise<void>;
    isLoading: boolean;
}

const notificationTypes = [
    { value: 'system', label: 'System', icon: Bell },
    { value: 'payment', label: 'Payment', icon: CheckCircle2 },
    { value: 'conversion', label: 'Conversion', icon: Users },
    { value: 'milestone', label: 'Milestone', icon: CheckCircle2 },
    { value: 'achievement', label: 'Achievement', icon: CheckCircle2 },
];

const NotificationManager = ({
    notifications,
    users,
    onCreateNotification,
    onDeleteNotification,
    isLoading,
}: NotificationManagerProps) => {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('system');
    const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!title || !description) return;

        setIsCreating(true);
        try {
            await onCreateNotification({
                title,
                description,
                type,
                studentId: targetType === 'specific' ? selectedUserId : undefined,
                amount: amount ? parseFloat(amount) : undefined,
            });

            // Reset form
            setTitle('');
            setDescription('');
            setType('system');
            setTargetType('all');
            setSelectedUserId('');
            setAmount('');
            setCreateDialogOpen(false);
        } catch (error) {
            console.error('Failed to create notification:', error);
        } finally {
            setIsCreating(false);
        }
    };

    // Group notifications by title to show stats
    const notificationGroups = notifications.reduce((acc, notif) => {
        if (!acc[notif.title]) {
            acc[notif.title] = {
                title: notif.title,
                description: notif.description,
                type: notif.type,
                total: 0,
                read: 0,
                unread: 0,
                createdAt: notif.createdAt,
                notifications: [],
            };
        }
        acc[notif.title].total++;
        if (notif.read) acc[notif.title].read++;
        else acc[notif.title].unread++;
        acc[notif.title].notifications.push(notif);
        return acc;
    }, {} as Record<string, any>);

    const groups = Object.values(notificationGroups).sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'payment':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'conversion':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
            case 'milestone':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
            case 'achievement':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Notification Management</h3>
                    <p className="text-sm text-muted-foreground">
                        Create and manage notifications for students
                    </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Notification
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-2xl font-bold">{notifications.length}</p>
                            <p className="text-sm text-muted-foreground">Total Sent</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="text-2xl font-bold">
                                {notifications.filter(n => n.read).length}
                            </p>
                            <p className="text-sm text-muted-foreground">Read</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-orange-600" />
                        <div>
                            <p className="text-2xl font-bold">
                                {notifications.filter(n => !n.read).length}
                            </p>
                            <p className="text-sm text-muted-foreground">Unread</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No notifications created yet
                </div>
            ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Notification</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-center">Recipients</TableHead>
                                <TableHead className="text-center">Read</TableHead>
                                <TableHead className="text-center">Unread</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groups.map((group: any, index: number) => (
                                <motion.tr
                                    key={group.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-border last:border-0"
                                >
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{group.title}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {group.description}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getTypeColor(group.type)}>
                                            {group.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">{group.total}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-green-600 font-medium">{group.read}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="text-orange-600 font-medium">{group.unread}</span>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(group.createdAt), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                // Delete all notifications with this title
                                                group.notifications.forEach((n: Notification) => {
                                                    onDeleteNotification(n.id);
                                                });
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create Notification Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create Notification</DialogTitle>
                        <DialogDescription>
                            Send a notification to all students or a specific student
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Title</label>
                            <Input
                                placeholder="Notification title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Description</label>
                            <Textarea
                                placeholder="Notification message"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Type</label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {notificationTypes.map((t) => (
                                        <SelectItem key={t.value} value={t.value}>
                                            {t.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Target</label>
                            <Select
                                value={targetType}
                                onValueChange={(value: 'all' | 'specific') => setTargetType(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            All Students
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="specific">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Specific Student
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {targetType === 'specific' && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Student</label>
                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select student" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {type === 'payment' && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Amount (Optional)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!title || !description || isCreating || (targetType === 'specific' && !selectedUserId)}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            {isCreating ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NotificationManager;
