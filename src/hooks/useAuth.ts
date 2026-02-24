/**
 * useAuth Hook
 * Manages user authentication state and operations
 */

'use client';

import { useEffect, useState } from 'react';
import {
  supabase,
  getCurrentUser,
  signUp,
  signIn,
  signOut,
  onAuthStateChange,
} from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  user_metadata?: any;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        setAuth({
          user: user as User | null,
          loading: false,
          error: null,
        });
      } catch (error) {
        setAuth({
          user: null,
          loading: false,
          error: null,
        });
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const subscription = onAuthStateChange((user) => {
      setAuth({
        user: user as User | null,
        loading: false,
        error: null,
      });
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up handler
  const handleSignUp = async (email: string, password: string) => {
    setAuth((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await signUp(email, password);
      setAuth({
        user: data?.user as User | null,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign up failed';
      setAuth({
        user: null,
        loading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Sign in handler
  const handleSignIn = async (email: string, password: string) => {
    setAuth((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await signIn(email, password);
      setAuth({
        user: data?.user as User | null,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign in failed';
      setAuth({
        user: null,
        loading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    setAuth((prev) => ({ ...prev, loading: true }));
    try {
      await signOut();
      setAuth({
        user: null,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sign out failed';
      setAuth({
        user: null,
        loading: false,
        error: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!auth.user,
  };
}