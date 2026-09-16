# TaskFlow

> Clear progress, one task at a time. A focused, minimal task workspace designed to keep friction low and execution visible.

TaskFlow solves the friction of overcomplicated task trackers. Instead of heavy workflows, deep nested menus, or distracting features, it provides a quiet, focused home for day-to-day work with clear lifecycle-oriented status transitions.

---

## Core Features

- **Google Authentication**: Secure single sign-on via Google OAuth, with cookie-backed session persistence across browser reloads.
- **Create Tasks**: Fast, non-blocking task creation requiring a title, with optional context details.
- **View Tasks**: Structured overview organizing tasks into clear lifecycle columns (**Planned**, **In progress**, **Complete**) with live task counters and formatted display identifiers.
- **Update Task Status**: Immediate status updates via an explicit status menu or an intuitive "Next Move" action button on each task card.
- **Strict User Isolation**: Every user only accesses and modifies their own private tasks, enforced at both the API layer and the PostgreSQL database level using Row Level Security (RLS).
- **Graceful States**: Polished empty state for new users, inline error feedback, and toast notifications.

### Supported Task Statuses

1. `Planned` — Tasks queued for attention.
2. `In progress` — Tasks currently being worked on.
3. `Complete` — Tasks successfully finished.

---

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.3.3 (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.7.3 (Strict Mode)
- **Library**: [React](https://react.dev/) 19
- **Authentication & Database**: [Supabase](https://supabase.com/) (Supabase Auth via `@supabase/ssr`, PostgreSQL with Row Level Security)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4 & vanilla design system in `app/globals.css`
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/) 12.4.2

---

## Architecture Overview

TaskFlow uses a clean, self-contained architecture leveraging Next.js App Router API route handlers as a secure backend layer between the frontend client and Supabase:

```
[ Browser Client ]
        │
        ▼
[ Next.js Middleware ] (Session cookie refresh)
        │
        ├──▶ [ Google OAuth Callback ] (/auth/callback)
        │
        ├──▶ [ Frontend App ] (app/page.tsx - React Client Component)
        │           │
        │           ▼ HTTP (Cookie-authenticated)
        └──▶ [ Next.js API Routes ] (app/api/tasks/...)
                    │
                    ▼ Supabase Client (authenticated via session JWT)
             [ Supabase PostgreSQL ] (Row Level Security enforced)
```

### 1. Authentication Flow
1. User clicks **Continue with Google** on the login screen.
2. The browser client triggers `supabase.auth.signInWithOAuth()` targeting the `/auth/callback` route.
3. Google handles credential verification and redirects through Supabase to `/auth/callback?code=...`.
4. The Next.js server route exchanges the PKCE code for a session via `@supabase/ssr`, sets secure HTTP cookies, and redirects the user into the workspace.
5. On subsequent requests, `middleware.ts` runs `updateSession()` to keep session tokens active.

### 2. Task Data & Persistence Flow
1. Upon landing in the workspace, the frontend queries `GET /api/tasks`.
2. The API route verifies the user's session with `supabase.auth.getUser()`. If unauthenticated, it immediately returns `401 Unauthorized`.
3. The query executes against `public.tasks`, automatically filtered to the authenticated user's records via RLS.
4. Tasks are rendered in the client. New tasks are added via `POST /api/tasks`, and status modifications are issued via `PATCH /api/tasks/[id]`.

---

## API Endpoints

All endpoints require an active, cookie-authenticated session.

| Method | Endpoint | Description | Request Body | Response Codes |
|---|---|---|---|---|
| `GET` | `/api/tasks` | Retrieves all tasks for the logged-in user, ordered newest first. | None | `200`, `401`, `500` |
| `POST` | `/api/tasks` | Creates a new task assigned to the authenticated user. | `{ "title": string, "detail"?: string, "status"?: "Planned" \| "In progress" \| "Complete" }` | `201`, `400`, `401`, `500` |
| `PATCH` | `/api/tasks/[id]` | Updates the status of a specific task owned by the user. | `{ "status": "Planned" \| "In progress" \| "Complete" }` | `200`, `400`, `401`, `404`, `500` |

---

## Database & Schema Overview

TaskFlow relies on a PostgreSQL table in Supabase (`public.tasks`):

```sql
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  detail text default '',
  status text not null check (status in ('Planned', 'In progress', 'Complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);
```

### Row Level Security (RLS) & User Isolation
Row Level Security is enabled on `public.tasks`:
- **SELECT**: Authenticated users can only read rows where `auth.uid() = user_id`.
- **INSERT**: Authenticated users can only insert rows where `auth.uid() = user_id`.
- **UPDATE**: Authenticated users can only modify rows where `auth.uid() = user_id`.

In addition to database RLS, API route handlers independently enforce `eq('user_id', user.id)` on all operations, preventing cross-tenant access.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v20 or v22 recommended)
- `pnpm` (`npm install -g pnpm`)
- A Supabase project with Google Authentication enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NeethishS/TaskFlow.git
   cd TaskFlow
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory (this file is excluded from Git):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
   ```

### Running Locally

Run the development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build and Type-Checking Commands

Run strict TypeScript verification:
```bash
pnpm tsc --noEmit
```

Build the production bundle:
```bash
pnpm build
```

---

## Deployment Instructions (Vercel)

1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
3. Import the `TaskFlow` repository.
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Your Supabase Anon/Publishable Key
5. Click **Deploy**.

### Production OAuth Configuration Notes
Once deployed:
1. Copy your production domain (e.g., `https://your-taskflow.vercel.app`).
2. Go to your **Supabase Dashboard** → **Authentication** → **URL Configuration**.
3. Update **Site URL** to your production domain (`https://your-taskflow.vercel.app`).
4. Under **Redirect URLs**, ensure both local and production callbacks are listed:
   - `http://localhost:3000/auth/callback`
   - `https://your-taskflow.vercel.app/auth/callback`
5. In your **Google Cloud Console** (Credentials → OAuth 2.0 Client IDs), ensure your Supabase auth domain is included in **Authorized redirect URIs** (e.g., `https://<your-project-id>.supabase.co/auth/v1/callback`).

---

## Scope Decisions & Assumptions

- **Scope Adherence**: Strictly implements the 4 core requirements: Google Auth, Create Task, View Tasks, and Update Status. Features such as task deletion, title editing, tags, due dates, and notifications were intentionally omitted to avoid scope bloat.
- **Server-Driven User Identity**: The client never passes `user_id`. Identity is always extracted server-side from the verified session.
- **Allowed Statuses**: Constrained strictly to `'Planned' | 'In progress' | 'Complete'`.
- **Optimistic Updates**: Task status updates apply optimistically in the UI and automatically roll back if the server returns an error.

---

## Known Limitations

- **Network Dependency**: Tasks require an active network connection; offline mutations are not supported.
- **Fixed Task Lifecycle**: Custom statuses or subtask hierarchies are not supported by design.
- **Page-Level Task List**: Pagination is not implemented as personal task lists are expected to remain focused.

---

## Testing & Validation Performed

1. **Authentication**:
   - Tested Google Sign-In redirect and callback token exchange.
   - Tested session persistence across browser reloads.
   - Tested real user name and avatar extraction with fallback initials.
   - Tested `Log out` button and verified redirection to login.
2. **Task Operations**:
   - Tested empty state display for a clean user account.
   - Created tasks with and without optional detail context.
   - Verified newly created tasks land in the `Planned` section.
   - Tested status transitions using both the status dropdown and the "Next Move" action button.
   - Verified persistence of status changes after browser refresh.
3. **Security & API Testing**:
   - Verified `401 Unauthorized` responses for unauthenticated requests to `/api/tasks`.
   - Verified rejection (`400 Bad Request`) of invalid payloads and status values.
   - Verified Row Level Security boundaries so users cannot view or modify other users' tasks.
4. **Build & Quality Checks**:
   - `pnpm tsc --noEmit` executed cleanly with zero errors.
   - `pnpm build` completed successfully.

---

## Repository

- GitHub Repository: [https://github.com/NeethishS/TaskFlow.git](https://github.com/NeethishS/TaskFlow.git)
