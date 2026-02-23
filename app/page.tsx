import type { Metadata } from 'next'
import HomeClient from './HomeClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'

export const metadata: Metadata = {
  title: 'Home',
  description: 'A technical blog about software development, machine learning, and everything in between',
  openGraph: {
    title: 'Blog | Tech & Thoughts',
    description: 'Exploring software development, one article at a time.',
    url: SITE_URL,
    type: 'website',
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function Home() {
  return <HomeClient />
}
