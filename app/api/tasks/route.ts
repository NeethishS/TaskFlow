import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidStatus } from '@/lib/types/task'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tasks, error: dbError } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (dbError) {
    return NextResponse.json({ error: 'Unable to load tasks.' }, { status: 500 })
  }

  return NextResponse.json({ tasks: tasks ?? [] }, { status: 200 })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 })
  }

  const { title, detail, status = 'Planned' } = body as Record<string, unknown>

  if (typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }

  if (!isValidStatus(status)) {
    return NextResponse.json(
      { error: "Status must be 'Planned', 'In progress', or 'Complete'." },
      { status: 400 }
    )
  }

  const taskDetail = typeof detail === 'string' ? detail.trim() : ''

  const { data: task, error: dbError } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: title.trim(),
      detail: taskDetail,
      status,
    })
    .select('*')
    .single()

  if (dbError || !task) {
    return NextResponse.json({ error: 'Unable to create task.' }, { status: 500 })
  }

  return NextResponse.json({ task }, { status: 201 })
}
