'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareStoryModal({ isOpen, onClose }: ShareStoryModalProps) {
  // MOCK STATE: Change this to 'true' to see the submission form, 'false' to see login
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-6 md:p-8">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
        >
          <X size={24} />
        </button>

        {/* --- VIEW 1: NOT LOGGED IN --- */}
        {!isLoggedIn ? (
          <div className="text-center">
            <h2 className="text-2xl font-black uppercase mb-2">
              {authMode === 'signin' ? 'Welcome Back' : 'Join the Disaster'}
            </h2>
            <p className="mb-6 font-medium text-gray-600">
              You need an account to expose your worst dates.
            </p>

            <form className="space-y-4 text-left">
              <div>
                <label className="block font-bold text-xs uppercase mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block font-bold text-xs uppercase mb-1">Password</label>
                <input
                  type="password"
                  className="w-full p-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsLoggedIn(true)} // Fake login for now
                className="w-full py-3 bg-yellow-400 font-black uppercase border-4 border-black hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                {authMode === 'signin' ? 'Log In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-sm font-bold">
              {authMode === 'signin' ? (
                <p>New here? <button onClick={() => setAuthMode('signup')} className="underline text-blue-600">Create an account</button></p>
              ) : (
                <p>Already have one? <button onClick={() => setAuthMode('signin')} className="underline text-blue-600">Log in</button></p>
              )}
            </div>
          </div>
        ) : (

          /* --- VIEW 2: LOGGED IN (SUBMIT STORY) --- */
          <div>
            <h2 className="text-2xl font-black uppercase mb-4">Spill the Tea ☕️</h2>
            <form className="space-y-4">
              <div>
                <label className="block font-bold text-xs uppercase mb-1">Your Nickname</label>
                <input
                  type="text"
                  className="w-full p-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  placeholder="Anonymous"
                />
              </div>
              <div>
                <label className="block font-bold text-xs uppercase mb-1">The Story</label>
                <textarea
                  rows={5}
                  className="w-full p-3 border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-none"
                  placeholder="So we went to dinner and..."
                ></textarea>
                <p className="text-right text-xs font-bold mt-1 text-black">0/300</p>
              </div>

              <button
                type="button" // Change to submit later
                onClick={onClose}
                className="w-full py-3 bg-red-500 text-white font-black uppercase border-4 border-black hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Submit Story
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
