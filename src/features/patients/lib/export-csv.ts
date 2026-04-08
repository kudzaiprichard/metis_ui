/**
 * CSV export helpers for the patients list. Kept separate from the React
 * component so the column schema is easy to find and edit.
 */

import type { Patient } from '../api/patients.types';

const CSV_COLUMNS: Array<{ key: keyof Patient; label: string }> = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'gender', label: 'Gender' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'updatedAt', label: 'Updated At' },
];

/**
 * RFC-4180-compliant cell escaper. Wraps a cell in double quotes when it
 * contains a comma, quote, or newline; doubles any embedded quotes.
 */
function csvEscape(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function buildPatientsCsv(patients: Patient[]): string {
    const header = CSV_COLUMNS.map((c) => csvEscape(c.label)).join(',');
    const rows = patients.map((p) =>
        CSV_COLUMNS.map((c) => csvEscape(p[c.key] ?? '')).join(','),
    );
    return [header, ...rows].join('\r\n');
}

export function buildPatientsExportFilename(): string {
    const now = new Date();
    const stamp =
        `${now.getFullYear()}` +
        `${String(now.getMonth() + 1).padStart(2, '0')}` +
        `${String(now.getDate()).padStart(2, '0')}-` +
        `${String(now.getHours()).padStart(2, '0')}` +
        `${String(now.getMinutes()).padStart(2, '0')}`;
    return `metis-patients-${stamp}.csv`;
}

export function downloadCsv(csv: string, filename: string): void {
    if (typeof window === 'undefined') return;
    // Prepended UTF-8 BOM so Excel renders accents correctly on direct open.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
