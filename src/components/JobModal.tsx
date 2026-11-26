import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { companiesService } from '../services/companies';
import { contactsService } from '../services/contacts';
import type { Database } from '../lib/database.types';
import {
  EMPLOYMENT_TYPES, JOB_STATUSES, PAY_PERIODS,
  type EmploymentType, type JobStatus, type PayPeriod,
} from '../lib/enums';
import { COMMON_CURRENCIES, OTHER_CURRENCIES } from '../lib/pay';

type Job = Database['public']['Tables']['jobs']['Row'];
type Company = Awaited<ReturnType<typeof companiesService.getAll>>[number];
type Contact = Awaited<ReturnType<typeof contactsService.getByCompany>>[number];

export type JobFormData = Omit<Job, 'id' | 'created_at' | 'updated_at' | 'organisation_id'>;

interface JobModalProps {
  isOpen: boolean;
  job?: Job;
  // Pre-fills the company when adding a job from a company page.
  defaultCompanyId?: string;
  onClose: () => void;
  onSubmit: (data: JobFormData) => Promise<void>;
}

const INPUT = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

// Contract work is quoted as a day rate; perm and fixed-term as a salary.
const defaultPeriod = (type: EmploymentType): PayPeriod => (type === 'Contract' ? 'Day' : 'Year');

function toNumber(value: string): number | null {
  return value.trim() === '' ? null : Number(value);
}

export function JobModal({ isOpen, job, defaultCompanyId, onClose, onSubmit }: JobModalProps) {
  const [title, setTitle] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [contactId, setContactId] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('Permanent');
  const [openings, setOpenings] = useState('1');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [payPeriod, setPayPeriod] = useState<PayPeriod>('Year');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<JobStatus>('Open');
  const [description, setDescription] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    companiesService.getAll()
      .then(setCompanies)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load companies'));
  }, [isOpen]);

  useEffect(() => {
    setTitle(job?.title ?? '');
    setCompanyId(job?.company_id ?? defaultCompanyId ?? '');
    setContactId(job?.contact_id ?? '');
    setEmploymentType((job?.employment_type as EmploymentType) ?? 'Permanent');
    setOpenings(String(job?.openings ?? 1));
    setSalaryMin(job?.salary_min?.toString() ?? '');
    setSalaryMax(job?.salary_max?.toString() ?? '');
    setCurrency(job?.salary_currency ?? 'GBP');
    setPayPeriod((job?.pay_period as PayPeriod) ?? 'Year');
    setLocation(job?.location ?? '');
    setStatus((job?.status as JobStatus) ?? 'Open');
    setDescription(job?.description ?? '');
    setError('');
  }, [job, isOpen, defaultCompanyId]);

  // The hiring manager is one of the chosen company's contacts.
  useEffect(() => {
    if (!isOpen || !companyId) {
      setContacts([]);
      return;
    }
    contactsService.getByCompany(companyId)
      .then(setContacts)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load contacts'));
  }, [isOpen, companyId]);

  const handleCompanyChange = (id: string) => {
    setCompanyId(id);
    setContactId(''); // a contact from the previous company can't be this job's hiring manager
  };

  const handleTypeChange = (type: EmploymentType) => {
    setEmploymentType(type);
    setPayPeriod(defaultPeriod(type));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = toNumber(salaryMin);
    const max = toNumber(salaryMax);
    if (min !== null && max !== null && min > max) {
      setError('The lower figure is above the upper one.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const hasPay = min !== null || max !== null;
      await onSubmit({
        title,
        company_id: companyId,
        contact_id: contactId || null,
        employment_type: employmentType,
        openings: Number(openings),
        salary_min: min,
        salary_max: max,
        salary_currency: hasPay ? currency : null,
        pay_period: payPeriod,
        location: location || null,
        status,
        description: description || null,
        created_by: job?.created_by ?? null,
        assigned_to: job?.assigned_to ?? null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const payLabel = employmentType === 'Contract' ? 'Rate' : 'Salary';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {job ? 'Edit Job' : 'New Job'}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={INPUT}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <select value={companyId} onChange={(e) => handleCompanyChange(e.target.value)} required className={INPUT}>
                <option value="">Select a company…</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Manager</label>
              <select
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                disabled={!companyId}
                className={`${INPUT} disabled:bg-gray-50 disabled:text-gray-400`}
              >
                <option value="">{companyId && contacts.length === 0 ? 'No contacts at this company' : 'None'}</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.full_name}{contact.job_title ? ` — ${contact.job_title}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={employmentType} onChange={(e) => handleTypeChange(e.target.value as EmploymentType)} className={INPUT}>
                {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Openings</label>
              <input type="number" min={1} value={openings} onChange={(e) => setOpenings(e.target.value)} required className={INPUT} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as JobStatus)} className={INPUT}>
                {JOB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{payLabel}</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input
                type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)}
                className={INPUT} placeholder={employmentType === 'Contract' ? 'From, e.g. 500' : 'From, e.g. 80000'}
              />
              <input
                type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)}
                className={INPUT} placeholder={employmentType === 'Contract' ? 'To, e.g. 600' : 'To, e.g. 95000'}
              />
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={INPUT}>
                <optgroup label="Common">
                  {COMMON_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
                <optgroup label="Other">
                  {OTHER_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </optgroup>
              </select>
              <select value={payPeriod} onChange={(e) => setPayPeriod(e.target.value as PayPeriod)} className={INPUT}>
                {PAY_PERIODS.map((p) => <option key={p} value={p}>per {p.toLowerCase()}</option>)}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">Leave blank if unknown. One figure is fine.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={INPUT}
              placeholder="e.g., Berlin (hybrid)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={INPUT}
              placeholder="Job description and requirements"
              rows={4}
            />
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