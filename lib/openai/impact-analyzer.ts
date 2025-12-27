import { getOpenAIClient } from './client'
import type { AlignmentResult } from './alignment-engine'

export interface ImpactAnalysis {
  scope: string[]
  timeline: string
  dependencies: string[]
  quality: string
}

/**
 * Analyzes the impact of misalignment on the project plan
 */
export class ImpactAnalyzer {
  private client: ReturnType<typeof getOpenAIClient>

  constructor(apiKey?: string) {
    this.client = getOpenAIClient(apiKey)
  }

  /**
   * Analyze impact of misalignment
   */
  async analyzeImpact(
    alignmentResult: AlignmentResult,
    planStep: { title: string; description: string },
    model: string = 'gpt-4'
  ): Promise<ImpactAnalysis> {
    if (alignmentResult.overall === 'aligned') {
      return {
        scope: [],
        timeline: 'No impact',
        dependencies: [],
        quality: 'Implementation aligns with plan',
      }
    }

    const prompt = this.buildImpactPrompt(alignmentResult, planStep)

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are a project management expert analyzing the impact of code changes that don't align with the project plan.
Analyze impact across four dimensions:
1. Scope: What features were added/removed/changed?
2. Timeline: How does this affect estimated completion?
3. Dependencies: What other steps are impacted?
4. Quality: Is the implementation complete and correct?`,
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
      return JSON.parse(content) as ImpactAnalysis
    } catch (error) {
      console.error('Failed to parse impact analysis:', error)
      return {
        scope: ['Unable to analyze scope impact'],
        timeline: 'Unable to assess timeline impact',
        dependencies: ['Unable to assess dependency impact'],
        quality: 'Unable to assess quality',
      }
    }
  }

  private buildImpactPrompt(
    alignmentResult: AlignmentResult,
    planStep: { title: string; description: string }
  ): string {
    return `Analyze the impact of this misalignment:

PLAN STEP:
Title: ${planStep.title}
Description: ${planStep.description}

ALIGNMENT FINDINGS:
Step Level Score: ${alignmentResult.stepLevel.score}
Step Level Findings: ${alignmentResult.stepLevel.findings.join(', ')}

Feature Level:
${Object.entries(alignmentResult.featureLevel).map(([name, data]) =>
  `- ${name}: Score ${data.score}, Implemented: ${data.implemented}, Findings: ${data.findings.join(', ')}`
).join('\n')}

File Level:
Expected: ${alignmentResult.fileLevel.expected.join(', ')}
Found: ${alignmentResult.fileLevel.found.join(', ')}
Missing: ${alignmentResult.fileLevel.missing.join(', ')}
Unexpected: ${alignmentResult.fileLevel.unexpected.join(', ')}

Return a JSON object with impact analysis:
{
  "scope": ["scope impact 1", "scope impact 2"],
  "timeline": "timeline impact description",
  "dependencies": ["dependency impact 1", "dependency impact 2"],
  "quality": "quality assessment description"
}`
  }
}

