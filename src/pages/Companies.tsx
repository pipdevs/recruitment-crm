import { useState, useEffect } from 'react';
import { Building2, Edit2, Trash2, Plus, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CompanyModal } from '../components/CompanyModal';
import { companiesService } from '../services/companies';
import { ActivityPanel } from '../components/ActivityPanel';
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

  const handleCreate = async (data: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newCompany = await companiesService.create({
        ...data,
        created_by: user?.id || undefined,
      });
      setCompanies([newCompany, ...companies]);
      setModalOpen(false);
    } catch (err) {
      throw err;
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
  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-700 font-medium">
        ← Back to Companies
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — company info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-700 font-bold text-xl">
                  {company.name.charAt(0).toUpperCase()}
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

            <h1 className="text-xl font-bold text-gray-900 mb-4">{company.name}</h1>

            <div className="space-y-3 text-sm">
              {company.industry && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Industry</p>
                  <p className="font-medium text-gray-900">{company.industry}</p>
                </div>
              )}
              {company.website && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Website</p>
                  <a href={company.website} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all">
                    {company.website}
                  </a>
                </div>
              )}
              {company.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Notes</p>
                  <p className="text-gray-700">{company.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — tabbed activity panel */}
        <div className="lg:col-span-2">
          <ActivityPanel
            entityType="company"
            entityId={company.id}
            addNote={(content, userId) => companiesService.addNote(company.id, content, userId)}
            getNotes={(id) => companiesService.getNotes(id)}
            deleteNote={(noteId) => companiesService.deleteNote(noteId)}
          />
        </div>
      </div>
    </div>
  );
}
