import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { candidateDocumentsService, type CandidateDocument } from '../services/candidateDocuments';

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function CandidateDocuments({ candidateId }: { candidateId: string }) {
  const [documents, setDocuments] = useState<CandidateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    candidateDocumentsService
      .getForCandidate(candidateId)
      .then(setDocuments)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load CVs'))
      .finally(() => setLoading(false));
  }, [candidateId]);

  const handleDownload = async (document: CandidateDocument) => {
    setError('');
    try {
      window.location.assign(await candidateDocumentsService.getDownloadUrl(document));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download CV');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">CVs</h2>
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
                </p>
              </div>
              <button
                onClick={() => handleDownload(doc)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}