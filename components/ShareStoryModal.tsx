'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  isTempAccount: boolean;
  userEmail: string | null;
  cookieId: string;
  onLoginSuccess: (params: { userId: string; isTempAccount: boolean; userEmail?: string | null }) => void;
  onSignOut: () => void;
}

export default function ShareStoryModal({
  isOpen,
  onClose,
  userId,
  isTempAccount,
  userEmail,
  cookieId,
  onLoginSuccess,
  onSignOut,
}: ShareStoryModalProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [storyNickname, setStoryNickname] = useState('');
  const [storySubmitLoading, setStorySubmitLoading] = useState(false);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storySuccess, setStorySuccess] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });
        const data = await res.json();
        if (!data.success) {
          setAuthError(data.error === 'invalid_credentials' ? 'Invalid email or password.' : data.error ?? 'Login failed.');
          return;
        }
        onLoginSuccess({ userId: data.userId, isTempAccount: data.isTempAccount ?? false, userEmail: email.trim() });
      } else {
        const res = await fetch('/api/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password, cookieId: cookieId || undefined }),
        });
        const data = await res.json();
        if (!data.success) {
          setAuthError(data.error === 'email_taken' ? 'That email is already in use.' : data.error ?? 'Sign up failed.');
          return;
        }
        onLoginSuccess({ userId: userId!, isTempAccount: false, userEmail: email.trim() });
      }
      setPassword('');
      setEmail('');
      setAuthError(null);
      // Stay in modal; parent state update will hide auth form and show submit-story view
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOutClick = () => {
    onSignOut();
    onClose();
  };

  const handleStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = storyText.trim();
    if (!text) {
      setStoryError('Please enter your story.');
      return;
    }
    if (!userId) return;
    setStoryError(null);
    setStorySuccess(false);
    setStorySubmitLoading(true);
    try {
      const res = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          userId,
          storyName: storyNickname.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setStoryError(
          data.error === 'text_too_long' ? 'Story is too long (max 3000 characters).'
          : data.error === 'sign_in_required' ? 'You must be signed in to post a story.'
          : data.error ?? 'Something went wrong.'
        );
        return;
      }
      setStorySuccess(true);
      setStoryText('');
      setStoryNickname('');
      // Optionally close after a short delay so they see success
      setTimeout(() => { setStorySuccess(false); onClose(); }, 1500);
    } finally {
      setStorySubmitLoading(false);
    }
  };

  if (!isOpen) return null;

  const showAuthForm = !!userId && isTempAccount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 md:p-8 max-h-[90vh] overflow-y-auto text-black">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {showAuthForm && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black uppercase mb-2 text-black">
              {authMode === 'signin' ? 'Welcome Back' : 'Join the Disaster'}
            </h2>
            <p className="mb-4 font-medium text-black">
              Create an account to save your progress, or sign in.
            </p>

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
              <div>
                <label className="block font-bold text-xs uppercase mb-1 text-black">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setAuthError(null); }}
                  className="w-full p-3 border-4 border-black text-black placeholder:text-gray-500 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-xs uppercase mb-1 text-black">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setAuthError(null); }}
                  className="w-full p-3 border-4 border-black text-black placeholder:text-gray-500 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
              {authError && <p className="text-sm text-red-600 font-medium">{authError}</p>}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-yellow-400 text-black font-black uppercase border-4 border-black hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-60"
              >
                {authLoading ? '…' : authMode === 'signin' ? 'Log In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-sm font-bold text-black">
              {authMode === 'signin' ? (
                <p>New here? <button type="button" onClick={() => { setAuthMode('signup'); setAuthError(null); }} className="underline text-blue-600 hover:text-blue-800">Create an account</button></p>
              ) : (
                <p>Already have one? <button type="button" onClick={() => { setAuthMode('signin'); setAuthError(null); }} className="underline text-blue-600 hover:text-blue-800">Log in</button></p>
              )}
            </div>
          </div>
        )}

        {/* Submit story (only for signed-in / non-temp users) */}
        {userId && !isTempAccount && (
          <div>
            <div className="mb-4 text-black">
              <p className="text-sm font-semibold text-black">Signed in as {userEmail ?? 'you'}</p>
            </div>
            <h2 className="text-2xl font-black uppercase mb-4 text-black">Spill the Tea ☕️</h2>
            {storySuccess && (
              <p className="mb-4 text-green-700 font-semibold">Your story was submitted. Thanks!</p>
            )}
            <form onSubmit={handleStorySubmit} className="space-y-4 text-black">
              <div>
                <label className="block font-bold text-xs uppercase mb-1 text-black">Your Nickname</label>
                <input
                  type="text"
                  value={storyNickname}
                  onChange={(e) => setStoryNickname(e.target.value)}
                  className="w-full p-3 border-4 border-black text-black placeholder:text-gray-500 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  placeholder="Anonymous"
                />
              </div>
              <div>
                <label className="block font-bold text-xs uppercase mb-1 text-black">The Story</label>
                <textarea
                  rows={5}
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  className="w-full p-3 border-4 border-black text-black placeholder:text-gray-500 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-none"
                  placeholder="So we went to dinner and..."
                  maxLength={3000}
                />
                <p className="text-right text-xs font-bold mt-1 text-black">{storyText.length}/3000</p>
              </div>
              {storyError && <p className="text-sm text-red-600 font-medium">{storyError}</p>}
              <button
                type="submit"
                disabled={storySubmitLoading}
                className="w-full py-3 bg-red-500 text-white font-black uppercase border-4 border-black hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-60"
              >
                {storySubmitLoading ? 'Submitting…' : 'Submit Story'}
              </button>
            </form>
          </div>
        )}

        {!userId && (
          <p className="text-center text-black">Loading…</p>
        )}
      </div>
    </div>
  );
}
