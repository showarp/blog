import { Client } from '@notionhq/client'
import 'dotenv/config'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID!

async function createTestPost() {
  // Create a new page in the database
  const page = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Name: {
        title: [
          {
            text: {
              content: 'Notion Blocks Test Post',
            },
          },
        ],
      },
      Slug: {
        rich_text: [
          {
            text: {
              content: 'notion-blocks-test',
            },
          },
        ],
      },
      Summary: {
        rich_text: [
          {
            text: {
              content: 'Test post for various Notion block types rendering',
            },
          },
        ],
      },
      Tags: {
        multi_select: [
          { name: 'test' },
          { name: 'notion' },
        ],
      },
      Category: {
        select: {
          name: 'Test',
        },
      },
      Published: {
        checkbox: true,
      },
      Date: {
        date: {
          start: new Date().toISOString().split('T')[0],
        },
      },
    },
  })

  console.log('Created page:', page.id)

  // Now add blocks to the page
  const blocks = [
    {
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [{ text: { content: 'Heading 1' } }],
      },
    },
    {
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ text: { content: 'Heading 2' } }],
      },
    },
    {
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [{ text: { content: 'Heading 3' } }],
      },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { text: { content: 'Plain text with ' } },
          { text: { content: 'bold', annotations: { bold: true } } },
          { text: { content: ', ' } },
          { text: { content: 'italic', annotations: { italic: true } } },
          { text: { content: ', ' } },
          { text: { content: 'underline', annotations: { underline: true } } },
          { text: { content: ', ' } },
          { text: { content: 'strikethrough', annotations: { strikethrough: true } } },
          { text: { content: ', and ' } },
          { text: { content: 'inline code', annotations: { code: true } } },
          { text: { content: '.' } },
        ],
      },
    },
    {
      object: 'block',
      type: 'quote',
      quote: {
        rich_text: [{ text: { content: 'This is a blockquote.' } }],
      },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ text: { content: 'Bullet item 1' } }],
      },
    },
    {
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ text: { content: 'Bullet item 2' } }],
      },
    },
    {
      object: 'block',
      type: 'numbered_list_item',
      numbered_list_item: {
        rich_text: [{ text: { content: 'Numbered item 1' } }],
      },
    },
    {
      object: 'block',
      type: 'numbered_list_item',
      numbered_list_item: {
        rich_text: [{ text: { content: 'Numbered item 2' } }],
      },
    },
    {
      object: 'block',
      type: 'to_do',
      to_do: {
        rich_text: [{ text: { content: 'Todo - checked' } }],
        checked: true,
      },
    },
    {
      object: 'block',
      type: 'to_do',
      to_do: {
        rich_text: [{ text: { content: 'Todo - unchecked' } }],
        checked: false,
      },
    },
    {
      object: 'block',
      type: 'toggle',
      toggle: {
        rich_text: [{ text: { content: 'Toggle content' } }],
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ text: { content: 'Inside toggle' } }] },
          },
        ],
      },
    },
    {
      object: 'block',
      type: 'code',
      code: {
        rich_text: [{ text: { content: 'const x = 1;\nconsole.log(x);' } }],
        language: 'javascript',
      },
    },
    {
      object: 'block',
      type: 'divider',
      divider: {},
    },
    {
      object: 'block',
      type: 'image',
      image: {
        type: 'external',
        external: { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80' },
        caption: [{ text: { content: 'Test image' } }],
      },
    },
    {
      object: 'block',
      type: 'table',
      table: {
        table_width: 2,
        has_column_header: true,
        has_row_header: false,
        children: [
          {
            object: 'block',
            type: 'table_row',
            table_row: {
              cells: [
                [{ text: { content: 'Col 1' } }],
                [{ text: { content: 'Col 2' } }],
              ],
            },
          },
          {
            object: 'block',
            type: 'table_row',
            table_row: {
              cells: [
                [{ text: { content: 'Cell 1' } }],
                [{ text: { content: 'Cell 2' } }],
              ],
            },
          },
        ],
      },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ text: { content: 'Code block - Python' } }],
      },
    },
    {
      object: 'block',
      type: 'code',
      code: {
        rich_text: [{ text: { content: 'def hello():\n    print("Hello")' } }],
        language: 'python',
      },
    },
    {
      object: 'block',
      type: 'code',
      code: {
        rich_text: [{ text: { content: '{"key": "value"}' } }],
        language: 'json',
      },
    },
    {
      object: 'block',
      type: 'code',
      code: {
        rich_text: [{ text: { content: 'SELECT * FROM users;' } }],
        language: 'sql',
      },
    },
    {
      object: 'block',
      type: 'divider',
      divider: {},
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          { text: { content: 'Link: ' } },
          { text: { content: 'Google', link: { url: 'https://google.com' } } },
        ],
      },
    },
    {
      object: 'block',
      type: 'bookmark',
      bookmark: {
        url: 'https://github.com',
        caption: [{ text: { content: 'GitHub bookmark' } }],
      },
    },
    {
      object: 'block',
      type: 'video',
      video: {
        type: 'external',
        external: { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      },
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ text: { content: 'End of test post.' } }],
      },
    },
  ]

  // Add blocks
  await notion.blocks.children.append({
    block_id: page.id,
    children: blocks,
  })

  console.log('Done! Test post created.')
  console.log('Post ID:', page.id)
  console.log('URL: https://notion.so/' + page.id.replace(/-/g, ''))
}

createTestPost().catch(console.error)
