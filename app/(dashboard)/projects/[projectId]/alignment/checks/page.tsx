import { getProject } from '@/lib/db/queries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChecksPageClient } from './ChecksPageClient'

export default async function AlignmentChecksPage({
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

  return <ChecksPageClient />
}

