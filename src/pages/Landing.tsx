import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, X } from 'lucide-react';

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
    description: 'Move candidates through your recruitment process stage by stage.',
  },
  {
    icon: '💰',
    title: 'Placement & Fee Tracking',
    description: "Record placements, track fees, and monitor your revenue pipeline. Know exactly what you've earned.",
  },
  {
    icon: '✅',
    title: 'Tasks & Notes',
    description: 'Never miss a follow-up. Assign tasks, set due dates, and keep notes on every record.',
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
      'CSV import', 'Priority support',
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
      'Advanced reporting', 'Dedicated onboarding', 'SLA support',
    ],
    excluded: [],
    cta: 'Start free trial',
    highlighted: false,
  },
];

const COMPARISON = [
  { feature: 'Candidate pipeline', recto: true, vincere: true, recruitcrm: true },
  { feature: 'Job & application tracking', recto: true, vincere: true, recruitcrm: true },
  { feature: 'Placement & fee tracking', recto: true, vincere: true, recruitcrm: true },
  { feature: 'Team collaboration', recto: true, vincere: true, recruitcrm: true },
  { feature: 'CSV import', recto: true, vincere: true, recruitcrm: true },
  { feature: 'Flat monthly pricing', recto: true, vincere: false, recruitcrm: false },
  { feature: 'No per-seat penalties', recto: true, vincere: false, recruitcrm: false },
  { feature: 'Setup in under 30 mins', recto: true, vincere: false, recruitcrm: false },
  { feature: 'No training required', recto: true, vincere: false, recruitcrm: false },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-slate-900 bg-white">

      {/* ANNOUNCEMENT BAR */}
      <div className="bg-slate-900 text-white text-center py-2.5 px-4">
        <p className="text-sm font-medium">
          <span className="text-teal-400 font-semibold">Now in beta</span>
          {' '}- 10 free Pro licences available for solo recruiters.{' '}
          <button
            onClick={() => navigate('/signup')}
            className="underline underline-offset-2 hover:text-teal-300 transition-colors"
          >
            Apply now →
          </button>
        </p>
      </div>

      {/* NAV */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm tracking-tight">R</span>
          </div>
          <span className="font-bold text-lg tracking-tight">
            Recto<span className="text-teal-600">CRM</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
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
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg border-none cursor-pointer transition-colors"
          >
            Start free →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[92vh] flex flex-col items-center justify-center text-center px-6 py-24">
        {/* Subtle background decoration — Roman grid pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-200 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          {/* Large decorative numeral — Roman touch */}
          <div className="absolute right-[5%] top-1/2 -translate-y-1/2 text-[20rem] font-serif font-bold text-slate-50 select-none leading-none pointer-events-none hidden xl:block">
            I
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Beta badge */}
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-xs font-semibold text-teal-700 mb-8">
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse inline-block" />
            Open beta - join 10 founding recruiters
          </div>

          {/* Main headline — serif + teal contrast */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.02] tracking-tight mb-6 text-slate-900">
            The recruitment CRM{' '}
            <br className="hidden md:block" />
            that{' '}
            <em className="not-italic text-teal-600">
              gets out of your way
            </em>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Candidates, clients, jobs, placements, all in one place.
            A third of the price of Vincere or RecruitCRM.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <button
              onClick={() => navigate('/signup')}
              className="group inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-xl border-none cursor-pointer transition-all text-lg shadow-lg shadow-teal-500/20 hover:-translate-y-0.5"
            >
              Start free - no card needed
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            
              <a href="#pricing"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-medium px-8 py-4 rounded-xl border border-slate-200 no-underline transition-colors text-lg"
            >
              See pricing
            </a>
          </div>

          {/* Social proof strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-500" /> Free plan available</span>
            <span className="text-slate-200 hidden sm:block">|</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-500" /> Setup in under 30 minutes</span>
            <span className="text-slate-200 hidden sm:block">|</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-500" /> No training required</span>
            <span className="text-slate-200 hidden sm:block">|</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-500" /> Cancel any time</span>
          </div>
        </div>
      </section>

      {/* THIN DIVIDER */}
      <div className="flex items-center gap-4 px-8 max-w-6xl mx-auto">
        <div className="flex-1 h-px bg-slate-100" />
        <div className="w-1 h-1 rounded-full bg-teal-400" />
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      {/* FEATURES */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-teal-600 font-semibold text-xs uppercase tracking-[0.2em] mb-4">Features</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-5 text-slate-900">
              Everything you actually need.{' '}
              <span className="text-slate-300">Nothing you don't.</span>
            </h2>
            <p className="text-slate-500 text-xl max-w-xl mx-auto">
              No AI gimmicks. No bloated feature lists. Just the tools that help you place candidates and get paid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`group p-8 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg ${
                  i === 4
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-slate-200 hover:border-teal-200'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5 ${
                  i === 4 ? 'bg-teal-500' : 'bg-teal-50'
                }`}>
                  {f.icon}
                </div>
                <h3 className={`font-semibold text-lg mb-2.5 tracking-tight ${i === 4 ? 'text-white' : 'text-slate-900'}`}>
                  {f.title}
                </h3>
                <p className={`text-sm leading-relaxed ${i === 4 ? 'text-teal-100' : 'text-slate-500'}`}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" className="py-28 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-xs uppercase tracking-[0.2em] mb-4">Compare</p>
            <h2 className="text-5xl font-bold tracking-tight mb-4 text-slate-900">Why switch?</h2>
            <p className="text-slate-500 text-xl">Same core features. A fraction of the cost.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-[1fr_100px_100px_100px] px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Feature</div>
              <div className="text-xs font-bold text-teal-600 text-center uppercase tracking-wider">RectoCRM</div>
              <div className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider">Vincere</div>
              <div className="text-xs font-semibold text-slate-400 text-center uppercase tracking-wider">RecruitCRM</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-[1fr_100px_100px_100px] px-6 py-3.5 ${
                  i < COMPARISON.length - 1 ? 'border-b border-slate-100' : ''
                } ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
              >
                <div className="text-sm font-medium text-slate-700">{row.feature}</div>
                <div className="text-center">
                  {row.recto ? <span className="text-teal-600 font-bold text-base">✓</span> : <span className="text-slate-300">—</span>}
                </div>
                <div className="text-center">
                  {row.vincere ? <span className="text-green-500 font-bold">✓</span> : <X className="w-3.5 h-3.5 text-red-300 mx-auto" />}
                </div>
                <div className="text-center">
                  {row.recruitcrm ? <span className="text-green-500 font-bold">✓</span> : <X className="w-3.5 h-3.5 text-red-300 mx-auto" />}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-6 text-sm text-slate-400">
            Vincere starts at £60/user/month. RecruitCRM starts at £75/user/month.{' '}
            <span className="text-teal-600 font-semibold">RectoCRM Pro is £49/month flat.</span>
          </p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-600 font-semibold text-xs uppercase tracking-[0.2em] mb-4">Pricing</p>
            <h2 className="text-5xl font-bold tracking-tight mb-4 text-slate-900">Honest pricing. No surprises.</h2>
            <p className="text-slate-500 text-xl max-w-md mx-auto">Flat monthly fee. No per-seat traps. Cancel any time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 transition-all ${
                  plan.highlighted
                    ? 'bg-teal-600 shadow-2xl shadow-teal-500/25 scale-105'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest whitespace-nowrap">
                    Most popular
                  </div>
                )}

                <p className={`font-bold text-xs uppercase tracking-[0.2em] mb-3 ${
                  plan.highlighted ? 'text-teal-200' : 'text-slate-400'
                }`}>
                  {plan.name}
                </p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-5xl font-extrabold tracking-tight ${
                    plan.highlighted ? 'text-white' : 'text-slate-900'
                  }`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlighted ? 'text-teal-200' : 'text-slate-400'}`}>
                    /{plan.period}
                  </span>
                </div>

                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-teal-100' : 'text-slate-500'}`}>
                  {plan.description}
                </p>

                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm border-none cursor-pointer transition-all hover:opacity-90 mb-6 ${
                    plan.highlighted
                      ? 'bg-white text-teal-600 hover:bg-teal-50'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="flex flex-col gap-2.5">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2.5">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-teal-200' : 'text-teal-500'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-teal-50' : 'text-slate-700'}`}>{f}</span>
                    </div>
                  ))}
                  {plan.excluded.map(f => (
                    <div key={f} className="flex items-center gap-2.5 opacity-40">
                      <X className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-teal-200' : 'text-slate-400'}`} />
                      <span className={`text-sm line-through ${plan.highlighted ? 'text-teal-100' : 'text-slate-400'}`}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BETA CTA — replaces fake testimonials */}
      <section className="py-28 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            {/* Decorative Roman numeral background */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[12rem] font-serif font-bold text-white/5 select-none leading-none pointer-events-none hidden lg:block">
              X
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-teal-400 mb-6">
                <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse inline-block" />
                10 founding recruiter spots available
              </div>

              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                Be one of our{' '}
                <span className="text-teal-400">founding 10</span>
              </h2>

              <p className="text-slate-400 text-lg mb-4 max-w-xl mx-auto leading-relaxed">
                Free Pro licence for 3 months. In exchange? Use it for real and tell us honestly what's missing.
              </p>

              <p className="text-slate-500 text-sm mb-10">
                No credit card. No commitment. Just a tool you might actually love.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-4 rounded-xl border-none cursor-pointer transition-all text-base hover:-translate-y-0.5"
                >
                  Apply for a founding spot
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                  <a href="/"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-8 py-4 rounded-xl no-underline transition-colors text-base border border-white/10"
                >
                  Questions? Email us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-8 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-teal-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-bold text-sm text-slate-900">RectoCRM</span>
          <span className="text-slate-300 text-sm">·</span>
          <span className="text-slate-400 text-sm">© 2026</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/privacy" className="text-slate-400 hover:text-slate-600 text-sm no-underline transition-colors">Privacy</a>
          <a href="/terms" className="text-slate-400 hover:text-slate-600 text-sm no-underline transition-colors">Terms</a>
          <a href="/" className="text-slate-400 hover:text-slate-600 text-sm no-underline transition-colors">hello@rectocrm.com</a>
        </div>
      </footer>

    </div>
  );
}