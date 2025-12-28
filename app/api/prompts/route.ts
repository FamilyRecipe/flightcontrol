import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProject, getProjectPlan, getPlanSteps, getLatestSnapshot } from '@/lib/db/queries'
import { CursorPromptGenerator } from '@/lib/openai/prompt-generator'
import { SnapshotManager } from '@/lib/alignment/snapshot-manager'
import { createUserGitHubClient } from '@/lib/github/api-client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, stepId, apiKey, model = 'gpt-4' } = body

    if (!projectId || !stepId) {
      return NextResponse.json(
        { error: 'projectId and stepId are required' },
        { status: 400 }
      )
    }

    const project = await getProject(projectId)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const plan = await getProjectPlan(project.id)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const steps = await getPlanSteps(plan.id)
    const step = steps.find(s => s.id === stepId)

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    // Get snapshot for context
    const githubClient = await createUserGitHubClient()
    const snapshotManager = new SnapshotManager(githubClient)
    const snapshot = await snapshotManager.getOrCreateSnapshot(project)

    // Generate prompt
    const generator = new CursorPromptGenerator(apiKey)
    const prompt = await generator.generatePrompt(
      {
        title: step.title,
        description: step.description,
        acceptance_criteria: step.acceptance_criteria || undefined,
      },
      {
        fileStructure: snapshot.snapshot_data.fileStructure || [],
        keyFiles: snapshot.snapshot_data.keyFiles || [],
      },
      model
    )

    return NextResponse.json(prompt)
  } catch (error: any) {
    console.error('Error generating prompt:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate prompt' },
      { status: 500 }
    )
  }
}

