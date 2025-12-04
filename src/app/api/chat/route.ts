import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('Request body:', body)
    
    const { message, projectId } = body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    // Get user's API keys
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('claude_api_key, openrouter_api_key')
      .eq('id', user.id)
      .single()

    console.log('User data:', userData, 'Error:', userError)

    if (userError) {
      console.error('Failed to fetch user data:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user settings' },
        { status: 500 }
      )
    }

    // Determine which provider to use (prefer OpenRouter if both are set)
    const useOpenRouter = !!userData?.openrouter_api_key
    const useClaude = !!userData?.claude_api_key

    console.log('useOpenRouter:', useOpenRouter, 'useClaude:', useClaude)

    if (!useOpenRouter && !useClaude) {
      return NextResponse.json(
        { error: 'Please add your API key in settings' },
        { status: 400 }
      )
    }

    // Fetch relevant memories - properly handle null/undefined projectId
    let memoriesQuery = supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Only add project filter if projectId is a valid UUID
    if (projectId && typeof projectId === 'string' && projectId.length > 0) {
      memoriesQuery = memoriesQuery.or(`is_global.eq.true,project_id.eq.${projectId}`)
    } else {
      memoriesQuery = memoriesQuery.eq('is_global', true)
    }

    const { data: memories, error: memoriesError } = await memoriesQuery

    if (memoriesError) {
      console.error('Memories fetch error:', memoriesError)
    }

    // Fetch PRD sections if projectId provided
    let prdSections: Array<{
      section_title: string
      section_content: string
      section_order: number
    }> = []

    if (projectId && typeof projectId === 'string' && projectId.length > 0) {
      const { data: sections, error: sectionsError } = await supabase
        .from('prd_sections')
        .select('*')
        .eq('project_id', projectId)
        .order('section_order', { ascending: true })
        .limit(5)

      if (sectionsError) {
        console.error('PRD sections fetch error:', sectionsError)
      }

      prdSections = sections || []
    }

    // Build context for AI
    let contextPrompt = ''

    if (memories && memories.length > 0) {
      contextPrompt += '\n\n**RELEVANT MEMORIES:**\n'
      memories.forEach((mem) => {
        contextPrompt += `- [${mem.memory_type}] ${mem.content}\n`
      })
    }

    if (prdSections.length > 0) {
      contextPrompt += '\n\n**PROJECT PRD SECTIONS:**\n'
      prdSections.forEach((section) => {
        contextPrompt += `\n### ${section.section_title}\n${section.section_content.substring(0, 1000)}\n`
      })
    }

    const systemPrompt = `You are an intelligent AI assistant with access to the user's memory vault and project documentation. Use the provided context to give personalized, contextual responses.

${contextPrompt}

Remember to:
- Reference memories when relevant
- Use PRD context for project-specific questions
- Be helpful, concise, and professional
- Format code blocks with language tags`

    let assistantMessage = ''

    // Call OpenRouter or Claude API
    if (useOpenRouter) {
      console.log('Using OpenRouter...')
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.openrouter_api_key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'AI Memory Vault',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4',  // FIXED: Correct OpenRouter model ID
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: message,
            },
          ],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('OpenRouter error:', data)
        return NextResponse.json(
          { error: data.error?.message || 'OpenRouter API call failed' },
          { status: response.status }
        )
      }

      assistantMessage = data.choices?.[0]?.message?.content || 'No response from AI'
    } else {
      console.log('Using Claude direct...')
      
      const anthropic = new Anthropic({
        apiKey: userData.claude_api_key!,
      })

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',  // Direct Anthropic API uses this format
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      })

      const firstContent = response.content[0]
      assistantMessage = firstContent.type === 'text' ? firstContent.text : ''
    }

    // Save conversation to database
    const { error: insertError } = await supabase.from('conversations').insert([
      {
        user_id: user.id,
        project_id: projectId || null,
        role: 'user',
        content: message,
        context_used: {
          memories_count: memories?.length || 0,
          prd_sections_count: prdSections.length,
        },
      },
      {
        user_id: user.id,
        project_id: projectId || null,
        role: 'assistant',
        content: assistantMessage,
        context_used: {
          memories_count: memories?.length || 0,
          prd_sections_count: prdSections.length,
        },
      },
    ])

    if (insertError) {
      console.error('Failed to save conversation:', insertError)
    }

    return NextResponse.json({
      message: assistantMessage,
      context: {
        memories_used: memories?.length || 0,
        prd_sections_used: prdSections.length,
        provider: useOpenRouter ? 'openrouter' : 'claude',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed' },
      { status: 500 }
    )
  }
}