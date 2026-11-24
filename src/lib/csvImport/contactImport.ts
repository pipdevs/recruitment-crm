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
    { key: 'company_name', label: 'Company Name', required: true, description: 'Must match an existing company' },
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

  // contacts.company_id is NOT NULL — resolve every company up front so an
  // unresolvable row fails on its own instead of taking its batch down with it.
  const resolved: { row: ValidatedRow; companyId: string }[] = [];
  validRows.forEach(row => {
    const companyName = row.data.company_name?.trim() || '';
    const companyId = companyMap[companyName.toLowerCase()];
    if (!companyId) {
      result.failed += 1;
      result.errors.push({
        row: row.rowIndex,
        error: companyName
          ? `Company "${companyName}" not found`
          : 'Company Name is required',
      });
      return;
    }
    resolved.push({ row, companyId });
  });

  const BATCH_SIZE = 50;

  for (let i = 0; i < resolved.length; i += BATCH_SIZE) {
    const batch = resolved.slice(i, i + BATCH_SIZE);

    const records = batch.map(({ row, companyId }) => ({
      full_name: sanitiseName(row.data.full_name || ''),
      email: row.data.email?.trim().toLowerCase() || null,
      phone: row.data.phone?.trim() || null,
      job_title: row.data.job_title?.trim() || null,
      company_id: companyId,
      organisation_id: organisationId,
      created_by: userId,
    }));

    const { error } = await supabase
      .from('contacts')
      .insert(records);

    if (!error) {
      result.imported += batch.length;
      continue;
    }

    // Batch rejected. Retry row by row so one bad row cannot discard the rest,
    // and report the failure against the row it actually came from.
    for (let j = 0; j < records.length; j++) {
      const { error: rowError } = await supabase
        .from('contacts')
        .insert(records[j]);
      if (rowError) {
        result.failed += 1;
        result.errors.push({ row: batch[j].row.rowIndex, error: rowError.message });
      } else {
        result.imported += 1;
      }
    }
  }

  result.skipped = rows.filter(r => r.isDuplicate).length;
  result.failed += rows.filter(r => !r.valid).length;

  return result;
}