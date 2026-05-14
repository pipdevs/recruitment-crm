import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno&no-check=true';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2025-01-27.acacia',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const PLAN_MAP: Record<string, string> = {
  [Deno.env.get('STRIPE_PRICE_PRO') || '']: 'pro',
  [Deno.env.get('STRIPE_PRICE_GROWTH') || '']: 'growth',
};

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    );
  } catch (err) {
    console.error('Webhook signature failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const getOrgId = async (customerId: string) => {
    const { data } = await supabase
      .from('organisations')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
    return data?.id;
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.organisation_id;
      if (!orgId) break;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const priceId = subscription.items.data[0].price.id;
      const plan = PLAN_MAP[priceId] || 'pro';

      await supabase.from('organisations').update({
        plan,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        billing_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }).eq('id', orgId);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = await getOrgId(subscription.customer as string);
      if (!orgId) break;

      const priceId = subscription.items.data[0].price.id;
      const plan = PLAN_MAP[priceId] || 'pro';
      const isActive = ['active', 'trialing'].includes(subscription.status);

      await supabase.from('organisations').update({
        plan: isActive ? plan : 'free',
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        billing_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }).eq('id', orgId);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const orgId = await getOrgId(subscription.customer as string);
      if (!orgId) break;

      await supabase.from('organisations').update({
        plan: 'free',
        stripe_subscription_id: null,
        stripe_price_id: null,
        billing_period_end: null,
      }).eq('id', orgId);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});