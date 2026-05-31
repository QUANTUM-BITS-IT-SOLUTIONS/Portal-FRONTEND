import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useAdminAuth = () => {
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    // Check for admin token in local storage
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setIsAdminLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/admin/login', { email, password });

      if (response.data?.token) {
        localStorage.setItem('admin_token', response.data.token);
        setIsAdmin(true);
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast({
        title: "Login Failed",
        description: error.response?.data?.error || "Invalid credentials",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAdmin(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel.",
    });
  };

  // Deprecated: Kept for compatibility during migration, logic replaced by login
  const grantAdminRole = async (password: string): Promise<boolean> => {
    console.warn("grantAdminRole is deprecated. Use login() instead.");
    return false;
  };

  return {
    isAdmin,
    isAdminLoading,
    login,
    logout,
    grantAdminRole, // deprecated
  };
};
