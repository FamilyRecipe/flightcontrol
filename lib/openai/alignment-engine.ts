import { getOpenAIClient } from './client'

export interface AlignmentResult {
  overall: 'aligned' | 'misaligned' | 'partial'
  stepLevel: {
    score: number // 0-1
    findings: string[]
  }
  featureLevel: {
    [featureName: string]: {
      score: number
      implemented: boolean
      findings: string[]
    }
  }
  fileLevel: {
    expected: string[]
    found: string[]
    missing: string[]
    unexpected: string[]
  }
  impactAnalysis?: {
    scope: string[]
    timeline: string
    dependencies: string[]
    quality: string
  }
}

export interface PlanStep {
  title: string
  description: string
  acceptance_criteria?: string
}

export interface RepoState {
  fileStructure: Array<{
    path: string
    type: 'file' | 'directory'
    language?: string
  }>
  keyFiles: Array<{
    path: string
    content: string
    functions?: string[]
  }>
  recentCommits: Array<{
    sha: string
    message: string
    date: string
  }>
}

/**
 * Multi-level alignment engine that compares repo state to plan step
 */
export class AlignmentEngine {
  private client: ReturnType<typeof getOpenAIClient>

  constructor(apiKey?: string) {
    this.client = getOpenAIClient(apiKey)
  }

  /**
   * Compare repository state to a plan step at multiple levels
   */
  async checkAlignment(
    step: PlanStep,
    repoState: RepoState,
    model: string = 'gpt-4'
  ): Promise<AlignmentResult> {
    const prompt = this.buildAlignmentPrompt(step, repoState)

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert code reviewer analyzing alignment between a project plan and actual implementation.
Analyze at three levels:
1. Step Level: Overall alignment of the step
2. Feature Level: Individual features/components mentioned in the step
3. File Level: Expected files vs actual files

Return a JSON object with the alignment result.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    try {
      return JSON.parse(content) as AlignmentResult
    } catch (error) {
      console.error('Failed to parse alignment result:', error)
      // Return a default misaligned result if parsing fails
      return {
        overall: 'misaligned',
        stepLevel: {
          score: 0,
          findings: ['Failed to analyze alignment'],
        },
        featureLevel: {},
        fileLevel: {
          expected: [],
          found: [],
          missing: [],
          unexpected: [],
        },
      }
    }
  }

  private buildAlignmentPrompt(step: PlanStep, repoState: RepoState): string {
    return `Analyze the alignment between this project plan step and the current repository state.

PLAN STEP:
Title: ${step.title}
Description: ${step.description}
${step.acceptance_criteria ? `Acceptance Criteria: ${step.acceptance_criteria}` : ''}

REPOSITORY STATE:
File Structure:
${repoState.fileStructure.map(f => `- ${f.path} (${f.type}${f.language ? `, ${f.language}` : ''})`).join('\n')}

Key Files:
${repoState.keyFiles.map(f => `\n${f.path}:\n${f.content.substring(0, 500)}...`).join('\n\n')}

Recent Commits:
${repoState.recentCommits.map(c => `- ${c.sha.substring(0, 7)}: ${c.message}`).join('\n')}

Analyze alignment at three levels and return a JSON object with this structure:
{
  "overall": "aligned" | "misaligned" | "partial",
  "stepLevel": {
    "score": 0.0-1.0,
    "findings": ["finding1", "finding2"]
  },
  "featureLevel": {
    "featureName": {
      "score": 0.0-1.0,
      "implemented": true/false,
      "findings": ["finding1"]
    }
  },
  "fileLevel": {
    "expected": ["file1", "file2"],
    "found": ["file1"],
    "missing": ["file2"],
    "unexpected": ["file3"]
  }
}

If misaligned, also include:
"impactAnalysis": {
  "scope": ["scope impact 1"],
  "timeline": "timeline impact",
  "dependencies": ["dependency impact 1"],
  "quality": "quality assessment"
}`
  }
}


