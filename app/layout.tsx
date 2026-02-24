import type { Metadata } from "next";
import Link from "next/link";
import { ThemeProvider } from "next-themes";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";
import "katex/dist/katex.min.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Blog | Tech & Thoughts",
    template: "%s | Blog",
  },
  description: "A technical blog about software development, machine learning, and everything in between",
  keywords: ["blog", "tech", "software development", "machine learning", "programming", "tutorial"],
  authors: [{ name: "Your Name", url: SITE_URL }],
  creator: "Your Name",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    title: "Blog | Tech & Thoughts",
    description: "A technical blog about software development, machine learning, and everything in between",
    siteName: "Tech & Thoughts Blog",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Blog OG Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Tech & Thoughts",
    description: "A technical blog about software development, machine learning, and everything in between",
    creator: "@yourtwitterhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // 添加 Google Search Console 验证
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      </head>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CustomCursor />
          <header className="header">
            <div className="container">
              <div className="header-inner">
                <Link href="/" className="logo">
                  <span className="logo-mark">/</span>
                  <span className="logo-text">blog</span>
                </Link>
                <nav className="nav">
                  <Link href="/" className="nav-link">
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <line x1="3" y1="9" x2="21" y2="9"/>
                      <line x1="9" y1="21" x2="9" y2="9"/>
                    </svg>
                    Home
                  </Link>
                  <Link href="/about" className="nav-link">
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M12 14c-6 0-8 3-8 6v2h16v-2c0-3-2-6-8-6z"/>
                    </svg>
                    About
                  </Link>
                  <Link href="/archive" className="nav-link">
                    <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Archive
                  </Link>
                  <ThemeToggle />
                </nav>
              </div>
            </div>
          </header>

          <main className="main">{children}</main>

          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
