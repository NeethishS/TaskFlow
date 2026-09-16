'use client'

import { useEffect, useState } from 'react'
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

type Status = 'Planned' | 'In progress' | 'Complete'

type Task = {
  id: number
  title: string
  detail: string
  status: Status
}

const initialTasks: Task[] = [
  { id: 1, title: 'Map the first-run experience', detail: 'Outline the key moments from sign-in to the first completed task.', status: 'Complete' },
  { id: 2, title: 'Write the task creation flow', detail: 'Keep the form focused on the smallest useful piece of work.', status: 'In progress' },
  { id: 3, title: 'Connect the task list to the API', detail: 'Leave a clean seam for the FastAPI integration.', status: 'Planned' },
  { id: 4, title: 'Review the empty state', detail: 'Make the first task feel easy to add, not like an error.', status: 'Planned' },
]

const statuses: Status[] = ['Planned', 'In progress', 'Complete']

const mockUser = {
  name: 'Alex Morgan',
  initials: 'AM',
}

const statusActions: Record<Status, string> = {
  Planned: 'Start task',
  'In progress': 'Complete',
  Complete: 'Completed ✓',
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

function LoginScreen({ onPreviewLogin }: { onPreviewLogin: () => void }) {
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
        <button className="google-button" type="button" onClick={onPreviewLogin}><GoogleMark /><span>Continue with Google</span><ArrowRight size={17} /></button>
        <p className="login-note">Google authentication will be connected to the production API.</p>
        <button className="preview-login" type="button" onClick={onPreviewLogin}>Preview signed-in state <span>Development only</span></button>
      </section>
      <p className="login-footer">TASKFLOW <span>·</span> SIMPLE TASKS, CLEAR PROGRESS</p>
    </main>
  )
}

function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange: (id: number, status: Status) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <article className="task-card">
      <div className="task-card-top"><span className="task-number">0{task.id}</span><StatusPill status={task.status} /></div>
      <h3>{task.title}</h3>
      <p>{task.detail}</p>
      <div className="task-card-bottom">
        <div className="status-control">
          <button className="status-trigger" type="button" aria-expanded={open} onClick={() => setOpen(!open)}><span>Update status</span><ChevronDown size={15} /></button>
          {open && <div className="status-menu">{statuses.map((status) => <button key={status} type="button" className={status === task.status ? 'selected' : ''} onClick={() => { onStatusChange(task.id, status); setOpen(false) }}>{status}{status === task.status && <Check size={14} />}</button>)}</div>}
        </div>
        <span className={`next-action next-${task.status.toLowerCase().replace(' ', '-')}`}>{statusActions[task.status]}</span>
      </div>
    </article>
  )
}

function TaskSection({ status, tasks, onStatusChange }: { status: Status; tasks: Task[]; onStatusChange: (id: number, status: Status) => void }) {
  if (tasks.length === 0) return null
  return <section className="task-section" aria-labelledby={`section-${status}`}>
    <div className="task-section-heading"><h2 id={`section-${status}`}>{status}</h2><span>{tasks.length}</span></div>
    <div className="task-grid">{tasks.map((task) => <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />)}</div>
  </section>
}

function CreateTaskModal({ onClose, onCreate }: { onClose: () => void; onCreate: (title: string, detail: string) => void }) {
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [error, setError] = useState('')
  const submit = () => {
    if (!title.trim()) { setError('Give your task a clear title to continue.'); return }
    onCreate(title.trim(), detail.trim())
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close create task dialog"><X size={18} /></button>
      <p className="eyebrow">New task</p><h2 id="create-title">What needs your attention?</h2><p className="modal-intro">Keep it clear and actionable. You can update its status as the work moves forward.</p>
      <label htmlFor="task-title">Task title <span>Required</span></label><input id="task-title" autoFocus value={title} onChange={(event) => { setTitle(event.target.value); setError('') }} placeholder="e.g. Prepare launch notes" aria-invalid={Boolean(error)} />
      <label htmlFor="task-detail">A little context <span>Optional</span></label><textarea id="task-detail" value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="What does done look like?" rows={3} />
      {error && <p className="field-error"><CircleAlert size={15} />{error}</p>}
      <div className="modal-actions"><button className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" onClick={submit}>Create task <ArrowRight size={16} /></button></div>
    </section>
  </div>
}

function TaskWorkspace({ onLogout }: { onLogout: () => void }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [showModal, setShowModal] = useState(false)
  const [showError, setShowError] = useState(false)
  const [toast, setToast] = useState('')
  const [today, setToday] = useState('')
  useEffect(() => { setToday(formatLocalDate(new Date())) }, [])
  const createTask = (title: string, detail: string) => { setTasks((current) => [{ id: current.length + 1, title, detail: detail || 'No additional context provided.', status: 'Planned' }, ...current]); setShowModal(false); setToast('Task added to your list'); setTimeout(() => setToast(''), 2800) }
  const updateStatus = (id: number, status: Status) => { setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task)); setToast('Status updated'); setTimeout(() => setToast(''), 2200) }
  return <main className="workspace-shell">
    <header className="workspace-header"><div className="brand-lockup"><span className="brand-mark">T</span><span>taskflow</span></div><div className="header-actions"><span className="signed-in"><span className="avatar">{mockUser.initials}</span><span className="signed-in-name">{mockUser.name}</span></span><button className="logout-button" onClick={onLogout}><LogOut size={15} /> Log out</button></div></header>
    <div className="workspace-content">
      <section className="workspace-intro"><div><p className="eyebrow">{today}</p><h1>Good morning, {mockUser.name.split(' ')[0]}.</h1><p className="intro-copy">A clear view of the work in front of you.</p></div><button className="primary-button create-button" onClick={() => setShowModal(true)}><Plus size={17} /> New task</button></section>
      <div className="workspace-rule" />
      <section className="task-summary"><div><span className="summary-number">{tasks.length}</span><span>tasks in view</span></div><span className="summary-dot" /><span className="summary-muted">Move them forward, one at a time.</span></section>
      {showError ? <div className="error-state"><CircleAlert size={22} /><div><strong>We couldn&apos;t load your tasks.</strong><p>This is a preview state. Try again when the API is connected.</p></div><button className="retry-button" onClick={() => setShowError(false)}><RotateCcw size={15} /> Try again</button></div> : tasks.length === 0 ? <div className="empty-state"><span className="empty-icon"><Check size={20} /></span><h2>Your list is clear.</h2><p>Start with one small, concrete task.</p><button className="secondary-button" onClick={() => setShowModal(true)}>Create your first task</button></div> : <div className="task-sections">{statuses.map((status) => <TaskSection key={status} status={status} tasks={tasks.filter((task) => task.status === status)} onStatusChange={updateStatus} />)}</div>}
    </div>
    <footer className="workspace-footer"><span>PREVIEW BUILD</span><span>Google auth · Mock task data</span><button onClick={() => setShowError(true)}>Show error state</button></footer>
    {showModal && <CreateTaskModal onClose={() => setShowModal(false)} onCreate={createTask} />}
    {toast && <div className="toast" role="status"><Check size={16} /> {toast}</div>}
  </main>
}

export default function Page() {
  const [signedIn, setSignedIn] = useState(false)
  return signedIn ? <TaskWorkspace onLogout={() => setSignedIn(false)} /> : <LoginScreen onPreviewLogin={() => setSignedIn(true)} />
}
