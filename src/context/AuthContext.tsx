'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { mockUser, mockAdminUser } from '@/data/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check local storage for persisted session
    try {
      const stored = localStorage.getItem('aivalytics_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to mockUser for seamless initial experience
        setUser(mockUser);
        localStorage.setItem('aivalytics_user', JSON.stringify(mockUser));
      }
    } catch {
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'password123',
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        const loggedUser: User = {
          id: data.user?.id || 'usr_' + Date.now(),
          name: data.user?.user_metadata?.full_name || email.split('@')[0],
          email: data.user?.email || email,
          initials: (email.slice(0, 2)).toUpperCase(),
          role: email.includes('admin') ? 'admin' : 'learner',
          term: 'Fall 2026',
        };
        setUser(loggedUser);
        localStorage.setItem('aivalytics_user', JSON.stringify(loggedUser));
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Authentication failed';
        setIsLoading(false);
        return { success: false, error: msg };
      }
    }

    // Demo / mock authentication mode
    await new Promise((resolve) => setTimeout(resolve, 400));
    const isAdmin = email.toLowerCase().includes('admin');
    const signedUser: User = isAdmin
      ? mockAdminUser
      : {
          ...mockUser,
          email,
          name: email.toLowerCase().includes('nikunj') ? 'Nikunj Sonda' : email.split('@')[0].replace('.', ' '),
        };

    setUser(signedUser);
    localStorage.setItem('aivalytics_user', JSON.stringify(signedUser));
    setIsLoading(false);
    return { success: true };
  };

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        const newUser: User = {
          id: data.user?.id || 'usr_' + Date.now(),
          name,
          email,
          initials: initials || 'NL',
          role: 'learner',
          term: 'Fall 2026',
        };
        setUser(newUser);
        localStorage.setItem('aivalytics_user', JSON.stringify(newUser));
        setIsLoading(false);
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Sign up failed';
        setIsLoading(false);
        return { success: false, error: msg };
      }
    }

    // Demo fallback sign up
    await new Promise((resolve) => setTimeout(resolve, 400));
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: name || 'New Learner',
      email,
      initials: initials || 'NL',
      role: 'learner',
      term: 'Fall 2026',
    };

    setUser(newUser);
    localStorage.setItem('aivalytics_user', JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('aivalytics_user');
    router.push('/login');
  };

  const switchRole = (newRole: UserRole) => {
    const updated = newRole === 'admin' ? mockAdminUser : mockUser;
    setUser(updated);
    localStorage.setItem('aivalytics_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'learner',
        isAuthenticated: Boolean(user),
        isLoading,
        signIn,
        signUp,
        signOut,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
