'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, auth as supabaseAuth, db } from '@/services/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on mount
    const checkUser = async () => {
      try {
        try {
          const currentUser = await supabaseAuth.getUser();
          setUser(currentUser || null);

          // If user is logged in, ensure they have a record in our users table
          if (currentUser) {
            await ensureUserInDatabase(currentUser);
          }
        } catch (error) {
          console.error('Error getting current user:', error);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user || null;
        setUser(user);

        // If user is logged in, ensure they have a record in our users table
        if (user) {
          await ensureUserInDatabase(user);
        }

        setLoading(false);
      }
    );

    return () => {
      // Clean up subscription
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Helper function to ensure user exists in our custom users table
  const ensureUserInDatabase = async (user: User) => {
    if (!user || !user.id) {
      console.error('Invalid user object provided to ensureUserInDatabase');
      return;
    }

    try {
      // Check if user already exists in our custom users table
      let userData = null;
      try {
        userData = await db.getUser(user.id);
        console.log('User found in database:', userData);
      } catch (error) {
        console.log('User not found in custom table, will create');
      }

      // If user doesn't exist in our custom table, create them
      if (!userData) {
        try {
          const newUser = {
            id: user.id,
            email: user.email,
            cash_balance: 100000 // Default starting balance
          };

          console.log('Creating new user in database:', newUser);
          const { data, error } = await supabase
            .from('users')
            .insert(newUser)
            .select();

          if (error) {
            console.error('Error creating user in custom table:', error);
          } else {
            console.log('Successfully created user in custom table:', data);
          }
        } catch (createErr) {
          console.error('Error creating user in custom table:', createErr);
        }
      }
    } catch (err) {
      console.error('Error in ensureUserInDatabase:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await supabaseAuth.signIn(email, password);
      if (data?.user) {
        await ensureUserInDatabase(data.user);
      }
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await supabaseAuth.signUp(email, password);
      if (data?.user) {
        await ensureUserInDatabase(data.user);
      }
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabaseAuth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await supabaseAuth.resetPassword(email);
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
