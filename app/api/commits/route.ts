import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCommits } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    const commits = await getCommits(projectId, limit)
    return NextResponse.json(commits)
  } catch (error: any) {
    console.error('Error fetching commits:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commits' },
      { status: 500 }
    )
  }
}

