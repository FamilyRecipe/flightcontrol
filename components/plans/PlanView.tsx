'use client'

import { useState, useEffect } from 'react'
import { StepCard } from './StepCard'
import { StepEditor } from './StepEditor'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
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
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No plan found for this project.</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading plan steps...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadSteps} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
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
          <h3 className="text-2xl font-bold">{plan.title}</h3>
          {plan.description && (
            <p className="text-muted-foreground mt-1">{plan.description}</p>
          )}
        </div>
      </div>

      {parentSteps.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No steps in this plan yet.</p>
          </CardContent>
        </Card>
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

