import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProject, getProjectPlan, getPlanSteps, getLatestSnapshot } from '@/lib/db/queries'
import { AlignmentChecker } from '@/lib/alignment/checker'
import { createRepoSnapshot } from '@/lib/db/queries'
import { SnapshotManager } from '@/lib/alignment/snapshot-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await getProject(params.projectId)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Skip if in experimental mode
    if (project.experimental_mode) {
      return NextResponse.json({
        message: 'Alignment checking disabled in experimental mode',
      })
    }

    // Get project plan and current step
    const plan = await getProjectPlan(project.id)
    if (!plan) {
      return NextResponse.json(
        { error: 'No project plan found' },
        { status: 404 }
      )
    }

    const steps = await getPlanSteps(plan.id)
    const currentStep = steps[plan.current_step_index]

    if (!currentStep) {
      return NextResponse.json(
        { error: 'No current step found' },
        { status: 404 }
      )
    }

    // Get or create snapshot
    const snapshotManager = new SnapshotManager()
    const snapshot = await snapshotManager.getOrCreateSnapshot(project)

    // Perform alignment check
    const checker = new AlignmentChecker()
    const result = await checker.checkAlignment(currentStep, snapshot)

    // Store alignment check result (would need to create alignment_checks table record)
    // For now, just return the result

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error performing alignment check:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to perform alignment check' },
      { status: 500 }
    )
  }
}

