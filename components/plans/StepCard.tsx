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
  pending: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  blocked: 'bg-red-500',
  completed: 'bg-green-500',
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
    <Card className={isCurrent ? 'border-2 border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {hasSubsteps && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 mt-0.5"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">{step.title}</CardTitle>
                {isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
                <Badge
                  className={`${statusColors[step.status]} text-white`}
                >
                  {statusLabels[step.status]}
                </Badge>
                {hasSubsteps && (
                  <Badge variant="outline" className="text-xs">
                    {substeps.length} substep{substeps.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {step.description}
              </p>
              {step.acceptance_criteria && (
                <div className="mt-2">
                  <p className="text-xs font-semibold mb-1">Acceptance Criteria:</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {step.acceptance_criteria}
                  </p>
                </div>
              )}
              {completionProgress > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${statusColors[step.status]}`}
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
            className="ml-2"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {expanded && hasSubsteps && (
        <CardContent className="pt-0">
          <div className="ml-8 space-y-2 border-l-2 border-muted pl-4">
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

