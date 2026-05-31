import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

const STORAGE_KEY = 'token';
const USER_INFO_KEY = 'user';

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  university: string | null;
  referral_code: string | null;
  referred_by: string | null;
  avatar_url: string | null;
  is_approved: boolean | null;
  created_at: string;
  updated_at: string;
  commission_percent?: number;
  tier_name?: string;
  tier_icon?: string;
  phone_number?: string | null;
  payment_method?: string | null;
  upi_id?: string | null;
  bank_account_number?: string | null;
  bank_ifsc?: string | null;
  pan_number?: string | null;
  pan_verified?: boolean | null;
}

interface AuthContextType {
  user: { id: string; email: string; name: string } | null;
  session: { access_token: string } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, university?: string, referralCode?: string | null, phoneNumber?: string | null) => Promise<{ data: any | null; error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/students/me');
      setProfile(data);
      // Construct a basic user object from profile since we don't have separate user/profile in some contexts
      if (!user && data) {
        // Map backend response matching Profile interface to user object
        setUser({ id: data.id, email: data.email, name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.name });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (session) {
      await fetchProfile();
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem(STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_INFO_KEY);

      if (token) {
        setSession({ access_token: token });
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
        }
        // Validate token by fetching profile
        try {
          await fetchProfile();
        } catch (e) {
          // If profile fetch fails (e.g. 401), clear session
          console.error("Session invalid", e);
          signOut();
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    university?: string,
    referralCode?: string | null,
    phoneNumber?: string | null
  ) => {
    try {
      if (!email || !password || !firstName || !lastName || !phoneNumber) {
        return { data: null, error: { message: "Name, email, password, and phone number are required." } };
      }

      const name = `${firstName} ${lastName}`.trim();

      const response = await api.post("/students/signup-student", {
        email,
        password,
        name,
        universityName: university || "",
        phoneNumber,
        referralCode
      });

      const { token, student } = response.data;

      if (token) {
        localStorage.setItem(STORAGE_KEY, token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(student));

        setSession({ access_token: token });
        setUser(student);

        await fetchProfile();

        return { data: { user: student, session: token }, error: null };
      } else {
        return { data: null, error: { message: "No token returned from server." } };
      }

    } catch (err: any) {
      console.error("Sign Up error:", err);
      const msg = err.response?.data?.error || err.message || "Signup failed";
      return { data: null, error: { message: msg } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/students/login-student', { email, password });
      const { token, student } = response.data;

      localStorage.setItem(STORAGE_KEY, token);
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(student));

      setSession({ access_token: token });
      setUser(student);

      // Fetch full profile immediately
      await fetchProfile();

      return { error: null };
    } catch (err: any) {
      console.error("Login failed", err);
      const errorMessage = err.response?.data?.error || "Login failed";
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_INFO_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
