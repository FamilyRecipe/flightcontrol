'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import type { PlanStep } from '@/lib/db/queries'

interface StepEditorProps {
  step: PlanStep | null
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onSave: () => void
}

export function StepEditor({
  step,
  open,
  onOpenChange,
  projectId,
  onSave,
}: StepEditorProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('')
  const [status, setStatus] = useState<PlanStep['status']>('pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (step) {
      setTitle(step.title)
      setDescription(step.description)
      setAcceptanceCriteria(step.acceptance_criteria || '')
      setStatus(step.status)
    } else {
      setTitle('')
      setDescription('')
      setAcceptanceCriteria('')
      setStatus('pending')
    }
    setError(null)
  }, [step, open])

  const handleSave = async () => {
    if (!step) return

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/projects/${projectId}/plan/steps/${step.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            acceptance_criteria: acceptanceCriteria.trim() || null,
            status,
          }),
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update step')
      }

      onSave()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save step')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Step</DialogTitle>
          <DialogDescription>
            Update the step details, acceptance criteria, and status
          </DialogDescription>
        </DialogHeader>
        <DialogClose onClose={() => onOpenChange(false)} />

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter step title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this step involves"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="acceptance">Acceptance Criteria</Label>
            <Textarea
              id="acceptance"
              value={acceptanceCriteria}
              onChange={(e) => setAcceptanceCriteria(e.target.value)}
              placeholder="Define what needs to be completed for this step to be considered done"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Specify the conditions that must be met for this step to be complete
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PlanStep['status'])}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
            </Select>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive border border-destructive/20">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


