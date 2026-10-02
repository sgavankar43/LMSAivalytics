'use client';

import React, { useState } from 'react';
import { ImportedStudent } from '@/types';
import { sampleCsvTemplate } from '@/data/adminMockData';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  UserPlus,
  Users,
} from 'lucide-react';

interface CsvUserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (newStudents: ImportedStudent[]) => void;
}

interface ParsedRow {
  fullName: string;
  email: string;
  courseCode: string;
  term: string;
  isValid: boolean;
  error?: string;
}

export const CsvUserImportModal: React.FC<CsvUserImportModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
}) => {
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'aivalytics_student_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    parseFile(file);
  };

  const parseFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        setIsProcessing(false);
        return;
      }

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setIsProcessing(false);
        return;
      }

      // Check header
      const rows: ParsedRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          const fullName = parts[0] || 'Learner';
          const email = parts[1] || '';
          const courseCode = parts[2] || 'ACA-101';
          const term = parts[3] || 'Fall 2026';

          const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

          rows.push({
            fullName,
            email,
            courseCode,
            term,
            isValid: isValidEmail,
            error: !isValidEmail ? 'Invalid email format' : undefined,
          });
        }
      }

      setParsedRows(rows);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    const courseMap: Record<string, string> = {
      'ACA-101': 'Academic Information & Governance',
      'BRM-204': 'Business Research Methodologies',
      'AML-305': 'Applied AI & Neural Predictive Analytics',
    };

    const newStudents: ImportedStudent[] = validRows.map((r, idx) => ({
      id: 'imp_' + Date.now() + '_' + idx,
      fullName: r.fullName,
      email: r.email,
      courseCode: r.courseCode,
      courseName: courseMap[r.courseCode] || 'Core Curriculum',
      term: r.term,
      enrolledAt: 'Today',
      status: 'Active',
    }));

    onImportStudents(newStudents);
    setSuccessCount(newStudents.length);

    setTimeout(() => {
      setSuccessCount(null);
      setParsedRows([]);
      setFileName('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]/60">
              <FileSpreadsheet className="w-5 h-5 text-[#3ECE92]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bulk User Import via CSV</h2>
              <p className="text-xs text-gray-400">Onboard students & enroll into course cohorts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successCount !== null ? (
          <div className="my-8 p-8 text-center bg-[#e8f8f0] rounded-2xl border border-[#d1f4e2] animate-in zoom-in-95">
            <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto mb-2" />
            <h4 className="text-base font-bold text-gray-900">
              Successfully Imported {successCount} Students!
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              Student accounts are active and enrolled into specified course batches.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Step 1: Download Sample Template */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#f8faf9] rounded-2xl border border-gray-200/70">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-gray-800">Need a CSV template?</span>
                <p className="text-[11px] text-gray-500">
                  Headers: <code className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border">fullName,email,courseCode,term</code>
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 shrink-0 shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-[#3ECE92]" />
                <span>Download Sample CSV</span>
              </button>
            </div>

            {/* Step 2: Upload Area */}
            <div className="border-2 border-dashed border-gray-200 hover:border-[#3ECE92] transition-colors rounded-2xl p-6 text-center bg-[#fafbfb] relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">
                {fileName ? fileName : 'Click or drag & drop CSV file to upload'}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Supports comma-separated UTF-8 values (.csv)
              </p>
            </div>

            {/* Step 3: Parsed Rows Preview */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">
                    Preview Parsed Rows ({parsedRows.length} found)
                  </span>
                  <span className="text-[11px] font-mono text-[#059669]">
                    {parsedRows.filter((r) => r.isValid).length} ready to import
                  </span>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Full Name</th>
                        <th className="py-2 px-3">Email Address</th>
                        <th className="py-2 px-3">Course Code</th>
                        <th className="py-2 px-3">Term</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className={row.isValid ? 'bg-white' : 'bg-red-50/50'}>
                          <td className="py-2 px-3 font-semibold text-gray-900">{row.fullName}</td>
                          <td className="py-2 px-3 font-mono text-gray-600">{row.email}</td>
                          <td className="py-2 px-3 font-mono text-gray-700">{row.courseCode}</td>
                          <td className="py-2 px-3 text-gray-500">{row.term}</td>
                          <td className="py-2 px-3 text-right">
                            {row.isValid ? (
                              <span className="text-[10px] font-bold text-[#059669] bg-[#e8f8f0] px-2 py-0.5 rounded-full">
                                ✓ Valid
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                ⚠ {row.error}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={parsedRows.filter((r) => r.isValid).length === 0 || isProcessing}
                onClick={handleConfirmImport}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-[#3ECE92] text-[#111614] hover:bg-[#34be83] disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Confirm & Import Students</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
