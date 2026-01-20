import { useState, useEffect } from 'react';
import { Building2, Edit2, Trash2, Plus, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CompanyModal } from '../components/CompanyModal';
import { companiesService } from '../services/companies';
import type { Database } from '../lib/database.types';

type Company = Database['public']['Tables']['companies']['Row'];

interface CompaniesPageState {
  view: 'list' | 'detail';
  selectedId?: string;
}

export function Companies() {
  const { user } = useAuth();
  const [state, setState] = useState<CompaniesPageState>({ view: 'list' });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companiesService.getAll();
      setCompanies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (
    data: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'created_by'>
    ) => {
  try {
    // Only include the fields from the form
    const insertData = {
      name: data.name,
      industry: data.industry,
      website: data.website,
      notes: data.notes,
    };

    const newCompany = await companiesService.create(insertData);

    setCompanies([newCompany, ...companies]);
    setModalOpen(false);
  } catch (err) {
    console.error('Failed to create company:', err);
    throw err; // this will be caught in the modal and displayed
  }
};



  const handleUpdate = async (data: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedCompany) return;
    try {
      const updated = await companiesService.update(selectedCompany.id, data);
      setCompanies(companies.map(c => c.id === updated.id ? updated : c));
      setSelectedCompany(updated);
      setModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    try {
      await companiesService.delete(id);
      setCompanies(companies.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
    }
  };

  const openCompanyDetail = async (company: Company) => {
    setSelectedCompany(company);
    setState({ view: 'detail', selectedId: company.id });
  };

  const handleEditClick = (company: Company) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };

  if (state.view === 'detail' && selectedCompany) {
    return (
      <CompanyDetail
        company={selectedCompany}
        onBack={() => {
          setState({ view: 'list' });
          loadCompanies();
        }}
        onEdit={() => handleEditClick(selectedCompany)}
        onDelete={() => {
          handleDelete(selectedCompany.id);
          setState({ view: 'list' });
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies</h1>
          <p className="text-gray-600">Manage your company database</p>
        </div>
        <button
          onClick={() => {
            setSelectedCompany(undefined);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Company
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {companies.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Companies Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Add companies to track your clients and prospects.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openCompanyDetail(company)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {company.name}
                  </h3>
                  {company.industry && (
                    <p className="text-sm text-gray-600 mb-2">{company.industry}</p>
                  )}
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Visit website
                    </a>
                  )}
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(company);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(company.id);
                    }}
                    className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {company.notes && (
                <p className="text-sm text-gray-600 line-clamp-2">{company.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <CompanyModal
        isOpen={modalOpen}
        company={selectedCompany}
        onClose={() => {
          setModalOpen(false);
          setSelectedCompany(undefined);
        }}
        onSubmit={selectedCompany ? handleUpdate : handleCreate}
      />
    </div>
  );
}

interface CompanyDetailProps {
  company: Company;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function CompanyDetail({ company, onBack, onEdit, onDelete }: CompanyDetailProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await companiesService.getNotes(company.id);
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
      await companiesService.addNote(company.id, newNote, user.id);
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
      await companiesService.deleteNote(noteId);
      await loadNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  return (
    <div className="p-8">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to Companies
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
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

            {company.industry && (
              <p className="text-gray-600 mb-3">Industry: <span className="font-medium">{company.industry}</span></p>
            )}

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3"
              >
                <LinkIcon className="w-4 h-4" />
                {company.website}
              </a>
            )}

            {company.notes && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700">{company.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-gray-900">Company created</p>
                  <p className="text-sm text-gray-500">
                    {new Date(company.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {company.updated_at !== company.created_at && (
                <div className="flex gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Last updated</p>
                    <p className="text-sm text-gray-500">
                      {new Date(company.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
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
