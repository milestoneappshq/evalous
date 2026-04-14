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
    default: "Evalous | Professional Cognitive & Skill Assessment",
    template: "%s | Evalous"
  },
  description: "The premier platform for high-integrity cognitive benchmarks, psychometric assessments, and recruitment evaluations.",
  metadataBase: new URL('https://evalous.milestoneapps.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Evalous | High-Integrity Cognitive Profiling",
    description: "Military-grade psychometric assessments and neural benchmarks with microsecond precision.",
    url: 'https://evalous.milestoneapps.com',
    siteName: 'Evalous',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Evalous | Professional Cognitive Assessment",
    description: "Benchmark your cognitive profile with institutional precision.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

import Footer from "@/components/layout/Footer";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <div className="flex-1">{children}</div>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
