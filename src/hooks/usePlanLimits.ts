import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlanLimits {
  plan: string;
  isPro: boolean;
  candidates: { current: number; max: number; reached: boolean };
  jobs: { current: number; max: number; reached: boolean };
  members: { current: number; max: number; reached: boolean };
  canAccessPlacements: boolean;
  canAccessContacts: boolean;
  loading: boolean;
}

const FREE_LIMITS = {
  candidates: 25,
  jobs: 3,
  members: 1,
};

const DEFAULT_LIMITS: PlanLimits = {
  plan: 'free',
  isPro: false,
  candidates: { current: 0, max: FREE_LIMITS.candidates, reached: false },
  jobs: { current: 0, max: FREE_LIMITS.jobs, reached: false },
  members: { current: 0, max: FREE_LIMITS.members, reached: false },
  canAccessPlacements: false,
  canAccessContacts: true,
  loading: true,
};

export function usePlanLimits(): PlanLimits {
  const auth = useAuth();
  const organisation = auth?.organisation;
  const [counts, setCounts] = useState({ candidates: 0, jobs: 0, members: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organisation) {
      loadCounts();
    } else {
      setLoading(false);
    }
  }, [organisation]);

  const loadCounts = async () => {
    try {
      const [candidatesRes, jobsRes, membersRes] = await Promise.all([
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'Open'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      setCounts({
        candidates: candidatesRes.count ?? 0,
        jobs: jobsRes.count ?? 0,
        members: membersRes.count ?? 0,
      });
    } catch (err) {
      console.error('Failed to load plan limits:', err);
    } finally {
      setLoading(false);
    }
  };

  const isPro = organisation?.plan !== 'free';

  return {
    plan: organisation?.plan ?? 'free',
    isPro,
    candidates: {
      current: counts.candidates,
      max: FREE_LIMITS.candidates,
      reached: !isPro && counts.candidates >= FREE_LIMITS.candidates,
    },
    jobs: {
      current: counts.jobs,
      max: FREE_LIMITS.jobs,
      reached: !isPro && counts.jobs >= FREE_LIMITS.jobs,
    },
    members: {
      current: counts.members,
      max: FREE_LIMITS.members,
      reached: !isPro && counts.members >= FREE_LIMITS.members,
    },
    canAccessPlacements: isPro,
    canAccessContacts: true,
    loading,
  };
}