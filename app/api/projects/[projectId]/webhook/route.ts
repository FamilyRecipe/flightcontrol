import { NextRequest, NextResponse } from 'next/server'
import { getProject, createCommit, createRepoSnapshot } from '@/lib/db/queries'
import { verifyWebhookSignature, parseWebhookPayload, extractCommitsFromWebhook } from '@/lib/github/webhook'
import { createUserGitHubClient } from '@/lib/github/api-client'
import { RepoAnalyzer } from '@/lib/github/analyzer'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const project = await getProject(params.projectId)

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Verify webhook signature
    const signature = request.headers.get('x-hub-signature-256')
    const body = await request.text()

    if (signature && project.webhook_secret) {
      const isValid = verifyWebhookSignature(body, signature, project.webhook_secret)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Parse webhook payload
    const payload = parseWebhookPayload(JSON.parse(body))
    const commits = extractCommitsFromWebhook(payload)

    // Process each commit
    const githubClient = await createUserGitHubClient()
    for (const commitData of commits) {
      // Get commit diff
      let diff: string | null = null
      try {
        diff = await githubClient.getCommitDiff(
          project.github_repo_owner,
          project.github_repo_name,
          commitData.sha
        )
      } catch (error) {
        console.error(`Failed to fetch diff for commit ${commitData.sha}:`, error)
      }

      // Create commit record
      await createCommit({
        project_id: project.id,
        github_commit_sha: commitData.sha,
        commit_message: commitData.message,
        diff,
        alignment_status: null,
        reviewed: false,
        reviewed_at: null,
      })
    }

    // Create repo snapshot
    if (commits.length > 0 && !project.experimental_mode) {
      try {
        const analyzer = new RepoAnalyzer(githubClient)
        const analysis = await analyzer.analyze(
          project.github_repo_owner,
          project.github_repo_name,
          payload.ref.replace('refs/heads/', '')
        )

        await createRepoSnapshot({
          project_id: project.id,
          snapshot_data: {
            commitSha: commits[0].sha,
            fileStructure: analysis.fileStructure,
            keyFiles: analysis.keyFiles,
            recentCommits: analysis.recentCommits,
            timestamp: new Date().toISOString(),
          },
        })
      } catch (error) {
        console.error('Failed to create repo snapshot:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

