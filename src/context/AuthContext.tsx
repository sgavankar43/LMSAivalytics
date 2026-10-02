'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
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

  // Helper to format a Supabase Auth user object into our LMS User model
  const formatSupabaseUser = (authUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User => {
    const email = authUser.email || '';
    let defaultLearnerName = 'Alex Morgan';
    if (email.toLowerCase().startsWith('sarah')) defaultLearnerName = 'Sarah Connor';
    else if (email.toLowerCase().startsWith('david')) defaultLearnerName = 'David Miller';
    else if (email.toLowerCase().startsWith('emily')) defaultLearnerName = 'Emily Watson';

    const fullName =
      (authUser.user_metadata?.full_name as string) ||
      (email.toLowerCase().includes('admin') ? 'Admin Faculty' : defaultLearnerName);
    const initials = fullName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return {
      id: authUser.id,
      name: fullName,
      email,
      initials: initials || 'AM',
      role: email.toLowerCase().includes('admin') ? 'admin' : 'learner',
      term: 'Fall 2026',
    };
  };

  useEffect(() => {
    async function initSupabaseSession() {
      if (!isSupabaseConfigured || !supabase) {
        console.warn('Supabase is not configured yet. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Query live Supabase Auth session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Supabase session retrieval error:', error.message);
          setUser(null);
        } else if (session?.user) {
          setUser(formatSupabaseUser(session.user));
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to initialize Supabase session:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initSupabaseSession();

    // Subscribe to live Supabase Auth state changes (sign in, sign out, token refresh)
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser(formatSupabaseUser(session.user));
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Pure Supabase Auth signInWithPassword
  const signIn = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: 'Supabase Auth service is not configured.' };
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(formatSupabaseUser(data.user));
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const signUp = async (
    _email: string,
    _password: string,
    _name: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Registration process kept aside as requested
    return { success: false, error: 'Registration is currently invitation-only. Please sign in.' };
  };

  // Pure Supabase Auth signOut
  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    setUser(null);
    router.replace('/login');
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    setUser({ ...user, role: newRole });
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
