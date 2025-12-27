import { getOpenAIClient } from './client'
import type { ImpactAnalysis } from './impact-analyzer'

export interface ConversationQuestion {
  question: string
  type: 'why' | 'how' | 'impact' | 'clarification'
  required: boolean
}

export interface ConversationGuide {
  questions: ConversationQuestion[]
  context: string
}

/**
 * Generates guided conversation questions for misalignment discussions
 */
export class ConversationGuideGenerator {
  private client: ReturnType<typeof getOpenAIClient>

  constructor(apiKey?: string) {
    this.client = getOpenAIClient(apiKey)
  }

  /**
   * Generate questions for misalignment conversation
   */
  async generateQuestions(
    impactAnalysis: ImpactAnalysis,
    alignmentFindings: string[],
    planStep: { title: string; description: string },
    model: string = 'gpt-4'
  ): Promise<ConversationGuide> {
    const prompt = this.buildQuestionPrompt(impactAnalysis, alignmentFindings, planStep)

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert at facilitating productive conversations about project alignment.
Generate specific, focused questions that help understand:
1. Why changes were made (intent)
2. How changes differ from plan (scope)
3. Impact on project (consequences)
4. Clarifications needed (ambiguity)

Questions should be:
- Specific and actionable
- Not accusatory
- Focused on understanding and alignment
- Mix of required and optional questions`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    try {
      const parsed = JSON.parse(content)
      return {
        questions: parsed.questions || [],
        context: parsed.context || '',
      }
    } catch (error) {
      console.error('Failed to parse conversation guide:', error)
      // Return default questions
      return {
        questions: [
          {
            question: 'Why were these changes made instead of following the plan?',
            type: 'why',
            required: true,
          },
          {
            question: 'How do these changes differ from what was planned?',
            type: 'how',
            required: true,
          },
          {
            question: 'What impact do these changes have on the project timeline?',
            type: 'impact',
            required: false,
          },
        ],
        context: 'Default conversation guide',
      }
    }
  }

  private buildQuestionPrompt(
    impactAnalysis: ImpactAnalysis,
    alignmentFindings: string[],
    planStep: { title: string; description: string }
  ): string {
    return `Generate conversation questions for this misalignment:

PLAN STEP:
Title: ${planStep.title}
Description: ${planStep.description}

ALIGNMENT FINDINGS:
${alignmentFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

IMPACT ANALYSIS:
Scope: ${impactAnalysis.scope.join(', ')}
Timeline: ${impactAnalysis.timeline}
Dependencies: ${impactAnalysis.dependencies.join(', ')}
Quality: ${impactAnalysis.quality}

Return JSON:
{
  "context": "Brief context for the conversation",
  "questions": [
    {
      "question": "question text",
      "type": "why" | "how" | "impact" | "clarification",
      "required": true/false
    }
  ]
}

Generate 3-5 questions that help understand the misalignment and guide toward resolution.`
  }
}


