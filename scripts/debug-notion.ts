import 'dotenv/config'
import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

async function debugNotionStructure() {
  console.log('=== Debugging Notion Database Structure ===\n')

  // Debug 1: Get posts database structure
  console.log('1. Posts Database Properties:')
  try {
    const postsDbId = process.env.NOTION_DATABASE_ID!
    const postsResponse = await notion.databases.retrieve({ database_id: postsDbId })
    console.log('   Database ID:', postsDbId)
    console.log('   Properties:', JSON.stringify((postsResponse as any).properties, null, 2))
  } catch (error: any) {
    console.log('   Error:', error.message)
  }
  console.log()

  // Debug 2: Get about database structure
  console.log('2. About Database Properties:')
  try {
    const aboutDbId = process.env.NOTION_ABOUT_DATABASE_ID!
    const aboutResponse = await notion.databases.retrieve({ database_id: aboutDbId })
    console.log('   Database ID:', aboutDbId)
    console.log('   Properties:', JSON.stringify((aboutResponse as any).properties, null, 2))
  } catch (error: any) {
    console.log('   Error:', error.message)
  }
  console.log()

  // Debug 3: Get a sample post with ALL fields
  console.log('3. Sample Post Full Data:')
  try {
    const postsDbId = process.env.NOTION_DATABASE_ID!
    const normalizeId = (id: string) => id.replace(/-/g, '')

    const searchResponse = await notion.search({
      filter: { value: 'page', property: 'object' },
    })

    const samplePost = (searchResponse.results as any[]).find(
      (item) => {
        const parentDbId = item.parent?.database_id
        return parentDbId && normalizeId(parentDbId) === normalizeId(postsDbId)
      }
    )

    if (samplePost) {
      console.log('   Page ID:', samplePost.id)
      console.log('   Created time:', samplePost.created_time)
      console.log('   Last edited time:', samplePost.last_edited_time)
      console.log('   Properties:')
      for (const [key, value] of Object.entries(samplePost.properties)) {
        console.log(`      ${key}:`, JSON.stringify(value, null, 2))
      }
    }
  } catch (error: any) {
    console.log('   Error:', error.message)
  }
  console.log()

  // Debug 4: Get about page with ALL fields
  console.log('4. About Page Full Data:')
  try {
    const aboutDbId = process.env.NOTION_ABOUT_DATABASE_ID!
    const normalizeId = (id: string) => id.replace(/-/g, '')

    const searchResponse = await notion.search({
      filter: { value: 'page', property: 'object' },
    })

    const aboutPage = (searchResponse.results as any[]).find(
      (item) => {
        const parentDbId = item.parent?.database_id
        return parentDbId && normalizeId(parentDbId) === normalizeId(aboutDbId)
      }
    )

    if (aboutPage) {
      console.log('   Page ID:', aboutPage.id)
      console.log('   Properties:')
      for (const [key, value] of Object.entries(aboutPage.properties)) {
        console.log(`      ${key}:`, JSON.stringify(value, null, 2))
      }
    } else {
      console.log('   No about page found')
    }
  } catch (error: any) {
    console.log('   Error:', error.message)
  }

  console.log('\n=== Debug Complete ===')
}

debugNotionStructure()
