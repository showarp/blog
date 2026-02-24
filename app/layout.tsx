import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
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
          <main className="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
