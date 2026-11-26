import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { COMPANY_STATUSES, type CompanyStatus } from '../lib/enums';
import { domainFromWebsite } from '../lib/domain';

type Company = Database['public']['Tables']['companies']['Row'];

// Only the fields the form edits. created_by and organisation_id are set by
// the page and the service, never sent from here.
export type CompanyFormData = Pick<
  Company,
  'name' | 'status' | 'industry' | 'location' | 'website' | 'domain' | 'linkedin_url' | 'fee_percentage'
>;

interface CompanyModalProps {
  isOpen: boolean;
  company?: Company;
  onClose: () => void;
  onSubmit: (data: CompanyFormData) => Promise<void>;
}

const INPUT = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export function CompanyModal({ isOpen, company, onClose, onSubmit }: CompanyModalProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<CompanyStatus>('Prospect');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [feePercentage, setFeePercentage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(company?.name ?? '');
    setStatus((company?.status as CompanyStatus) ?? 'Prospect');
    setIndustry(company?.industry ?? '');
    setLocation(company?.location ?? '');
    setWebsite(company?.website ?? '');
    setLinkedinUrl(company?.linkedin_url ?? '');
    setFeePercentage(company?.fee_percentage?.toString() ?? '');
    setError('');
  }, [company, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check for duplicate before submitting
    const { data: existing } = await supabase
      .from('companies')
      .select('id, name')
      .ilike('name', name.trim())
      .maybeSingle();

    if (existing && existing.id !== company?.id) {
      setError(`A company called "${existing.name}" already exists. Please check before adding a duplicate.`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        status,
        industry: industry || null,
        location: location || null,
        website: website || null,
        domain: domainFromWebsite(website),
        linkedin_url: linkedinUrl || null,
        fee_percentage: feePercentage.trim() === '' ? null : Number(feePercentage),
      });
      onClose();
    } catch (err) {
      // The only unique constraint a company form can hit is one domain per organisation.
      if ((err as { code?: string }).code === '23505') {
        setError(`Another company already uses ${domainFromWebsite(website)}.`);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save company');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {company ? 'Edit Company' : 'New Company'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={INPUT}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as CompanyStatus)} className={INPUT}>
                {COMPANY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className={INPUT}
                placeholder="e.g., Fintech"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={INPUT}
                placeholder="e.g., Munich"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className={INPUT}
              placeholder="acme.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className={INPUT}
              placeholder="https://linkedin.com/company/acme"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Standard fee %</label>
            <input
              type="number"
              min={0.01}
              max={100}
              step={0.01}
              value={feePercentage}
              onChange={(e) => setFeePercentage(e.target.value)}
              className={`${INPUT} max-w-[8rem]`}
              placeholder="e.g. 20"
            />
            <p className="mt-1 text-xs text-gray-500">Your agreed terms. Pre-fills the fee on new placements.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}