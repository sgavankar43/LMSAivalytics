'use client';

import React from 'react';
import { CertificateItem, User } from '@/types';
import {
  X,
  Download,
  Share2,
  CheckCircle2,
  Award,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Printer,
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateItem | null;
  user: User | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificate,
  user,
}) => {
  if (!isOpen || !certificate) return null;

  const recipientName = user?.name || 'Alex Morgan';
  const credentialId = certificate.credentialId;
  const issueDate = certificate.issueDate || 'July 15, 2026';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/profile?verify=${encodeURIComponent(credentialId)}`;
      navigator.clipboard.writeText(url);
      alert(`Verification link copied to clipboard:\n${url}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden my-auto flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Award className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Verified Certificate of Completion</h3>
              <p className="text-xs text-gray-400 font-mono">ID: {credentialId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={handleCopyLink}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs"
              title="Share verification URL"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Parchment Display */}
        <div className="p-4 sm:p-8 bg-[#f8faf9] flex justify-center items-center">
          <div className="relative w-full max-w-3xl bg-[#ffffff] border-[6px] border-[#121614] rounded-2xl p-6 sm:p-12 shadow-xl text-center select-none overflow-hidden">
            {/* Subtle Guilloche / Geometric Watermark Background */}
            <div className="absolute inset-2 border border-[#d1d5db] pointer-events-none rounded-lg" />
            <div className="absolute inset-3 border border-dashed border-[#9ca3af]/40 pointer-events-none rounded-md" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#3ECE92]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Academy Crest / Header */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#121614] text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                  <span className="text-[#3ECE92]">AI</span>
                </div>
                <div className="text-left leading-none">
                  <span className="text-sm font-black tracking-wider text-[#121614] uppercase">
                    AIvalytics Academy
                  </span>
                  <span className="block text-[9px] font-mono text-gray-400 tracking-widest uppercase">
                    Institute of AI Governance & Executive Studies
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gray-400">
                  Official Executive Certificate
                </p>
                <p className="text-[13px] text-gray-600 italic font-serif mt-1">
                  This credential is conferred with honors to
                </p>
              </div>

              {/* Recipient Name */}
              <div className="py-2">
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-gray-900 tracking-tight">
                  {recipientName}
                </h1>
                <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#3ECE92] to-transparent mx-auto mt-2" />
              </div>

              {/* Program & Achievement Statement */}
              <p className="text-xs text-gray-600 max-w-lg mx-auto font-sans leading-relaxed">
                having demonstrated exceptional proficiency and rigorous completion of all required
                modules, milestone evaluations, and faculty-supervised submissions for
              </p>

              {/* Certificate Title */}
              <div className="py-2 px-4 bg-[#f8faf9] rounded-xl border border-gray-100 max-w-xl mx-auto">
                <h2 className="text-base sm:text-xl font-bold text-[#111614]">
                  {certificate.title}
                </h2>
                <p className="text-xs font-semibold text-[#059669] mt-0.5">
                  {certificate.grade || 'Passed with Distinction'}
                </p>
              </div>

              {/* Signatures & Seal Row */}
              <div className="pt-8 grid grid-cols-3 items-end gap-4 text-center mt-4">
                {/* Dean Signature */}
                <div className="space-y-1">
                  <div className="font-serif italic text-base text-gray-800 border-b border-gray-300 pb-1">
                    Dr. Evelyn Reed
                  </div>
                  <p className="text-[10px] font-semibold text-gray-600">Dr. Evelyn Reed</p>
                  <p className="text-[9px] text-gray-400">Dean of Academic Affairs</p>
                </div>

                {/* Official Gold/Emerald Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3ECE92] to-[#059669] p-0.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-full border-2 border-white/80 bg-[#121614] flex flex-col items-center justify-center text-white">
                      <ShieldCheck className="w-5 h-5 text-[#3ECE92]" />
                      <span className="text-[7px] font-mono tracking-widest uppercase text-[#3ECE92] mt-0.5">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                </div>

                {/* Director Signature */}
                <div className="space-y-1">
                  <div className="font-serif italic text-base text-gray-800 border-b border-gray-300 pb-1">
                    Prof. Marcus Vance
                  </div>
                  <p className="text-[10px] font-semibold text-gray-600">Prof. Marcus Vance</p>
                  <p className="text-[9px] text-gray-400">Director of AI Programs</p>
                </div>
              </div>

              {/* Credential ID and Date Footer */}
              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-gray-400 font-mono gap-1">
                <span>Credential ID: {credentialId}</span>
                <span>Issue Date: {issueDate}</span>
                <span className="flex items-center gap-1 text-[#059669]">
                  <CheckCircle2 className="w-3 h-3" />
                  Authenticated on AIvalytics Ledger
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>This verified credential is permanently linked to your AIvalytics account.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Copy Verification URL
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#111614] bg-[#3ECE92] hover:bg-[#34be83] transition-colors shadow-sm"
            >
              Download Printable PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
