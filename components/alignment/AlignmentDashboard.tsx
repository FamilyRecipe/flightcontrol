'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/templates/states/LoadingState'
import { ErrorState } from '@/components/templates/states/ErrorState'
import { EmptyState } from '@/components/templates/states/EmptyState'
import { CheckCircle2, XCircle, AlertCircle, GitCommit, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlignmentCheck {
  id: string
  commit_sha: string
  commit_message: string
  status: 'aligned' | 'misaligned' | 'partial'
  created_at: string
  impact_level?: 'low' | 'medium' | 'high'
}

interface AlignmentDashboardProps {
  projectId: string
}

export function AlignmentDashboard({ projectId }: AlignmentDashboardProps) {
  const [checks, setChecks] = useState<AlignmentCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    aligned: 0,
    misaligned: 0,
    partial: 0,
  })

  useEffect(() => {
    loadChecks()
  }, [projectId])

  const loadChecks = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/projects/${projectId}/alignment`)
      if (!response.ok) {
        throw new Error('Failed to load alignment checks')
      }
      const data = await response.json()
      setChecks(data.checks || [])
      
      // Calculate stats
      const total = data.checks?.length || 0
      const aligned = data.checks?.filter((c: AlignmentCheck) => c.status === 'aligned').length || 0
      const misaligned = data.checks?.filter((c: AlignmentCheck) => c.status === 'misaligned').length || 0
      const partial = data.checks?.filter((c: AlignmentCheck) => c.status === 'partial').length || 0
      
      setStats({ total, aligned, misaligned, partial })
    } catch (err: any) {
      setError(err.message || 'Failed to load alignment checks')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Loading alignment checks..." />
  }

  if (error) {
    return <ErrorState error={error} retry={loadChecks} />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aligned':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'misaligned':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      aligned: 'bg-green-500/10 text-green-700 dark:text-green-400',
      misaligned: 'bg-red-500/10 text-red-700 dark:text-red-400',
      partial: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    }
    return (
      <Badge className={cn('text-xs', variants[status as keyof typeof variants])}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Aligned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.aligned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Misaligned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.misaligned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              Partial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Checks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Alignment Checks</CardTitle>
            <Button variant="outline" size="sm" onClick={loadChecks}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {checks.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No alignment checks yet"
              description="Alignment checks will appear here after commits are made to your repository."
              variant="card"
            />
          ) : (
            <div className="space-y-3">
              {checks.slice(0, 10).map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-4 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-0.5">{getStatusIcon(check.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(check.status)}
                      {check.impact_level && (
                        <Badge variant="outline" className="text-xs">
                          {check.impact_level} impact
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(check.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <GitCommit className="h-3 w-3 text-muted-foreground" />
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {check.commit_sha.substring(0, 7)}
                      </code>
                      <span className="text-muted-foreground">{check.commit_message}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

