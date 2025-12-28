'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Edit } from 'lucide-react'
import type { PlanStep } from '@/lib/db/queries'

interface StepCardProps {
  step: PlanStep
  isCurrent: boolean
  substeps?: PlanStep[]
  onEdit: (step: PlanStep) => void
  onStatusChange?: (stepId: string, status: PlanStep['status']) => void
}

const statusColors = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary text-primary-foreground',
  blocked: 'bg-destructive text-destructive-foreground',
  completed: 'bg-primary text-primary-foreground',
}

const statusLabels = {
  pending: 'Pending',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  completed: 'Completed',
}

export function StepCard({
  step,
  isCurrent,
  substeps = [],
  onEdit,
  onStatusChange,
}: StepCardProps) {
  const [expanded, setExpanded] = useState(false)

  const hasSubsteps = substeps.length > 0
  const completionProgress = step.status === 'completed' ? 100 : step.status === 'in_progress' ? 50 : 0

  return (
    <Card className={isCurrent ? 'border-2 border-primary shadow-md' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            {hasSubsteps && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 mt-0.5 flex-shrink-0"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <CardTitle className="text-base font-semibold leading-tight">{step.title}</CardTitle>
                {isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
                <Badge className={`${statusColors[step.status]} text-xs`}>
                  {statusLabels[step.status]}
                </Badge>
                {hasSubsteps && (
                  <Badge variant="outline" className="text-xs border-border">
                    {substeps.length} substep{substeps.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                {step.description}
              </p>
              {step.acceptance_criteria && (
                <div className="mt-2.5 p-2.5 rounded-md bg-card border border-border">
                  <p className="text-xs font-semibold mb-1 text-foreground">Acceptance Criteria:</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {step.acceptance_criteria}
                  </p>
                </div>
              )}
              {completionProgress > 0 && (
                <div className="mt-2.5">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        step.status === 'completed' 
                          ? 'bg-primary' 
                          : step.status === 'in_progress'
                          ? 'bg-primary'
                          : 'bg-muted-foreground'
                      }`}
                      style={{ width: `${completionProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(step)}
            className="ml-2 flex-shrink-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {expanded && hasSubsteps && (
        <CardContent className="pt-0 pb-3">
          <div className="ml-9 space-y-2 border-l-2 border-border pl-4">
            {substeps.map((substep) => (
              <StepCard
                key={substep.id}
                step={substep}
                isCurrent={false}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}


