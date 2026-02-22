import 'dotenv/config'
import { Client } from '@notionhq/client'

// Load .env.local explicitly
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { NotionToMarkdown } from 'notion-to-md'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const n2m = new NotionToMarkdown({ notionClient: notion })

// Helper function
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

async function testNotion() {
  console.log('=== Testing Notion API ===\n')

  // Test 1: Get all posts using search API
  console.log('1. Testing getPosts()...')
  try {
    const normalizeId = (id: string) => id.replace(/-/g, '')
    const databaseId = normalizeId(process.env.NOTION_DATABASE_ID!)

    const response = await notion.search({
      filter: {
        value: 'page',
        property: 'object',
      },
    })

    const databasePages = (response.results as any[]).filter(
      (item) => {
        const parentDbId = item.parent?.database_id
        return parentDbId && normalizeId(parentDbId) === databaseId
      }
    )

    const posts = databasePages
      .map((page: any) => ({
        id: page.id,
        title: getPropertyValue(page.properties.Name),
        slug: getPropertyValue(page.properties.Slug),
        summary: getPropertyValue(page.properties.Summary),
        cover: getPropertyValue(page.properties.Cover),
        tags: getPropertyValue(page.properties.Tags) || [],
        category: getPropertyValue(page.properties.Category),
        date: getPropertyValue(page.properties.Date),
        published: getPropertyValue(page.properties.Published),
      }))
      .filter((post: any) => post.published === true)

    console.log(`   ✓ Success! Found ${posts.length} published posts`)
    if (posts.length > 0) {
      console.log(`   Sample post: "${posts[0].title}" (slug: ${posts[0].slug})`)
    }
  } catch (error: any) {
    console.log(`   ✗ Error: ${error.message}`)
  }
  console.log()

  // Test 2: Get tags
  console.log('2. Testing getTags()...')
  try {
    const normalizeId = (id: string) => id.replace(/-/g, '')
    const databaseId = normalizeId(process.env.NOTION_DATABASE_ID!)

    const response = await notion.search({
      filter: { value: 'page', property: 'object' },
    })

    const tagSet = new Set<string>()

    ;(response.results as any[])
      .filter((item) => {
        const parentDbId = item.parent?.database_id
        return parentDbId && normalizeId(parentDbId) === databaseId
      })
      .forEach((page: any) => {
        const tags = getPropertyValue(page.properties.Tags) || []
        tags.forEach((tag: string) => tagSet.add(tag))
      })

    const tags = Array.from(tagSet).sort()
    console.log(`   ✓ Success! Found ${tags.length} tags:`, tags)
  } catch (error: any) {
    console.log(`   ✗ Error: ${error.message}`)
  }
  console.log()

  // Test 3: Get categories
  console.log('3. Testing getCategories()...')
  try {
    const normalizeId = (id: string) => id.replace(/-/g, '')
    const databaseId = normalizeId(process.env.NOTION_DATABASE_ID!)

    const response = await notion.search({
      filter: { value: 'page', property: 'object' },
    })

    const categorySet = new Set<string>()

    ;(response.results as any[])
      .filter((item) => {
        const parentDbId = item.parent?.database_id
        return parentDbId && normalizeId(parentDbId) === databaseId
      })
      .forEach((page: any) => {
        const category = getPropertyValue(page.properties.Category)
        if (category) categorySet.add(category)
      })

    const categories = Array.from(categorySet).sort()
    console.log(`   ✓ Success! Found ${categories.length} categories:`, categories)
  } catch (error: any) {
    console.log(`   ✗ Error: ${error.message}`)
  }
  console.log()

  // Test 4: Get about info
  console.log('4. Testing getAbout()...')
  try {
    const normalizeId = (id: string) => id.replace(/-/g, '')
    const databaseId = normalizeId(process.env.NOTION_ABOUT_DATABASE_ID!)

    const response = await notion.search({
      filter: { value: 'page', property: 'object' },
    })

    const aboutPage = (response.results as any[]).find(
      (item) => {
        const parentDbId = item.parent?.database_id
        return parentDbId && normalizeId(parentDbId) === databaseId
      }
    )

    if (aboutPage && 'properties' in aboutPage) {
      const props = aboutPage.properties

      const about = {
        name: getPropertyValue(props.Name),
        avatar: getPropertyValue(props.Avatar),
        bio: getPropertyValue(props.Bio),
        bioExtended: getPropertyValue(props.BioExtended) || '',
        email: getPropertyValue(props.Email) || '',
        github: getPropertyValue(props.GitHub) || '',
        website: getPropertyValue(props.Website) || '',
        wechat: getPropertyValue(props.Wechat) || '',
      }

      console.log(`   ✓ Success! Found about info:`)
      console.log(`   - Name: ${about.name}`)
      console.log(`   - Bio: ${about.bio}`)
      console.log(`   - Email: ${about.email}`)
      console.log(`   - GitHub: ${about.github}`)
    } else {
      console.log(`   ✗ No about info found (empty database)`)
    }
  } catch (error: any) {
    console.log(`   ✗ Error: ${error.message}`)
  }
  console.log()

  // Test 5: Get post content
  console.log('5. Testing getPostBySlug()...')
  try {
    const normalizeId = (id: string) => id.replace(/-/g, '')
    const databaseId = normalizeId(process.env.NOTION_DATABASE_ID!)

    const searchResponse = await notion.search({
      filter: { value: 'page', property: 'object' },
    })

    const page = (searchResponse.results as any[]).find(
      (item) => {
        const parentDbId = item.parent?.database_id
        return parentDbId && normalizeId(parentDbId) === databaseId &&
          item.properties?.Slug?.rich_text?.[0]?.plain_text === 'hello-world'
      }
    )

    if (page) {
      const mdblocks = await n2m.pageToMarkdown(page.id)
      const content = n2m.toMarkdownString(mdblocks).parent

      console.log(`   ✓ Success! Found post content`)
      console.log(`   - Content length: ${content.length} chars`)
    } else {
      console.log(`   ⊘ No post with slug "hello-world" (may not exist yet)`)
    }
  } catch (error: any) {
    console.log(`   ✗ Error: ${error.message}`)
  }
  console.log()

  console.log('=== All tests completed ===')
}

testNotion()
