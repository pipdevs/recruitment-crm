import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organisation = Database['public']['Tables']['organisations']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  organisation: Organisation | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: Profile['role'], orgName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          setOrganisation(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      // Retry up to 5 times with 500ms delay
      // The database trigger may not have run yet on first login
      let data = null;
      for (let i = 0; i < 5; i++) {
        const { data: result, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) throw error;

        if (result) {
          data = result;
          break;
        }

        // Profile not created yet by trigger — wait and retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (data) {
        setProfile(data);
        if (data.organisation_id) {
          await loadOrganisation(data.organisation_id);
        }
        return;
      }

      console.warn('Profile not found after retries for user:', userId);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganisation = async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', orgId)
        .single();
      if (error) throw error;
      setOrganisation(data);
    } catch (error) {
      console.error('Error loading organisation:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    _role: Profile['role'],
    orgName: string,
  ) => {
    // Trigger on auth.users insert handles org+profile creation server-side
    // Pass metadata so trigger can use the correct name and org name
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          org_name: orgName,
        },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, profile, organisation, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}