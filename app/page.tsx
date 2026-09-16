'use client'

import { useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Status, Task } from '@/lib/types/task'
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock3,
  LogOut,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react'

const statuses: Status[] = ['Planned', 'In progress', 'Complete']

const statusActions: Record<Status, string> = {
  Planned: 'Start task',
  'In progress': 'Complete',
  Complete: 'Completed ✓',
}

const nextStatusMap: Record<Status, Status> = {
  Planned: 'In progress',
  'In progress': 'Complete',
  Complete: 'Complete',
}

function formatLocalDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(date)
}

function GoogleMark() {
  return <span aria-hidden="true" className="google-mark">G</span>
}

function StatusPill({ status }: { status: Status }) {
  const Icon = status === 'Complete' ? CircleCheck : status === 'In progress' ? Clock3 : ArrowRight
  return <span className={`status-pill status-${status.toLowerCase().replace(' ', '-')}`}><Icon size={13} strokeWidth={2.2} />{status}</span>
}

function LoginScreen({ onGoogleLogin, error }: { onGoogleLogin: () => void; error?: string | null }) {
  return (
    <main className="login-shell">
      <div className="login-orbit orbit-one" />
      <div className="login-orbit orbit-two" />
      <section className="login-card" aria-labelledby="login-heading">
        <div className="brand-lockup"><span className="brand-mark">T</span><span>taskflow</span></div>
        <div className="login-copy">
          <p className="eyebrow">A quieter way to move work</p>
          <h1 id="login-heading">Make space for<br /><em>what matters next.</em></h1>
          <p className="login-description">A focused home for your tasks, built to keep progress visible and friction low.</p>
        </div>
        {error && (
          <p className="field-error" style={{ marginBottom: '14px' }}>
            <CircleAlert size={15} />
            {error}
          </p>
        )}
        <button className="google-button" type="button" onClick={onGoogleLogin}>
          <GoogleMark />
          <span>Continue with Google</span>
          <ArrowRight size={17} />
        </button>
      </section>
      <p className="login-footer">TASKFLOW <span>·</span> SIMPLE TASKS, CLEAR PROGRESS</p>
    </main>
  )
}

