import { RepoAnalyzer } from '@/lib/github/analyzer'
import { githubMCPClient } from '@/lib/github/mcp-client'
import { createRepoSnapshot, getLatestSnapshot } from '@/lib/db/queries'
import type { Project } from '@/lib/db/queries'

export interface SnapshotOptions {
  includeContent?: boolean
  maxFileSize?: number
  maxFiles?: number
}

/**
 * Manages repository snapshots for tracking state changes
 */
export class SnapshotManager {
  private analyzer: RepoAnalyzer

  constructor() {
    this.analyzer = new RepoAnalyzer(githubMCPClient)
  }

  /**
   * Create a snapshot for a project
   */
  async createSnapshot(
    project: Project,
    ref?: string,
    options: SnapshotOptions = {}
  ): Promise<import('@/lib/db/queries').RepoSnapshot> {
    const {
      includeContent = true,
      maxFileSize = 10000,
      maxFiles = 50,
    } = options

    // Analyze repository
    const analysis = await this.analyzer.analyze(
      project.github_repo_owner,
      project.github_repo_name,
      ref
    )

    // Limit key files if needed
    const keyFiles = analysis.keyFiles.slice(0, maxFiles).map(file => ({
      ...file,
      content: includeContent
        ? file.content.substring(0, maxFileSize)
        : '',
    }))

    // Create snapshot data
    const snapshotData = {
      commitSha: analysis.recentCommits[0]?.sha || 'unknown',
      fileStructure: analysis.fileStructure,
      keyFiles,
      recentCommits: analysis.recentCommits,
      languages: analysis.languages,
      totalFiles: analysis.totalFiles,
      totalLines: analysis.totalLines,
      timestamp: new Date().toISOString(),
    }

    // Save to database
    return await createRepoSnapshot({
      project_id: project.id,
      snapshot_data: snapshotData,
    })
  }

  /**
   * Get or create latest snapshot
   */
  async getOrCreateSnapshot(
    project: Project,
    ref?: string,
    options?: SnapshotOptions
  ): Promise<import('@/lib/db/queries').RepoSnapshot> {
    const existing = await getLatestSnapshot(project.id)

    // If snapshot exists and is recent (within last hour), return it
    if (existing) {
      const snapshotAge = Date.now() - new Date(existing.created_at).getTime()
      const oneHour = 60 * 60 * 1000
      if (snapshotAge < oneHour) {
        return existing
      }
    }

    // Create new snapshot
    return await this.createSnapshot(project, ref, options)
  }

  /**
   * Compare two snapshots
   */
  compareSnapshots(
    oldSnapshot: import('@/lib/db/queries').RepoSnapshot,
    newSnapshot: import('@/lib/db/queries').RepoSnapshot
  ): {
    addedFiles: string[]
    removedFiles: string[]
    modifiedFiles: string[]
    newCommits: number
  } {
    const oldFiles = new Set(
      oldSnapshot.snapshot_data.fileStructure
        .filter((f: any) => f.type === 'file')
        .map((f: any) => f.path)
    )
    const newFiles = new Set(
      newSnapshot.snapshot_data.fileStructure
        .filter((f: any) => f.type === 'file')
        .map((f: any) => f.path)
    )

    const addedFiles = Array.from(newFiles).filter(f => !oldFiles.has(f))
    const removedFiles = Array.from(oldFiles).filter(f => !newFiles.has(f))
    const modifiedFiles = Array.from(newFiles).filter(f => oldFiles.has(f))

    const oldCommitSha = oldSnapshot.snapshot_data.commitSha
    const newCommits = newSnapshot.snapshot_data.recentCommits.filter(
      (c: any) => c.sha !== oldCommitSha
    ).length

    return {
      addedFiles,
      removedFiles,
      modifiedFiles,
      newCommits,
    }
  }
}

