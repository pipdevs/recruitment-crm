import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Company = { id: string; name: string; website: string | null };
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactRow = Database['public']['Tables']['contacts']['Row'];

interface ContactModalProps {
  contact?: ContactRow | null;
  preselectedCompanyId?: string;
  onSubmit: (data: ContactInsert) => Promise<void>;
  onClose: () => void;
}

export function ContactModal({ contact, preselectedCompanyId, onSubmit, onClose }: ContactModalProps) {
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');
  const [showCompanies, setShowCompanies] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (contact) {
      setFullName(contact.full_name || '');
      setJobTitle(contact.job_title || '');
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setLinkedinUrl(contact.linkedin_url || '');
      setCompanyId(contact.company_id || '');
      setIsPrimary(contact.is_primary || false);
    } else if (preselectedCompanyId) {
      setCompanyId(preselectedCompanyId);
    }
    loadCompanies();
  }, [contact, preselectedCompanyId]);

  const loadCompanies = async () => {
    const { data } = await supabase.from('companies').select('id, name, website').order('name');
    setCompanies(data || []);
  };

  // Show the selected company's name in the input (covers edit + preselect).
  useEffect(() => {
    const selected = companies.find(c => c.id === companyId);
    if (selected) setCompanyQuery(selected.name);
  }, [companyId, companies]);

  const hostOf = (url: string) =>
    url.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  // Match the email's domain against company websites. Only fills on a single
  // unambiguous match — two companies sharing a domain leaves it to the user.
  const autofillCompanyFromEmail = () => {
    if (companyId || preselectedCompanyId) return;
    const domain = email.split('@')[1]?.trim().toLowerCase();
    if (!domain) return;
    const matches = companies.filter(c => c.website && hostOf(c.website) === domain);
    if (matches.length === 1) setCompanyId(matches[0].id);
  };

  const filteredCompanies = companyQuery.trim()
    ? companies.filter(c => c.name.toLowerCase().includes(companyQuery.trim().toLowerCase()))
    : companies;

  const selectCompany = (c: Company) => {
    setCompanyId(c.id);
    setCompanyQuery(c.name);
    setShowCompanies(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!companyId) {
      setError('Select a company from the list');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        full_name: fullName,
        job_title: jobTitle || null,
        email: email || null,
        phone: phone || null,
        linkedin_url: linkedinUrl || null,
        company_id: companyId,
        is_primary: isPrimary,
        created_by: contact?.created_by || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {contact ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jane Smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Head of Talent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={autofillCompanyFromEmail}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="jane@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+44 7700 900000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://linkedin.com/in/jane-smith"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <div className="relative">
              <input
                type="text"
                value={companyQuery}
                onChange={(e) => { setCompanyQuery(e.target.value); setCompanyId(''); setShowCompanies(true); }}
                onFocus={() => setShowCompanies(true)}
                onBlur={() => setShowCompanies(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowCompanies(false);
                  if (e.key === 'Enter' && showCompanies && filteredCompanies.length > 0) {
                    e.preventDefault();
                    selectCompany(filteredCompanies[0]);
                  }
                }}
                disabled={!!preselectedCompanyId}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600"
                placeholder="Search companies..."
              />
              {showCompanies && !preselectedCompanyId && (
                <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                  {filteredCompanies.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-gray-500">No companies match</li>
                  ) : (
                    filteredCompanies.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectCompany(c)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 ${
                            c.id === companyId ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {c.name}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="isPrimary" className="text-sm text-gray-700">
              Primary contact for this company
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : contact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}