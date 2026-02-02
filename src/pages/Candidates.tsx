import { useState, useEffect } from 'react';
import { Users, Edit2, Trash2, Plus, Mail, Phone, Linkedin, List, Columns } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CandidateModal } from '../components/CandidateModal';
import { PipelineView } from '../components/PipelineView';
import { ActivityFeed } from '../components/ActivityFeed';
import { candidatesService } from '../services/candidates';
import { activitiesService } from '../services/activities';
import type { Database } from '../lib/database.types';

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
    try {
      const newCandidate = await candidatesService.create({
        ...data,
        created_by: user?.id || null,
      });
      setCandidates([newCandidate, ...candidates]);
      setModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (data: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedCandidate) return;
    try {
      const updated = await candidatesService.update(selectedCandidate.id, data);
      setCandidates(candidates.map(c => c.id === updated.id ? updated : c));
      setSelectedCandidate(updated);
      setModalOpen(false);
    } catch (err) {
      throw err;
    }
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
            const updated = await candidatesService.updateStatus(selectedCandidate.id, status);
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
          <button
            onClick={() => {
              setSelectedCandidate(undefined);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Candidate
          </button>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[candidate.status]}`}>
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
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await candidatesService.getNotes(candidate.id);
      setNotes(data || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    setAddingNote(true);
    try {
      await candidatesService.addNote(candidate.id, newNote, user.id);
      await activitiesService.createNote('candidate', candidate.id, newNote, user.id);
      setNewNote('');
      await loadNotes();
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await candidatesService.deleteNote(noteId);
      await loadNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleStatusChange = async (newStatus: typeof STATUSES[number]) => {
    setStatusUpdating(true);
    try {
      if (user) {
        await activitiesService.createStageMove(
          'candidate',
          candidate.id,
          candidate.status,
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
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Candidates
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{candidate.full_name}</h1>
              <div className="flex gap-2">
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pipeline Status
              </label>
              <select
                value={candidate.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                disabled={statusUpdating}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${STATUS_COLORS[candidate.status]} font-medium`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {candidate.email && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <a
                    href={`mailto:${candidate.email}`}
                    className="text-blue-600 hover:text-blue-700 break-all"
                  >
                    {candidate.email}
                  </a>
                </div>
              )}

              {candidate.phone && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <a
                    href={`tel:${candidate.phone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {candidate.phone}
                  </a>
                </div>
              )}

              {candidate.linkedin_url && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">LinkedIn</p>
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 break-all"
                  >
                    View Profile
                  </a>
                </div>
              )}

              {candidate.resume_url && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resume</p>
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Timeline</h2>
            <ActivityFeed entityType="candidate" entityId={candidate.id} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Notes</h2>

          <div className="space-y-3 mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={3}
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || addingNote}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {addingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-600 font-medium">
                      {note.creator?.full_name || 'Unknown'}
                    </p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}