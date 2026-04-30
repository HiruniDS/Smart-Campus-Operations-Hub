import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthState } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  googleLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    // Check if we just returned from Google OAuth with params
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    if (oauthToken) {
      const oauthUser = {
        id: params.get('id') || '',
        email: params.get('email') || '',
        name: params.get('name') || '',
        role: params.get('role') || 'USER',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${params.get('name')}`
      };

      localStorage.setItem("token", oauthToken);
      localStorage.setItem("role", oauthUser.role);
      localStorage.setItem('user', JSON.stringify(oauthUser));

      setState({
        user: oauthUser as any,
        isAuthenticated: true,
        isLoading: false,
      });

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (token && savedUser) {
      setState({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem('user', JSON.stringify(user));
      // Store credentials for HTTP Basic auth used by booking/ticket API client
      localStorage.setItem('basicAuthUser', email);
      localStorage.setItem('basicAuthPass', password);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/auth/signup', { name, email, password, role });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem('user', JSON.stringify(user));
      // Store credentials for HTTP Basic auth used by booking/ticket API client
      localStorage.setItem('basicAuthUser', email);
      localStorage.setItem('basicAuthPass', password);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const googleLogin = async (role: UserRole) => {
    // Save the intended role in a cookie so the backend can read it after the redirect
    document.cookie = `intended_role=${role}; path=/; max-age=300`; // 5 minute expiry

    // For real Google Auth, we redirect the entire browser to the backend
    window.location.href = `http://localhost:8080/oauth2/authorization/google`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem('user');
    localStorage.removeItem('basicAuthUser');
    localStorage.removeItem('basicAuthPass');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, googleLogin, logout }}>
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
