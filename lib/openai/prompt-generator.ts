import { getOpenAIClient } from './client'

export interface CursorPrompt {
  prompt: string
  context: string
}

/**
 * Generates Cursor-ready prompts for the current plan step
 */
export class CursorPromptGenerator {
  private client: ReturnType<typeof getOpenAIClient>

  constructor(apiKey?: string) {
    this.client = getOpenAIClient(apiKey)
  }

  /**
   * Generate a Cursor prompt for the current step
   */
  async generatePrompt(
    step: {
      title: string
      description: string
      acceptance_criteria?: string
    },
    repoContext: {
      fileStructure: Array<{ path: string; type: string }>
      keyFiles: Array<{ path: string; content: string }>
    },
    model: string = 'gpt-4'
  ): Promise<CursorPrompt> {
    const prompt = this.buildPromptRequest(step, repoContext)

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert at writing clear, actionable prompts for AI coding assistants like Cursor.
Generate prompts that are:
- Specific and detailed
- Include relevant context
- Reference acceptance criteria
- Provide clear instructions
- Format as markdown for readability`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return {
      prompt: content,
      context: this.buildContext(step, repoContext),
    }
  }

  private buildPromptRequest(
    step: {
      title: string
      description: string
      acceptance_criteria?: string
    },
    repoContext: {
      fileStructure: Array<{ path: string; type: string }>
      keyFiles: Array<{ path: string; content: string }>
    }
  ): string {
    return `Generate a Cursor prompt for this project plan step:

STEP:
Title: ${step.title}
Description: ${step.description}
${step.acceptance_criteria ? `Acceptance Criteria:\n${step.acceptance_criteria}` : ''}

REPOSITORY CONTEXT:
File Structure:
${repoContext.fileStructure.slice(0, 20).map(f => `- ${f.path}`).join('\n')}

Key Files:
${repoContext.keyFiles.slice(0, 5).map(f => `\n${f.path}:\n${f.content.substring(0, 300)}...`).join('\n\n')}

Generate a comprehensive, markdown-formatted prompt that:
1. Clearly describes what needs to be implemented
2. References the acceptance criteria
3. Includes relevant context from existing code
4. Provides specific instructions
5. Is ready to paste into Cursor

Format the response as markdown.`
  }

  private buildContext(
    step: {
      title: string
      description: string
      acceptance_criteria?: string
    },
    repoContext: {
      fileStructure: Array<{ path: string; type: string }>
      keyFiles: Array<{ path: string; content: string }>
    }
  ): string {
    return `Step: ${step.title}
Files in repo: ${repoContext.fileStructure.length}
Key files analyzed: ${repoContext.keyFiles.length}`
  }
}

