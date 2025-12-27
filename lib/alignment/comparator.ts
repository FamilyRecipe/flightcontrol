import type { AlignmentResult } from '@/lib/openai/alignment-engine'

/**
 * Multi-level comparison engine utilities
 */
export class MultiLevelComparator {
  /**
   * Calculate overall alignment score from multi-level results
   */
  calculateOverallScore(alignmentResult: AlignmentResult): number {
    const weights = {
      stepLevel: 0.4,
      featureLevel: 0.4,
      fileLevel: 0.2,
    }

    // Step level score
    const stepScore = alignmentResult.stepLevel.score

    // Feature level score (average of all features)
    const featureScores = Object.values(alignmentResult.featureLevel).map(
      f => f.score
    )
    const featureScore =
      featureScores.length > 0
        ? featureScores.reduce((a, b) => a + b, 0) / featureScores.length
        : 1.0

    // File level score (based on expected vs found)
    const expectedCount = alignmentResult.fileLevel.expected.length
    const foundCount = alignmentResult.fileLevel.found.length
    const fileScore =
      expectedCount > 0 ? foundCount / expectedCount : 1.0

    // Weighted average
    return (
      stepScore * weights.stepLevel +
      featureScore * weights.featureLevel +
      fileScore * weights.fileLevel
    )
  }

  /**
   * Determine alignment status from score
   */
  determineStatus(score: number): 'aligned' | 'misaligned' | 'partial' {
    if (score >= 0.9) {
      return 'aligned'
    } else if (score >= 0.5) {
      return 'partial'
    } else {
      return 'misaligned'
    }
  }

  /**
   * Get detailed breakdown of alignment
   */
  getBreakdown(alignmentResult: AlignmentResult): {
    stepLevel: { score: number; status: string }
    featureLevel: Array<{ name: string; score: number; status: string }>
    fileLevel: { score: number; status: string; details: string }
  } {
    return {
      stepLevel: {
        score: alignmentResult.stepLevel.score,
        status: this.determineStatus(alignmentResult.stepLevel.score),
      },
      featureLevel: Object.entries(alignmentResult.featureLevel).map(
        ([name, data]) => ({
          name,
          score: data.score,
          status: this.determineStatus(data.score),
        })
      ),
      fileLevel: {
        score:
          alignmentResult.fileLevel.expected.length > 0
            ? alignmentResult.fileLevel.found.length /
              alignmentResult.fileLevel.expected.length
            : 1.0,
        status: this.determineStatus(
          alignmentResult.fileLevel.expected.length > 0
            ? alignmentResult.fileLevel.found.length /
              alignmentResult.fileLevel.expected.length
            : 1.0
        ),
        details: `Found ${alignmentResult.fileLevel.found.length} of ${alignmentResult.fileLevel.expected.length} expected files`,
      },
    }
  }
}

