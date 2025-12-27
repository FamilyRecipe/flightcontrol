import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProjects, createProject } from '@/lib/db/queries'
import { githubMCPClient } from '@/lib/github/mcp-client'
import crypto from 'crypto'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await getProjects()
    return NextResponse.json(projects)
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { github_repo_full_name } = body

    if (!github_repo_full_name) {
      return NextResponse.json(
        { error: 'Repository name is required' },
        { status: 400 }
      )
    }

    // Parse repo owner and name
    const [owner, repo] = github_repo_full_name.split('/')
    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Invalid repository format. Use owner/repo' },
        { status: 400 }
      )
    }

    // Verify repo exists and user has access
    try {
      await githubMCPClient.getRepository(owner, repo)
    } catch (error) {
      return NextResponse.json(
        { error: 'Repository not found or access denied' },
        { status: 404 }
      )
    }

    // Generate webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex')
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/[projectId]/webhook`

    // Create webhook (will be updated with actual project ID after creation)
    let webhookId: string | null = null
    try {
      const webhook = await githubMCPClient.createWebhook(
        owner,
        repo,
        webhookUrl.replace('[projectId]', 'placeholder'),
        webhookSecret
      )
      webhookId = webhook.id
    } catch (error) {
      console.warn('Failed to create webhook:', error)
      // Continue without webhook - user can configure manually
    }

    // Create project
    const project = await createProject({
      user_id: user.id,
      github_repo_owner: owner,
      github_repo_name: repo,
      github_repo_full_name,
      webhook_secret: webhookSecret,
      webhook_id: webhookId,
      experimental_mode: false,
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    )
  }
}

