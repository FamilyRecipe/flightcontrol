import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProjects, createProject, updateProject } from '@/lib/db/queries'
import { createUserMCPClient } from '@/lib/github/mcp-client'
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
      const mcpClient = await createUserMCPClient()
      await mcpClient.getRepository(owner, repo)
    } catch (error) {
      return NextResponse.json(
        { error: 'Repository not found or access denied' },
        { status: 404 }
      )
    }

    // Generate webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex')

    // Create project first to get the actual project ID
    const project = await createProject({
      user_id: user.id,
      github_repo_owner: owner,
      github_repo_name: repo,
      github_repo_full_name,
      webhook_secret: webhookSecret,
      webhook_id: null,
      experimental_mode: false,
    })

    // Now create webhook with actual project ID
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${project.id}/webhook`
    let webhookId: string | null = null
    try {
      const mcpClient = await createUserMCPClient()
      const webhook = await mcpClient.createWebhook(
        owner,
        repo,
        webhookUrl,
        webhookSecret
      )
      webhookId = webhook.id
      
      // Update project with webhook ID
      const updatedProject = await updateProject(project.id, { webhook_id: webhookId })
      return NextResponse.json(updatedProject, { status: 201 })
    } catch (error) {
      console.warn('Failed to create webhook:', error)
      // Return project without webhook - user can configure manually
      return NextResponse.json(project, { status: 201 })
    }
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    )
  }
}

