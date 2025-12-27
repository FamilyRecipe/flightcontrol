import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProject, getProjectPlan, getPlanSteps, updatePlanStep } from '@/lib/db/queries'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string; stepId: string } }
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

    const plan = await getProjectPlan(project.id)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const steps = await getPlanSteps(plan.id)
    const step = steps.find(s => s.id === params.stepId)

    if (!step) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 })
    }

    const body = await request.json()
    const updatedStep = await updatePlanStep(params.stepId, body)

    return NextResponse.json(updatedStep)
  } catch (error: any) {
    console.error('Error updating step:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update step' },
      { status: 500 }
    )
  }
}

