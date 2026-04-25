import { supabase } from './supabase'

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function streamAIAdvisor(
  messages: AIMessage[],
  month: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: string) => void,
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()

    if (!user || !session) {
      onError('Not authenticated')
      return
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-advisor`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages, userId: user.id, month }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      onError(`Advisor error: ${err}`)
      return
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

      for (const line of lines) {
        const raw = line.replace('data: ', '').trim()
        if (raw === '[DONE]') {
          onDone(fullText)
          return
        }
        try {
          const parsed = JSON.parse(raw)
          const text = parsed.text || ''
          if (text) {
            fullText += text
            onChunk(fullText)
          }
        } catch {}
      }
    }

    onDone(fullText)
  } catch (err: any) {
    onError(err.message || 'Something went wrong')
  }
}