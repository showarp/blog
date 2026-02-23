import { NextResponse } from 'next/server'
import { getPosts } from '@/lib/notion'

export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'

export async function GET() {
  try {
    const { posts } = await getPosts()

    // Static routes
    const staticRoutes = [
      { path: '', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
      { path: 'about', lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
      { path: 'archive', lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    ]

    // Dynamic post routes
    const postRoutes = posts.map((post) => ({
      path: `post/${post.slug}`,
      lastModified: new Date(post.date || Date.now()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    const allRoutes = [...staticRoutes, ...postRoutes]

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${BASE_URL}/${route.path}</loc>
    <lastmod>${route.lastModified.toISOString()}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 })
  }
}
