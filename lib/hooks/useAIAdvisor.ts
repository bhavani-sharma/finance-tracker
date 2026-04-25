import { useState } from 'react';
import { supabase } from '../supabase';

interface Message { role: 'user' | 'assistant'; content: string }

export function useAIAdvisor(month: string) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I can see your transactions and budgets. Ask me anything about your finances." }
  ])
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')

  async function send(question: string) {
    if (!question.trim() || loading) return

    const userMsg: Message = { role: 'user', content: question }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setLoading(true)
    setStreamingText('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-advisor`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session!.access_token}`,
          },
          body: JSON.stringify({
            messages: updatedMessages,
            userId: user!.id,
            month,
          })
        }
      )

      if (!response.ok) throw new Error('Advisor unavailable')

      // Read SSE stream
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))
        for (const line of lines) {
          const raw = line.replace('data: ', '').trim()
          if (raw === '[DONE]') break
          try {
            const parsed = JSON.parse(raw)
            fullText += parsed.text || ''
            setStreamingText(fullText)
          } catch {}
        }
      }

      setMessages([...updatedMessages, { role: 'assistant', content: fullText }])
    } catch (err: any) {
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: 'Sorry, I could not reach the advisor. Please try again.'
      }])
    } finally {
      setLoading(false)
      setStreamingText('')
    }
  }

  function clearChat() {
    setMessages([{ role: 'assistant', content: "Chat cleared. What would you like to know about your finances?" }])
  }

  // Merge streaming text into display list
  const displayMessages = streamingText
    ? [...messages, { role: 'assistant' as const, content: streamingText }]
    : messages

  return { messages: displayMessages, send, loading, clearChat }
}