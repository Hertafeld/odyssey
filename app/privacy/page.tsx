import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    "How I've Had Worse collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="flex min-h-screen flex-col bg-yellow-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="text-sm font-semibold text-gray-500 hover:text-black transition-colors mb-6 inline-block"
        >
          &larr; Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-black mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-800 text-sm leading-relaxed">
          <p>
            <strong>Last updated:</strong> February 2026
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">1. Information We Collect</h2>
          <p>
            When you use I've Had Worse, we may collect the following information:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>A randomly generated identifier stored in your browser's local storage to maintain your session.</li>
            <li>Your email address and password if you choose to create an account.</li>
            <li>Stories and nicknames you voluntarily submit.</li>
            <li>Votes you cast on stories.</li>
          </ul>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide the core service — showing stories, recording votes, and displaying the leaderboard.</li>
            <li>Authenticate your account if you choose to register.</li>
            <li>Improve and maintain the platform.</li>
          </ul>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">3. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties.
            Submitted stories and nicknames are displayed publicly on the platform.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">4. Cookies &amp; Local Storage</h2>
          <p>
            We use browser local storage to maintain your session identifier. We do not use
            third-party tracking cookies.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">5. Data Retention</h2>
          <p>
            Your data is retained for as long as your account exists. Temporary accounts and
            their associated data may be periodically cleaned up.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">6. Contact</h2>
          <p>
            If you have questions about this privacy policy, reach out to us via our social
            media channels linked in the footer.
          </p>
        </div>
      </div>
    </main>
  );
}
