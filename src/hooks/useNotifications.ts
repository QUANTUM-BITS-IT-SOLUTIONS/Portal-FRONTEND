import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export interface Notification {
    id: string;
    type: 'conversion' | 'payment' | 'milestone' | 'achievement' | 'system';
    title: string;
    description: string;
    time: string;
    amount?: number;
    read: boolean;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const { data } = await api.get('/students/me/notifications');
            setNotifications(data);
            setError(null);
        } catch (err: any) {
            console.error('Error loading notifications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!token) return;

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);

        return () => clearInterval(interval);
    }, [token, fetchNotifications]);

    const markAsRead = async (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );

        if (!token) return;

        await api.put(`/students/me/notifications/${id}/read`);
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));

        if (!token) return;

        await api.put('/students/me/notifications/read-all');

        toast.info('All notifications marked as read');
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return {
        notifications,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        removeNotification,
        refreshOptions: fetchNotifications,
    };
};
