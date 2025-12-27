import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProject, getProjectPlan, createProjectPlan, updateProjectPlan } from '@/lib/db/queries'

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
    return NextResponse.json(plan)
  } catch (error: any) {
    console.error('Error fetching plan:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plan' },
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

    const body = await request.json()
    const plan = await createProjectPlan({
      project_id: project.id,
      version: body.version || 1,
      title: body.title || 'Project Plan',
      description: body.description || null,
      current_step_index: 0,
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error: any) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create plan' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const updatedPlan = await updateProjectPlan(plan.id, body)

    return NextResponse.json(updatedPlan)
  } catch (error: any) {
    console.error('Error updating plan:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update plan' },
      { status: 500 }
    )
  }
}

