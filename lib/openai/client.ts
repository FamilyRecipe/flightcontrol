import OpenAI from 'openai'

let openaiInstance: OpenAI | null = null
let openaiServiceInstance: OpenAI | null = null

export function getOpenAIClient(apiKey?: string): OpenAI {
  if (!openaiInstance) {
    const key = apiKey || process.env.OPENAI_API_KEY
    if (!key) {
      throw new Error('OpenAI API key not configured')
    }
    openaiInstance = new OpenAI({
      apiKey: key,
    })
  }
  return openaiInstance
}

export function getOpenAIServiceClient(apiKey?: string): OpenAI {
  if (!openaiServiceInstance) {
    const key = apiKey || process.env.OPENAI_SERVICE_KEY || process.env.OPENAI_API_KEY
    if (!key) {
      throw new Error('OpenAI service key not configured')
    }
    openaiServiceInstance = new OpenAI({
      apiKey: key,
    })
  }
  return openaiServiceInstance
}

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
  })
}

