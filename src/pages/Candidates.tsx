import { useState, useEffect } from 'react';
import { Users, Edit2, Trash2, Plus, Mail, Phone, Linkedin, List, Columns } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CandidateModal } from '../components/CandidateModal';
import { PipelineView } from '../components/PipelineView';
import { candidatesService } from '../services/candidates';
import { activitiesService } from '../services/activities';
import type { Database } from '../lib/database.types';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { ActivityPanel } from '../components/ActivityPanel';

type Candidate = Database['public']['Tables']['candidates']['Row'];

interface CandidatesPageState {
  view: 'list' | 'detail';
  selectedId?: string;
}

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-gray-100 text-gray-800',
  Screening: 'bg-blue-100 text-blue-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Hired: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

export function Candidates() {
  const { user } = useAuth();
  const [state, setState] = useState<CandidatesPageState>({ view: 'list' });
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const limits = usePlanLimits();

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const data = await candidatesService.getAll();
      setCandidates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

const handleCreate = async (data: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) => {
    const newCandidate = await candidatesService.create({
      ...data,
      created_by: user?.id || null,
    });
    setCandidates([newCandidate, ...candidates]);
    setModalOpen(false);
  };

const handleUpdate = async (data: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedCandidate) return;
    const updated = await candidatesService.update(selectedCandidate.id, data);
    setCandidates(candidates.map(c => c.id === updated.id ? updated : c));
    setSelectedCandidate(updated);
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    try {
      await candidatesService.delete(id);
      setCandidates(candidates.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete candidate');
    }
  };

  const openCandidateDetail = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setState({ view: 'detail', selectedId: candidate.id });
  };

  const handleEditClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setModalOpen(true);
  };

  if (state.view === 'detail' && selectedCandidate) {
    return (
      <CandidateDetail
        candidate={selectedCandidate}
        onBack={() => {
          setState({ view: 'list' });
          loadCandidates();
        }}
        onEdit={() => handleEditClick(selectedCandidate)}
        onDelete={() => {
          handleDelete(selectedCandidate.id);
          setState({ view: 'list' });
        }}
        onStatusChange={async (status) => {
          try {
            const updated = await candidatesService.updateStatus(selectedCandidate.id, status ?? 'New');
            setCandidates(candidates.map(c => c.id === updated.id ? updated : c));
            setSelectedCandidate(updated);
          } catch (err) {
            console.error('Failed to update status:', err);
          }
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates</h1>
          <p className="text-gray-600">Manage your candidate pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'pipeline'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Columns className="w-4 h-4" />
              Pipeline
            </button>
          </div>
          {limits.candidates.reached ? (
          <UpgradePrompt
            compact
            title={`Free plan limit reached (${limits.candidates.max} candidates)`}
            description=""
          />
        ) : (
          <button
            onClick={() => { setSelectedCandidate(undefined); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Candidate
          </button>
        )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Start building your candidate database by adding new candidates to your pipeline.
            </p>
          </div>
        </div>
      ) : viewMode === 'pipeline' ? (
        <PipelineView
          candidates={candidates}
          onCandidateClick={openCandidateDetail}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      ) : (
        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openCandidateDetail(candidate)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {candidate.full_name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.status ? STATUS_COLORS[candidate.status] : ''}`}>
                      {candidate.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {candidate.email && (
                      <a
                        href={`mailto:${candidate.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {candidate.email}
                      </a>
                    )}
                    {candidate.phone && (
                      <a
                        href={`tel:${candidate.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        {candidate.phone}
                      </a>
                    )}
                    {candidate.linkedin_url && (
                      <a
                        href={candidate.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(candidate);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(candidate.id);
                    }}
                    className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CandidateModal
        isOpen={modalOpen}
        candidate={selectedCandidate}
        onClose={() => {
          setModalOpen(false);
          setSelectedCandidate(undefined);
        }}
        onSubmit={selectedCandidate ? handleUpdate : handleCreate}
      />
    </div>
  );
}

interface CandidateDetailProps {
  candidate: Candidate;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Candidate['status']) => Promise<void>;
}

const STATUSES = ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'] as const;

function CandidateDetail({ candidate, onBack, onEdit, onDelete, onStatusChange }: CandidateDetailProps) {
  const { user } = useAuth();
  const [statusUpdating, setStatusUpdating] = useState(false);

  const handleStatusChange = async (newStatus: typeof STATUSES[number]) => {
    setStatusUpdating(true);
    try {
      if (user) {
        await activitiesService.createStageMove(
          'candidate',
          candidate.id,
          candidate.status ?? 'New',
          newStatus,
          user.id
        );
      }
      await onStatusChange(newStatus as any);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-700 font-medium">
        ← Back to Candidates
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — profile info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold text-xl">
                  {candidate.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={onEdit} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={onDelete} className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-1">{candidate.full_name}</h1>

            <div className="mb-4">
              <select
                value={candidate.status ?? 'New'}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                disabled={statusUpdating}
                className={`w-full px-3 py-2 border-0 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 ${candidate.status ? STATUS_COLORS[candidate.status] : ''}`}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-3 text-sm">
              {candidate.email && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline break-all">
                    {candidate.email}
                  </a>
                </div>
              )}
              {candidate.phone && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <a href={`tel:${candidate.phone}`} className="text-blue-600 hover:underline">
                    {candidate.phone}
                  </a>
                </div>
              )}
              {candidate.linkedin_url && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">LinkedIn</p>
                  <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Profile
                  </a>
                </div>
              )}
              {candidate.resume_url && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Resume</p>
                  <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — tabbed activity panel */}
        <div className="lg:col-span-2">
          <ActivityPanel
            entityType="candidate"
            entityId={candidate.id}
            addNote={(content, userId) => candidatesService.addNote(candidate.id, content, userId)}
            getNotes={(id) => candidatesService.getNotes(id)}
            deleteNote={(noteId) => candidatesService.deleteNote(noteId)}
          />
        </div>
      </div>
    </div>
  );
}