import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Database, CandidateStatus } from '../lib/database.types';

type Candidate = Database['public']['Tables']['candidates']['Row'];

const STATUSES: CandidateStatus[] = [
  'New',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
];

interface CandidateModalProps {
  isOpen: boolean;
  candidate?: Candidate;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      Database['public']['Tables']['candidates']['Insert'],
      'id' | 'created_by' | 'created_at' | 'updated_at'
    >
  ) => Promise<void>;
}

export function CandidateModal({
  isOpen,
  candidate,
  onClose,
  onSubmit,
}: CandidateModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [status, setStatus] = useState<CandidateStatus>('New');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (candidate) {
      setFullName(candidate.full_name);
      setEmail(candidate.email ?? '');
      setPhone(candidate.phone ?? '');
      setLinkedinUrl(candidate.linkedin_url ?? '');
      setResumeUrl(candidate.resume_url ?? '');
      setStatus(candidate.status);
    } else {
      setFullName('');
      setEmail('');
      setPhone('');
      setLinkedinUrl('');
      setResumeUrl('');
      setStatus('New');
    }
    setError('');
  }, [candidate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit({
        full_name: fullName,
        email: email || null,
        phone: phone || null,
        linkedin_url: linkedinUrl || null,
        resume_url: resumeUrl || null,
        status,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save candidate');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {candidate ? 'Edit Candidate' : 'New Candidate'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            required
            className="w-full input"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full input"
          />

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="w-full input"
          />

          <input
            type="url"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="LinkedIn URL"
            className="w-full input"
          />

          <input
            type="url"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="Resume URL"
            className="w-full input"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CandidateStatus)}
            className="w-full input"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
