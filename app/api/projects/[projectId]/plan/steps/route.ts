import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProject, getProjectPlan, getPlanSteps, createPlanStep, updatePlanStep } from '@/lib/db/queries'

export async function GET(
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

    const plan = await getProjectPlan(project.id)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const steps = await getPlanSteps(plan.id)
    return NextResponse.json(steps)
  } catch (error: any) {
    console.error('Error fetching steps:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch steps' },
      { status: 500 }
    )
  }
}

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

    const plan = await getProjectPlan(project.id)
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const body = await request.json()
    const step = await createPlanStep({
      project_plan_id: plan.id,
      parent_step_id: body.parent_step_id || null,
      step_index: body.step_index ?? (await getPlanSteps(plan.id)).length,
      title: body.title,
      description: body.description,
      acceptance_criteria: body.acceptance_criteria || null,
      status: body.status || 'pending',
    })

    return NextResponse.json(step, { status: 201 })
  } catch (error: any) {
    console.error('Error creating step:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create step' },
      { status: 500 }
    )
  }
}


