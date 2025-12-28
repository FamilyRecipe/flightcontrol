import { getProject } from '@/lib/db/queries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface ProjectLayoutProps {
  projectId: string
  children: React.ReactNode
  activeTab?: 'overview' | 'plan' | 'alignment' | 'commits' | 'chat' | 'settings'
}

export async function ProjectLayout({ projectId, children, activeTab }: ProjectLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const project = await getProject(projectId)

  if (!project) {
    notFound()
  }

  if (project.user_id !== user.id) {
    redirect('/')
  }

  // Project context is handled by TopNav and ProjectContext
  // This wrapper just ensures project exists and user has access
  return <>{children}</>
}

