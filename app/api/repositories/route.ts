import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createUserMCPClient } from '@/lib/github/mcp-client'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const mcpClient = await createUserMCPClient()
    const repositories = await mcpClient.listRepositories()

    return NextResponse.json(repositories)
  } catch (error: any) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}


