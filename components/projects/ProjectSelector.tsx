'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { githubMCPClient } from '@/lib/github/mcp-client'
import { useRouter } from 'next/navigation'

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
  }
  description: string | null
  private: boolean
}

export function ProjectSelector() {
  const router = useRouter()
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRepositories()
  }, [])

  const loadRepositories = async () => {
    try {
      setLoading(true)
      const reposList = await githubMCPClient.listRepositories()
      setRepos(reposList)
    } catch (error: any) {
      setError(error.message || 'Failed to load repositories')
      console.error('Error loading repositories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!selectedRepo) {
      setError('Please select a repository')
      return
    }

    try {
      setCreating(true)
      setError(null)

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          github_repo_full_name: selectedRepo,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create project')
      }

      const project = await response.json()
      router.push(`/projects/${project.id}`)
    } catch (error: any) {
      setError(error.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">Loading repositories...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Repository</CardTitle>
        <CardDescription>Choose a GitHub repository to track</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="text-sm text-red-500">{error}</div>
        )}
        <div className="space-y-2">
          <Label htmlFor="repo">Repository</Label>
          <select
            id="repo"
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option value="">Select a repository</option>
            {repos.map((repo) => (
              <option key={repo.id} value={repo.full_name}>
                {repo.full_name} {repo.private ? '(Private)' : ''}
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={handleCreateProject}
          disabled={!selectedRepo || creating}
          className="w-full"
        >
          {creating ? 'Creating...' : 'Create Project'}
        </Button>
      </CardContent>
    </Card>
  )
}

