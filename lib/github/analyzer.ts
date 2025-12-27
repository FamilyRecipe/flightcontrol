import { GitHubMCPClient } from './mcp-client'

export interface RepoStructure {
  path: string
  type: 'file' | 'directory'
  size?: number
  language?: string
}

export interface KeyFile {
  path: string
  content: string
  functions?: string[]
}

export interface RepoAnalysis {
  fileStructure: RepoStructure[]
  keyFiles: KeyFile[]
  recentCommits: {
    sha: string
    message: string
    date: string
  }[]
  languages: string[]
  totalFiles: number
  totalLines: number
}

/**
 * Analyzes repository state including file structure, key files, and commit history
 */
export class RepoAnalyzer {
  private client: GitHubMCPClient

  constructor(client: GitHubMCPClient) {
    this.client = client
  }

  /**
   * Analyze repository structure recursively
   */
  async analyzeStructure(owner: string, repo: string, ref?: string): Promise<RepoStructure[]> {
    const files: RepoStructure[] = []
    
    const traverse = async (path: string = '') => {
      try {
        const contents = await this.client.getRepositoryStructure(owner, repo, ref)
        
        for (const item of contents) {
          const fullPath = path ? `${path}/${item.path}` : item.path
          
          if (item.type === 'file') {
            // Try to detect language from extension
            const language = this.detectLanguage(item.path)
            files.push({
              path: fullPath,
              type: 'file',
              size: item.size,
              language,
            })
          } else if (item.type === 'dir') {
            files.push({
              path: fullPath,
              type: 'directory',
            })
            // Recursively traverse directories
            await traverse(fullPath)
          }
        }
      } catch (error) {
        console.error(`Error traversing ${path}:`, error)
      }
    }

    await traverse()
    return files
  }

  /**
   * Identify and fetch key files (package.json, README, main source files, etc.)
   */
  async getKeyFiles(owner: string, repo: string, ref?: string): Promise<KeyFile[]> {
    const keyFiles: KeyFile[] = []
    const keyPaths = [
      'package.json',
      'README.md',
      'README',
      'tsconfig.json',
      'next.config.js',
      'next.config.ts',
      'tailwind.config.js',
      'tailwind.config.ts',
      'app',
      'src',
      'components',
      'lib',
      'pages',
    ]

    // Get root contents
    const rootContents = await this.client.getRepositoryStructure(owner, repo, ref)
    
    for (const item of rootContents) {
      if (item.type === 'file' && keyPaths.includes(item.path)) {
        try {
          const content = await this.client.getFileContent(owner, repo, item.path, ref)
          const functions = this.extractFunctions(content, item.path)
          
          keyFiles.push({
            path: item.path,
            content: content.substring(0, 10000), // Limit content size
            functions,
          })
        } catch (error) {
          console.error(`Error fetching key file ${item.path}:`, error)
        }
      }
    }

    return keyFiles
  }

  /**
   * Get recent commits
   */
  async getRecentCommits(owner: string, repo: string, limit: number = 10): Promise<{
    sha: string
    message: string
    date: string
  }[]> {
    const commits = await this.client.listCommits(owner, repo, limit)
    
    return commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      date: commit.commit.author.date,
    }))
  }

  /**
   * Perform full repository analysis
   */
  async analyze(owner: string, repo: string, ref?: string): Promise<RepoAnalysis> {
    const [fileStructure, keyFiles, recentCommits] = await Promise.all([
      this.analyzeStructure(owner, repo, ref),
      this.getKeyFiles(owner, repo, ref),
      this.getRecentCommits(owner, repo, 10),
    ])

    // Extract languages
    const languages = new Set<string>()
    fileStructure.forEach(file => {
      if (file.language) {
        languages.add(file.language)
      }
    })

    // Calculate total lines (approximate)
    const totalLines = fileStructure
      .filter(f => f.type === 'file')
      .reduce((sum, f) => sum + (f.size || 0), 0)

    return {
      fileStructure,
      keyFiles,
      recentCommits,
      languages: Array.from(languages),
      totalFiles: fileStructure.filter(f => f.type === 'file').length,
      totalLines,
    }
  }

  /**
   * Detect programming language from file path
   */
  private detectLanguage(path: string): string | undefined {
    const ext = path.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'rb': 'ruby',
      'php': 'php',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
    }
    return languageMap[ext || '']
  }

  /**
   * Extract function/component names from code
   */
  private extractFunctions(content: string, path: string): string[] {
    const functions: string[] = []
    
    // TypeScript/JavaScript function patterns
    const functionPatterns = [
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g,
      /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/g,
      /(?:export\s+)?class\s+(\w+)/g,
      /(?:export\s+default\s+)?function\s+(\w+)/g,
    ]

    // React component patterns
    const componentPatterns = [
      /(?:export\s+default\s+)?(?:function\s+)?(\w+)\s*[:\(]/g,
      /const\s+(\w+)\s*[:=]\s*(?:\([^)]*\)\s*=>|React\.(?:FC|Component))/g,
    ]

    const allPatterns = [...functionPatterns, ...componentPatterns]

    for (const pattern of allPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        if (match[1] && !functions.includes(match[1])) {
          functions.push(match[1])
        }
      }
    }

    return functions.slice(0, 50) // Limit to 50 functions
  }
}


