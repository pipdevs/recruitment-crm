import { supabase } from '../lib/supabase';
import { getOrganisationId } from '../lib/organisation';
import type { Database } from '../lib/database.types';

type Row = Database['public']['Tables']['candidate_documents']['Row'];

export type CandidateDocument = Pick<Row, 'id' | 'file_name' | 'byte_size' | 'storage_path' | 'created_at'> & {
  // False when no usable text could be read (a scan, or legacy .doc): the file is
  // kept and downloadable, but the AI search cannot see it.
  searchable: boolean;
};

const BUCKET = 'resumes';
const DOWNLOAD_LINK_SECONDS = 60;
const COLUMNS = 'id, file_name, byte_size, storage_path, created_at, content_text';

// Exactly what the bucket accepts. The extension comes from the type, not the file name.
const EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
};

// Less text than this means extraction found nothing a search could use. The
// shortest CV text from the import is 724 characters.
const MIN_SEARCHABLE_CHARS = 200;

function toDocument(row: Pick<Row, 'id' | 'file_name' | 'byte_size' | 'storage_path' | 'created_at' | 'content_text'>): CandidateDocument {
  const { content_text, ...rest } = row;
  return { ...rest, searchable: content_text !== null };
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

// Loaded on demand so the extraction libraries stay out of the main bundle.
// Legacy .doc has no extractor and returns null.
async function extractText(mimeType: string, bytes: ArrayBuffer): Promise<string | null> {
  let text = '';
  if (mimeType === 'application/pdf') {
    const pdfjs = await import('pdfjs-dist');
    const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(bytes) });
    const pdf = await loadingTask.promise;
    const pages: string[] = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      const content = await (await pdf.getPage(n)).getTextContent();
      pages.push(content.items.map(item => ('str' in item ? item.str : '')).join(' '));
    }
    await loadingTask.destroy();
    text = pages.join('\n');
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const { default: mammoth } = await import('mammoth');
    text = (await mammoth.extractRawText({ arrayBuffer: bytes })).value;
  }
  text = text.trim();
  return text.length >= MIN_SEARCHABLE_CHARS ? text : null;
}

export const candidateDocumentsService = {
  async getForCandidate(candidateId: string): Promise<CandidateDocument[]> {
    const { data, error } = await supabase
      .from('candidate_documents')
      .select(COLUMNS)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(toDocument);
  },

  // Same path and row shape as the bulk import: {org}/{candidate}/{sha256[:16]}.{ext}.
  // Every file is kept; content_text is null when nothing usable could be read.
  async upload(candidateId: string, file: File): Promise<CandidateDocument> {
    const extension = EXTENSIONS[file.type];
    if (!extension) throw new Error('Only PDF and Word files can be uploaded');

    const organisationId = await getOrganisationId();
    const bytes = await file.arrayBuffer();
    // Hash before extracting: pdf.js takes ownership of the bytes it is given.
    const sha256 = await sha256Hex(bytes);
    const contentText = await extractText(file.type, bytes);
    const storagePath = `${organisationId}/${candidateId}/${sha256.slice(0, 16)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { contentType: file.type });
    if (uploadError) throw uploadError;

    const { data, error } = await supabase
      .from('candidate_documents')
      .insert({
        organisation_id: organisationId,
        candidate_id: candidateId,
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type,
        byte_size: file.size,
        sha256,
        content_text: contentText,
      })
      .select(COLUMNS)
      .single();
    if (error) {
      // Never leave a file in storage that no row points to.
      await supabase.storage.from(BUCKET).remove([storagePath]);
      throw error;
    }
    return toDocument(data);
  },

  // File first, then row: if the row delete fails, the CV still shows and can be
  // deleted again. The other order could leave a file behind that nothing shows.
  async delete(document: CandidateDocument): Promise<void> {
    const { data, error: storageError } = await supabase.storage.from(BUCKET).remove([document.storage_path]);
    if (storageError) throw storageError;
    if (data.length !== 1) throw new Error('CV file could not be deleted');

    const { error } = await supabase.from('candidate_documents').delete().eq('id', document.id);
    if (error) throw error;
  },

  // For deleting a candidate: removes the files. The rows go with the candidate's cascade.
  async deleteFilesForCandidate(candidateId: string): Promise<void> {
    const { data: rows, error } = await supabase
      .from('candidate_documents')
      .select('storage_path')
      .eq('candidate_id', candidateId);
    if (error) throw error;
    if (rows.length === 0) return;

    const paths = rows.map(r => r.storage_path);
    const { data, error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
    if (storageError) throw storageError;
    if (data.length !== paths.length) throw new Error('Some CV files could not be deleted');
  },

  // The bucket is private, so downloads go through a short-lived signed link
  // that also tells the browser to save the file under its original name.
  async getDownloadUrl(document: CandidateDocument): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(document.storage_path, DOWNLOAD_LINK_SECONDS, { download: document.file_name });
    if (error) throw error;
    return data.signedUrl;
  },
};