/**
 * GitHub MCP Client Wrapper
 * 
 * This client wraps the GitHub MCP server to provide repository access.
 * The MCP server should be running and accessible via the configured URL.
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

export class GitHubMCPClient {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.GITHUB_MCP_SERVER_URL || ''
  }

  /**
   * List repositories for the authenticated user
   */
  async listRepositories(): Promise<GitHubRepo[]> {
    // In a real implementation, this would call the MCP server
    // For now, we'll use a placeholder that can be replaced with actual MCP calls
    if (!this.baseUrl) {
      throw new Error('GitHub MCP server URL not configured')
    }

    // TODO: Implement actual MCP server call
    // This is a placeholder - replace with actual MCP protocol implementation
    const response = await fetch(`${this.baseUrl}/repos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch repositories: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepo> {
    if (!this.baseUrl) {
      throw new Error('GitHub MCP server URL not configured')
    }

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch repository: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get repository file structure
   */
  async getRepositoryStructure(owner: string, repo: string, ref?: string): Promise<GitHubFile[]> {
    if (!this.baseUrl) {
      throw new Error('GitHub MCP server URL not configured')
    }

    const refParam = ref ? `?ref=${ref}` : ''
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents${refParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch repository structure: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get file content
   */
  async getFileContent(owner: string, repo: string, path: string, ref?: string): Promise<string> {
    if (!this.baseUrl) {
      throw new Error('GitHub MCP server URL not configured')
    }

    const refParam = ref ? `?ref=${ref}` : ''
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}${refParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch file content: ${response.statusText}`)
    }

    const data = await response.json()
    
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
    if (!this.baseUrl) {
      throw new Error('GitHub MCP server URL not configured')
    }

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3.diff',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch commit diff: ${response.statusText}`)
    }

    return response.text()
  }

  /**
   * List commits for a repository
   */
  async listCommits(owner: string, repo: string, limit: number = 30): Promise<GitHubCommit[]> {
    if (!this.baseUrl) {
      throw new Error('GitHub MCP server URL not configured')
    }

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/commits?per_page=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch commits: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get a specific commit
   */
  async getCommit(owner: string, repo: string, sha: string): Promise<GitHubCommit> {
    if (!this.baseUrl) {
      throw new Error('GitHub MCP server URL not configured')
    }

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch commit: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a webhook for a repository
   */
  async createWebhook(owner: string, repo: string, webhookUrl: string, secret: string): Promise<{ id: string }> {
    if (!this.baseUrl) {
      throw new Error('GitHub MCP server URL not configured')
    }

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/hooks`, {
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

    if (!response.ok) {
      throw new Error(`Failed to create webhook: ${response.statusText}`)
    }

    const data = await response.json()
    return { id: data.id.toString() }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(owner: string, repo: string, hookId: string): Promise<void> {
    if (!this.baseUrl) {
      throw new Error('GitHub MCP server URL not configured')
    }

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/hooks/${hookId}`, {
      method: 'DELETE',
    })

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete webhook: ${response.statusText}`)
    }
  }
}

// Export a singleton instance
export const githubMCPClient = new GitHubMCPClient()

/**
 * Create a user-specific MCP client instance
 * Fetches user settings from database and falls back to env var if no setting exists
 */
export async function createUserMCPClient(): Promise<GitHubMCPClient> {
  const { getUserSettings } = await import('@/lib/db/queries')
  const settings = await getUserSettings()
  
  const baseUrl = settings?.github_mcp_server_url || process.env.GITHUB_MCP_SERVER_URL || ''
  return new GitHubMCPClient(baseUrl)
}

