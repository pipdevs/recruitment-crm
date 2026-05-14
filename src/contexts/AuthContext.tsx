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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        if (data.organisation_id) {
          await loadOrganisation(data.organisation_id);
        }
        return;
      }

      // No profile found — auto-create org and profile
      const { data: newOrg, error: orgError } = await supabase
        .from('organisations')
        .insert([{ name: 'My Organisation', plan: 'free' }])
        .select()
        .single();

      if (orgError) {
        console.error('Failed to create organisation:', orgError);
        return;
      }

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: userId,
          full_name: 'New User',
          role: 'Admin',
          organisation_id: newOrg.id,
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Failed to create profile:', profileError);
        return;
      }

      setProfile(newProfile);
      setOrganisation(newOrg);

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
    role: Profile['role'],
    orgName: string,
  ) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('User creation failed');

    const { data: org, error: orgError } = await supabase
      .from('organisations')
      .insert([{ name: orgName, plan: 'free' }])
      .select()
      .single();
    if (orgError) throw orgError;

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        full_name: fullName,
        role: role,
        organisation_id: org.id,
      }]);

    if (profileError && profileError.code !== '23505') {
      throw profileError;
    }
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