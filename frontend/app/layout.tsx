import type { Metadata } from "next";
import { NTR, Patrick_Hand } from "next/font/google";
import "./globals.css";

const ntr = NTR({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ntr",
});

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick",
});

export const metadata: Metadata = {
  title: "Book Recommender",
  description:
    "This project creates a semantic book recommendation system using various LLM techniques and technologies. Users can discover books through natural language queries, filter by fiction/non-fiction categories, and sort by emotional tone.",
  icons: {
    icon: "/BookOpen.svg",
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
        className={`${ntr.variable} ${patrickHand.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
