import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Zap, TrendingUp, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { billingService } from '../services/billing';

const PLANS = [
  {
    name: 'Free',
    price: '£0',
    period: 'forever',
    priceId: null,
    description: 'For solo recruiters getting started.',
    features: ['1 user', '25 candidates', '3 active jobs', 'Basic pipeline', 'Notes & tasks'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '£49',
    period: 'per month',
    priceId: import.meta.env.VITE_STRIPE_PRICE_PRO,
    description: 'For small agencies ready to grow.',
    features: [
      'Up to 5 users', 'Unlimited candidates', 'Unlimited jobs',
      'Full pipeline & applications', 'Placements & fee tracking',
      'Team collaboration', 'Contacts management', 'Priority support',
    ],
    highlighted: true,
  },
  {
    name: 'Growth',
    price: '£99',
    period: 'per month',
    priceId: import.meta.env.VITE_STRIPE_PRICE_GROWTH,
    description: 'For growing agencies scaling fast.',
    features: [
      'Up to 15 users', 'Everything in Pro',
      'Advanced reporting', 'Dedicated onboarding', 'SLA support',
    ],
    highlighted: false,
  },
];

export function Billing() {
  const { organisation } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const success = searchParams.get('success');
  const cancelled = searchParams.get('cancelled');

  const handleUpgrade = async (priceId: string, planName: string) => {
    if (!organisation) return;
    setLoading(planName);
    setError('');
    try {
      const url = await billingService.createCheckoutSession(
        priceId,
        organisation.id,
        organisation.name,
      );
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing</h1>
        <p className="text-gray-600">
          Current plan: <span className="font-semibold capitalize">{organisation?.plan}</span>
        </p>
      </div>

      {success && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Payment successful!</p>
            <p className="text-sm text-green-700">Your plan has been upgraded. It may take a moment to reflect.</p>
          </div>
        </div>
      )}

      {cancelled && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800 text-sm">Checkout cancelled. Your plan has not changed.</p>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {PLANS.map((plan) => {
          const isCurrent = organisation?.plan === plan.name.toLowerCase();
          return (
            <div key={plan.name} style={{
              background: plan.highlighted ? 'var(--color-accent)' : 'white',
              border: plan.highlighted ? 'none' : '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              boxShadow: plan.highlighted ? '0 20px 40px rgba(13, 148, 136, 0.2)' : 'var(--shadow-sm)',
              position: 'relative',
              transform: plan.highlighted ? 'scale(1.02)' : 'scale(1)',
            }}>
              {isCurrent && (
                <div className="absolute top-3 right-3 bg-white text-xs font-bold px-2 py-1 rounded-full"
                  style={{ color: 'var(--color-accent)' }}>
                  Current
                </div>
              )}

              <p className="font-bold text-sm mb-2 uppercase tracking-wider"
                style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                {plan.name}
              </p>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold"
                  style={{ color: plan.highlighted ? 'white' : 'var(--color-text)' }}>
                  {plan.price}
                </span>
                <span className="text-sm"
                  style={{ color: plan.highlighted ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)' }}>
                  /{plan.period}
                </span>
              </div>

              <p className="text-sm mb-6"
                style={{ color: plan.highlighted ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)' }}>
                {plan.description}
              </p>

              {plan.priceId && !isCurrent ? (
                <button
                  onClick={() => handleUpgrade(plan.priceId!, plan.name)}
                  disabled={!!loading}
                  style={{
                    width: '100%',
                    background: plan.highlighted ? 'white' : 'var(--color-accent)',
                    color: plan.highlighted ? 'var(--color-accent)' : 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    marginBottom: '1.5rem',
                  }}
                >
                  {loading === plan.name ? 'Redirecting...' : `Upgrade to ${plan.name}`}
                </button>
              ) : (
                <div style={{
                  width: '100%',
                  background: plan.highlighted ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-muted)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: plan.highlighted ? 'white' : 'var(--color-text-secondary)',
                  marginBottom: '1.5rem',
                }}>
                  {isCurrent ? '✓ Current plan' : 'Free forever'}
                </div>
              )}

              <div className="space-y-2">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0"
                      style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'var(--color-accent)' }} />
                    <span className="text-sm"
                      style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'var(--color-text)' }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}