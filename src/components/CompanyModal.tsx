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
    data: Database['public']['Tables']['candidates']['Insert']
  ) => Promise<void>;
}

export function CandidateModal({ isOpen, candidate, onClose, onSubmit }: CandidateModalProps) {
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
      setEmail(candidate.email || '');
      setPhone(candidate.phone || '');
      setLinkedinUrl(candidate.linkedin_url || '');
      setResumeUrl(candidate.resume_url || '');
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
    setError('');
    setLoading(true);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {candidate ? 'Edit Candidate' : 'New Candidate'}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM JSX UNCHANGED */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* inputs unchanged */}
        </form>
      </div>
    </div>
  );
}
