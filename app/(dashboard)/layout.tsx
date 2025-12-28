import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProjects } from '@/lib/db/queries'
import { TopNavClient } from '@/components/navigation/TopNavClient'
import { MainSidebar } from '@/components/navigation/MainSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const projects = await getProjects()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavClient user={user} projects={projects} />
      <div className="flex flex-1 overflow-hidden">
        <MainSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

