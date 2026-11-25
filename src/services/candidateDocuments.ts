import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type CandidateDocument = Pick<
  Database['public']['Tables']['candidate_documents']['Row'],
  'id' | 'file_name' | 'byte_size' | 'storage_path' | 'created_at'
>;

const BUCKET = 'resumes';
const DOWNLOAD_LINK_SECONDS = 60;

export const candidateDocumentsService = {
  async getForCandidate(candidateId: string): Promise<CandidateDocument[]> {
    const { data, error } = await supabase
      .from('candidate_documents')
      .select('id, file_name, byte_size, storage_path, created_at')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
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