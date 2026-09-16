import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isValidStatus } from '@/lib/types/task'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Task ID is required.' }, { status: 400 })
  }

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

  const { status } = body as Record<string, unknown>

  if (!status || !isValidStatus(status)) {
    return NextResponse.json(
      { error: "Status is required and must be 'Planned', 'In progress', or 'Complete'." },
      { status: 400 }
    )
  }

  // Update task scoped to user_id and task id.
  // Returns empty if task does not exist or does not belong to user.
  const { data: updatedTask, error: dbError } = await supabase
    .from('tasks')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .maybeSingle()

  if (dbError) {
    return NextResponse.json({ error: 'Unable to update task.' }, { status: 500 })
  }

  if (!updatedTask) {
    return NextResponse.json({ error: 'Task not found or not accessible.' }, { status: 404 })
  }

  return NextResponse.json({ task: updatedTask }, { status: 200 })
}
