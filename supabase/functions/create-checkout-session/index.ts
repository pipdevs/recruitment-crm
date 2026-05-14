import Stripe from 'https://esm.sh/stripe@17.7.0?target=deno&no-check=true';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2025-01-27.acacia',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response('Unauthorized', { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) return new Response('Unauthorized', { status: 401 });

    const { priceId, organisationId, organisationName } = await req.json();

    // Get or create Stripe customer
    const { data: org } = await supabase
      .from('organisations')
      .select('stripe_customer_id, name')
      .eq('id', organisationId)
      .single();

    let customerId = org?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: organisationName || org?.name,
        metadata: { organisation_id: organisationId },
      });
      customerId = customer.id;

      await supabase
        .from('organisations')
        .update({ stripe_customer_id: customerId })
        .eq('id', organisationId);
    }

    const origin = req.headers.get('origin') || 'https://rectocrm.vercel.app';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?cancelled=true`,
      metadata: { organisation_id: organisationId },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});