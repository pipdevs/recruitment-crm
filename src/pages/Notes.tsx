import { useState, useEffect } from 'react';
import { StickyNote, Trash2, Building2, Users, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CandidatePicker } from '../components/CandidatePicker';
import { supabase } from '../lib/supabase';
import { activitiesService, type EntityType } from '../services/activities';

interface Note {
  id: string;
  content: string;
  entity_type: string;
  entity_id: string;
  created_at: string | null;
  creator: { full_name: string } | null;
  entity_name?: string;
}

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  candidate: <Users className="w-4 h-4" />,
  company: <Building2 className="w-4 h-4" />,
  job: <Briefcase className="w-4 h-4" />,
};

const ENTITY_COLORS: Record<string, string> = {
  candidate: 'bg-blue-100 text-blue-700',
  company: 'bg-green-100 text-green-700',
  job: 'bg-orange-100 text-orange-700',
};

type NoteRow = Awaited<ReturnType<typeof activitiesService.getAllNotes>>[number];

// A note links to exactly one record; take whichever link is set.
function toNote(row: NoteRow): Note {
  const [entity_type, entity_id, entity_name]: [EntityType, string, string] =
    row.candidate ? ['candidate', row.candidate.id, row.candidate.full_name]
    : row.company ? ['company', row.company.id, row.company.name]
    : ['job', row.job!.id, row.job!.title];
  return {
    id: row.id,
    content: row.message,
    entity_type,
    entity_id,
    entity_name,
    created_at: row.occurred_at,
    creator: row.author,
  };
}

export function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'candidate' | 'company' | 'job'>('all');
  const [newNote, setNewNote] = useState('');
  const [entityType, setEntityType] = useState<'candidate' | 'company' | 'job'>('candidate');
  const [entityId, setEntityId] = useState('');
  const [entities, setEntities] = useState<any[]>([]);
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [filterType]);

  useEffect(() => {
    setEntityId('');
    setEntities([]);
    if (entityType !== 'candidate') loadEntities(entityType);
  }, [entityType]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await activitiesService.getAllNotes(filterType === 'all' ? undefined : filterType);
      setNotes(data.map(toNote));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const loadEntities = async (type: 'company' | 'job') => {
    try {
      let data: any[] = [];
      if (type === 'company') {
        const res = await supabase.from('companies').select('id, name').order('name');
        data = res.data || [];
      } else {
        const res = await supabase.from('jobs').select('id, title').order('title');
        data = res.data || [];
      }
      setEntities(data);
    } catch (err) {
      console.error('Failed to load entities:', err);
    }
  };

  const getEntityLabel = (entity: any) => {
    if (entityType === 'candidate') return entity.full_name;
    if (entityType === 'company') return entity.name;
    return entity.title;
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !entityId || !user) return;
    setAddingNote(true);
    try {
      await activitiesService.createNote(entityType, entityId, newNote, user.id);
      setNewNote('');
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await activitiesService.deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notes</h1>
        <p className="text-gray-600">All notes across candidates, companies and jobs</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Add Note Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="candidate">Candidate</option>
              <option value="company">Company</option>
              <option value="job">Job</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
            </label>
            {entityType === 'candidate' ? (
              <CandidatePicker value={entityId} onChange={setEntityId} />
            ) : (
              <select
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select...</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>{getEntityLabel(e)}</option>
                ))}
              </select>
            )}
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write your note..."
              rows={1}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleAddNote}
          disabled={!newNote.trim() || !entityId || addingNote}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          {addingNote ? 'Adding...' : 'Add Note'}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-6">
        {(['all', 'candidate', 'company', 'job'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Notes Feed */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-600 mx-auto"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-yellow-100 p-4 rounded-full mb-4 inline-block">
            <StickyNote className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notes Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Add notes to candidates, companies, or jobs to keep important information organised.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ENTITY_COLORS[note.entity_type]}`}>
                    {ENTITY_ICONS[note.entity_type]}
                    {note.entity_name}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{note.entity_type}</span>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-800 text-sm leading-relaxed mb-3">{note.content}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{note.creator?.full_name || 'Unknown'}</span>
                <span>·</span>
                <span>{note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}