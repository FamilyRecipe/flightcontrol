import { getProject } from '@/lib/db/queries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/templates/layout/PageHeader'
import { ChatPage as ChatPageComponent } from '@/components/chat/ChatPage'

export default async function ChatPage({
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
      <PageHeader title="Chat" description="Discuss misalignments and updates" />
      <ChatPageComponent projectId={params.projectId} />
    </div>
  )
}


