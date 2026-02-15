'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareStoryModal from '@/components/ShareStoryModal';
import { getOrCreateCookieId, clearCookieId, saveSession, loadSession, clearSession } from '@/lib/auth';
import { Trash2 } from 'lucide-react';

interface MyStory {
  id: string;
  text: string;
  storyName: string | null;
  sucksCount: number;
  iveHadWorseCount: number;
  createdAt: string;
}

interface MyVote {
  storyId: string;
  vote: 'sucks' | 'ive_had_worse';
  createdAt: string;
  storyText: string;
  storyName: string | null;
}

interface AccountInfo {
  email: string | null;
  createdAt: string | null;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [stories, setStories] = useState<MyStory[]>([]);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [isTempAccount, setIsTempAccount] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cookieId, setCookieId] = useState<string>('');
  const [modalMode, setModalMode] = useState<'auth' | 'submit' | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Delete story
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Voting history
  const [votes, setVotes] = useState<MyVote[]>([]);
  const [votesLoading, setVotesLoading] = useState(true);
  const [changingVoteId, setChangingVoteId] = useState<string | null>(null);
  const [voteFilter, setVoteFilter] = useState<'all' | 'sucks' | 'ive_had_worse'>('all');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const cid = getOrCreateCookieId();
    setCookieId(cid);

    const saved = loadSession();
    if (saved && !saved.isTempAccount) {
      setUserId(saved.userId);
      setIsTempAccount(saved.isTempAccount);
      setUserEmail(saved.userEmail);
      setAuthLoading(false);
      return;
    }

    if (!cid) { setAuthLoading(false); return; }
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookieId: cid }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.userId) {
          setUserId(data.userId);
          setIsTempAccount(data.isTempAccount ?? true);
        }
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLoginSuccess = (params: { userId: string; isTempAccount: boolean; userEmail?: string | null }) => {
    setUserId(params.userId);
    setIsTempAccount(params.isTempAccount);
    setUserEmail(params.userEmail ?? null);
    saveSession({ userId: params.userId, isTempAccount: params.isTempAccount, userEmail: params.userEmail ?? null });
  };

  const handleSignOut = () => {
    clearCookieId();
    clearSession();
    setUserId(null);
    setIsTempAccount(true);
    setUserEmail(null);
    setStories([]);
    setAccount(null);
    const newCid = getOrCreateCookieId();
    setCookieId(newCid);
    if (newCid) {
      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookieId: newCid }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.userId) {
            setUserId(data.userId);
          }
        });
    }
  };

  // Fetch user's stories + account info
  useEffect(() => {
    if (!userId || isTempAccount) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchMyStories() {
      try {
        const res = await fetch('/api/my-stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!json.success) {
          setError(json.error ?? 'Failed to load stories');
          return;
        }
        setStories(json.stories ?? []);
        setAccount(json.account ?? null);
        setError(null);
      } catch {
        if (!cancelled) setError('Failed to load stories');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    setLoading(true);
    fetchMyStories();
    return () => { cancelled = true; };
  }, [userId, isTempAccount]);

  // Fetch voting history
  useEffect(() => {
    if (!userId || isTempAccount) {
      setVotesLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchMyVotes() {
      try {
        const res = await fetch('/api/my-votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json.success) {
          setVotes(json.votes ?? []);
        }
      } catch {
        // silent fail for votes
      } finally {
        if (!cancelled) setVotesLoading(false);
      }
    }
    setVotesLoading(true);
    fetchMyVotes();
    return () => { cancelled = true; };
  }, [userId, isTempAccount]);

  const handleChangeVote = async (storyId: string, newVote: 'sucks' | 'ive_had_worse') => {
    if (!userId) return;
    setChangingVoteId(storyId);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, userId, vote: newVote }),
      });
      const data = await res.json();
      if (data.success) {
        setVotes((prev) => prev.map((v) =>
          v.storyId === storyId ? { ...v, vote: newVote } : v
        ));
      }
    } finally {
      setChangingVoteId(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        setPwError(
          data.error === 'wrong_password' ? 'Current password is incorrect.'
          : data.error === 'new_password_too_short' ? 'New password must be at least 6 characters.'
          : data.error ?? 'Something went wrong.'
        );
        return;
      }
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3000);
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    setDeletingId(storyId);
    try {
      const res = await fetch('/api/delete-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, storyId }),
      });
      const data = await res.json();
      if (data.success) {
        setStories((prev) => prev.filter((s) => s.id !== storyId));
      }
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const needsSignIn = mounted && !authLoading && isTempAccount;
  const totalVotesReceived = stories.reduce((sum, s) => sum + s.sucksCount + s.iveHadWorseCount, 0);
  const totalBadReceived = stories.reduce((sum, s) => sum + s.sucksCount, 0);
  const totalWorseReceived = stories.reduce((sum, s) => sum + s.iveHadWorseCount, 0);
  const totalVotesCast = votes.length;
  const totalBadCast = votes.filter((v) => v.vote === 'sucks').length;
  const totalWorseCast = votes.filter((v) => v.vote === 'ive_had_worse').length;

  // Achievements (computed on the fly)
  const hasControversial = stories.some((s) => {
    const total = s.sucksCount + s.iveHadWorseCount;
    if (total < 10) return false;
    const ratio = Math.min(s.sucksCount, s.iveHadWorseCount) / Math.max(s.sucksCount, s.iveHadWorseCount);
    return ratio >= 0.4;
  });

  const achievements: { id: string; icon: string; name: string; description: string; unlocked: boolean }[] = [
    { id: 'first_story', icon: '✍️', name: 'First Story', description: 'Post your first story', unlocked: stories.length >= 1 },
    { id: 'storyteller', icon: '📖', name: 'Storyteller', description: 'Post 3 stories', unlocked: stories.length >= 3 },
    { id: 'prolific', icon: '🏆', name: 'Prolific Writer', description: 'Post 10 stories', unlocked: stories.length >= 10 },
    { id: 'first_vote', icon: '👆', name: 'First Vote', description: 'Vote on your first story', unlocked: totalVotesCast >= 1 },
    { id: 'judge', icon: '⚖️', name: 'Judge Judy', description: 'Vote on 25 stories', unlocked: totalVotesCast >= 25 },
    { id: 'veteran_voter', icon: '🗳️', name: 'Veteran Voter', description: 'Vote on 100 stories', unlocked: totalVotesCast >= 100 },
    { id: 'crowd_pleaser', icon: '🔥', name: 'Crowd Pleaser', description: 'Get 10 votes on a story', unlocked: stories.some((s) => s.sucksCount + s.iveHadWorseCount >= 10) },
    { id: 'viral', icon: '💥', name: 'Viral', description: 'Get 50 votes on a story', unlocked: stories.some((s) => s.sucksCount + s.iveHadWorseCount >= 50) },
    { id: 'truly_terrible', icon: '💀', name: 'Truly Terrible', description: 'Get 25 "That\'s Bad" on a single story', unlocked: stories.some((s) => s.sucksCount >= 25) },
    { id: 'controversial', icon: '🤔', name: 'Controversial', description: 'Have a story with a near-even split (10+ votes)', unlocked: hasControversial },
    { id: 'all_bad', icon: '😈', name: 'Always Bad', description: 'Vote "That\'s Bad" 10 times', unlocked: totalBadCast >= 10 },
    { id: 'all_worse', icon: '🤷', name: 'Seen It All', description: 'Vote "Had Worse" 10 times', unlocked: totalWorseCast >= 10 },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <main className="flex min-h-screen flex-col bg-yellow-50 overflow-hidden relative">
      <div
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      <Header
        isTempAccount={isTempAccount}
        authLoading={authLoading}
        onSignInClick={() => setModalMode('auth')}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-col items-center flex-1 z-10 p-4 pt-6 pb-8">
        <nav className="w-full max-w-2xl mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-sm">
            <li>
              <Link href="/" className="font-semibold text-gray-500 hover:text-black transition-colors">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="font-semibold text-black">Dashboard</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tighter text-center mb-2">
          Dashboard
        </h1>
        <p className="text-base font-semibold text-black text-center mb-6 max-w-md">
          Your account, your stories, your stats.
        </p>

        {/* Not signed in */}
        {needsSignIn && (
          <div className="w-full max-w-2xl bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-8 text-center">
            <h2 className="text-xl font-black uppercase text-black mb-2">Sign in to continue</h2>
            <p className="text-sm font-medium text-gray-700 mb-4">
              You need an account to access your dashboard.
            </p>
            <button
              onClick={() => setModalMode('auth')}
              className="inline-block px-6 py-3 bg-yellow-400 text-black font-black uppercase border-4 border-black hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Loading */}
        {!needsSignIn && loading && (
          <p className="text-center font-bold text-black py-12">Loading…</p>
        )}

        {/* Error */}
        {!needsSignIn && error && !loading && (
          <div className="w-full max-w-2xl bg-white border-4 border-black rounded-xl p-6 text-center">
            <p className="font-bold text-black">{error}</p>
          </div>
        )}

        {/* Dashboard content */}
        {!needsSignIn && !loading && !error && (
          <div className="w-full max-w-2xl space-y-10">

            {/* Account info */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-3">Account</h2>
              <p className="text-base font-bold text-black truncate">{account?.email ?? userEmail ?? '—'}</p>
              {account?.createdAt && (
                <p className="text-xs font-semibold text-gray-500 mt-1">
                  Member since {formatDate(account.createdAt)}
                </p>
              )}
            </div>

            {/* Statistics */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5 sm:p-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-5">Statistics</h2>

              {/* Your Stories row */}
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 pb-1 border-b-2 border-gray-100">Your Stories</h3>
                <div className="flex items-center justify-around text-center">
                  <div className="px-2">
                    <p className="text-3xl font-black text-black">{stories.length}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mt-0.5">Posted</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="px-2">
                    <p className="text-3xl font-black text-yellow-600">{totalBadReceived}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mt-0.5">That&apos;s Bad</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="px-2">
                    <p className="text-3xl font-black text-red-600">{totalWorseReceived}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mt-0.5">Had Worse</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="px-2">
                    <p className="text-3xl font-black text-gray-400">{totalVotesReceived}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mt-0.5">Total</p>
                  </div>
                </div>
              </div>

              {/* Your Votes row */}
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-wider text-black mb-3 pb-1 border-b-2 border-gray-100">Your Votes</h3>
                <div className="flex items-center justify-around text-center">
                  <div className="px-2">
                    <p className="text-3xl font-black text-black">{totalVotesCast}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mt-0.5">Total</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="px-2">
                    <p className="text-3xl font-black text-yellow-600">{totalBadCast}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mt-0.5">That&apos;s Bad</p>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="px-2">
                    <p className="text-3xl font-black text-red-600">{totalWorseCast}</p>
                    <p className="text-[10px] font-bold uppercase text-gray-500 mt-0.5">Had Worse</p>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-black mb-1 pb-1 border-b-2 border-gray-100">
                  Achievements
                </h3>
                <p className="text-xs font-semibold text-gray-400 mb-4">{unlockedCount}/{achievements.length} unlocked</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {achievements.map((a) => (
                    <div
                      key={a.id}
                      className={`relative rounded-lg border-2 p-3 text-center transition-all ${
                        a.unlocked
                          ? 'border-black bg-yellow-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-gray-200 bg-gray-50 opacity-50'
                      }`}
                    >
                      <span className="text-2xl block mb-1" role="img" aria-label={a.name}>
                        {a.unlocked ? a.icon : '🔒'}
                      </span>
                      <p className={`text-xs font-black uppercase leading-tight ${a.unlocked ? 'text-black' : 'text-gray-400'}`}>
                        {a.name}
                      </p>
                      <p className={`text-[10px] mt-0.5 leading-tight ${a.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                        {a.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stories section */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">Your Stories</h2>
                <button
                  onClick={() => setModalMode('submit')}
                  className="px-3 py-1.5 bg-red-500 text-white font-bold uppercase text-[10px] border-2 border-red-700 hover:bg-red-600 transition-colors"
                >
                  + New Story
                </button>
              </div>

              {stories.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="font-bold text-black text-lg mb-2">No stories yet</p>
                  <p className="text-sm text-gray-600">You haven&apos;t shared any stories. Time to spill the tea!</p>
                </div>
              ) : (
                <div className="max-h-[28rem] overflow-y-auto space-y-3 pr-1">
                  {stories.map((story) => {
                    const storyVotes = story.sucksCount + story.iveHadWorseCount;
                    const isConfirming = confirmDeleteId === story.id;
                    const isDeleting = deletingId === story.id;
                    return (
                      <div
                        key={story.id}
                        className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-400 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                              {formatDate(story.createdAt)}
                            </p>
                            {story.storyName && (
                              <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mt-0.5">
                                — {story.storyName}
                              </p>
                            )}
                          </div>
                          {isConfirming ? (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] font-bold text-red-600">Delete?</span>
                              <button
                                onClick={() => handleDeleteStory(story.id)}
                                disabled={isDeleting}
                                className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase border-2 border-red-700 hover:bg-red-600 transition-colors disabled:opacity-60"
                              >
                                {isDeleting ? '…' : 'Yes'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 bg-gray-100 text-black text-[10px] font-bold uppercase border-2 border-gray-300 hover:bg-gray-200 transition-colors"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(story.id)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                              title="Delete story"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="font-medium italic text-gray-900 leading-relaxed text-sm mb-2 line-clamp-2">
                          <span className="text-lg font-serif leading-none text-gray-300 mr-0.5">&ldquo;</span>
                          {story.text}
                          <span className="text-lg font-serif leading-none text-gray-300 ml-0.5">&rdquo;</span>
                        </p>
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-yellow-700">{story.sucksCount}</span>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">That&apos;s Bad</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-black text-red-700">{story.iveHadWorseCount}</span>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">Had Worse</span>
                          </div>
                          <span className="ml-auto text-[10px] font-bold text-gray-400">{storyVotes} vote{storyVotes !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Voting history */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-400">Voting History</h2>
                <Link
                  href="/"
                  className="px-3 py-1.5 bg-black text-white font-bold uppercase text-[10px] border-2 border-black hover:bg-gray-800 transition-colors"
                >
                  Vote More
                </Link>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 mb-4">
                {([
                  { key: 'all' as const, label: 'All' },
                  { key: 'sucks' as const, label: "That\u2019s Bad" },
                  { key: 'ive_had_worse' as const, label: 'Had Worse' },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setVoteFilter(tab.key)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase border-2 transition-all ${
                      voteFilter === tab.key
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {votesLoading ? (
                <p className="text-center font-bold text-black py-6">Loading votes…</p>
              ) : votes.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="font-bold text-black text-lg mb-2">No votes yet</p>
                  <p className="text-sm text-gray-600">You haven&apos;t voted on any stories yet. Go swipe!</p>
                </div>
              ) : (() => {
                const filtered = voteFilter === 'all' ? votes : votes.filter((v) => v.vote === voteFilter);
                return filtered.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm font-semibold text-gray-500">No votes in this category.</p>
                  </div>
                ) : (
                  <div className="max-h-[28rem] overflow-y-auto space-y-3 pr-1">
                    {filtered.map((v) => {
                      const isChanging = changingVoteId === v.storyId;
                      const isBad = v.vote === 'sucks';
                      return (
                        <div
                          key={v.storyId}
                          className="border-2 border-gray-200 rounded-lg p-3 hover:border-gray-400 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded border-2 ${
                              isBad
                                ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                                : 'bg-red-100 border-red-500 text-red-800'
                            }`}>
                              {isBad ? "That\u2019s Bad" : "Had Worse"}
                            </span>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                              {formatDate(v.createdAt)}
                            </p>
                          </div>
                          <p className="font-medium italic text-gray-900 leading-relaxed text-sm mb-2 line-clamp-2">
                            <span className="text-lg font-serif leading-none text-gray-300 mr-0.5">&ldquo;</span>
                            {v.storyText}
                            <span className="text-lg font-serif leading-none text-gray-300 ml-0.5">&rdquo;</span>
                          </p>
                          {v.storyName && (
                            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2 text-right">
                              — {v.storyName}
                            </p>
                          )}
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 mr-auto">Change:</span>
                            <button
                              onClick={() => handleChangeVote(v.storyId, 'sucks')}
                              disabled={isChanging || isBad}
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase border-2 transition-colors disabled:opacity-40 ${
                                isBad
                                  ? 'bg-yellow-400 border-yellow-600 text-yellow-900'
                                  : 'bg-white border-gray-300 text-black hover:border-yellow-500 hover:bg-yellow-50'
                              }`}
                            >
                              That&apos;s Bad
                            </button>
                            <button
                              onClick={() => handleChangeVote(v.storyId, 'ive_had_worse')}
                              disabled={isChanging || !isBad}
                              className={`px-2 py-0.5 text-[10px] font-bold uppercase border-2 transition-colors disabled:opacity-40 ${
                                !isBad
                                  ? 'bg-red-500 border-red-700 text-white'
                                  : 'bg-white border-gray-300 text-black hover:border-red-500 hover:bg-red-50'
                              }`}
                            >
                              Had Worse
                            </button>
                            {isChanging && <span className="text-[10px] text-gray-400 font-semibold">Saving…</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Change password */}
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block font-bold text-xs uppercase mb-1 text-black">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); setPwError(null); }}
                    className="w-full p-2.5 border-4 border-black text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-xs uppercase mb-1 text-black">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPwError(null); }}
                      className="w-full p-2.5 border-4 border-black text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm"
                      placeholder="min 6 characters"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs uppercase mb-1 text-black">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPwError(null); }}
                      className="w-full p-2.5 border-4 border-black text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-sm"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                {pwError && <p className="text-sm text-red-600 font-medium">{pwError}</p>}
                {pwSuccess && <p className="text-sm text-green-700 font-semibold">Password updated successfully!</p>}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-5 py-2.5 bg-black text-white font-bold uppercase text-sm border-4 border-black hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {pwLoading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <ShareStoryModal
        isOpen={modalMode !== null}
        mode={modalMode ?? 'submit'}
        onClose={() => setModalMode(null)}
        userId={userId}
        isTempAccount={isTempAccount}
        userEmail={userEmail}
        cookieId={cookieId}
        onLoginSuccess={handleLoginSuccess}
        onSignOut={handleSignOut}
      />
    </main>
  );
}
