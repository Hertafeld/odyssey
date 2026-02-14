import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "See the top-voted worst date stories ranked by 'That's Bad' votes. Find out which dating disasters the community thinks are the most cringe-worthy.",
  openGraph: {
    title: "Leaderboard | I've Had Worse",
    description:
      "See the top-voted worst date stories ranked by 'That's Bad' votes.",
  },
  twitter: {
    card: "summary",
    title: "Leaderboard | I've Had Worse",
    description:
      "See the top-voted worst date stories ranked by 'That's Bad' votes.",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
