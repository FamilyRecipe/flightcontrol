import { getProject } from '@/lib/db/queries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{project.github_repo_full_name}</h2>
          <p className="text-muted-foreground mt-1">
            {project.github_repo_owner}/{project.github_repo_name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href={`/projects/${project.id}/plan`}>
          <Button variant="outline" className="w-full h-24">
            View Project Plan
          </Button>
        </Link>
        <Link href={`/projects/${project.id}/alignment`}>
          <Button variant="outline" className="w-full h-24">
            Alignment Dashboard
          </Button>
        </Link>
        <Link href={`/projects/${project.id}/chat`}>
          <Button variant="outline" className="w-full h-24">
            Chat
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="outline" className="w-full h-24">
            Settings
          </Button>
        </Link>
      </div>
    </div>
  )
}

