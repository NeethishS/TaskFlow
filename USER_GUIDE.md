# TaskFlow — User Guide

Welcome to **TaskFlow**. This guide walks you through using the application to manage your personal tasks efficiently.

---

## 1. Opening TaskFlow

Open your web browser and navigate to the TaskFlow URL (e.g., `http://localhost:3000` for local use or the production deployment link).

You will be welcomed by the TaskFlow login screen featuring a clean, distraction-free design.

---

## 2. Signing In with Google

1. On the login screen, click the **Continue with Google** button.
2. If prompted, select or sign into your Google account on the Google authorization screen.
3. Once authenticated, you will automatically be redirected back to your personal TaskFlow workspace.
4. Your name and profile picture (or initials) will appear in the top-right corner of the header.

---

## 3. The Workspace and Status Sections

Your workspace organizes tasks across three distinct columns based on their lifecycle status:

- **Planned**: Work that has been identified and scheduled, but not yet started.
- **In progress**: Work that is actively being performed.
- **Complete**: Tasks that are finished.

At the top of the workspace, you can see today's date and a total counter of how many tasks are currently in view.

---

## 4. Creating a Task

1. Click the **+ New task** button located in the top-right of the workspace intro (or **Create your first task** if your list is empty).
2. In the modal dialog that appears:
   - **Task title** *(Required)*: Enter a concise, actionable summary of what needs to be done.
   - **A little context** *(Optional)*: Add details or notes about what completion looks like.
3. Click **Create task**.
4. The dialog will close, a confirmation toast will appear at the bottom right, and your task will appear in the **Planned** section.

---

## 5. Viewing Your Tasks

Each task is represented by a minimal task card showing:
- A display number (e.g., `01`, `02`)
- A status badge (`PLANNED`, `IN PROGRESS`, or `COMPLETE`)
- The title and detail description
- Status transition controls

Tasks are ordered with the newest tasks visible at the top.

---

## 6. Updating Task Status

You can move tasks between statuses in two convenient ways:

### Option A: The "Next Move" Action Button
Every task card has an intelligent action button at the bottom right:
- If the task is **Planned**, the button displays **Start task** → Clicking it moves the task directly to **In progress**.
- If the task is **In progress**, the button displays **Complete** → Clicking it marks the task as **Complete**.
- If the task is **Complete**, the button displays **Completed ✓**.

### Option B: The Status Dropdown
1. Click the **Update status** dropdown on any card.
2. Select any status (**Planned**, **In progress**, or **Complete**).
3. The card immediately moves to the appropriate section, and a toast message confirms the update.

---

## 7. Refreshing & Session Persistence

- **Session**: Your Google login session is securely stored in browser cookies. You do not need to log in again if you refresh or reopen the tab.
- **Data Persistence**: All your tasks and status changes are permanently saved in the database. Refreshing the browser or logging in from another device will restore your current task list.

---

## 8. Empty & Error States

- **Empty State**: If you are a new user or have no tasks, the workspace displays an encouraging message: *"Your list is clear. Start with one small, concrete task."* Simply click the button to create your first task.
- **Error State**: If a network interruption prevents tasks from loading, an error message appears with a **Try again** button to quickly retry fetching your tasks.

---

## 9. Logging Out

1. Click the **Log out** button in the top-right header next to your profile.
2. Your session will be securely terminated, and you will be returned to the login screen.
