// ============================================================
// CSV Import — Contact Config & Insert Logic
// ============================================================

import { supabase } from '../../lib/supabase';
import { sanitiseName } from './validators';
import type { ImportConfig, ValidatedRow, ImportResult } from './types';

export const CONTACT_CONFIG: ImportConfig = {
  entityType: 'contacts',
  fields: [
    { key: 'full_name', label: 'Full Name', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'job_title', label: 'Job Title', required: false },
    { key: 'company_name', label: 'Company Name', required: false, description: 'Must match an existing company' },
  ],
  columnAliases: {
    'First Name': 'full_name',
    'Last Name': 'full_name',
    'Name': 'full_name',
    'Contact Name': 'full_name',
    'Full Name': 'full_name',
    'Contact First Name': 'full_name',
    'Contact Last Name': 'full_name',
    'Email Address': 'email',
    'Contact Email': 'email',
    'E-mail': 'email',
    'Mobile': 'phone',
    'Contact Number': 'phone',
    'Phone Number': 'phone',
    'Contact Phone Number': 'phone',
    'Title': 'job_title',
    'Position': 'job_title',
    'Designation': 'job_title',
    'Contact Designation': 'job_title',
    'Job Title': 'job_title',
    'Company': 'company_name',
    'Company Name': 'company_name',
    'Organisation': 'company_name',
    'Employer': 'company_name',
  },
};

export async function insertContacts(
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

  // Pre-fetch all companies in this org to resolve company names to IDs
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('organisation_id', organisationId);

  const companyMap: Record<string, string> = {};
  (companies || []).forEach(c => {
    companyMap[c.name.toLowerCase().trim()] = c.id;
  });

  const validRows = rows.filter(r => r.valid && !r.isDuplicate);
  const BATCH_SIZE = 50;

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);

    const records = batch.map(row => {
      const companyName = row.data.company_name?.toLowerCase().trim() || '';
      const companyId = companyMap[companyName] || null;

      return {
        full_name: sanitiseName(row.data.full_name || ''),
        email: row.data.email?.trim().toLowerCase() || null,
        phone: row.data.phone?.trim() || null,
        job_title: row.data.job_title?.trim() || null,
        company_id: companyId,
        organisation_id: organisationId,
        created_by: userId,
      };
    });

    const { error } = await supabase
      .from('contacts')
      .insert(records);

    if (error) {
      result.failed += batch.length;
      result.errors.push({ row: i, error: error.message });
    } else {
      result.imported += batch.length;
    }
  }

  result.skipped = rows.filter(r => r.isDuplicate).length;
  result.failed += rows.filter(r => !r.valid).length;

  return result;
}