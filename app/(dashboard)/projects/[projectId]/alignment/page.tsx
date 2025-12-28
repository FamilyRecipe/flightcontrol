import { getProject } from '@/lib/db/queries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/templates/layout/PageHeader'
import { AlignmentDashboard } from '@/components/alignment/AlignmentDashboard'

export default async function AlignmentPage({
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alignment Dashboard"
        description="Check alignment between code and plan"
      />
      <AlignmentDashboard projectId={params.projectId} />
    </div>
  )
}


