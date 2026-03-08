import { Edit2, Trash2, Mail, Phone, Linkedin } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Candidate = Database['public']['Tables']['candidates']['Row'];
type CandidateStatus = Candidate['status'];

const STATUS_COLUMNS: CandidateStatus[] = ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-gray-50 border-gray-200',
  Screening: 'bg-blue-50 border-blue-200',
  Interview: 'bg-purple-50 border-purple-200',
  Offer: 'bg-green-50 border-green-200',
  Hired: 'bg-emerald-50 border-emerald-200',
  Rejected: 'bg-red-50 border-red-200',
};

interface PipelineViewProps {
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
}

export function PipelineView({ candidates, onCandidateClick, onEdit, onDelete }: PipelineViewProps) {
  const getCandidatesByStatus = (status: CandidateStatus) => {
    return candidates.filter(c => c.status === status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUS_COLUMNS.map((status) => {
        const statusCandidates = getCandidatesByStatus(status);
        return (
          <div
            key={status}
            className={`flex-shrink-0 w-80 rounded-xl border-2 ${status ? STATUS_COLORS[status] : ''} p-4`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{status}</h3>
              <span className="text-sm text-gray-600">
                {statusCandidates.length}
              </span>
            </div>
            <div className="space-y-3">
              {statusCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onCandidateClick(candidate)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {candidate.full_name}
                    </h4>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(candidate);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(candidate.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    {candidate.email && (
                      <a
                        href={`mailto:${candidate.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 hover:text-gray-900 transition-colors truncate"
                      >
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{candidate.email}</span>
                      </a>
                    )}
                    {candidate.phone && (
                      <a
                        href={`tel:${candidate.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        {candidate.phone}
                      </a>
                    )}
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                      >
                        <Linkedin className="w-3.5 h-3.5 flex-shrink-0" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {statusCandidates.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-500">
                  No candidates
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
