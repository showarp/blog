import { NextRequest, NextResponse } from 'next/server'
import { getPosts } from '@/lib/notion'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tag = searchParams.get('tag') || undefined
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    const result = await getPosts({ tag, category, search })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts', details: error.message },
      { status: 500 }
    )
  }
}
