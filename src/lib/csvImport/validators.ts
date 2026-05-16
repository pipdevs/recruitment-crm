// ============================================================
// CSV Import — Validation Rules
// Add new validators here. Each returns an error string or null.
// ============================================================

// Strip special characters from names
// Keeps: letters (including accented), spaces, hyphens, apostrophes
export function sanitiseName(name: string): string {
  return name.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '').trim();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Normalise date to ISO string or null
// Handles: "17 Jan 1991", "1991-01-17", "01/17/1991", "17/01/1991"
export function normaliseDate(value: string): string | null {
  if (!value?.trim()) return null;

  const cleaned = value.trim();

  // Already ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;

  // "17 Jan 1991" format
  const monthNames: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04',
    may: '05', jun: '06', jul: '07', aug: '08',
    sep: '09', oct: '10', nov: '11', dec: '12',
  };
  const monthMatch = cleaned.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (monthMatch) {
    const day = monthMatch[1].padStart(2, '0');
    const month = monthNames[monthMatch[2].toLowerCase()];
    const year = monthMatch[3];
    if (month) return `${year}-${month}-${day}`;
  }

  // DD/MM/YYYY or MM/DD/YYYY — assume DD/MM/YYYY (UK standard)
  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  return null;
}

// Validate a candidate row
export function validateCandidateRow(
  data: Record<string, string | null>
): string[] {
  const errors: string[] = [];

  if (!data.full_name?.trim()) {
    errors.push('Name is required');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push(`Invalid email: ${data.email}`);
  }

  return errors;
}

// Validate a company row
export function validateCompanyRow(
  data: Record<string, string | null>
): string[] {
  const errors: string[] = [];

  if (!data.name?.trim()) {
    errors.push('Company name is required');
  }

  return errors;
}

// Validate a contact row
export function validateContactRow(
  data: Record<string, string | null>
): string[] {
  const errors: string[] = [];

  if (!data.full_name?.trim()) {
    errors.push('Name is required');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push(`Invalid email: ${data.email}`);
  }

  return errors;
}