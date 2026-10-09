'use client';

import React, { useState } from 'react';
import { useTests } from '@/context/TestContext';
import { sampleQuizCsvTemplate } from '@/data/quizMockData';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  HelpCircle,
  Clock,
  Award,
  Layers,
  BookOpen,
  Sparkles,
} from 'lucide-react';

interface CsvQuizUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ParsedQuestionPreview {
  questionNumber: number;
  questionText: string;
  options: { A: string; B: string; C: string; D: string };
  correctOption: string;
  explanation: string;
}

export const CsvQuizUploadModal: React.FC<CsvQuizUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createQuizFromCsv } = useTests();

  // Test Metadata Form State
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('ANPM-101');
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [passingPercentage, setPassingPercentage] = useState(70);
  const [description, setDescription] = useState('');

  // CSV Parsing State
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedQuestionPreview[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const coursesList = [
    { code: 'AINPM-101', name: 'AI-Native Project Management' },
  ];

  const handleDownloadSample = () => {
    const blob = new Blob([sampleQuizCsvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'aivalytics_quiz_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      parseCsvForPreview(content);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setParseError('Failed to read CSV file.');
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const parseCsvForPreview = (content: string) => {
    try {
      const lines = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        setParseError('CSV must include a header and at least 1 question.');
        setParsedPreview([]);
        return;
      }

      const questions: ParsedQuestionPreview[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const rowMatches: string[] = [];
        let currentVal = '';
        let insideQuotes = false;

        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            rowMatches.push(currentVal.trim().replace(/^"|"$/g, ''));
            currentVal = '';
          } else {
            currentVal += char;
          }
        }
        rowMatches.push(currentVal.trim().replace(/^"|"$/g, ''));

        if (rowMatches.length >= 7) {
          const [qNumRaw, qText, optA, optB, optC, optD, correctRaw, explanation] = rowMatches;
          questions.push({
            questionNumber: parseInt(qNumRaw, 10) || i,
            questionText: qText,
            options: { A: optA, B: optB, C: optC, D: optD },
            correctOption: (correctRaw || 'A').toUpperCase().trim(),
            explanation: explanation || 'No explanation provided.',
          });
        }
      }

      if (questions.length === 0) {
        setParseError('No valid questions parsed. Check that all columns are provided.');
        setParsedPreview([]);
      } else {
        setParsedPreview(questions);
        setParseError(null);
        if (!title) {
          setTitle(`Module Assessment (${questions.length} Questions)`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error parsing CSV';
      setParseError(msg);
      setParsedPreview([]);
    }
  };

  const handleLoadSample = () => {
    setFileName('aivalytics_sample_quiz.csv');
    setCsvContent(sampleQuizCsvTemplate);
    parseCsvForPreview(sampleQuizCsvTemplate);
    if (!title) {
      setTitle('Model Regularisation & NLP Fundamentals Milestone');
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setParseError('Please specify an Assessment Title.');
      return;
    }
    if (!csvContent || parsedPreview.length === 0) {
      setParseError('Please upload or load a valid CSV with questions.');
      return;
    }

    const selectedCourse = coursesList.find((c) => c.code === courseCode);
    const courseName = selectedCourse ? selectedCourse.name : 'Institutional Studies';

    const result = await createQuizFromCsv({
      title: title.trim(),
      courseCode,
      courseName,
      timeLimitMinutes: Number(timeLimitMinutes),
      passingPercentage: Number(passingPercentage),
      description: description.trim(),
      csvContent,
    });

    if (result.success) {
      setUploadSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setUploadSuccess(false);
        onClose();
      }, 1500);
    } else {
      setParseError(result.error || 'Failed to create quiz.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl sm:max-w-3xl w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e8f8f0] text-[#059669] flex items-center justify-center border border-[#d1f4e2] shrink-0">
              <HelpCircle className="w-5 h-5 text-[#3ECE92]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Create Assessment via CSV</h2>
              <p className="text-xs text-gray-500">
                Upload question bank, configure time limit, and publish test for students.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleCreateQuiz} className="p-6 sm:p-7 overflow-y-auto overflow-x-hidden space-y-5 flex-1">
          {/* Success Banner */}
          {uploadSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Assessment Published Successfully!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  The test is now live on the student portal with a {timeLimitMinutes}-minute timer.
                </p>
              </div>
            </div>
          )}

          {/* Test Metadata Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-12">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Assessment Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Session 3: Neural Vector Embeddings & Similarity"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#3ECE92] focus:ring-2 focus:ring-[#3ECE92]/20 outline-none transition-all bg-white"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                Course Cohort *
              </label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#3ECE92] focus:ring-2 focus:ring-[#3ECE92]/20 outline-none bg-white font-medium text-gray-800"
              >
                {coursesList.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Time Limit
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="180"
                  required
                  value={timeLimitMinutes}
                  onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value, 10) || 15)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#3ECE92] focus:ring-2 focus:ring-[#3ECE92]/20 outline-none pr-11 font-mono font-bold text-gray-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium pointer-events-none">
                  mins
                </span>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-gray-400" />
                Passing %
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="30"
                  max="100"
                  required
                  value={passingPercentage}
                  onChange={(e) => setPassingPercentage(parseInt(e.target.value, 10) || 70)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#3ECE92] focus:ring-2 focus:ring-[#3ECE92]/20 outline-none pr-8 font-mono font-bold text-gray-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* CSV Template Download & Upload Box */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-gray-800">CSV Question Bank Schema</p>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-[#e8f8f0] text-[#059669] rounded-md border border-[#d1f4e2]">
                  8 Columns
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Template</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#059669] bg-[#e8f8f0] border border-[#d1f4e2] hover:bg-[#d8f4e6] transition-colors shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Load Sample</span>
                </button>
              </div>
            </div>

            <div className="bg-white px-3 py-2 rounded-xl border border-gray-200/80 font-mono text-[11px] text-gray-600 overflow-x-auto whitespace-nowrap">
              <span className="text-[#059669] font-bold">questionNumber</span>,{' '}
              <span className="text-gray-800 font-medium">questionText</span>,{' '}
              <span className="text-blue-600">optionA</span>,{' '}
              <span className="text-blue-600">optionB</span>,{' '}
              <span className="text-blue-600">optionC</span>,{' '}
              <span className="text-blue-600">optionD</span>,{' '}
              <span className="text-amber-600 font-bold">correctOption</span>,{' '}
              <span className="text-purple-600">explanation</span>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="relative border-2 border-dashed border-gray-300 hover:border-[#3ECE92] rounded-2xl p-6 text-center transition-all bg-white hover:bg-gray-50/50 group cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 group-hover:bg-[#e8f8f0] flex items-center justify-center transition-colors mb-2.5">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-[#3ECE92]" />
              </div>
              <p className="text-xs font-bold text-gray-800">
                {fileName ? fileName : 'Click or drag & drop CSV question file here'}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">
                Supports UTF-8 CSV with multiple choice questions (Options A, B, C, D)
              </p>
            </div>
          </div>

          {/* Error Notice */}
          {parseError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#3ECE92]" />
                  Preview Parsed Questions ({parsedPreview.length} questions)
                </span>
                <span className="text-[11px] font-mono text-gray-500">
                  Total Points: {parsedPreview.length * 5} pts
                </span>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-gray-100 bg-white">
                {parsedPreview.map((q, idx) => (
                  <div key={idx} className="p-3 text-xs hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium text-gray-800">
                        <span className="font-mono font-bold text-[#3ECE92] mr-1.5">
                          Q{q.questionNumber}.
                        </span>
                        {q.questionText}
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded-md font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        Correct: {q.correctOption}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px] text-gray-600 pl-4">
                      <div>A: {q.options.A}</div>
                      <div>B: {q.options.B}</div>
                      <div>C: {q.options.C}</div>
                      <div>D: {q.options.D}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || parsedPreview.length === 0}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#111614] bg-[#3ECE92] hover:bg-[#34b780] shadow-sm disabled:opacity-40 disabled:hover:bg-[#3ECE92] transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Confirm & Publish Assessment ({parsedPreview.length} Questions)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
