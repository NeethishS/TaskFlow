export type Status = 'Planned' | 'In progress' | 'Complete'

export type Task = {
  id: string
  user_id: string
  title: string
  detail: string
  status: Status
  created_at: string
  updated_at?: string
}

export const ALLOWED_STATUSES: Status[] = ['Planned', 'In progress', 'Complete']

export function isValidStatus(status: unknown): status is Status {
  return typeof status === 'string' && ALLOWED_STATUSES.includes(status as Status)
}
