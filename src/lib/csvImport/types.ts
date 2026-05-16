// ============================================================
// CSV Import — Shared Types
// All importers use these types. Add new entity types here.
// ============================================================

export type ImportEntityType = 'candidates' | 'companies' | 'contacts';

export type ImportStatus = 'idle' | 'mapping' | 'preview' | 'importing' | 'complete';

export interface ColumnMapping {
  csvColumn: string;        // column name from the uploaded CSV
  targetField: string | null; // our DB field name, null = skip
}

export interface ImportField {
  key: string;              // DB field name
  label: string;            // human readable label
  required: boolean;
  description?: string;
}

export interface ParsedRow {
  rowIndex: number;
  raw: Record<string, string>;  // original CSV row
  mapped: Record<string, string | null>; // after column mapping applied
}

export interface ValidatedRow {
  rowIndex: number;
  data: Record<string, string | null>;
  valid: boolean;
  errors: string[];
  isDuplicate: boolean;
}

export interface ImportResult {
  total: number;
  imported: number;
  skipped: number;       // duplicates
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export interface ImportConfig {
  entityType: ImportEntityType;
  fields: ImportField[];
  // Maps common CSV column name variations to our field keys
  columnAliases: Record<string, string>;
}