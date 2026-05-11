import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: '👤',
    title: 'Candidate Pipeline',
    description: 'Track every candidate from first contact to placement. Kanban board and list view included.',
  },
  {
    icon: '🏢',
    title: 'Client Management',
    description: 'Manage companies, contacts, and relationships in one place. No more scattered spreadsheets.',
  },
  {
    icon: '💼',
    title: 'Job Management',
    description: 'Post and manage open roles, link candidates to jobs, and track applications through every stage.',
  },
  {
    icon: '📋',
    title: 'Applications Pipeline',
    description: 'Move candidates through your recruitment process stage by stage. Board or list — your choice.',
  },
  {
    icon: '💰',
    title: 'Placement & Fee Tracking',
    description: 'Record placements, track fees, and monitor your revenue pipeline. Know exactly what you\'ve earned.',
  },
  {
    icon: '✅',
    title: 'Tasks & Calendar',
    description: 'Never miss a follow-up. Assign tasks, set due dates, and see everything in a calendar view.',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '£0',
    period: 'forever',
    description: 'For solo recruiters getting started.',
    features: [
      '1 user',
      'Up to 25 candidates',
      '3 active jobs',
      'Basic pipeline',
      'Notes & tasks',
    ],
    excluded: [
      'Placements & fee tracking',
      'Team collaboration',
      'Contacts',
    ],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '£49',
    period: 'per month',
    description: 'For small agencies ready to grow.',
    features: [
      'Up to 5 users',
      'Unlimited candidates',
      'Unlimited jobs',
      'Full pipeline & applications',
      'Placements & fee tracking',
      'Team collaboration',
      'Contacts management',
      'Notes, tasks & calendar',
      'Priority support',
    ],
    excluded: [],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Growth',
    price: '£99',
    period: 'per month',
    description: 'For growing agencies scaling fast.',
    features: [
      'Up to 15 users',
      'Everything in Pro',
      'Advanced reporting',
      'Custom pipeline stages',
      'Dedicated onboarding',
      'SLA support',
    ],
    excluded: [],
    cta: 'Start free trial',
    highlighted: false,
  },
];

const TESTIMONIALS = [
  {
    quote: 'We moved from Vincere and saved over £400 a month. RectoCRM does everything we actually use.',
    name: 'Sarah Mitchell',
    title: 'Director, Mitchell Talent Group',
    avatar: 'SM',
  },
  {
    quote: "I've been recruiting for 20 years. This is the first CRM that doesn't make me feel like I need a training course.",
    name: 'David Clarke',
    title: 'Senior Recruiter, Clarke & Partners',
    avatar: 'DC',
  },
  {
    quote: 'Simple, fast, and does exactly what it says. Our whole team was up and running in an afternoon.',
    name: 'Priya Sharma',
    title: 'Founder, Apex Search',
    avatar: 'PS',
  },
];

