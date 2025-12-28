'use client'

import { useState, useEffect } from 'react'
import { StepCard } from '@/components/plans/StepCard'
import { StepEditor } from '@/components/plans/StepEditor'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { LoadingState } from '@/components/templates/states/LoadingState'
import { ErrorState } from '@/components/templates/states/ErrorState'
import { FileText } from 'lucide-react'
import type { PlanStep, ProjectPlan } from '@/lib/db/queries'

interface PlanViewProps {
  projectId: string
  plan: ProjectPlan | null
}

export function PlanView({ projectId, plan }: PlanViewProps) {
  const [steps, setSteps] = useState<PlanStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<PlanStep | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  useEffect(() => {
    if (plan) {
      loadSteps()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, projectId])

  const loadSteps = async () => {
    if (!plan) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/plan/steps`)
      if (!response.ok) {
        throw new Error('Failed to load steps')
      }
      const data = await response.json()
      setSteps(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load steps')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (step: PlanStep) => {
    setEditingStep(step)
    setEditorOpen(true)
  }

  const handleSave = () => {
    loadSteps()
  }

  if (!plan) {
    return (
      <EmptyState
        icon={FileText}
        title="No plan found"
        description="This project doesn't have a plan yet. Create one to start tracking alignment between your code and project goals."
        action={{
          label: 'Refresh to Initialize Plan',
          onClick: () => window.location.reload(),
        }}
        variant="card"
      />
    )
  }

  if (loading) {
    return <LoadingState message="Loading plan steps..." />
  }

  if (error) {
    return <ErrorState error={error} retry={loadSteps} variant="card" />
  }

  // Group steps by parent_step_id
  const parentSteps = steps.filter((step) => !step.parent_step_id)
  const substepsByParent = steps.reduce((acc, step) => {
    if (step.parent_step_id) {
      if (!acc[step.parent_step_id]) {
        acc[step.parent_step_id] = []
      }
      acc[step.parent_step_id].push(step)
    }
    return acc
  }, {} as Record<string, PlanStep[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">{plan.title}</h3>
          {plan.description && (
            <p className="text-muted-foreground mt-2">{plan.description}</p>
          )}
        </div>
      </div>

      {parentSteps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No steps yet"
          description="Add steps to your plan to start tracking progress. Steps can be created manually or generated automatically from your repository."
          variant="card"
        />
      ) : (
        <div className="space-y-4">
          {parentSteps.map((step) => (
            <StepCard
              key={step.id}
              step={step}
              isCurrent={step.step_index === plan.current_step_index}
              substeps={substepsByParent[step.id] || []}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <StepEditor
        step={editingStep}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        projectId={projectId}
        onSave={handleSave}
      />
    </div>
  )
}

