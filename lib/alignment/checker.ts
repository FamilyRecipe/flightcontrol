import { AlignmentEngine } from '@/lib/openai/alignment-engine'
import { ImpactAnalyzer } from '@/lib/openai/impact-analyzer'
import { PartialCompletionDetector } from '@/lib/openai/partial-detector'
import { ConversationGuideGenerator } from '@/lib/openai/conversation-guide'
import type { RepoSnapshot, PlanStep } from '@/lib/db/queries'

export interface AlignmentCheckResult {
  alignmentResult: import('@/lib/openai/alignment-engine').AlignmentResult
  impactAnalysis?: import('@/lib/openai/impact-analyzer').ImpactAnalysis
  partialAnalysis?: import('@/lib/openai/partial-detector').PartialCompletionAnalysis
  conversationGuide?: import('@/lib/openai/conversation-guide').ConversationGuide
}

/**
 * Main alignment checking logic that orchestrates all analysis
 */
export class AlignmentChecker {
  private alignmentEngine: AlignmentEngine
  private impactAnalyzer: ImpactAnalyzer
  private partialDetector: PartialCompletionDetector
  private conversationGuide: ConversationGuideGenerator

  constructor(apiKey?: string) {
    this.alignmentEngine = new AlignmentEngine(apiKey)
    this.impactAnalyzer = new ImpactAnalyzer(apiKey)
    this.partialDetector = new PartialCompletionDetector(apiKey)
    this.conversationGuide = new ConversationGuideGenerator(apiKey)
  }

  /**
   * Perform complete alignment check
   */
  async checkAlignment(
    step: PlanStep,
    snapshot: RepoSnapshot,
    model: string = 'gpt-4'
  ): Promise<AlignmentCheckResult> {
    const repoState = this.snapshotToRepoState(snapshot)

    // Perform alignment check
    const alignmentResult = await this.alignmentEngine.checkAlignment(
      {
        title: step.title,
        description: step.description,
        acceptance_criteria: step.acceptance_criteria || undefined,
      },
      repoState,
      model
    )

    const result: AlignmentCheckResult = {
      alignmentResult,
    }

    // If misaligned, analyze impact and generate questions
    if (alignmentResult.overall === 'misaligned') {
      const impactAnalysis = await this.impactAnalyzer.analyzeImpact(
        alignmentResult,
        {
          title: step.title,
          description: step.description,
        },
        model
      )
      result.impactAnalysis = impactAnalysis

      const conversationGuide = await this.conversationGuide.generateQuestions(
        impactAnalysis,
        alignmentResult.stepLevel.findings,
        {
          title: step.title,
          description: step.description,
        },
        model
      )
      result.conversationGuide = conversationGuide
    }

    // If partial, detect what's missing
    if (alignmentResult.overall === 'partial' || alignmentResult.overall === 'misaligned') {
      const acceptanceCriteria = step.acceptance_criteria
        ? step.acceptance_criteria.split('\n').filter(c => c.trim())
        : []

      const partialAnalysis = await this.partialDetector.detectPartial(
        alignmentResult,
        acceptanceCriteria,
        repoState,
        model
      )
      result.partialAnalysis = partialAnalysis
    }

    return result
  }

  private snapshotToRepoState(snapshot: RepoSnapshot): import('@/lib/openai/alignment-engine').RepoState {
    const data = snapshot.snapshot_data
    return {
      fileStructure: data.fileStructure || [],
      keyFiles: data.keyFiles || [],
      recentCommits: data.recentCommits || [],
    }
  }
}

