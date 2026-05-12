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
      // Cmd/Ctrl + K to open
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
          id: c.id,
          type: 'candidate' as const,
          title: c.full_name,
          subtitle: c.email || c.status || 'Candidate',
        })),
        ...(companies.data || []).map(c => ({
          id: c.id,
          type: 'company' as const,
          title: c.name,
          subtitle: c.industry || 'Company',
        })),
        ...(jobs.data || []).map(j => ({
          id: j.id,
          type: 'job' as const,
          title: j.title,
          subtitle: j.status || 'Job',
        })),
        ...(contacts.data || []).map(c => ({
          id: c.id,
          type: 'contact' as const,
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
    navigate(TYPE_ROUTES[result.type]);
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
    <div ref={containerRef} style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
      {/* Search Input */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'var(--color-bg-subtle)',
        border: `1px solid ${open ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '0.5rem 0.75rem',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: open ? '0 0 0 3px rgba(13, 148, 136, 0.1)' : 'none',
      }}>
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search candidates, companies, jobs... (⌘K)"
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text)',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!query && (
          <kbd style={{
            fontSize: '0.7rem', padding: '0.15rem 0.4rem',
            background: 'var(--color-bg-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-text-muted)',
            fontFamily: 'monospace',
          }}>⌘K</kbd>
        )}
      </div>

      {/* Dropdown */}
      {open && query.trim().length >= 2 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)',
          left: 0, right: 0,
          background: 'white',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1000,
          overflow: 'hidden',
          maxHeight: 480,
          overflowY: 'auto',
        }}>
          {loading && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{
                width: 20, height: 20,
                border: '2px solid var(--color-border)',
                borderTopColor: 'var(--color-accent)',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
                margin: '0 auto',
              }} />
            </div>
          )}

          {!loading && results.length === 0 && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
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
                    <div style={{
                      padding: '0.5rem 1rem 0.25rem',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: 'var(--color-bg-subtle)',
                    }}>
                      {TYPE_LABELS[type]}s
                    </div>
                    {items.map((result, i) => {
                      const globalIndex = results.indexOf(result);
                      const isSelected = globalIndex === selected;
                      return (
                        <div
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelected(globalIndex)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            background: isSelected ? 'var(--color-accent-subtle)' : 'white',
                            borderLeft: isSelected ? '2px solid var(--color-accent)' : '2px solid transparent',
                            transition: 'background 0.1s',
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: 'var(--radius-md)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }} className={TYPE_COLORS[type]}>
                            {TYPE_ICONS[type]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontSize: 'var(--text-sm)', fontWeight: 500,
                              color: 'var(--color-text)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {result.title}
                            </p>
                            <p style={{
                              fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {result.subtitle}
                            </p>
                          </div>
                          <span style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--color-text-muted)',
                            flexShrink: 0,
                          }}>
                            {TYPE_LABELS[type]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div style={{
                padding: '0.5rem 1rem',
                borderTop: '1px solid var(--color-border)',
                display: 'flex', gap: '1rem',
                background: 'var(--color-bg-subtle)',
              }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>↑↓ navigate</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>↵ select</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>esc close</span>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}