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
    description: "Record placements, track fees, and monitor your revenue pipeline. Know exactly what you've earned.",
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
    features: ['1 user', 'Up to 25 candidates', '3 active jobs', 'Basic pipeline', 'Notes & tasks'],
    excluded: ['Placements & fee tracking', 'Team collaboration'],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '£49',
    period: 'per month',
    description: 'For small agencies ready to grow.',
    features: [
      'Up to 5 users', 'Unlimited candidates', 'Unlimited jobs',
      'Full pipeline & applications', 'Placements & fee tracking',
      'Team collaboration', 'Contacts management',
      'Notes, tasks & calendar', 'Priority support',
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
      'Up to 15 users', 'Everything in Pro',
      'Advanced reporting', 'Custom pipeline stages',
      'Dedicated onboarding', 'SLA support',
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
    <div className="font-sans text-slate-900 bg-white">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-bold text-lg tracking-tight">
            Recto<span className="text-teal-600">CRM</span>
          </span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#features" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors no-underline">Features</a>
          <a href="#pricing" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors no-underline">Pricing</a>
          <a href="#compare" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors no-underline">Compare</a>
          <button
            onClick={() => navigate('/login')}
            className="text-slate-500 hover:text-slate-900 text-sm font-medium bg-transparent border-none cursor-pointer transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2 rounded-lg border-none cursor-pointer transition-colors"
          >
            Start free →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-8 pt-32 pb-24 bg-gradient-to-b from-teal-50 to-white">
        <div className="inline-flex items-center gap-2 bg-white border border-teal-200 rounded-full px-4 py-1.5 text-xs font-semibold text-teal-700 mb-8 shadow-sm">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full inline-block" />
          Built for recruitment agencies. No fluff.
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto mb-6 text-slate-900">
          The recruitment CRM that{' '}
          <span className="text-teal-600">gets out of your way</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Everything you need to run a recruitment desk. Candidates, clients, jobs, placements, and fees - all in one place. A third of the price of the big names.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <button
            onClick={() => navigate('/signup')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3.5 rounded-lg border-none cursor-pointer transition-all hover:-translate-y-0.5 shadow-lg shadow-teal-500/20"
          >
            Start free - no card needed
          </button>
          
            <a href="#pricing"
            className="bg-white hover:bg-slate-50 text-slate-900 font-medium px-8 py-3.5 rounded-lg border border-slate-200 no-underline transition-colors shadow-sm"
          >
            See pricing
          </a>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-400 flex-wrap justify-center">
          <span>✓ Free plan available</span>
          <span className="text-slate-200">|</span>
          <span>✓ Setup in under 30 minutes</span>
          <span className="text-slate-200">|</span>
          <span>✓ No training required</span>
          <span className="text-slate-200">|</span>
          <span>✓ Cancel any time</span>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">Everything a recruiter actually needs</h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            No AI gimmicks. No bloated feature lists. Just the tools that help you place candidates and get paid.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-xl mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" className="py-24 px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Compare</p>
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">Why switch to RectoCRM?</h2>
            <p className="text-slate-500 text-lg">Same core features. A fraction of the cost.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
            <div className="grid grid-cols-[1fr_120px_120px_120px] px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="text-sm font-semibold text-slate-500">Feature</div>
              <div className="text-sm font-bold text-teal-600 text-center">RectoCRM</div>
              <div className="text-sm font-semibold text-slate-400 text-center">Vincere</div>
              <div className="text-sm font-semibold text-slate-400 text-center">RecruitCRM</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_120px_120px_120px] px-6 py-4 ${
                  i < COMPARISON.length - 1 ? 'border-b border-slate-100' : ''
                } ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
              >
                <div className="text-sm font-medium text-slate-900">{row.feature}</div>
                <div className="text-center">
                  {row.recto
                    ? <span className="text-teal-600 font-bold text-lg">✓</span>
                    : <span className="text-slate-300">—</span>}
                </div>
                <div className="text-center">
                  {row.vincere
                    ? <span className="text-green-600 font-bold">✓</span>
                    : <span className="text-red-300 font-bold">✗</span>}
                </div>
                <div className="text-center">
                  {row.recruitcrm
                    ? <span className="text-green-600 font-bold">✓</span>
                    : <span className="text-red-300 font-bold">✗</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center mt-6 text-sm text-slate-400">
            Vincere starts at £60/user/month. RecruitCRM starts at £75/user/month. RectoCRM Pro is £49/month flat.
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl font-bold tracking-tight mb-4 text-slate-900">Honest pricing. No surprises.</h2>
          <p className="text-slate-500 text-lg max-w-md mx-auto">Flat monthly fee. No per-seat traps. Cancel any time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-teal-600 shadow-2xl shadow-teal-500/30 scale-105'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Most popular
                </div>
              )}

              <p className={`font-bold text-sm uppercase tracking-widest mb-2 ${
                plan.highlighted ? 'text-white/80' : 'text-slate-400'
              }`}>
                {plan.name}
              </p>

              <div className="flex items-baseline gap-1 mb-2">
                <span className={`text-5xl font-extrabold tracking-tight ${
                  plan.highlighted ? 'text-white' : 'text-slate-900'
                }`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-slate-400'}`}>
                  /{plan.period}
                </span>
              </div>

              <p className={`text-sm mb-6 ${plan.highlighted ? 'text-white/80' : 'text-slate-500'}`}>
                {plan.description}
              </p>

              <button
                onClick={() => navigate('/signup')}
                className={`w-full py-3 rounded-xl font-bold text-sm border-none cursor-pointer transition-opacity hover:opacity-90 mb-6 ${
                  plan.highlighted
                    ? 'bg-white text-teal-600'
                    : 'bg-teal-600 text-white'
                }`}
              >
                {plan.cta}
              </button>

              <div className="flex flex-col gap-3">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <span className={`font-bold ${plan.highlighted ? 'text-white/90' : 'text-teal-600'}`}>✓</span>
                    <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-slate-900'}`}>{f}</span>
                  </div>
                ))}
                {plan.excluded.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <span className={plan.highlighted ? 'text-white/40' : 'text-slate-300'}>✗</span>
                    <span className={`text-sm line-through ${plan.highlighted ? 'text-white/40' : 'text-slate-300'}`}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900">Recruiters love it</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                <div className="mb-4">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className="text-amber-400 text-base">★</span>
                  ))}
                </div>
                <p className="text-slate-700 text-base leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 border-2 border-teal-200 rounded-full flex items-center justify-center text-xs font-bold text-teal-700">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center">
        <div className="max-w-2xl mx-auto bg-teal-600 rounded-2xl p-16 shadow-2xl shadow-teal-500/20">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Ready to ditch the expensive CRM?
          </h2>
          <p className="text-white/85 text-lg mb-8 leading-relaxed">
            Start free today. No credit card. No training. No nonsense.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="bg-white text-teal-600 font-bold px-10 py-3.5 rounded-xl border-none cursor-pointer transition-all hover:-translate-y-0.5"
          >
            Get started free →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-8 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-teal-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-bold text-sm text-slate-900">RectoCRM</span>
          <span className="text-slate-400 text-sm">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="text-slate-400 hover:text-slate-600 text-sm no-underline transition-colors">Privacy</a>
          <a href="#" className="text-slate-400 hover:text-slate-600 text-sm no-underline transition-colors">Terms</a>
          <a href="mailto:hello@rectocrm.com" className="text-slate-400 hover:text-slate-600 text-sm no-underline transition-colors">Contact</a>
        </div>
      </footer>

    </div>
  );
}