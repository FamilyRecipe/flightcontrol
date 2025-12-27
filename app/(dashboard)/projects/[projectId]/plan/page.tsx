import { getProject, getProjectPlan } from '@/lib/db/queries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PlanView } from '@/components/plans/PlanView'
import { PlanInitialization } from '@/components/plans/PlanInitialization'
import { PlanPageClient } from './PlanPageClient'

export default async function PlanPage({
  params,
}: {
  params: { projectId: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const project = await getProject(params.projectId)

  if (!project) {
    notFound()
  }

  if (project.user_id !== user.id) {
    redirect('/')
  }

  const plan = await getProjectPlan(project.id)

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Project Plan</h2>
      <PlanPageClient projectId={params.projectId} initialPlan={plan} />
    </div>
  )
}

