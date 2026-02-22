import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { Post, AboutInfo } from '@/types'

export type { Post, AboutInfo }

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const n2m = new NotionToMarkdown({ notionClient: notion })

function getPropertyValue(prop: any): any {
  if (!prop) return null

  switch (prop.type) {
    case 'title':
      return prop.title?.[0]?.plain_text || ''
    case 'rich_text':
      return prop.rich_text?.[0]?.plain_text || ''
    case 'text':
      return prop.text?.content || ''
    case 'select':
      return prop.select?.name || null
    case 'multi_select':
      return prop.multi_select?.map((item: any) => item.name) || []
    case 'checkbox':
      return prop.checkbox || false
    case 'date':
      return prop.date?.start || null
    case 'created_time':
      return prop.created_time || null
    case 'url':
      return prop.url || null
    case 'email':
      return prop.email || null
    case 'files':
      if (prop.files?.[0]?.file) {
        return prop.files[0].file.url
      } else if (prop.files?.[0]?.external) {
        return prop.files[0].external.url
      }
      return null
    default:
      return null
  }
}

export async function getPosts(options?: {
  tag?: string
  category?: string
  search?: string
}): Promise<{ posts: Post[]; total: number }> {
  // Normalize database ID (remove dashes for comparison)
  const normalizeId = (id: string) => id.replace(/-/g, '')
  const databaseId = normalizeId(process.env.NOTION_DATABASE_ID!)

  // Use search API to query the database
  const response = await notion.search({
    filter: {
      value: 'page',
      property: 'object',
    },
    sort: {
      direction: 'descending',
      timestamp: 'last_edited_time',
    },
  })

  // Filter results to only include our database
  const databasePages = response.results.filter(
    (item: any) => {
      const parentDbId = item.parent?.database_id
      return parentDbId && normalizeId(parentDbId) === databaseId
    }
  )

  let posts = databasePages
    .map((page: any) => {
      const props = page.properties
      return {
        id: page.id,
        title: getPropertyValue(props.Name),
        slug: getPropertyValue(props.Slug),
        summary: getPropertyValue(props.Summary),
        cover: getPropertyValue(props.Cover),
        tags: getPropertyValue(props['Tags ']) || [],
        category: getPropertyValue(props.Category),
        published: getPropertyValue(props.Published),
        date: getPropertyValue(props.Date) || (page as any).created_time,
      } as Post
    })
    .filter((post: Post) => post.published === true)

  // Filter by tag
  if (options?.tag) {
    posts = posts.filter((post) => post.tags.includes(options.tag!))
  }

  // Filter by category
  if (options?.category) {
    posts = posts.filter((post) => post.category === options.category)
  }

  // Search filter
  if (options?.search) {
    const searchLower = options.search.toLowerCase()
    posts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        post.summary.toLowerCase().includes(searchLower)
    )
  }

  // Sort by date (handle null dates)
  posts.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })

  return {
    posts,
    total: posts.length,
  }
}

export async function getPostBySlug(slug: string): Promise<{ post: Post; content: string } | null> {
  const normalizeId = (id: string) => id.replace(/-/g, '')
  const databaseId = normalizeId(process.env.NOTION_DATABASE_ID!)

  // Search for the page with specific slug
  const response = await notion.search({
    filter: {
      value: 'page',
      property: 'object',
    },
  })

  // Find the page in our database with matching slug
  const page = response.results.find(
    (item: any) => {
      const parentDbId = item.parent?.database_id
      return parentDbId && normalizeId(parentDbId) === databaseId &&
        item.properties?.Slug?.rich_text?.[0]?.plain_text === slug
    }
  )

  if (!page || !('properties' in page)) {
    return null
  }

  const pageWithProps = page as any
  const props = pageWithProps.properties

  const post: Post = {
    id: page.id,
    title: getPropertyValue(props.Name),
    slug: getPropertyValue(props.Slug),
    summary: getPropertyValue(props.Summary),
    cover: getPropertyValue(props.Cover),
    tags: getPropertyValue(props['Tags ']) || [],
    category: getPropertyValue(props.Category),
    published: getPropertyValue(props.Published),
    date: getPropertyValue(props.Date) || (page as any).created_time,
  }

  // Get content as markdown
  const mdblocks = await n2m.pageToMarkdown(page.id)
  const content = n2m.toMarkdownString(mdblocks).parent

  return { post, content }
}

export async function getAbout(): Promise<AboutInfo | null> {
  const normalizeId = (id: string) => id.replace(/-/g, '')
  const databaseId = normalizeId(process.env.NOTION_ABOUT_DATABASE_ID!)

  const response = await notion.search({
    filter: {
      value: 'page',
      property: 'object',
    },
  })

  const aboutPage = response.results.find(
    (item: any) => {
      const parentDbId = item.parent?.database_id
      return parentDbId && normalizeId(parentDbId) === databaseId
    }
  )

  if (!aboutPage || !('properties' in aboutPage)) {
    return null
  }

  const aboutPageWithProps = aboutPage as any
  const props = aboutPageWithProps.properties

  // Helper to try multiple property names
  const getProp = (names: string[]): any => {
    for (const name of names) {
      const val = getPropertyValue(props[name])
      if (val) return val
    }
    return null
  }

  return {
    name: getPropertyValue(props.Name),
    avatar: getProp(['Avatar', 'Avatar ', ' Avatar']) || getPropertyValue(props.Avatar),
    bio: getPropertyValue(props.Bio),
    bioExtended: getProp(['BioExtended', 'BioExtended ', ' BioExtended']) || '',
    email: getPropertyValue(props.Email) || '',
    github: getPropertyValue(props.GitHub) || '',
    leetcode: getPropertyValue(props.Leetcode) || '',
    qq: getPropertyValue(props.QQ) || '',
  }
}

export async function getTags(): Promise<string[]> {
  const normalizeId = (id: string) => id.replace(/-/g, '')
  const databaseId = normalizeId(process.env.NOTION_DATABASE_ID!)

  const response = await notion.search({
    filter: {
      value: 'page',
      property: 'object',
    },
  })

  const tagSet = new Set<string>()
  response.results
    .filter((item: any) => {
      const parentDbId = item.parent?.database_id
      return parentDbId && normalizeId(parentDbId) === databaseId
    })
    .forEach((page: any) => {
      const tags = getPropertyValue(page.properties['Tags ']) || []
      tags.forEach((tag: string) => tagSet.add(tag))
    })

  return Array.from(tagSet).sort()
}

export async function getCategories(): Promise<string[]> {
  const normalizeId = (id: string) => id.replace(/-/g, '')
  const databaseId = normalizeId(process.env.NOTION_DATABASE_ID!)

  const response = await notion.search({
    filter: {
      value: 'page',
      property: 'object',
    },
  })

  const categorySet = new Set<string>()
  response.results
    .filter((item: any) => {
      const parentDbId = item.parent?.database_id
      return parentDbId && normalizeId(parentDbId) === databaseId
    })
    .forEach((page: any) => {
      const category = getPropertyValue(page.properties.Category)
      if (category) {
        categorySet.add(category)
      }
    })

  return Array.from(categorySet).sort()
}
