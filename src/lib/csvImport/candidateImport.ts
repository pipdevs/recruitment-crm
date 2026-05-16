// ============================================================
// CSV Import — Candidate Config & Insert Logic
// ============================================================

import { supabase } from '../../lib/supabase';
import { sanitiseName } from './validators';
import type { ImportConfig, ValidatedRow, ImportResult } from './types';

export const CANDIDATE_CONFIG: ImportConfig = {
  entityType: 'candidates',
  fields: [
    { key: 'full_name', label: 'Full Name', required: true, description: 'First and last name' },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'linkedin_url', label: 'LinkedIn URL', required: false },
    { key: 'status', label: 'Status', required: false, description: 'New, Screening, Interview, Offer, Hired, Rejected' },
  ],
  columnAliases: {
    // Name variations
    'First Name': 'full_name',
    'FirstName': 'full_name',
    'Last Name': 'full_name',
    'LastName': 'full_name',
    'Name': 'full_name',
    'Candidate Name': 'full_name',
    'Full Name': 'full_name',
    // Email
    'Email Address': 'email',
    'E-mail': 'email',
    'Email': 'email',
    // Phone
    'Mobile': 'phone',
    'Contact Number': 'phone',
    'Phone Number': 'phone',
    'Tel': 'phone',
    'Telephone': 'phone',
    // LinkedIn
    'LinkedIn': 'linkedin_url',
    'LinkedIn URL': 'linkedin_url',
    'Linkedin Profile URL': 'linkedin_url',
    'LinkedIn Profile': 'linkedin_url',
    // Status
    'Stage': 'status',
    'Pipeline Stage': 'status',
    'Status': 'status',
  },
};

const VALID_STATUSES = ['New', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export async function insertCandidates(
  rows: ValidatedRow[],
  organisationId: string,
  userId: string,
): Promise<ImportResult> {
  const result: ImportResult = {
    total: rows.length,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  const validRows = rows.filter(r => r.valid && !r.isDuplicate);
  const BATCH_SIZE = 50;

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);

    const records = batch.map(row => ({
      full_name: sanitiseName(row.data.full_name || ''),
      email: row.data.email?.trim().toLowerCase() || null,
      phone: row.data.phone?.trim() || null,
      linkedin_url: row.data.linkedin_url?.trim() || null,
      status: VALID_STATUSES.includes(row.data.status || '')
        ? row.data.status
        : 'New',
      organisation_id: organisationId,
      created_by: userId,
    }));

    const { error } = await supabase
      .from('candidates')
      .insert(records);

    if (error) {
      result.failed += batch.length;
      result.errors.push({
        row: i,
        error: error.message,
      });
    } else {
      result.imported += batch.length;
    }
  }

  result.skipped = rows.filter(r => r.isDuplicate).length;
  result.failed += rows.filter(r => !r.valid).length;

  return result;
}