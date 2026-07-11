import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { PawPrint } from "lucide-react";
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
  title: "Puppy Meets People",
  description:
    "The dating app where your dog swipes too. Matches on human AND dog compatibility — and tells you why.",
};

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
        {/* Shared nav (TRD §8.0 app shell) */}
        <header className="border-b bg-card">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
          >
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-primary"
            >
              <PawPrint className="size-5" aria-hidden />
              Puppy Meets People
            </Link>
            <div className="flex items-center gap-4 text-sm">
              <Link href="/app" className="hover:text-primary">
                Discover
              </Link>
              <Link href="/app/profile" className="hover:text-primary">
                My Profile
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
