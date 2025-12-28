import { getProject } from '@/lib/db/queries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/templates/layout/PageHeader'
import { ProjectOverviewCards } from './ProjectOverviewCards'

export default async function ProjectPage({
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
        title={project.github_repo_full_name}
        description="Manage your project plan and track alignment with your repository"
      />

      <ProjectOverviewCards projectId={project.id} />
    </div>
  )
}

