export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionOptions {
  apiKey: string
  model?: string
  temperature?: number
  maxCompletionTokens?: number
}

export interface ChatCompletionResult {
  content: string
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const { apiKey, model = 'gpt-5.2', temperature = 0.7, maxCompletionTokens = 1024 } = options

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_completion_tokens: maxCompletionTokens,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
  }

  const result = await response.json()
  return { content: result.choices[0].message.content }
}