function TaskCard({
  task,
  indexNumber,
  onStatusChange,
}: {
  task: Task
  indexNumber: number
  onStatusChange: (id: string, status: Status) => void
}) {
  const [open, setOpen] = useState(false)
  const displayIndex = indexNumber < 10 ? `0${indexNumber}` : `${indexNumber}`

  const handleNextMove = () => {
    const next = nextStatusMap[task.status]
    if (next !== task.status) {
      onStatusChange(task.id, next)
    }
  }

  return (
    <article className="task-card">
      <div className="task-card-top">
        <span className="task-number">{displayIndex}</span>
        <StatusPill status={task.status} />
      </div>
      <h3>{task.title}</h3>
      <p>{task.detail || 'No additional context provided.'}</p>
      <div className="task-card-bottom">
        <div className="status-control">
          <button className="status-trigger" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
            <span>Update status</span>
            <ChevronDown size={15} />
          </button>
          {open && (
            <div className="status-menu">
              {statuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={status === task.status ? 'selected' : ''}
                  onClick={() => {
                    onStatusChange(task.id, status)
                    setOpen(false)
                  }}
                >
                  {status}
                  {status === task.status && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          className={`next-action next-${task.status.toLowerCase().replace(' ', '-')}`}
          style={{ background: 'none', border: 'none', padding: 0, cursor: task.status === 'Complete' ? 'default' : 'pointer' }}
          onClick={handleNextMove}
          disabled={task.status === 'Complete'}
          title={task.status !== 'Complete' ? `Move to ${nextStatusMap[task.status]}` : undefined}
        >
          {statusActions[task.status]}
        </button>
      </div>
    </article>
  )
}

function TaskSection({
  status,
  tasks,
  allTasks,
  onStatusChange,
}: {
  status: Status
  tasks: Task[]
  allTasks: Task[]
  onStatusChange: (id: string, status: Status) => void
}) {
  if (tasks.length === 0) return null
  return (
    <section className="task-section" aria-labelledby={`section-${status}`}>
      <div className="task-section-heading">
        <h2 id={`section-${status}`}>{status}</h2>
        <span>{tasks.length}</span>
      </div>
      <div className="task-grid">
        {tasks.map((task) => {
          // Stable visual order index across the workspace list (1-indexed)
          const indexNumber = allTasks.findIndex((t) => t.id === task.id) + 1
          return (
            <TaskCard
              key={task.id}
              task={task}
              indexNumber={indexNumber > 0 ? indexNumber : 1}
              onStatusChange={onStatusChange}
            />
          )
        })}
      </div>
    </section>
  )
}

function CreateTaskModal({
  onClose,
  onCreate,
  isSubmitting,
}: {
  onClose: () => void
  onCreate: (title: string, detail: string) => Promise<boolean>
  isSubmitting: boolean
}) {
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [error, setError] = useState('')

  const submit = async () => {
    if (!title.trim()) {
      setError('Give your task a clear title to continue.')
      return
    }
    const success = await onCreate(title.trim(), detail.trim())
    if (!success) {
      setError('Unable to save your task. Please try again.')
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close create task dialog" disabled={isSubmitting}>
          <X size={18} />
        </button>
        <p className="eyebrow">New task</p>
        <h2 id="create-title">What needs your attention?</h2>
        <p className="modal-intro">Keep it clear and actionable. You can update its status as the work moves forward.</p>
        <label htmlFor="task-title">Task title <span>Required</span></label>
        <input
          id="task-title"
          autoFocus
          disabled={isSubmitting}
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            setError('')
          }}
          placeholder="e.g. Prepare launch notes"
          aria-invalid={Boolean(error)}
        />
        <label htmlFor="task-detail">A little context <span>Optional</span></label>
        <textarea
          id="task-detail"
          disabled={isSubmitting}
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          placeholder="What does done look like?"
          rows={3}
        />
        {error && (
          <p className="field-error">
            <CircleAlert size={15} />
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
          <button className="primary-button" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create task'} <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  )
}

function TaskWorkspace({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState('')
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(formatLocalDate(new Date()))
  }, [])

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) {
        throw new Error('Failed to load tasks')
      }
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {
      setFetchError("We couldn't load your tasks. Please try again.")
    } finally {
      setLoadingTasks(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const showToast = (message: string, duration = 2400) => {
    setToast(message)
    setTimeout(() => setToast(''), duration)
  }

  const createTask = async (title: string, detail: string): Promise<boolean> => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, detail, status: 'Planned' }),
      })

      if (!res.ok) {
        return false
      }

      const { task } = await res.json()
      setTasks((current) => [task, ...current])
      setShowModal(false)
      showToast('Task added to your list', 2800)
      return true
    } catch {
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateStatus = async (id: string, newStatus: Status) => {
    // Find current task
    const currentTask = tasks.find((t) => t.id === id)
    if (!currentTask || currentTask.status === newStatus) return

    const previousStatus = currentTask.status

    // Optimistic UI update
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, status: newStatus } : task))
    )

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Update failed')
      }

      const { task: updatedTask } = await res.json()
      setTasks((current) =>
        current.map((t) => (t.id === id ? updatedTask : t))
      )
      showToast('Status updated', 2200)
    } catch {
      // Revert status on failure
      setTasks((current) =>
        current.map((task) => (task.id === id ? { ...task, status: previousStatus } : task))
      )
      showToast('Failed to update status. Please try again.', 3200)
    }
  }

  // Extract user metadata from Google OAuth / Supabase
  const meta = user.user_metadata || {}
  const fullName: string = meta.full_name || meta.name || user.email?.split('@')[0] || 'User'
  const firstName: string = meta.given_name || fullName.split(' ')[0] || 'there'
  const avatarUrl: string | undefined = meta.avatar_url || meta.picture
  const initials: string =
    fullName
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <div className="brand-lockup">
          <span className="brand-mark">T</span>
          <span>taskflow</span>
        </div>
        <div className="header-actions">
          <span className="signed-in">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="avatar"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <span className="avatar">{initials}</span>
            )}
            <span className="signed-in-name">{fullName}</span>
          </span>
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </header>
      <div className="workspace-content">
        <section className="workspace-intro">
          <div>
            <p className="eyebrow">{today}</p>
            <h1>Good morning, {firstName}.</h1>
            <p className="intro-copy">A clear view of the work in front of you.</p>
          </div>
          <button className="primary-button create-button" onClick={() => setShowModal(true)}>
            <Plus size={17} /> New task
          </button>
        </section>
        <div className="workspace-rule" />
        <section className="task-summary">
          <div>
            <span className="summary-number">{tasks.length}</span>
            <span>tasks in view</span>
          </div>
          <span className="summary-dot" />
          <span className="summary-muted">Move them forward, one at a time.</span>
        </section>

        {loadingTasks ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)' }}>
            Loading your tasks...
          </div>
        ) : fetchError ? (
          <div className="error-state">
            <CircleAlert size={22} />
            <div>
              <strong>We couldn&apos;t load your tasks.</strong>
              <p>{fetchError}</p>
            </div>
            <button className="retry-button" onClick={loadTasks}>
              <RotateCcw size={15} /> Try again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">
              <Check size={20} />
            </span>
            <h2>Your list is clear.</h2>
            <p>Start with one small, concrete task.</p>
            <button className="secondary-button" onClick={() => setShowModal(true)}>
              Create your first task
            </button>
          </div>
        ) : (
          <div className="task-sections">
            {statuses.map((status) => (
              <TaskSection
                key={status}
                status={status}
                tasks={tasks.filter((task) => task.status === status)}
                allTasks={tasks}
                onStatusChange={updateStatus}
              />
            ))}
          </div>
        )}
      </div>
      <footer className="workspace-footer">
        <span>TASKFLOW</span>
        <span>Google auth · Supabase persistence</span>
        <button onClick={loadTasks}>Refresh tasks</button>
      </footer>
      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreate={createTask}
          isSubmitting={isSubmitting}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} /> {toast}
        </div>
      )}
    </main>
  )
}

export default function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Check for callback failure parameter in URL if redirected back with error
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('error')) {
        setAuthError('Sign in failed or was cancelled. Please try again.')
        // Clean URL params without reloading
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    // Get initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Session retrieval error:', error.message)
        }
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleGoogleLogin = async () => {
    setAuthError(null)
    const redirectTo = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })
    if (error) {
      setAuthError('Unable to connect to Google Sign-In. Please check your credentials.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Graceful loading view preserving background color and typography without layout shift
  if (loading) {
    return (
      <main className="login-shell">
        <div className="login-orbit orbit-one" />
        <div className="login-orbit orbit-two" />
        <section className="login-card" style={{ textAlign: 'center', padding: '40px 30px' }}>
          <div className="brand-lockup" style={{ justifyContent: 'center', marginBottom: '20px' }}>
            <span className="brand-mark">T</span>
            <span>taskflow</span>
          </div>
          <p className="intro-copy">Checking session...</p>
        </section>
      </main>
    )
  }

  return user ? (
    <TaskWorkspace user={user} onLogout={handleLogout} />
  ) : (
    <LoginScreen onGoogleLogin={handleGoogleLogin} error={authError} />
  )
}
