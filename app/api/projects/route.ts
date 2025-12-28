import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProjects, createProject, updateProject } from '@/lib/db/queries'
import { createUserGitHubClient } from '@/lib/github/api-client'
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
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:27',message:'POST route entry',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'ALL'})}).catch(()=>{});
  // #endregion
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:32',message:'User auth check',data:{hasUser:!!user,userId:user?.id||null},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'ALL'})}).catch(()=>{});
    // #endregion

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { github_repo_full_name } = body

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:42',message:'Request body parsed',data:{github_repo_full_name,hasRepoName:!!github_repo_full_name},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'ALL'})}).catch(()=>{});
    // #endregion

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

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:53',message:'Repo parsed',data:{owner,repo,parsed:!!owner&&!!repo},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'ALL'})}).catch(()=>{});
    // #endregion

    // Verify repo exists and user has access
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:57',message:'Before createUserGitHubClient',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const githubClient = await createUserGitHubClient()
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:60',message:'After createUserGitHubClient success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:61',message:'Before getRepository',data:{owner,repo},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      await githubClient.getRepository(owner, repo)
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:64',message:'After getRepository success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:66',message:'GitHub client/repo verification error',data:{errorMessage:error instanceof Error?error.message:String(error),errorType:error instanceof Error?error.constructor.name:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(
        { error: 'Repository not found or access denied' },
        { status: 404 }
      )
    }

    // Generate webhook secret
    const webhookSecret = crypto.randomBytes(32).toString('hex')

    // Create project first to get the actual project ID
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:76',message:'Before createProject',data:{userId:user.id,owner,repo,github_repo_full_name,hasWebhookSecret:!!webhookSecret},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const project = await createProject({
      user_id: user.id,
      github_repo_owner: owner,
      github_repo_name: repo,
      github_repo_full_name,
      webhook_secret: webhookSecret,
      webhook_id: null,
      experimental_mode: false,
    })
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:87',message:'After createProject success',data:{projectId:project.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    // Now create webhook with actual project ID
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:91',message:'Before webhook URL construction',data:{NEXT_PUBLIC_APP_URL:process.env.NEXT_PUBLIC_APP_URL,hasEnvVar:!!process.env.NEXT_PUBLIC_APP_URL,projectId:project.id},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/projects/${project.id}/webhook`
    let webhookId: string | null = null
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:95',message:'Before createWebhook',data:{webhookUrl,owner,repo},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      const githubClient = await createUserGitHubClient()
      const webhook = await githubClient.createWebhook(
        owner,
        repo,
        webhookUrl,
        webhookSecret
      )
      webhookId = webhook.id
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:104',message:'After createWebhook success',data:{webhookId},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:107',message:'Before updateProject',data:{projectId:project.id,webhookId},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      // Update project with webhook ID
      const updatedProject = await updateProject(project.id, { webhook_id: webhookId })
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:110',message:'After updateProject success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      return NextResponse.json(updatedProject, { status: 201 })
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:113',message:'Webhook creation error',data:{errorMessage:error instanceof Error?error.message:String(error),errorType:error instanceof Error?error.constructor.name:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,C'})}).catch(()=>{});
      // #endregion
      console.warn('Failed to create webhook:', error)
      // Return project without webhook - user can configure manually
      return NextResponse.json(project, { status: 201 })
    }
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/projects/route.ts:119',message:'Top-level error handler',data:{errorMessage:error?.message||String(error),errorType:error?.constructor?.name||'unknown',stack:error?.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'ALL'})}).catch(()=>{});
    // #endregion
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create project' },
      { status: 500 }
    )
  }
}

