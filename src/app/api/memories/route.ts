import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET all memories
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('project_id')
  const memoryType = searchParams.get('type')
  const search = searchParams.get('search')

  let query = supabase
    .from('memories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  if (memoryType) {
    query = query.eq('memory_type', memoryType)
  }

  if (search) {
    query = query.ilike('content', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// POST create new memory
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content, memory_type, tags, project_id, is_global, metadata } = body

  if (!content || !memory_type) {
    return NextResponse.json(
      { error: 'Content and memory_type are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('memories')
    .insert({
      user_id: user.id,
      content,
      memory_type,
      tags: tags || [],
      project_id: project_id || null,
      is_global: is_global || false,
      metadata: metadata || {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}