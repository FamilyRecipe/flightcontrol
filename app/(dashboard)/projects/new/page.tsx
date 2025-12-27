import { ProjectSelector } from '@/components/projects/ProjectSelector'

export default function NewProjectPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground mt-1">
          Connect a GitHub repository to start tracking alignment with your project plan
        </p>
      </div>
      <div className="max-w-2xl">
        <ProjectSelector />
      </div>
    </div>
  )
}

