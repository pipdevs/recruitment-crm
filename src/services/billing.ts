import { supabase } from '../lib/supabase';

export const billingService = {
  async createCheckoutSession(priceId: string, organisationId: string, organisationName: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId, organisationId, organisationName }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
    return data.url as string;
  },
};