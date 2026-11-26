import { useEffect, useRef, useState } from 'react';
import { Download, FileText, Trash2, Upload, Loader2 } from 'lucide-react';
import { candidateDocumentsService, type CandidateDocument } from '../services/candidateDocuments';

// The types the resumes bucket accepts.
const ACCEPT = '.pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword';

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function CandidateDocuments({ candidateId }: { candidateId: string }) {
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    candidateDocumentsService
      .getForCandidate(candidateId)
      .then(setDocuments)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load CVs'))
      .finally(() => setLoading(false));
  }, [candidateId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // so choosing the same file again still fires onChange
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const created = await candidateDocumentsService.upload(candidateId, file);
      setDocuments(docs => [created, ...docs]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document: CandidateDocument) => {
    setError('');
    try {
      window.location.assign(await candidateDocumentsService.getDownloadUrl(document));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download CV');
    }
  };

  const handleDelete = async (document: CandidateDocument) => {
    if (!confirm(`Delete ${document.file_name}? This removes the file permanently.`)) return;
    setError('');
    try {
      await candidateDocumentsService.delete(document);
      setDocuments(docs => docs.filter(d => d.id !== document.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete CV');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">CVs</h2>
        <button
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input ref={fileInput} type="file" accept={ACCEPT} onChange={handleUpload} className="hidden" />
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-gray-500">No CV on file.</p>
      ) : (
        <ul className="space-y-2">
          {documents.map(doc => (
            <li key={doc.id} className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate" title={doc.file_name}>{doc.file_name}</p>
                <p className="text-xs text-gray-500">
                  {formatSize(doc.byte_size)} · {new Date(doc.created_at).toLocaleDateString()}
                  {!doc.searchable && (
                    <span
                      className="ml-1.5 text-amber-700"
                      title="No text could be read from this file (a scan, or an old .doc), so search can't see it. Upload a text-based PDF or .docx to fix."
                    >
                      · Not searchable
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleDownload(doc)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(doc)}
                className="p-2 text-gray-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}