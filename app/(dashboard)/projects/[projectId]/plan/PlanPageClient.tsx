'use client'

import { useState, useEffect } from 'react'
import { PlanView } from '@/components/plans/PlanView'
import { PlanInitialization } from '@/components/plans/PlanInitialization'
import type { ProjectPlan } from '@/lib/db/queries'

interface PlanPageClientProps {
  projectId: string
  initialPlan: ProjectPlan | null
}

export function PlanPageClient({ projectId, initialPlan }: PlanPageClientProps) {
  const [plan, setPlan] = useState<ProjectPlan | null>(initialPlan)
  const [loading, setLoading] = useState(false)

  const handlePlanCreated = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/plan`)
      if (response.ok) {
        const data = await response.json()
        setPlan(data)
      }
    } catch (error) {
      console.error('Failed to reload plan:', error)
    } finally {
      setLoading(false)
    }
  }

  if (plan) {
    return <PlanView projectId={projectId} plan={plan} />
  }

  return (
    <PlanInitialization
      projectId={projectId}
      onPlanCreated={handlePlanCreated}
    />
  )
}

