# Engineering Decisions & Scope Document

This document records the architectural decisions, scoping boundaries, and assumptions made during the implementation of **TaskFlow** for the Graduate Support Engineer Trainee assessment.

---

## 1. Scope Boundaries & Adherence

The assessment explicitly stated:
> *"Do not unnecessarily expand the scope. Identify ambiguities. Make reasonable assumptions. Improve usability and completeness. Document decisions."*

To satisfy these requirements without introducing unneeded complexity, development adhered to the four mandatory user capabilities:
1. **Google Authentication**
2. **Create Tasks**
3. **View Tasks**
4. **Update Task Status**

### Excluded Features (Intentional Non-Goals)
The following features were intentionally excluded:
- **Task Deletion & Title Editing**: Outside core requirements; omitting them avoids accidental data loss without adding extra confirmation steps.
- **Due Dates, Priority Flags, Tags, Categories**: Adds metadata overhead that detracts from the app's minimal focus.
- **Search and Filtering**: Personal focused task lists do not require complex search indexing.
- **Teams, Collaboration, Sharing**: Kept strictly single-user per account.
- **Reminders, Push Notifications, Background Jobs**: Unnecessary external infrastructure dependencies.
- **Separate Python/FastAPI Backend Service**: All required API functionality is cleanly and natively served by Next.js App Router API route handlers, avoiding external hosting costs and latency.

---

## 2. Architectural & Technical Decisions

### Decision 1: Next.js API Route Handlers as Backend
- **Context**: The assessment required a backend API layer for task operations.
- **Decision**: Implemented `app/api/tasks/route.ts` and `app/api/tasks/[id]/route.ts` using Next.js App Router server handlers rather than a separate external service (such as FastAPI or Express).
- **Rationale**: Keeps the codebase cohesive, eliminates cross-origin resource sharing (CORS) complexity, allows unified cookie-based session verification, and deploys as a single atomic unit to Vercel.

### Decision 2: Server-Side User Identity & Authorization
- **Context**: In multi-tenant databases, improper authorization allows users to impersonate others by modifying client-sent payload fields.
- **Decision**: The client never provides a `user_id`. Instead, the API routes extract the user ID directly from the authenticated Supabase session using `supabase.auth.getUser()`.
- **Rationale**: Guarantees that users can never forge tasks under another user's identity, regardless of what payload is sent.

### Decision 3: Multi-Layered User Isolation (API + Database RLS)
- **Context**: Tasks must only be visible to and editable by their owner.
- **Decision**: Enforced security at two independent levels:
  1. **API Layer**: Route handlers explicitly query and update where `user_id = user.id`.
  2. **Database Layer**: PostgreSQL Row Level Security (RLS) policies enforce `auth.uid() = user_id` for `SELECT`, `INSERT`, and `UPDATE`.
- **Rationale**: Defense-in-depth ensures that even if an API route query omitted a filter, the database engine would reject unauthorized access.

### Decision 4: Task Status Lifecycle & Validation
- **Context**: Task statuses must be predictable.
- **Decision**: Restricted valid statuses strictly to `'Planned' | 'In progress' | 'Complete'`.
- **Rationale**: Validated at runtime in the API (`isValidStatus()`) and at the database level using a `CHECK` constraint.

### Decision 5: Task Identification & Display
- **Context**: Database tables use UUIDs for scalability and security, but displaying UUIDs (e.g., `d3b07384...`) in the UI degrades user experience.
- **Decision**: Stored task IDs as UUIDs, while computing a clean, 1-indexed sequential visual identifier (`01`, `02`, `03`) on the frontend based on the task's position in view.
- **Rationale**: Combines the collision-free security of UUIDs with clean visual aesthetics.

### Decision 6: Optimistic UI Updates with Rollback
- **Context**: Updating task status should feel instantaneous.
- **Decision**: The UI updates card state immediately when a status change is triggered. If the subsequent `PATCH` network request fails, the task reverts to its previous status and an error toast notifies the user.
- **Rationale**: Provides smooth interactions while safeguarding against desynchronization.

---

## 3. Ambiguities Identified & Assumptions Made

| Ambiguity Identified | Assumption / Resolution Made |
|---|---|
| **First-time User Experience**: What should a user see before any tasks are created? | Show a dedicated empty state (*"Your list is clear. Start with one small, concrete task."*) with a prominent action to create a task, instead of seeding mock or placeholder tasks. |
| **Task Ordering**: How should tasks be ordered within status sections? | Ordered by creation timestamp (`created_at DESC`), so recently added work appears at the top. |
| **Task Details**: Are task descriptions mandatory? | The task `title` is required; `detail` is treated as optional context. If omitted, the UI gracefully displays a subtle fallback indicator. |
| **Next Move Button on Complete Tasks**: What should the button do when a task is already finished? | The button transitions to a non-clickable state labeled **Completed ✓** to avoid circular or invalid transitions. Users can still revert the status using the dropdown if needed. |

---

## 4. Known Limitations

1. **No Offline Support**: All operations require an active internet connection.
2. **Fixed Task Ordering**: Manual drag-and-drop reordering is not supported.
3. **No Batch Operations**: Tasks must be updated individually.
