import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "I've Had Worse – Swipe Through the Worst Dates",
    template: "%s | I've Had Worse",
  },
  description:
    "Swipe through the worst date stories, vote on the most cringe-worthy disasters, share your own, and see which stories top the leaderboard.",
  openGraph: {
    title: "I've Had Worse – Swipe Through the Worst Dates",
    description:
      "Swipe through the worst date stories, vote on the most cringe-worthy disasters, share your own, and see which stories top the leaderboard.",
    siteName: "I've Had Worse",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "I've Had Worse – Swipe Through the Worst Dates",
    description:
      "Swipe through the worst date stories, vote on the most cringe-worthy disasters, share your own, and see which stories top the leaderboard.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
