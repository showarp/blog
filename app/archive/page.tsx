import type { Metadata } from 'next'
import ArchiveClient from './ArchiveClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Browse all articles organized by year',
  openGraph: {
    title: 'Archive | Blog',
    description: 'Browse all articles organized by year',
    url: `${SITE_URL}/archive`,
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/archive`,
  },
}

export default function Archive() {
  return <ArchiveClient />
}
