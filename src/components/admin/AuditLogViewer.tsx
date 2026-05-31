import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface AuditLogViewerProps {
    log: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function AuditLogViewer({ log, open, onOpenChange }: AuditLogViewerProps) {
    if (!log) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Audit Log Details</DialogTitle>
                    <DialogDescription>
                        ID: {log.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Action</p>
                            <p className="font-semibold">{log.action}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Date</p>
                            <p>{format(new Date(log.created_at || log.createdAt), 'PPpp')}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">User ID</p>
                            <p className="font-mono text-xs bg-muted p-1 rounded">{log.user_id || log.userId}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Entity</p>
                            <Badge variant="outline">{log.entity_type || log.entityType}</Badge>
                            {log.entity_id && <span className="ml-2 font-mono text-xs">{log.entity_id || log.entityId}</span>}
                        </div>
                    </div>

                    {/* Metadata */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Metadata</h3>
                            <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Old Values */}
                    {log.old_values && Object.keys(log.old_values).length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2 text-yellow-600">Old Values</h3>
                            <pre className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(log.old_values, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* New Values */}
                    {log.new_values && Object.keys(log.new_values).length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2 text-green-600">New Values</h3>
                            <pre className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(log.new_values, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
