/**
 * Client-side CSV validation — mirrors the backend contract in spec §6.2
 * "CSV Requirements" so users see specific errors at file-select time
 * instead of waiting for the server's CSV_VALIDATION_FAILED rejection.
 *
 * What we enforce (same rules the backend applies):
 *   • UTF-8 encoding (strict)
 *   • Header row contains all 16 required columns with exact spec names
 *   • Row count between 100 and 50 000 (inclusive)
 *   • Per-column numeric ranges for the 12 continuous features
 *   • Binary-only constraint (0 or 1) for cvd / ckd / nafld / hypertension
 *   • No missing cells, no non-numeric values
 *
 * Error messages follow spec §6.2's example style so the client and server
 * surface consistent phrasing:
 *   "Row 5: 'egfr' value 201.0 out of range [5.0, 200.0]"
 *   "Row 12: 'cvd' must be 0 or 1, got 2"
 *   "Row 47: missing value for 'alt'"
 *
 * Parsing is delegated to PapaParse which handles quoting, escaping, CRLF
 * line endings, and empty-row skipping robustly. We stream row-by-row via
 * the `step` callback to avoid buffering large files.
 *
 * Error list is capped at 20 entries with an overflow counter, matching the
 * backend's behaviour.
 */

import Papa, { type ParseError, type ParseStepResult } from 'papaparse';

export const CSV_MAX_ERRORS = 20;
export const CSV_MIN_ROWS = 100;
export const CSV_MAX_ROWS = 50_000;

type NumericRange = {
    kind: 'range';
    min: number;
    max: number;
    integer?: boolean;
};

type BinaryRule = { kind: 'binary' };

type ColumnRule = {
    name: string;
    rule: NumericRange | BinaryRule;
};

/**
 * Spec §6.2 "Required columns" — exact names, order irrelevant. The backend
 * matches names case-sensitively, so we do the same.
 */
export const REQUIRED_COLUMNS: ColumnRule[] = [
    { name: 'age', rule: { kind: 'range', min: 18, max: 120, integer: true } },
    { name: 'bmi', rule: { kind: 'range', min: 10, max: 80 } },
    { name: 'hba1c_baseline', rule: { kind: 'range', min: 3, max: 20 } },
    { name: 'egfr', rule: { kind: 'range', min: 5, max: 200 } },
    { name: 'diabetes_duration', rule: { kind: 'range', min: 0, max: 60 } },
    { name: 'fasting_glucose', rule: { kind: 'range', min: 50, max: 500 } },
    { name: 'c_peptide', rule: { kind: 'range', min: 0, max: 10 } },
    { name: 'cvd', rule: { kind: 'binary' } },
    { name: 'ckd', rule: { kind: 'binary' } },
    { name: 'nafld', rule: { kind: 'binary' } },
    { name: 'hypertension', rule: { kind: 'binary' } },
    { name: 'bp_systolic', rule: { kind: 'range', min: 60, max: 250 } },
    { name: 'ldl', rule: { kind: 'range', min: 20, max: 400 } },
    { name: 'hdl', rule: { kind: 'range', min: 10, max: 150 } },
    { name: 'triglycerides', rule: { kind: 'range', min: 30, max: 800 } },
    { name: 'alt', rule: { kind: 'range', min: 5, max: 500 } },
];

const REQUIRED_COLUMN_NAMES = REQUIRED_COLUMNS.map((c) => c.name);

export interface CsvValidationResult {
    valid: boolean;
    rowCount: number;
    errors: string[];
    /** Number of additional errors suppressed beyond `CSV_MAX_ERRORS`. */
    truncatedCount: number;
}

/**
 * Validate a patient CSV against spec §6.2 rules.
 *
 * UTF-8 is checked strictly up-front via `TextDecoder({ fatal: true })`
 * because PapaParse's default file-read path uses `FileReader.readAsText`
 * which silently replaces invalid bytes with U+FFFD. That would hide
 * encoding problems the backend would then reject with `INVALID_ENCODING`.
 */
