import { Metadata } from 'next'
import PostClient from './PostClient'
import { getPostBySlug } from '@/lib/notion'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'

// Generate metadata for each post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const postData = await getPostBySlug(slug)

  if (!postData) {
    return {
      title: 'Article Not Found',
      description: 'The article you are looking for could not be found.',
    }
  }

  const { post } = postData
  const postUrl = `${SITE_URL}/post/${slug}`
  const imageUrl = post.cover || `${SITE_URL}/og-image.png`

  return {
    title: post.title,
    description: post.summary || `Read ${post.title} on our blog`,
    openGraph: {
      title: post.title,
      description: post.summary || `Read ${post.title} on our blog`,
      url: postUrl,
      type: 'article',
      publishedTime: post.date,
      authors: ['Your Name'],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary || `Read ${post.title} on our blog`,
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  return <PostClient params={params} />
}
