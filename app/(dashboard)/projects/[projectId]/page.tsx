import { getProject } from '@/lib/db/queries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, GitBranch, MessageSquare } from 'lucide-react'

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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.github_repo_full_name}</h1>
        <p className="text-muted-foreground mt-1">
          Manage your project plan and track alignment with your repository
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href={`/projects/${project.id}/plan`}>
          <Card className="transition-colors hover:bg-accent cursor-pointer h-full">
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Project Plan</CardTitle>
              <CardDescription>
                View and manage your project plan steps
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href={`/projects/${project.id}/alignment`}>
          <Card className="transition-colors hover:bg-accent cursor-pointer h-full">
            <CardHeader>
              <GitBranch className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Alignment</CardTitle>
              <CardDescription>
                Check alignment between code and plan
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href={`/projects/${project.id}/chat`}>
          <Card className="transition-colors hover:bg-accent cursor-pointer h-full">
            <CardHeader>
              <MessageSquare className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Chat</CardTitle>
              <CardDescription>
                Discuss misalignments and updates
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}

