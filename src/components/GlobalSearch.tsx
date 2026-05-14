import { useState, useEffect, useRef } from 'react';
import { Search, Users, Building2, Briefcase, UserCheck, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface SearchResult {
  id: string;
  type: 'candidate' | 'company' | 'job' | 'contact';
  title: string;
  subtitle: string;
}

const TYPE_ICONS = {
  candidate: <Users className="w-4 h-4" />,
  company: <Building2 className="w-4 h-4" />,
  job: <Briefcase className="w-4 h-4" />,
  contact: <UserCheck className="w-4 h-4" />,
};

const TYPE_COLORS = {
  candidate: 'bg-blue-100 text-blue-600',
  company: 'bg-green-100 text-green-600',
  job: 'bg-orange-100 text-orange-600',
  contact: 'bg-purple-100 text-purple-600',
};

const TYPE_LABELS = {
  candidate: 'Candidate',
  company: 'Company',
  job: 'Job',
  contact: 'Contact',
};

const TYPE_ROUTES = {
  candidate: '/candidates',
  company: '/companies',
  job: '/jobs',
  contact: '/contacts',
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => search(query), 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const search = async (q: string) => {
    setLoading(true);
    try {
      const term = `%${q}%`;
      const [candidates, companies, jobs, contacts] = await Promise.all([
        supabase.from('candidates').select('id, full_name, email, status').ilike('full_name', term).limit(4),
        supabase.from('companies').select('id, name, industry').ilike('name', term).limit(4),
        supabase.from('jobs').select('id, title, status').ilike('title', term).limit(4),
        supabase.from('contacts').select('id, full_name, job_title, company:company_id(name)').ilike('full_name', term).limit(4),
      ]);

      const mapped: SearchResult[] = [
        ...(candidates.data || []).map(c => ({
          id: c.id, type: 'candidate' as const,
          title: c.full_name,
          subtitle: c.email || c.status || 'Candidate',
        })),
        ...(companies.data || []).map(c => ({
          id: c.id, type: 'company' as const,
          title: c.name,
          subtitle: c.industry || 'Company',
        })),
        ...(jobs.data || []).map(j => ({
          id: j.id, type: 'job' as const,
          title: j.title,
          subtitle: j.status || 'Job',
        })),
        ...(contacts.data || []).map(c => ({
          id: c.id, type: 'contact' as const,
          title: c.full_name,
          subtitle: [c.job_title, (c.company as any)?.name].filter(Boolean).join(' · ') || 'Contact',
        })),
      ];

      setResults(mapped);
      setSelected(0);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
  navigate(`${TYPE_ROUTES[result.type]}/${result.id}`);
  setOpen(false);
  setQuery('');
  setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && results[selected]) {
      handleSelect(results[selected]);
    }
  };

  const grouped = {
    candidate: results.filter(r => r.type === 'candidate'),
    company: results.filter(r => r.type === 'company'),
    job: results.filter(r => r.type === 'job'),
    contact: results.filter(r => r.type === 'contact'),
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl">
      {/* Search Input */}
      <div className={`flex items-center gap-2 bg-slate-50 border rounded-xl px-3 py-2 transition-all ${
        open ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200'
      }`}>
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search candidates, companies, jobs... (⌘K)"
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400"
        />
        {query ? (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0 bg-transparent border-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd className="text-xs px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      {open && query.trim().length >= 2 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[480px] overflow-y-auto">
          {loading && (
            <div className="p-4 flex justify-center">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400">
              No results for "{query}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              {(Object.keys(grouped) as Array<keyof typeof grouped>).map(type => {
                const items = grouped[type];
                if (items.length === 0) return null;
                return (
                  <div key={type}>
                    <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50">
                      {TYPE_LABELS[type]}s
                    </div>
                    {items.map((result) => {
                      const globalIndex = results.indexOf(result);
                      const isSelected = globalIndex === selected;
                      return (
                        <div
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelected(globalIndex)}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2 ${
                            isSelected
                              ? 'bg-teal-50 border-l-teal-500'
                              : 'bg-white border-l-transparent hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[type]}`}>
                            {TYPE_ICONS[type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{result.title}</p>
                            <p className="text-xs text-slate-400 truncate">{result.subtitle}</p>
                          </div>
                          <span className="text-xs text-slate-400 flex-shrink-0">{TYPE_LABELS[type]}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div className="px-4 py-2 border-t border-slate-100 flex gap-4 bg-slate-50">
                <span className="text-xs text-slate-400">↑↓ navigate</span>
                <span className="text-xs text-slate-400">↵ select</span>
                <span className="text-xs text-slate-400">esc close</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}