const COMPARISON = [
  { feature: 'Candidate pipeline', recto: true, vincere: true, recruitcrm: true },
  { feature: 'Job & application tracking', recto: true, vincere: true, recruitcrm: true },
  { feature: 'Placement & fee tracking', recto: true, vincere: true, recruitcrm: true },
  { feature: 'Team collaboration', recto: true, vincere: true, recruitcrm: true },
  { feature: 'Simple flat pricing', recto: true, vincere: false, recruitcrm: false },
  { feature: 'No per-seat penalties', recto: true, vincere: false, recruitcrm: false },
  { feature: 'Setup in under 30 mins', recto: true, vincere: false, recruitcrm: false },
  { feature: 'No training required', recto: true, vincere: false, recruitcrm: false },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text)', background: 'var(--color-bg)' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2.5rem',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, background: 'var(--color-accent)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>R</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
            Recto<span style={{ color: 'var(--color-accent)' }}>CRM</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#features" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Features</a>
          <a href="#pricing" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Pricing</a>
          <a href="#compare" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontSize: 'var(--text-sm)', fontWeight: 500 }}>Compare</a>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 500 }}
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'var(--color-accent)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '0.5rem 1.25rem', fontSize: 'var(--text-sm)',
              fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-dark)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Start free →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '8rem 2rem 6rem',
        background: 'linear-gradient(180deg, var(--color-accent-subtle) 0%, var(--color-bg) 60%)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'white', border: '1px solid var(--color-accent-border)',
          borderRadius: 'var(--radius-full)', padding: '0.35rem 1rem',
          fontSize: 'var(--text-xs)', fontWeight: 600,
          color: 'var(--color-accent-dark)', marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <span style={{ width: 6, height: 6, background: 'var(--color-accent)', borderRadius: '50%', display: 'inline-block' }} />
          Built for recruitment agencies. No fluff.
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 700,
          letterSpacing: '-0.04em',
          lineHeight: 1.05,
          maxWidth: '16ch',
          margin: '0 auto 1.5rem',
          color: 'var(--color-text)',
        }}>
          The recruitment CRM that{' '}
          <span style={{ color: 'var(--color-accent)' }}>gets out of your way</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--color-text-secondary)',
          maxWidth: '52ch',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          Everything you need to run a recruitment desk. Candidates, clients, jobs, placements, and fees — all in one place. A third of the price of the big names.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'var(--color-accent)', color: 'white',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '0.875rem 2rem', fontSize: 'var(--text-base)',
              fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Start free — no card needed
          </button>
          <a href="#pricing" style={{
            background: 'white', color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 2rem', fontSize: 'var(--text-base)',
            fontWeight: 500, textDecoration: 'none',
            boxShadow: 'var(--shadow-sm)',
          }}>
            See pricing
          </a>
        </div>

        {/* SOCIAL PROOF BAR */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '2rem',
          color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          <span>✓ Free plan available</span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span>✓ Setup in under 30 minutes</span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span>✓ No training required</span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span>✓ Cancel any time</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{
        padding: 'var(--space-24) var(--space-8)',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <p style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Features
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Everything a recruiter actually needs
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', maxWidth: '48ch', margin: '0 auto' }}>
            No AI gimmicks. No bloated feature lists. Just the tools that help you place candidates and get paid.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{
                width: 44, height: 44,
                background: 'var(--color-accent-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', marginBottom: 'var(--space-4)',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 600, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)', letterSpacing: '-0.01em' }}>
                {f.title}
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" style={{
        padding: 'var(--space-24) var(--space-8)',
        background: 'var(--color-bg-subtle)',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <p style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Compare
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              Why switch to RectoCRM?
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
              Same core features. A fraction of the cost.
            </p>
          </div>

          <div style={{
            background: 'white',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
              padding: '1rem 1.5rem',
              background: 'var(--color-bg-muted)',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>Feature</div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-accent)', textAlign: 'center' }}>RectoCRM</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>Vincere</div>
              <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>RecruitCRM</div>
            </div>

            {COMPARISON.map((row, i) => (
              <div key={row.feature} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
                padding: '1rem 1.5rem',
                borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--color-border)' : 'none',
                background: i % 2 === 0 ? 'white' : 'var(--color-bg-subtle)',
              }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text)' }}>{row.feature}</div>
                <div style={{ textAlign: 'center' }}>
                  {row.recto ? <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.1rem' }}>✓</span> : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {row.vincere ? <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span> : <span style={{ color: '#fca5a5', fontWeight: 700 }}>✗</span>}
                </div>
                <div style={{ textAlign: 'center' }}>
                  {row.recruitcrm ? <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>✓</span> : <span style={{ color: '#fca5a5', fontWeight: 700 }}>✗</span>}
                </div>
              </div>
            ))}
          </div>

          <p style={{
            textAlign: 'center', marginTop: 'var(--space-6)',
            color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)',
          }}>
            Vincere starts at £60/user/month. RecruitCRM starts at £75/user/month. RectoCRM Pro is £49/month flat.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{
        padding: 'var(--space-24) var(--space-8)',
        maxWidth: 1100, margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
          <p style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Pricing
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Honest pricing. No surprises.
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)', maxWidth: '44ch', margin: '0 auto' }}>
            Flat monthly fee. No per-seat traps. Cancel any time.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}>
          {PRICING.map((plan) => (
            <div key={plan.name} style={{
              background: plan.highlighted ? 'var(--color-accent)' : 'white',
              border: plan.highlighted ? 'none' : '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              boxShadow: plan.highlighted ? '0 20px 40px rgba(13, 148, 136, 0.3)' : 'var(--shadow-sm)',
              position: 'relative',
              transform: plan.highlighted ? 'scale(1.03)' : 'scale(1)',
            }}>
              {plan.highlighted && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--color-text)', color: 'white',
                  padding: '0.25rem 1rem', borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)', fontWeight: 700, whiteSpace: 'nowrap',
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  Most popular
                </div>
              )}

              <p style={{
                fontWeight: 700, fontSize: 'var(--text-sm)',
                color: plan.highlighted ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                marginBottom: 'var(--space-2)',
              }}>
                {plan.name}
              </p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: 'var(--space-2)' }}>
                <span style={{
                  fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 800,
                  color: plan.highlighted ? 'white' : 'var(--color-text)',
                  letterSpacing: '-0.04em',
                }}>
                  {plan.price}
                </span>
                <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                  /{plan.period}
                </span>
              </div>

              <p style={{
                color: plan.highlighted ? 'rgba(255,255,255,0.8)' : 'var(--color-text-secondary)',
                fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)',
              }}>
                {plan.description}
              </p>

              <button
                onClick={() => navigate('/signup')}
                style={{
                  width: '100%',
                  background: plan.highlighted ? 'white' : 'var(--color-accent)',
                  color: plan.highlighted ? 'var(--color-accent)' : 'white',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  padding: '0.75rem', fontSize: 'var(--text-sm)',
                  fontWeight: 700, cursor: 'pointer', marginBottom: 'var(--space-6)',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {plan.cta}
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'var(--color-accent)', fontWeight: 700 }}>✓</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: plan.highlighted ? 'rgba(255,255,255,0.9)' : 'var(--color-text)' }}>
                      {f}
                    </span>
                  </div>
                ))}
                {plan.excluded.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ color: plan.highlighted ? 'rgba(255,255,255,0.4)' : 'var(--color-text-muted)' }}>✗</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: plan.highlighted ? 'rgba(255,255,255,0.4)' : 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{
        padding: 'var(--space-24) var(--space-8)',
        background: 'var(--color-bg-subtle)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
            <p style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Testimonials
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 700, letterSpacing: '-0.03em' }}>
              Recruiters love it
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{
                background: 'white',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-8)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: '#f59e0b', fontSize: '1rem' }}>★</span>
                  ))}
                </div>
                <p style={{
                  color: 'var(--color-text)', fontSize: 'var(--text-base)',
                  lineHeight: 1.7, marginBottom: 'var(--space-6)',
                  fontStyle: 'italic',
                }}>
                  "{t.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: 40, height: 40,
                    background: 'var(--color-accent-subtle)',
                    border: '2px solid var(--color-accent-border)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 'var(--text-xs)',
                    color: 'var(--color-accent-dark)',
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{t.name}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{
        padding: 'var(--space-24) var(--space-8)',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: 640, margin: '0 auto',
          background: 'var(--color-accent)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-16) var(--space-8)',
          boxShadow: '0 20px 60px rgba(13, 148, 136, 0.25)',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 800, letterSpacing: '-0.03em',
            color: 'white', marginBottom: 'var(--space-4)',
          }}>
            Ready to ditch the expensive CRM?
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)',
            lineHeight: 1.6,
          }}>
            Start free today. No credit card. No training. No nonsense.
          </p>
          <button
            onClick={() => navigate('/signup')}
            style={{
              background: 'white', color: 'var(--color-accent)',
              border: 'none', borderRadius: 'var(--radius-md)',
              padding: '0.875rem 2.5rem',
              fontSize: 'var(--text-base)', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Get started free →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: 'var(--space-8)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 24, height: 24, background: 'var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}>R</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>RectoCRM</span>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            © {new Date().getFullYear()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
          <a href="#" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Terms</a>
          <a href="mailto:hello@rectocrm.com" style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>

    </div>
  );
}