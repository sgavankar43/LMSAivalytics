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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const email = session.user.email || 'nikunj.sonda@aivalytics.com';
            const fullName = session.user.user_metadata?.full_name || (email.toLowerCase().includes('admin') ? 'Admin Faculty' : 'Nikunj Sonda');
            const initials = fullName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const activeUser: User = {
              id: session.user.id,
              name: fullName,
              email: email,
              initials: initials || 'NS',
              role: email.toLowerCase().includes('admin') ? 'admin' : 'learner',
              term: 'Fall 2026',
            };
            setUser(activeUser);
            localStorage.setItem('aivalytics_user', JSON.stringify(activeUser));
            setIsLoading(false);
            return;
          }
        }

        // Fallback to local storage if present
        const stored = localStorage.getItem('aivalytics_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen for Supabase auth state changes
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session?.user) {
            const email = session.user.email || '';
            const fullName = session.user.user_metadata?.full_name || (email.toLowerCase().includes('admin') ? 'Admin Faculty' : 'Nikunj Sonda');
            const initials = fullName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const activeUser: User = {
              id: session.user.id,
              name: fullName,
              email,
              initials: initials || 'NS',
              role: email.toLowerCase().includes('admin') ? 'admin' : 'learner',
              term: 'Fall 2026',
            };
            setUser(activeUser);
            localStorage.setItem('aivalytics_user', JSON.stringify(activeUser));
          } else {
            setUser(null);
            localStorage.removeItem('aivalytics_user');
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
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

        const fullName = data.user?.user_metadata?.full_name || (email.toLowerCase().includes('admin') ? 'Admin Faculty' : 'Nikunj Sonda');
        const initials = fullName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        const loggedUser: User = {
          id: data.user?.id || 'usr_' + Date.now(),
          name: fullName,
          email: data.user?.email || email,
          initials: initials || 'NS',
          role: email.toLowerCase().includes('admin') ? 'admin' : 'learner',
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

    // Demo fallback if Supabase not reachable
    await new Promise((resolve) => setTimeout(resolve, 300));
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
    // Kept aside per user request
    return { success: false, error: 'Registration is currently invitation-only. Please sign in.' };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('aivalytics_user');
    router.replace('/login');
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
