import { NextResponse } from 'next/server'
import { getAbout } from '@/lib/notion'

export async function GET() {
  try {
    const about = await getAbout()

    if (!about) {
      return NextResponse.json(
        { error: 'About info not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(about)
  } catch (error: any) {
    console.error('Error fetching about:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about info', details: error.message },
      { status: 500 }
    )
  }
}
