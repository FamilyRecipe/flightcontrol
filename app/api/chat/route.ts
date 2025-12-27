import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpenAIClient } from '@/lib/openai/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages, apiKey, model = 'gpt-4' } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const openai = createOpenAIClient(apiKey || process.env.OPENAI_API_KEY!)

    const response = await openai.chat.completions.create({
      model,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
    })

    const assistantMessage = response.choices[0]?.message?.content

    return NextResponse.json({
      message: assistantMessage,
    })
  } catch (error: any) {
    console.error('Error in chat:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

