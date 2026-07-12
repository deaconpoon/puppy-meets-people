import type { Metadata } from "next";
import { Baloo_2, Figtree, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
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
      className={`${baloo.variable} ${figtree.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Shared nav (TRD §8.0 app shell) */}
        <header className="border-b border-border/60 bg-background/90 backdrop-blur">
          <nav
            aria-label="Main"
            className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"
          >
            <Link
              href="/"
              className="flex items-center gap-2.5 font-display text-lg font-bold text-foreground"
            >
              <span
                aria-hidden
                className="gradient-sunrise grid size-9 place-items-center rounded-xl text-white"
              >
                <PawPrint className="size-5" />
              </span>
              Puppy Meets People
            </Link>
            <div className="flex items-center gap-5 text-sm font-semibold text-muted-foreground">
              <Link href="/app" className="transition-colors hover:text-primary">
                Discover
              </Link>
              <Link
                href="/app/profile"
                className="transition-colors hover:text-primary"
              >
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
