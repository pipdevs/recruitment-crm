// ============================================================
// CSV Import — Company Config & Insert Logic
// ============================================================

import { supabase } from '../../lib/supabase';
import type { ImportConfig, ValidatedRow, ImportResult } from './types';

export const COMPANY_CONFIG: ImportConfig = {
  entityType: 'companies',
  fields: [
    { key: 'name', label: 'Company Name', required: true },
    { key: 'industry', label: 'Industry', required: false },
    { key: 'website', label: 'Website', required: false },
    { key: 'notes', label: 'Notes', required: false },
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
    'Comments': 'notes',
  },
};

export async function insertCompanies(
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
      name: row.data.name?.trim() || '',
      industry: row.data.industry?.trim() || null,
      website: row.data.website?.trim() || null,
      notes: row.data.notes?.trim() || null,
      organisation_id: organisationId,
      created_by: userId,
    }));

    const { error } = await supabase
      .from('companies')
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