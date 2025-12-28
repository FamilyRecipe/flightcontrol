import { ProjectList } from '@/components/projects/ProjectList'
import { PageHeader } from '@/components/templates/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your GitHub repositories and track alignment with project plans"
        actions={
          <Link href="/projects/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        }
      />
      <ProjectList />
    </div>
  )
}

