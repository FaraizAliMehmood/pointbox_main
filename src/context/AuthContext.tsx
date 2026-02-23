import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { customerApi } from '@/services/api';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  points: number;
  linkedBrands: string[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string, phoneNumber: string) => Promise<boolean>;
  logout: () => void;
  deleteAccount: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('customer_user');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
  }
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAndRestoreAuth = async () => {
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('customer_token');
      const storedUser = localStorage.getItem('customer_user');

      if (!token) {
        if (storedUser) {
          localStorage.removeItem('customer_user');
          setUser(null);
        }
        setIsLoading(false);
        return;
      }

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }

      try {
        const profileResponse = await customerApi.getProfile();
        if (profileResponse.success && profileResponse.data) {
          const userData = profileResponse.data;
          const authUserData: User = {
            id: userData._id,
            email: userData.email,
            fullName: userData.username,
            phoneNumber: userData.phone || '',
            points: userData.totalPoints || 0,
            linkedBrands: userData.linkedCompanies?.map((lc: { company: string | { _id: string } }) =>
              typeof lc.company === 'string' ? lc.company : lc.company._id
            ) || [],
            createdAt: userData.createdAt,
          };
          localStorage.setItem('customer_user', JSON.stringify(authUserData));
          setUser(authUserData);
        } else {
          localStorage.removeItem('customer_token');
          localStorage.removeItem('customer_user');
          setUser(null);
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAndRestoreAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    try {
      const response = await customerApi.login({
        email: email.trim(),
        password: password.trim(),
        deviceToken: "c-5cML0cRXKBjabcZYr5J_:APA91bGgoE0gOUo2z7UB2p93SxfjkvKq5XZmLlRV4ILTFZfIsSUlAgsa2PDWlB3xZ87OLiIdWojaDFPLJx9Uj3y-JhaKLXK46nJ12acg_Q0SNwuBIVsK8p8"
      });

      if (response.success && response.token && response.user) {
        try {
          const profileResponse = await customerApi.getProfile();
          if (profileResponse.success && profileResponse.data) {
            const userData = profileResponse.data;
            const authUserData: User = {
              id: userData._id,
              email: userData.email,
              fullName: userData.username,
              phoneNumber: userData.phone || '',
              points: userData.totalPoints || 0,
              linkedBrands: userData.linkedCompanies?.map((lc: { company: string | { _id: string } }) =>
                typeof lc.company === 'string' ? lc.company : lc.company._id
              ) || [],
              createdAt: userData.createdAt,
            };
            localStorage.setItem('customer_user', JSON.stringify(authUserData));
            setUser(authUserData);
            return true;
          }
        } catch (profileErr) {
          console.error('Failed to fetch profile:', profileErr);
        }

        const authUserData: User = {
          id: response.user.id || response.user._id,
          email: response.user.email,
          fullName: response.user.username || response.user.fullName || '',
          phoneNumber: response.user.phone || '',
          points: response.user.totalPoints || 0,
          linkedBrands: [],
          createdAt: response.user.createdAt || new Date().toISOString(),
        };
        localStorage.setItem('customer_user', JSON.stringify(authUserData));
        setUser(authUserData);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string
  ): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    const customers = JSON.parse(localStorage.getItem('customers') || '[]');

    if (customers.some((c: { email: string }) => c.email === email)) {
      return false;
    }

    const newCustomer = {
      id: Date.now().toString(),
      email,
      password,
      fullName,
      phoneNumber,
      points: 0,
      linkedBrands: [] as string[],
      createdAt: new Date().toISOString(),
    };

    customers.push(newCustomer);
    localStorage.setItem('customers', JSON.stringify(customers));

    const userData: User = {
      id: newCustomer.id,
      email: newCustomer.email,
      fullName: newCustomer.fullName,
      phoneNumber: newCustomer.phoneNumber,
      points: 0,
      linkedBrands: [],
      createdAt: newCustomer.createdAt,
    };

    setUser(userData);
    localStorage.setItem('customer_user', JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_user');
      localStorage.removeItem('customer_token');
    }
    customerApi.clearToken();
  };

  const deleteAccount = async () => {
    if (typeof window === 'undefined' || !user) return;

    try {
      await customerApi.deleteAccount();
    } catch (error) {
      console.error('Error deleting account:', error);
    }

    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customer_user');
      localStorage.removeItem('customer_token');
    }
    customerApi.clearToken();
  };

  const updateUser = (userData: Partial<User> | User) => {
    if (!user && !(userData as User).id) {
      return;
    }

    const updatedUser = user ? { ...user, ...userData } : (userData as User);
    setUser(updatedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('customer_user', JSON.stringify(updatedUser));

      if (user) {
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const index = customers.findIndex((c: { id: string }) => c.id === user.id);
        if (index !== -1) {
          customers[index] = { ...customers[index], ...userData };
          localStorage.setItem('customers', JSON.stringify(customers));
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        deleteAccount,
        isAuthenticated: !!user,
        isLoading,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
