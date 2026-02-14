import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    "Terms and conditions for using the I've Had Worse platform.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-800 text-sm leading-relaxed">
          <p>
            <strong>Last updated:</strong> February 2026
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using I've Had Worse, you agree to be bound by these Terms of
            Service. If you do not agree, please do not use the platform.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">2. Use of the Service</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the platform only for lawful purposes.</li>
            <li>Not submit content that is abusive, hateful, threatening, or violates any law.</li>
            <li>Not attempt to disrupt the service or access it through unauthorized means.</li>
          </ul>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">3. User Content</h2>
          <p>
            By submitting a story, you grant I've Had Worse a non-exclusive, royalty-free,
            worldwide license to display and distribute your submission on the platform.
            You are solely responsible for the content you submit.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">4. Content Moderation</h2>
          <p>
            We reserve the right to remove any content that violates these terms or that we
            deem inappropriate, without prior notice.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">5. Accounts</h2>
          <p>
            You may use the platform with a temporary session or create a registered account.
            You are responsible for maintaining the security of your account credentials.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">6. Disclaimer</h2>
          <p>
            The service is provided "as is" without warranties of any kind. We do not
            guarantee uninterrupted access or that the platform will be error-free.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">7. Limitation of Liability</h2>
          <p>
            I've Had Worse shall not be liable for any indirect, incidental, or consequential
            damages arising from your use of the platform.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">8. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the platform after
            changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-lg font-black uppercase text-black mt-8 mb-2">9. Contact</h2>
          <p>
            If you have questions about these terms, reach out to us via our social media
            channels linked in the footer.
          </p>
        </div>
      </div>
    </main>
  );
}
