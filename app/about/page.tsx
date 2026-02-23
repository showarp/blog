import type { Metadata } from 'next'
import AboutClient from './AboutClient'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about the author of this blog',
  openGraph: {
    title: 'About | Blog',
    description: 'Learn more about the author of this blog',
    url: `${SITE_URL}/about`,
    type: 'profile',
  },
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
}

export default function About() {
  return <AboutClient />
}
