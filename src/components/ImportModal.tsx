import { useState, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import {
  X, Upload, ChevronRight, ChevronDown,
  CheckCircle, AlertCircle, SkipForward, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  autoDetectMappings, applyMappings,
  validateCandidateRow, validateCompanyRow, validateContactRow,
  sanitiseName, isValidEmail,
  CANDIDATE_CONFIG, COMPANY_CONFIG, CONTACT_CONFIG,
  insertCandidates, insertCompanies, insertContacts,
} from '../lib/csvImport';
import type {
  ImportEntityType, ImportStatus, ColumnMapping,
  ParsedRow, ValidatedRow, ImportResult, ImportConfig,
} from '../lib/csvImport';

const MAX_ROWS = 10000;
const MAX_FILE_SIZE_MB = 5;

const CONFIGS: Record<ImportEntityType, ImportConfig> = {
  candidates: CANDIDATE_CONFIG,
  companies: COMPANY_CONFIG,
  contacts: CONTACT_CONFIG,
};

const TEMPLATES: Record<ImportEntityType, string> = {
  candidates: 'full_name,email,phone,linkedin_url,status\nJane Smith,jane@example.com,07700900000,https://linkedin.com/in/jane,New',
  companies: 'name,industry,website,notes\nAcme Ltd,Technology,https://acme.com,Key client',
  contacts: 'full_name,email,phone,job_title,company_name\nJohn Doe,john@acme.com,07700900001,Head of Talent,Acme Ltd',
};

interface ImportModalProps {
  entityType: ImportEntityType;
  onClose: () => void;
  onComplete: () => void;
}

export function ImportModal({ entityType, onClose, onComplete }: ImportModalProps) {
  const { user, organisation } = useAuth();
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parseError, setParseError] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = CONFIGS[entityType];

  const downloadTemplate = () => {
    const content = TEMPLATES[entityType];
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rectocrm_${entityType}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const processFile = useCallback((file: File) => {
    setParseError('');

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('Please upload a CSV file (.csv)');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setParseError(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<Record<string, string>>) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setParseError('Could not parse CSV file. Please check the format.');
          return;
        }

        const rows = results.data as Record<string, string>[];

        if (rows.length === 0) {
          setParseError('The CSV file is empty.');
          return;
        }

        if (rows.length > MAX_ROWS) {
          setParseError(`Too many rows. Maximum is ${MAX_ROWS.toLocaleString()} records per import.`);
          return;
        }

        const headers = results.meta.fields || [];
        const parsed: ParsedRow[] = rows.map((row, i) => ({
          rowIndex: i + 2, // +2 because row 1 is headers
          raw: row,
          mapped: {},
        }));

        const detectedMappings = autoDetectMappings(headers, config);
        setCsvHeaders(headers);
        setParsedRows(parsed);
        setMappings(detectedMappings);
        setStatus('mapping');
      },
      error: () => {
        setParseError('Failed to read the file. Please try again.');
      },
    });
  }, [config]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const updateMapping = (csvColumn: string, targetField: string | null) => {
    setMappings(prev => prev.map(m =>
      m.csvColumn === csvColumn ? { ...m, targetField } : m
    ));
  };

  const proceedToPreview = async () => {
    // Apply mappings to all rows
    const mapped = parsedRows.map(row => ({
      ...row,
      mapped: applyMappings(row.raw, mappings),
    }));

    // Check for existing emails/names to detect duplicates
    let existingEmails = new Set<string>();
    let existingNames = new Set<string>();

    if (entityType === 'candidates' || entityType === 'contacts') {
      const table = entityType === 'candidates' ? 'candidates' : 'contacts';
      const { data } = await supabase
        .from(table)
        .select('email')
        .not('email', 'is', null);
      existingEmails = new Set((data || []).map((r: any) => r.email?.toLowerCase()));
    }

    if (entityType === 'companies') {
      const { data } = await supabase
        .from('companies')
        .select('name');
      existingNames = new Set((data || []).map((r: any) => r.name?.toLowerCase().trim()));
    }

    // Validate each row
    const validated: ValidatedRow[] = mapped.map(row => {
      let errors: string[] = [];

      if (entityType === 'candidates') errors = validateCandidateRow(row.mapped);
      else if (entityType === 'companies') errors = validateCompanyRow(row.mapped);
      else if (entityType === 'contacts') errors = validateContactRow(row.mapped);

      // Check duplicate
      let isDuplicate = false;
      if (entityType === 'companies') {
        const name = row.mapped.name?.toLowerCase().trim() || '';
        isDuplicate = name !== '' && existingNames.has(name);
      } else {
        const email = row.mapped.email?.toLowerCase().trim() || '';
        isDuplicate = email !== '' && existingEmails.has(email);
      }

      return {
        rowIndex: row.rowIndex,
        data: row.mapped,
        valid: errors.length === 0,
        errors,
        isDuplicate,
      };
    });

    setValidatedRows(validated);
    setStatus('preview');
  };

  const handleImport = async () => {
    if (!organisation?.id || !user?.id) return;
    setImporting(true);

    try {
      let result: ImportResult;

      if (entityType === 'candidates') {
        result = await insertCandidates(validatedRows, organisation.id, user.id);
      } else if (entityType === 'companies') {
        result = await insertCompanies(validatedRows, organisation.id, user.id);
      } else {
        result = await insertContacts(validatedRows, organisation.id, user.id);
      }

      setImportResult(result);
      setStatus('complete');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const validCount = validatedRows.filter(r => r.valid && !r.isDuplicate).length;
  const invalidCount = validatedRows.filter(r => !r.valid).length;
  const duplicateCount = validatedRows.filter(r => r.isDuplicate).length;
  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Import {entityLabel}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {status === 'idle' && 'Upload a CSV file to import records'}
              {status === 'mapping' && 'Map your CSV columns to RectoCRM fields'}
              {status === 'preview' && 'Review your data before importing'}
              {status === 'complete' && 'Import complete'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 flex-shrink-0">
          {['Upload', 'Map', 'Preview', 'Done'].map((step, i) => {
            const stepStatuses: ImportStatus[] = ['idle', 'mapping', 'preview', 'complete'];
            const currentIndex = stepStatuses.indexOf(status);
            const isActive = i === currentIndex;
            const isDone = i < currentIndex;
            return (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDone ? 'bg-teal-600 text-white' :
                  isActive ? 'bg-teal-100 text-teal-700 border-2 border-teal-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-teal-700' : isDone ? 'text-teal-600' : 'text-gray-400'}`}>
                  {step}
                </span>
                {i < 3 && <ChevronRight className="w-3 h-3 text-gray-300" />}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP 1 — UPLOAD */}
          {status === 'idle' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Max {MAX_ROWS.toLocaleString()} rows · Max {MAX_FILE_SIZE_MB}MB · CSV only
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download template
                </button>
              </div>

              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
                }`}
              >
                <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-teal-500' : 'text-gray-400'}`} />
                <p className="font-medium text-gray-700 mb-1">
                  {dragOver ? 'Drop your file here' : 'Drag and drop your CSV here'}
                </p>
                <p className="text-sm text-gray-400">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {parseError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{parseError}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Required columns
                </p>
                <div className="flex flex-wrap gap-2">
                  {config.fields.filter(f => f.required).map(f => (
                    <span key={f.key} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700">
                      {f.label} *
                    </span>
                  ))}
                  {config.fields.filter(f => !f.required).map(f => (
                    <span key={f.key} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-500">
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — MAPPING */}
          {status === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">{fileName}</span> — {parsedRows.length.toLocaleString()} rows detected.
                  Auto-matched {mappings.filter(m => m.targetField).length} of {mappings.length} columns.
                </p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">
                  <span>Your CSV column</span>
                  <span>Maps to RectoCRM field</span>
                </div>

                {mappings.map(mapping => (
                  <div key={mapping.csvColumn} className="grid grid-cols-2 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{mapping.csvColumn}</p>
                      <p className="text-xs text-gray-400 truncate">
                        e.g. {parsedRows[0]?.raw[mapping.csvColumn] || '—'}
                      </p>
                    </div>
                    <select
                      value={mapping.targetField || ''}
                      onChange={e => updateMapping(mapping.csvColumn, e.target.value || null)}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        mapping.targetField ? 'border-teal-300 bg-teal-50 text-teal-800' : 'border-gray-300 text-gray-500'
                      }`}
                    >
                      <option value="">Skip this column</option>
                      {config.fields.map(f => (
                        <option key={f.key} value={f.key}>
                          {f.label}{f.required ? ' *' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {parseError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{parseError}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — PREVIEW */}
          {status === 'preview' && (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-teal-700">{validCount}</p>
                  <p className="text-xs text-teal-600 font-medium mt-0.5">Ready to import</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${duplicateCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-2xl font-bold ${duplicateCount > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{duplicateCount}</p>
                  <p className={`text-xs font-medium mt-0.5 ${duplicateCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>Duplicates (skip)</p>
                </div>
                <div className={`border rounded-xl p-4 text-center ${invalidCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-2xl font-bold ${invalidCount > 0 ? 'text-red-700' : 'text-gray-400'}`}>{invalidCount}</p>
                  <p className={`text-xs font-medium mt-0.5 ${invalidCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>Invalid (skip)</p>
                </div>
              </div>

              {/* Preview table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Preview (first 5 rows)
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Status</th>
                        {config.fields.map(f => (
                          <th key={f.key} className="px-3 py-2 text-left text-gray-500 font-medium">{f.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {validatedRows.slice(0, 5).map(row => (
                        <tr key={row.rowIndex} className={
                          row.isDuplicate ? 'bg-amber-50' :
                          !row.valid ? 'bg-red-50' :
                          'bg-white'
                        }>
                          <td className="px-3 py-2">
                            {row.isDuplicate ? (
                              <span className="flex items-center gap-1 text-amber-600">
                                <SkipForward className="w-3 h-3" /> Duplicate
                              </span>
                            ) : !row.valid ? (
                              <span className="flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-3 h-3" /> {row.errors[0]}
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-teal-600">
                                <CheckCircle className="w-3 h-3" /> Valid
                              </span>
                            )}
                          </td>
                          {config.fields.map(f => (
                            <td key={f.key} className="px-3 py-2 text-gray-700 max-w-32 truncate">
                              {row.data[f.key] || <span className="text-gray-300">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {validatedRows.length > 5 && (
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                      + {validatedRows.length - 5} more rows
                    </p>
                  </div>
                )}
              </div>

              {/* Error detail toggle */}
              {invalidCount > 0 && (
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showErrors ? 'rotate-180' : ''}`} />
                  {showErrors ? 'Hide' : 'Show'} {invalidCount} validation error{invalidCount !== 1 ? 's' : ''}
                </button>
              )}

              {showErrors && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1 max-h-40 overflow-y-auto">
                  {validatedRows.filter(r => !r.valid).map(row => (
                    <p key={row.rowIndex} className="text-xs text-red-700">
                      <span className="font-semibold">Row {row.rowIndex}:</span> {row.errors.join(', ')}
                    </p>
                  ))}
                </div>
              )}

              {parseError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{parseError}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — COMPLETE */}
          {status === 'complete' && importResult && (
            <div className="text-center py-8">
              <div className="bg-teal-100 p-5 rounded-full inline-block mb-4">
                <CheckCircle className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Import Complete</h3>

              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mt-6">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <p className="text-2xl font-bold text-teal-700">{importResult.imported}</p>
                  <p className="text-xs text-teal-600 font-medium mt-0.5">Imported</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-2xl font-bold text-amber-700">{importResult.skipped}</p>
                  <p className="text-xs text-amber-600 font-medium mt-0.5">Skipped</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-2xl font-bold text-red-700">{importResult.failed}</p>
                  <p className="text-xs text-red-600 font-medium mt-0.5">Failed</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-left max-h-32 overflow-y-auto">
                  {importResult.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-700">Row {e.row}: {e.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {status === 'complete' ? 'Close' : 'Cancel'}
          </button>

          <div className="flex gap-3">
            {status === 'mapping' && (
              <button
                onClick={() => { setStatus('idle'); setParseError(''); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                ← Back
              </button>
            )}
            {status === 'preview' && (
              <button
                onClick={() => setStatus('mapping')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                ← Back
              </button>
            )}

            {status === 'mapping' && (
              <button
                onClick={proceedToPreview}
                disabled={!mappings.some(m => m.targetField)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Preview →
              </button>
            )}

            {status === 'preview' && validCount > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors text-sm font-medium"
              >
                {importing
                  ? `Importing...`
                  : `Import ${validCount} ${entityLabel}`}
              </button>
            )}

            {status === 'complete' && (
              <button
                onClick={() => { onComplete(); onClose(); }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
              >
                View {entityLabel} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}