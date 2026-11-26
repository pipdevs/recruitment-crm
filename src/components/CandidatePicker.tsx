import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { candidatesService } from '../services/candidates';
import type { Database } from '../lib/database.types';

type Candidate = Database['public']['Tables']['candidates']['Row'];

const RESULT_LIMIT = 20;
const MIN_TERM_LENGTH = 2;

interface CandidatePickerProps {
  value: string;
  onChange: (candidateId: string) => void;
}

// Search-driven candidate selector. A plain <select> can only hold the first
// page the API returns, so it silently hides most of the database.
export function CandidatePicker({ value, onChange }: CandidatePickerProps) {
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loadedId = useRef('');

  // Show the name for a candidate chosen elsewhere (editing an existing record).
  useEffect(() => {
    if (!value) {
      setSelected(null);
      loadedId.current = '';
      return;
    }
    if (loadedId.current === value) return;
    let current = true;
    candidatesService.getById(value)
      .then(candidate => {
        if (!current) return;
        setSelected(candidate);
        loadedId.current = value;
      })
      .catch(err => {
        if (current) setError(err instanceof Error ? err.message : 'Failed to load candidate');
      });
    return () => { current = false; };
  }, [value]);

  // Wait for a pause in typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => setTerm(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (term.length < MIN_TERM_LENGTH) {
      setResults([]);
      return;
    }
    let current = true;  // ignore responses that arrive after a newer search has started
    setLoading(true);
    candidatesService.search(term, 0, RESULT_LIMIT)
      .then(result => {
        if (!current) return;
        setResults(result.candidates ?? []);
        setError('');
      })
      .catch(err => { if (current) setError(err instanceof Error ? err.message : 'Search failed'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [term]);

  const handleSelect = (candidate: Candidate) => {
    loadedId.current = candidate.id;
    setSelected(candidate);
    setQuery('');
    setTerm('');
    setResults([]);
    onChange(candidate.id);
  };

  const handleClear = () => {
    loadedId.current = '';
    setSelected(null);
    setQuery('');
    setTerm('');
    setResults([]);
    onChange('');
  };

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
        <div className="min-w-0">
          <p className="text-sm text-gray-900 truncate">{selected.full_name}</p>
          {selected.email && <p className="text-xs text-gray-500 truncate">{selected.email}</p>}
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="p-1 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
          aria-label="Clear selected candidate"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, email or phone"
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {loading && <p className="mt-1 text-xs text-gray-400">Searching…</p>}

      {!loading && term.length >= MIN_TERM_LENGTH && results.length === 0 && (
        <p className="mt-1 text-xs text-gray-400">No candidates match “{term}”.</p>
      )}

      {results.length > 0 && (
        <ul className="mt-1 border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-48 overflow-y-auto">
          {results.map(candidate => (
            <li key={candidate.id}>
              <button
                type="button"
                onClick={() => handleSelect(candidate)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <p className="text-sm text-gray-900 truncate">{candidate.full_name}</p>
                {candidate.email && <p className="text-xs text-gray-500 truncate">{candidate.email}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}