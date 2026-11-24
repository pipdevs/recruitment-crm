import { useState, useEffect } from 'react';
import { Plus, Mail, Phone, Star, Pencil, Trash2, Linkedin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { contactsService } from '../services/contacts';
import { ContactModal } from './ContactModal';
import type { Database } from '../lib/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];

export function CompanyContacts({ companyId }: { companyId: string }) {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);

  useEffect(() => { load(); }, [companyId]);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      setContacts(await contactsService.getByCompany(companyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ContactInsert) => {
    if (selected) {
      await contactsService.update(selected.id, data);
    } else {
      await contactsService.create({ ...data, created_by: user?.id || null });
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    await contactsService.delete(id);
    await load();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Contacts</h2>
        <button
          onClick={() => { setSelected(null); setModalOpen(true); }}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-gray-500">No contacts yet.</p>
      ) : (
        <ul className="space-y-4">
          {contacts.map((c) => (
            <li key={c.id} className="text-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-900">{c.full_name}</span>
                    {c.is_primary && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                  </div>
                  {c.job_title && <p className="text-xs text-gray-500">{c.job_title}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelected(c); setModalOpen(true); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-1 space-y-1">
                {c.email && (
                  <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                    <Mail className="w-3.5 h-3.5" /> {c.email}
                  </a>
                )}
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5" /> {c.phone}
                  </a>
                )}
                {c.linkedin_url && (
                  <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <ContactModal
          contact={selected}
          preselectedCompanyId={companyId}
          onSubmit={handleSubmit}
          onClose={() => { setModalOpen(false); setSelected(null); }}
        />
      )}
    </div>
  );
}