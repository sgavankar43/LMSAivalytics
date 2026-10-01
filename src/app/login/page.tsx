'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('you@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Nikunj Sonda');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    if (mode === 'signin') {
      const res = await signIn(email, password);
      setSubmitting(false);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    } else {
      if (!name) {
        setErrorMsg('Please enter your full name');
        setSubmitting(false);
        return;
      }
      const res = await signUp(email, password, name);
      setSubmitting(false);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMsg(res.error || 'Failed to create account');
      }
    }
  };

  const handleQuickFill = (type: 'learner' | 'admin') => {
    if (type === 'learner') {
      setEmail('nikunj.sonda@aivalytics.com');
      setName('Nikunj Sonda');
      setPassword('password123');
    } else {
      setEmail('admin@aivalytics.com');
      setName('Admin Faculty');
      setPassword('adminpass123');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[430px] bg-white rounded-3xl p-8 sm:p-10 border border-[#eaedf0] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        {/* Brand Logo */}
        <div className="mb-6">
          <Logo size="md" />
        </div>

        {/* Pill Segmented Switcher */}
        <div className="bg-[#f1f3f2] p-1 rounded-full flex items-center mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
              mode === 'signin'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nikunj Sonda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white rounded-xl border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#3ECE92] focus:ring-2 focus:ring-[#3ECE92]/20 transition-all"
                />
              </div>
            </div>
          )}

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
              <span>{mode === 'signin' ? 'Sign in' : 'Create account'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Demo Footer Note from Screenshot 1 */}
        <div className="mt-8 text-center border-t border-gray-100 pt-5">
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-[280px] mx-auto">
            Demo build — any email/password signs you in as a learner. Admin access uses a separate admin credential.
          </p>

          {/* Quick Fill Helpers */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('learner')}
              className="text-[10px] font-medium text-gray-500 hover:text-[#059669] bg-gray-50 hover:bg-[#e8f8f0] px-2.5 py-1 rounded-md transition-colors border border-gray-200/60"
            >
              Fill Learner (Nikunj)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="text-[10px] font-medium text-gray-500 hover:text-[#059669] bg-gray-50 hover:bg-[#e8f8f0] px-2.5 py-1 rounded-md transition-colors border border-gray-200/60"
            >
              Fill Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
