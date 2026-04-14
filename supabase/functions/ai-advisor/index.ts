// supabase/functions/ai-advisor/index.ts
// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js'
import OpenAI from 'npm:openai'

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })

Deno.serve(async (req) => {
  const { messages, userId, month } = await req.json()

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SERVICE_ROLE_KEY')!
  )

  // Fetch user's transactions for the month
  const { data: txns } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', `${month}-01`)
    .lte('date', `${month}-31`)

  // Fetch user's budgets
  const { data: budgets } = await supabaseAdmin
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)

  // Aggregate financial data
  const income = txns
    .filter((t: { type: string }) => t.type === 'income')
    .reduce((s: any, t: { amount: any }) => s + t.amount, 0)

  const expenses = txns
    .filter((t: { type: string }) => t.type === 'expense')
    .reduce((s: any, t: { amount: any }) => s + t.amount, 0)

  const savingsRate = income > 0
    ? Math.round(((income - expenses) / income) * 100)
    : 0

  // Category breakdown
  const categorySpend = txns
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

  const categoryBreakdown = Object.entries(categorySpend)
    .map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString('en-IN')}`)
    .join(', ')

  const budgetStatus = budgets?.map(b => {
    const spent = categorySpend[b.category] || 0
    const pct = Math.round((spent / b.limit_amount) * 100)
    return `${b.category}: ₹${spent.toLocaleString('en-IN')} of ₹${b.limit_amount.toLocaleString('en-IN')} (${pct}%)`
  }).join('; ') || 'No budgets set'

  const systemPrompt = `You are a friendly and knowledgeable personal finance advisor for an Indian user.

Here is their financial data for ${month}:
- Total income: ₹${income.toLocaleString('en-IN')}
- Total expenses: ₹${expenses.toLocaleString('en-IN')}
- Balance: ₹${(income - expenses).toLocaleString('en-IN')}
- Savings rate: ${savingsRate}%
- Spending by category: ${categoryBreakdown}
- Budget status: ${budgetStatus}
- Recent transactions: ${JSON.stringify(txns.slice(0, 15))}

Rules:
- Give specific, actionable advice based on their actual numbers
- Reference specific categories and amounts from their data
- Use ₹ for all currency values
- Be concise (3-5 sentences unless they ask for detail)
- Be encouraging but honest about overspending
- Suggest realistic improvements based on their spending patterns`

  // Build messages array with system prompt
  const openaiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }))
  ]

  // Streaming response
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1000,
    messages: openaiMessages,
    stream: true,
  })

  // Stream back to the app
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || ''
        if (text) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
})