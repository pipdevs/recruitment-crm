import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Building2, Star, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { contactsService } from '../services/contacts';
import { ContactModal } from '../components/ContactModal';
import type { Database } from '../lib/database.types';

type Contact = Database['public']['Tables']['contacts']['Row'] & {
  company?: { id: string; name: string } | null;
};

export function Contacts() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await contactsService.getAll();
      setContacts(data as Contact[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    const created = await contactsService.create({ ...data, created_by: user?.id || null });
    setContacts([created as Contact, ...contacts]);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedContact) return;
    const updated = await contactsService.update(selectedContact.id, data);
    setContacts(contacts.map(c => c.id === updated.id ? updated as Contact : c));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    await contactsService.delete(id);
    setContacts(contacts.filter(c => c.id !== id));
  };

  const filtered = contacts.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contacts</h1>
          <p className="text-gray-600">People at your client companies</p>
        </div>
        <button
          onClick={() => { setSelectedContact(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Contact
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4 inline-block">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contacts Yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Add contacts to track the people you work with at client companies.
          </p>
          <button
            onClick={() => { setSelectedContact(null); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((contact) => (
            <div key={contact.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-700 font-semibold text-sm">
                      {contact.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-gray-900 text-sm">{contact.full_name}</h3>
                      {contact.is_primary && (
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    {contact.job_title && (
                      <p className="text-xs text-gray-500">{contact.job_title}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { setSelectedContact(contact); setShowModal(true); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {contact.company && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
                  <Building2 className="w-3.5 h-3.5" />
                  {contact.company.name}
                </div>
              )}

              <div className="space-y-1.5 mt-3">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                    <Mail className="w-3.5 h-3.5" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5" />
                    {contact.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ContactModal
          contact={selectedContact}
          onSubmit={selectedContact ? handleUpdate : handleCreate}
          onClose={() => { setShowModal(false); setSelectedContact(null); }}
        />
      )}
    </div>
  );
}