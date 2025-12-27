import { getOpenAIClient } from './client'
import type { AlignmentResult } from './alignment-engine'

export interface PartialCompletionAnalysis {
  isPartial: boolean
  completedCriteria: string[]
  missingCriteria: string[]
  missingFiles: string[]
  missingFeatures: string[]
  nextSteps: string[]
}

/**
 * Detects partial completion using acceptance criteria, code coverage, and AI analysis
 */
export class PartialCompletionDetector {
  private client: ReturnType<typeof getOpenAIClient>

  constructor(apiKey?: string) {
    this.client = getOpenAIClient(apiKey)
  }

  /**
   * Detect partial completion
   */
  async detectPartial(
    alignmentResult: AlignmentResult,
    acceptanceCriteria: string[],
    repoState: {
      fileStructure: Array<{ path: string; type: string }>
      keyFiles: Array<{ path: string }>
    },
    model: string = 'gpt-4'
  ): Promise<PartialCompletionAnalysis> {
    // Check acceptance criteria
    const completedCriteria: string[] = []
    const missingCriteria: string[] = []

    // Use AI to determine which criteria are met
    const criteriaAnalysis = await this.analyzeCriteria(
      acceptanceCriteria,
      alignmentResult,
      repoState,
      model
    )

    // Check file coverage
    const expectedFiles = alignmentResult.fileLevel.expected
    const foundFiles = alignmentResult.fileLevel.found
    const missingFiles = alignmentResult.fileLevel.missing

    // Check feature coverage
    const missingFeatures: string[] = []
    Object.entries(alignmentResult.featureLevel).forEach(([name, data]) => {
      if (!data.implemented || data.score < 0.7) {
        missingFeatures.push(name)
      }
    })

    const isPartial =
      alignmentResult.overall === 'partial' ||
      (alignmentResult.overall === 'misaligned' &&
        (foundFiles.length > 0 || Object.keys(alignmentResult.featureLevel).length > 0))

    // Generate next steps
    const nextSteps = await this.generateNextSteps(
      missingCriteria,
      missingFiles,
      missingFeatures,
      model
    )

    return {
      isPartial,
      completedCriteria: criteriaAnalysis.completed,
      missingCriteria: criteriaAnalysis.missing,
      missingFiles,
      missingFeatures,
      nextSteps,
    }
  }

  private async analyzeCriteria(
    criteria: string[],
    alignmentResult: AlignmentResult,
    repoState: any,
    model: string
  ): Promise<{ completed: string[]; missing: string[] }> {
    if (criteria.length === 0) {
      return { completed: [], missing: [] }
    }

    const prompt = `Analyze which acceptance criteria are met based on this alignment result:

Acceptance Criteria:
${criteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Alignment Result:
- Step Level Score: ${alignmentResult.stepLevel.score}
- Findings: ${alignmentResult.stepLevel.findings.join(', ')}
- Feature Level: ${JSON.stringify(alignmentResult.featureLevel)}
- File Level: Found ${alignmentResult.fileLevel.found.length}, Missing ${alignmentResult.fileLevel.missing.length}

Return JSON:
{
  "completed": ["criterion 1", "criterion 2"],
  "missing": ["criterion 3", "criterion 4"]
}`

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing code against acceptance criteria.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })

      const content = response.choices[0]?.message?.content
      if (content) {
        return JSON.parse(content)
      }
    } catch (error) {
      console.error('Failed to analyze criteria:', error)
    }

    // Fallback: assume all criteria are missing if analysis fails
    return { completed: [], missing: criteria }
  }

  private async generateNextSteps(
    missingCriteria: string[],
    missingFiles: string[],
    missingFeatures: string[],
    model: string
  ): Promise<string[]> {
    if (
      missingCriteria.length === 0 &&
      missingFiles.length === 0 &&
      missingFeatures.length === 0
    ) {
      return []
    }

    const prompt = `Generate specific next steps to complete this work:

Missing Criteria:
${missingCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Missing Files:
${missingFiles.join(', ')}

Missing Features:
${missingFeatures.join(', ')}

Return JSON array of specific, actionable next steps:
{
  "nextSteps": ["step 1", "step 2", "step 3"]
}`

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a project manager generating actionable next steps.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      })

      const content = response.choices[0]?.message?.content
      if (content) {
        const parsed = JSON.parse(content)
        return parsed.nextSteps || []
      }
    } catch (error) {
      console.error('Failed to generate next steps:', error)
    }

    // Fallback next steps
    const steps: string[] = []
    if (missingFiles.length > 0) {
      steps.push(`Create missing files: ${missingFiles.join(', ')}`)
    }
    if (missingFeatures.length > 0) {
      steps.push(`Implement missing features: ${missingFeatures.join(', ')}`)
    }
    if (missingCriteria.length > 0) {
      steps.push(`Address missing criteria: ${missingCriteria.join(', ')}`)
    }
    return steps
  }
}

