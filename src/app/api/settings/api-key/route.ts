import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { apiKey, provider } = await request.json()

    if (!apiKey || !provider) {
      return NextResponse.json(
        { error: 'API key and provider are required' },
        { status: 400 }
      )
    }

    // Validate API key format
    if (provider === 'claude' && !apiKey.startsWith('sk-ant-')) {
      return NextResponse.json(
        { error: 'Invalid Claude API key format' },
        { status: 400 }
      )
    }

    if (provider === 'openrouter' && !apiKey.startsWith('sk-or-')) {
      return NextResponse.json(
        { error: 'Invalid OpenRouter API key format' },
        { status: 400 }
      )
    }

    // Update the appropriate key
    const updateData =
      provider === 'claude'
        ? { claude_api_key: apiKey }
        : { openrouter_api_key: apiKey }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    )
  }
}