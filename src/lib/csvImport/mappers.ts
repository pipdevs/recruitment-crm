// ============================================================
// CSV Import — Column Auto-Detection
// Add new aliases here when supporting new column name variants
// ============================================================

import type { ColumnMapping, ImportConfig } from './types';

// Normalise a column name for fuzzy matching
// "LinkedIn Profile URL" → "linkedinprofileurl"
export function normaliseColumnName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Given CSV headers and an import config, auto-detect mappings
export function autoDetectMappings(
  csvHeaders: string[],
  config: ImportConfig
): ColumnMapping[] {
  return csvHeaders.map(header => {
    const normalised = normaliseColumnName(header);

    // Check direct field key match first
    const directMatch = config.fields.find(
      f => normaliseColumnName(f.key) === normalised
    );
    if (directMatch) {
      return { csvColumn: header, targetField: directMatch.key };
    }

    // Check aliases
    for (const [alias, fieldKey] of Object.entries(config.columnAliases)) {
      if (normaliseColumnName(alias) === normalised) {
        return { csvColumn: header, targetField: fieldKey };
      }
    }

    // No match found — user will need to map manually or skip
    return { csvColumn: header, targetField: null };
  });
}

// Apply mappings to a raw CSV row to produce a mapped record
export function applyMappings(
  raw: Record<string, string>,
  mappings: ColumnMapping[]
): Record<string, string | null> {
  const result: Record<string, string | null> = {};

  for (const mapping of mappings) {
    if (!mapping.targetField) continue;
    const value = raw[mapping.csvColumn]?.trim() || null;
    
    // If field already has a value (e.g. first_name set, now last_name comes)
    // concatenate with a space (handles First Name + Last Name → full_name)
    if (mapping.targetField in result && result[mapping.targetField]) {
      result[mapping.targetField] = `${result[mapping.targetField]} ${value}`;
    } else {
      result[mapping.targetField] = value;
    }
  }

  return result;
}