export async function validatePatientCsv(file: File): Promise<CsvValidationResult> {
    // -- 1. Strict UTF-8 decode ----------------------------------------------
    let text: string;
    try {
        const buffer = await file.arrayBuffer();
        text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
        return {
            valid: false,
            rowCount: 0,
            errors: ['File is not valid UTF-8. Re-export the CSV with UTF-8 encoding.'],
            truncatedCount: 0,
        };
    }

    // Strip UTF-8 BOM so PapaParse doesn't embed it in the first header cell.
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

    // -- 2. Parse header first to validate column set ------------------------
    // We run a no-step parse with preview=1 so only the header row is parsed;
    // if required columns are missing we bail without scanning the file body.
    const headerResult = Papa.parse<string[]>(text, {
        header: false,
        preview: 1,
        skipEmptyLines: true,
    });

    if (headerResult.errors.length > 0) {
        return {
            valid: false,
            rowCount: 0,
            errors: [formatParseError(headerResult.errors[0])],
            truncatedCount: 0,
        };
    }

    const headerRow = (headerResult.data[0] ?? []).map((c) => c.trim());
    const headerErrors = validateHeader(headerRow);
    if (headerErrors.length > 0) {
        return {
            valid: false,
            rowCount: 0,
            errors: headerErrors,
            truncatedCount: 0,
        };
    }

    // -- 3. Stream data rows through a step callback -------------------------
    const errors: string[] = [];
    let truncatedCount = 0;
    let rowCount = 0;

    const push = (msg: string) => {
        if (errors.length < CSV_MAX_ERRORS) {
            errors.push(msg);
        } else {
            truncatedCount++;
        }
    };

    await new Promise<void>((resolve) => {
        Papa.parse<Record<string, string>>(text, {
            header: true,
            skipEmptyLines: true,
            // We keep everything as strings so we can emit rule-specific
            // error messages instead of the generic "NaN" papaparse would
            // produce with dynamicTyping.
            dynamicTyping: false,
            step: (result: ParseStepResult<Record<string, string>>) => {
                // PapaParse row index includes the header; subtract 1 so the
                // first data row is "Row 1" to match the spec's error style.
                rowCount++;
                const rowNumber = rowCount;

                if (result.errors.length > 0) {
                    for (const err of result.errors) push(`Row ${rowNumber}: ${err.message}`);
                }

                for (const col of REQUIRED_COLUMNS) {
                    const raw = (result.data[col.name] ?? '').trim();
                    const msg = validateCell(rowNumber, col, raw);
                    if (msg) push(msg);
                }
            },
            complete: () => resolve(),
            error: (err: Error) => {
                push(`Parse error: ${err.message}`);
                resolve();
            },
        });
    });

    // -- 4. Row count bounds -------------------------------------------------
    if (rowCount < CSV_MIN_ROWS) {
        errors.unshift(
            `Dataset has ${rowCount} valid row(s) — minimum is ${CSV_MIN_ROWS}.`,
        );
    } else if (rowCount > CSV_MAX_ROWS) {
        errors.unshift(
            `Dataset has ${rowCount.toLocaleString()} rows — maximum is ${CSV_MAX_ROWS.toLocaleString()}.`,
        );
    }

    return {
        valid: errors.length === 0,
        rowCount,
        errors,
        truncatedCount,
    };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function validateHeader(header: string[]): string[] {
    const present = new Set(header);

    if (header.length === 0 || header.every((c) => c === '')) {
        return [
            'Header row is missing. The first line of the CSV must contain the 16 required column names.',
        ];
    }

    const missing = REQUIRED_COLUMN_NAMES.filter((name) => !present.has(name));
    return missing.map((name) => `Required column '${name}' is missing from the header.`);
}

function validateCell(rowNumber: number, col: ColumnRule, raw: string): string | null {
    if (raw === '') {
        return `Row ${rowNumber}: missing value for '${col.name}'`;
    }

    const n = Number(raw);
    if (!Number.isFinite(n)) {
        return `Row ${rowNumber}: '${col.name}' value '${raw}' is not numeric`;
    }

    if (col.rule.kind === 'binary') {
        if (n !== 0 && n !== 1) {
            return `Row ${rowNumber}: '${col.name}' must be 0 or 1, got ${formatNumber(n)}`;
        }
        return null;
    }

    if (col.rule.integer && !Number.isInteger(n)) {
        return `Row ${rowNumber}: '${col.name}' must be an integer, got ${formatNumber(n)}`;
    }
    if (n < col.rule.min || n > col.rule.max) {
        return `Row ${rowNumber}: '${col.name}' value ${formatNumber(n)} out of range [${formatNumber(col.rule.min)}, ${formatNumber(col.rule.max)}]`;
    }

    return null;
}

function formatNumber(n: number): string {
    return String(n);
}

function formatParseError(err: ParseError): string {
    const rowInfo = typeof err.row === 'number' ? `Row ${err.row + 1}: ` : '';
    return `${rowInfo}${err.message}`;
}
