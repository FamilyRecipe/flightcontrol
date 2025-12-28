/**
 * GitHub REST API Client
 * 
 * Direct integration with GitHub REST API v3
 * Requires a GitHub Personal Access Token for authentication
 */

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

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author: {
    login: string
  }
}

interface GitHubFile {
  path: string
  type: 'file' | 'dir'
  size?: number
  sha?: string
  content?: string
  encoding?: string
}

export class GitHubAPIClient {
  private accessToken: string
  private baseUrl = 'https://api.github.com'

  constructor(accessToken?: string) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:47',message:'GitHubAPIClient constructor entry',data:{hasAccessTokenParam:!!accessToken,hasEnvToken:!!process.env.GITHUB_ACCESS_TOKEN},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    this.accessToken = accessToken || process.env.GITHUB_ACCESS_TOKEN || ''
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:50',message:'GitHubAPIClient token check',data:{hasToken:!!this.accessToken,tokenLength:this.accessToken.length},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!this.accessToken) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:52',message:'GitHubAPIClient token missing error',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw new Error('GitHub access token not configured. Set GITHUB_ACCESS_TOKEN environment variable.')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:54',message:'GitHub API request start',data:{endpoint,method:options.method||'GET'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'FlightControl/1.0',
        ...options.headers,
      },
    })

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:67',message:'GitHub API response received',data:{status:response.status,statusText:response.statusText,ok:response.ok,endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:71',message:'GitHub API error',data:{status:response.status,errorMessage:error.message||response.statusText,endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      throw new Error(`GitHub API error: ${error.message || response.statusText} (${response.status})`)
    }

    return response.json()
  }

  /**
   * List repositories for the authenticated user
   */
  async listRepositories(): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>('/user/repos?sort=updated&per_page=100')
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request<GitHubRepo>(`/repos/${owner}/${repo}`)
  }

  /**
   * Get repository file structure
   */
  async getRepositoryStructure(owner: string, repo: string, ref?: string): Promise<GitHubFile[]> {
    const refParam = ref ? `?ref=${ref}` : ''
    return this.request<GitHubFile[]>(`/repos/${owner}/${repo}/contents${refParam}`)
  }

  /**
   * Get file content
   */
  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    const refParam = ref ? `?ref=${ref}` : ''
    const data = await this.request<GitHubFile>(`/repos/${owner}/${repo}/contents/${path}${refParam}`)
    
    // Decode base64 content if present
    if (data.content && data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8')
    }

    return data.content || ''
  }

  /**
   * Get commit diff
   */
  async getCommitDiff(owner: string, repo: string, sha: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Accept': 'application/vnd.github.v3.diff',
          'User-Agent': 'FlightControl/1.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch commit diff: ${response.statusText}`)
    }

    return response.text()
  }

  /**
   * List commits for a repository
   */
  async listCommits(owner: string, repo: string, limit: number = 30): Promise<GitHubCommit[]> {
    return this.request<GitHubCommit[]>(`/repos/${owner}/${repo}/commits?per_page=${limit}`)
  }

  /**
   * Get a specific commit
   */
  async getCommit(owner: string, repo: string, sha: string): Promise<GitHubCommit> {
    return this.request<GitHubCommit>(`/repos/${owner}/${repo}/commits/${sha}`)
  }

  /**
   * Create a webhook for a repository
   */
  async createWebhook(owner: string, repo: string, webhookUrl: string, secret: string): Promise<{ id: string }> {
    const data = await this.request<{ id: number }>(`/repos/${owner}/${repo}/hooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push'],
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret: secret,
        },
      }),
    })

    return { id: data.id.toString() }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(owner: string, repo: string, hookId: string): Promise<void> {
    await this.request(`/repos/${owner}/${repo}/hooks/${hookId}`, {
      method: 'DELETE',
    })
  }
}

// Note: The singleton instance export has been removed to prevent module load errors.
// The eager instantiation `new GitHubAPIClient()` was causing the module to fail to load
// when no GITHUB_ACCESS_TOKEN environment variable was set.
// Use createUserGitHubClient() instead, which properly handles token retrieval from user settings.
// 
// For backwards compatibility, we export a placeholder that throws a helpful error if accessed.
export const githubAPIClient: any = new Proxy({} as any, {
  get(_target, _prop) {
    throw new Error(
      'githubAPIClient singleton is no longer available. ' +
      'Use createUserGitHubClient() instead to get a user-specific GitHub API client.'
    )
  }
})

/**
 * Create a user-specific GitHub API client instance
 * Fetches GitHub access token from user settings or falls back to env var
 */
export async function createUserGitHubClient(): Promise<GitHubAPIClient> {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:188',message:'createUserGitHubClient entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,B'})}).catch(()=>{});
  // #endregion
  const { getUserSettings } = await import('@/lib/db/queries')
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:191',message:'Before getUserSettings',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const settings = await getUserSettings()
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:194',message:'After getUserSettings',data:{hasSettings:!!settings,hasTokenInSettings:!!settings?.github_access_token,hasEnvToken:!!process.env.GITHUB_ACCESS_TOKEN},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A,B'})}).catch(()=>{});
  // #endregion
  
  const accessToken = settings?.github_access_token || process.env.GITHUB_ACCESS_TOKEN || ''
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/f5b31e45-a426-49ee-8b7d-0ba1d65d26a2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/github/api-client.ts:197',message:'Token resolution complete',data:{hasAccessToken:!!accessToken,tokenLength:accessToken.length,source:settings?.github_access_token?'settings':process.env.GITHUB_ACCESS_TOKEN?'env':'none'},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return new GitHubAPIClient(accessToken)
}

