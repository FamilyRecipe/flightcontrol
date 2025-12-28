'use client'

import { useRouter } from 'next/navigation'
import { StatusCard } from '@/components/templates/display/StatusCard'
import { FileText, GitBranch, MessageSquare } from 'lucide-react'

interface ProjectOverviewCardsProps {
  projectId: string
}

export function ProjectOverviewCards({ projectId }: ProjectOverviewCardsProps) {
  const router = useRouter()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatusCard
        title="Project Plan"
        description="View and manage your project plan steps"
        icon={FileText}
        onClick={() => router.push(`/projects/${projectId}/plan`)}
      />
      <StatusCard
        title="Alignment"
        description="Check alignment between code and plan"
        icon={GitBranch}
        onClick={() => router.push(`/projects/${projectId}/alignment`)}
      />
      <StatusCard
        title="Chat"
        description="Discuss misalignments and updates"
        icon={MessageSquare}
        onClick={() => router.push(`/projects/${projectId}/chat`)}
      />
    </div>
  )
}

