import { ProjectSelector } from '@/components/projects/ProjectSelector'

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Connect a GitHub repository to start tracking alignment with your project plan
        </p>
      </div>
      <div className="max-w-2xl">
        <ProjectSelector />
      </div>
    </div>
  )
}

