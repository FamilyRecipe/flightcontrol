import { ProjectSelector } from '@/components/projects/ProjectSelector'

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Create New Project</h2>
      <ProjectSelector />
    </div>
  )
}

