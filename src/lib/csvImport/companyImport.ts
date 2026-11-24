// ============================================================
// CSV Import — Company Config & Insert Logic
// ============================================================

import { supabase } from '../../lib/supabase';
import type { ImportConfig, ValidatedRow, ImportResult } from './types';
import { fetchAllRows } from './fetchAll';
import { sanitiseName } from './validators';

export const COMPANY_CONFIG: ImportConfig = {
  entityType: 'companies',
  fields: [
    { key: 'name', label: 'Company Name', required: true },
    { key: 'industry', label: 'Industry', required: false },
    { key: 'website', label: 'Website', required: false },
    { key: 'notes', label: 'Notes', required: false },
    { key: 'contact_full_name', label: 'Contact Name', required: false },
    { key: 'contact_email', label: 'Contact Email', required: false },
    { key: 'contact_phone', label: 'Contact Phone', required: false },
    { key: 'contact_job_title', label: 'Contact Job Title', required: false },
    { key: 'contact_linkedin_url', label: 'Contact Linkedin', required: false },
  ],
  columnAliases: {
    'Company': 'name',
    'Company Name': 'name',
    'Organisation': 'name',
    'Client': 'name',
    'Client Name': 'name',
    'Sector': 'industry',
    'Industry': 'industry',
    'Company Website': 'website',
    'URL': 'website',
    'Website URL': 'website',
    'Note': 'notes',
    'Notes': 'notes',
    'Contact': 'contact_full_name',
    'Contact Name': 'contact_full_name',
    'Contact Email Address': 'contact_email',
    'Contact Mobile': 'contact_phone',
    'Contact Phone Number': 'contact_phone',
    'Contact Title': 'contact_job_title',
    'Contact Position': 'contact_job_title',
    'Contact Linkedin': 'contact_linkedin_url',
    'Comments': 'notes',
  },
};

export async function insertCompanies(
  rows: ValidatedRow[],
  organisationId: string,
  userId: string,
): Promise<ImportResult> {
  const result: ImportResult = { total: rows.length, imported: 0, skipped: 0, failed: 0, errors: [] };

  const validRows = rows.filter(r => r.valid && !r.isDuplicate);
  const BATCH_SIZE = 50;
  const keyOf = (row: ValidatedRow) => row.data.name!.toLowerCase().trim();

  // 1. Resolve company ids: existing first, then create each missing company once.
  const existing = await fetchAllRows<{ id: string; name: string }>('companies', 'id, name', organisationId);
  const companyIds = new Map<string, string>();
  existing.forEach(c => companyIds.set(c.name.toLowerCase().trim(), c.id));

  const toCreate = new Map<string, ValidatedRow>();
  for (const row of validRows) {
    const key = keyOf(row);
    if (!companyIds.has(key) && !toCreate.has(key)) toCreate.set(key, row);
  }

  const createRows = [...toCreate.values()];
  for (let i = 0; i < createRows.length; i += BATCH_SIZE) {
    const batch = createRows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('companies')
      .insert(batch.map(row => ({
        name: row.data.name?.trim() || '',
        industry: row.data.industry?.trim() || null,
        website: row.data.website?.trim() || null,
        notes: row.data.notes?.trim() || null,
        organisation_id: organisationId,
        created_by: userId,
      })))
      .select('id, name');
    if (error) {
      result.errors.push({ row: batch[0].rowIndex, error: error.message });
      continue;
    }
    (data || []).forEach(c => companyIds.set(c.name.toLowerCase().trim(), c.id));
  }

  // 2. Contacts. Rows without a contact count once their company exists.
  const seenEmails = new Set<string>();
  const contactRows: ValidatedRow[] = [];
  for (const row of validRows) {
    if (!companyIds.has(keyOf(row))) { result.failed++; continue; }
    if (!row.data.contact_full_name?.trim()) { result.imported++; continue; }
    const email = row.data.contact_email?.trim().toLowerCase() || '';
    if (email && seenEmails.has(email)) { result.skipped++; continue; }
    if (email) seenEmails.add(email);
    contactRows.push(row);
  }

  for (let i = 0; i < contactRows.length; i += BATCH_SIZE) {
    const batch = contactRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('contacts').insert(batch.map(row => ({
      full_name: sanitiseName(row.data.contact_full_name || ''),
      email: row.data.contact_email?.trim().toLowerCase() || null,
      phone: row.data.contact_phone?.trim() || null,
      job_title: row.data.contact_job_title?.trim() || null,
      linkedin_url: row.data.contact_linkedin_url?.trim() || null,
      company_id: companyIds.get(keyOf(row))!,
      organisation_id: organisationId,
      created_by: userId,
    })));
    if (error) {
      result.failed += batch.length;
      result.errors.push({ row: batch[0].rowIndex, error: error.message });
    } else {
      result.imported += batch.length;
    }
  }

  result.skipped += rows.filter(r => r.isDuplicate).length;
  result.failed += rows.filter(r => !r.valid).length;
  return result;
}