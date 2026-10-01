'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ChevronRight, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect directly to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setSubmitting(true);

    const res = await signIn(email, password);
    setSubmitting(false);

    if (res.success) {
      router.replace('/');
    } else {
      setErrorMsg(res.error || 'Invalid email or password');
    }
  };

  const handleQuickFill = (type: 'learner' | 'admin') => {
    setErrorMsg('');
    setInfoMsg('');
    if (type === 'learner') {
      setEmail('nikunj.sonda@aivalytics.com');
      setPassword('password123');
    } else {
      setEmail('admin@aivalytics.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[430px] bg-white rounded-3xl p-8 sm:p-10 border border-[#eaedf0] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        {/* Brand Logo */}
        <div className="mb-6">
          <Logo size="md" />
        </div>

        {/* Pill Segmented Switcher (Sign Up kept aside per instructions) */}
        <div className="bg-[#f1f3f2] p-1 rounded-full flex items-center mb-6">
          <button
            type="button"
            className="flex-1 py-2 text-xs font-semibold rounded-full bg-white text-gray-900 shadow-xs cursor-default"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setInfoMsg('New student registration is currently by faculty invitation only. Please use the credentials below.');
              setErrorMsg('');
            }}
            className="flex-1 py-2 text-xs font-semibold rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            Sign up
          </button>
        </div>

        {/* Notice/Info banner if Sign up is clicked */}
        {infoMsg && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 leading-relaxed">
            {infoMsg}
          </div>
        )}

        {/* Error message if any */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3ECE92] focus:ring-2 focus:ring-[#3ECE92]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3ECE92] focus:ring-2 focus:ring-[#3ECE92]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || isLoading}
              className="w-full bg-[#5ae4a8] hover:bg-[#48d597] text-[#121614] font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs hover:shadow cursor-pointer disabled:opacity-60"
            >
              <span>{submitting ? 'Verifying with Supabase...' : 'Sign in >'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Test Credentials & Seed User Helpers */}
        <div className="mt-8 text-center border-t border-gray-100 pt-5">
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-[290px] mx-auto">
            Connected to live Supabase Auth. Click below to test with pre-seeded accounts:
          </p>

          <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('learner')}
              className="w-full sm:w-auto text-[11px] font-semibold text-gray-700 hover:text-[#059669] bg-gray-50 hover:bg-[#e8f8f0] px-3 py-1.5 rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#3ECE92]" />
              <span>Learner (Nikunj)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="w-full sm:w-auto text-[11px] font-semibold text-gray-700 hover:text-[#059669] bg-gray-50 hover:bg-[#e8f8f0] px-3 py-1.5 rounded-lg transition-colors border border-gray-200 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#3ECE92]" />
              <span>Faculty Admin</span>
            </button>
          </div>

          <p className="text-[10px] font-mono text-gray-400 mt-2">
            Password: password123
          </p>
        </div>
      </div>
    </div>
  );
}
