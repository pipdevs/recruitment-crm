import { supabase } from '../supabase';

// Keep PAGE_SIZE at or below the project's "Max rows" API setting.
const PAGE_SIZE = 1000;

export async function fetchAllRows<T>(
  table: 'candidates' | 'companies' | 'contacts',
  columns: string,
  organisationId: string,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .eq('organisation_id', organisationId)
      .order('id')
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as unknown as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}