# AI Usage & Development Process

This document describes how AI tools were utilized during the development of **TaskFlow** for the Graduate Support Engineer Trainee assessment. It outlines the specific tools used, the areas of responsibility assigned to AI versus human engineers, and how code and configurations were audited and verified.

---

## 1. Why AI Tools Were Used

AI tools were integrated to accelerate repetitive development workflows, assist in architecture and gap analysis, and quickly iterate on frontend styling and backend boilerplate. This allowed the engineer to focus heavily on:
- Ensuring strict assessment requirement compliance.
- Maintaining rigorous data isolation and security policies.
- Conducting thorough manual and automated verification.

---

## 2. Tools Used & Their Specific Roles

### A. v0.app
- **Purpose**: Initial UI and product interface generation and styling refinement.
- **Contribution**: Produced the distinctive B2B SaaS editorial aesthetic (warm neutral backgrounds, muted dark-green tones, serif typography, status pills, and responsive layout styling encapsulated in `app/globals.css`).

### B. Claude Sonnet 4.6
- **Purpose**: Repository audit, code inspection, and gap analysis.
- **Contribution**:
  - Examined the initial repository structure to produce a comprehensive inspection report.
  - Identified missing assessment capabilities (e.g., lack of real OAuth, in-memory mock data, missing database models, absence of API endpoints).
  - Clarified technical risks and provided a safe, non-destructive implementation roadmap.

### C. Gemini 3.8 Flash
- **Purpose**: Implementation of backend integration, authentication, and database persistence.
- **Contribution**:
  - Implemented `@supabase/ssr` browser and server clients, proxy cookie helpers, and Next.js middleware.
  - Created the OAuth callback route (`/auth/callback`) for PKCE token exchange.
  - Generated secure Next.js API routes (`GET /api/tasks`, `POST /api/tasks`, and `PATCH /api/tasks/[id]`).
  - Replaced hardcoded frontend mock state with real API calls and optimistic UI updates while strictly preserving visual styling.

---

## 3. Human Engineering & Manual Configuration

While AI tools assisted with code drafting, the core infrastructure, setup, and decision-making were handled manually:

1. **Google Cloud OAuth Configuration**:
   - Manually created and configured the Google Cloud Console project.
   - Configured OAuth consent screen, client IDs, and authorized redirect URIs.
2. **Supabase Cloud Project & Authentication**:
   - Initialized the Supabase project.
   - Enabled and configured the Google provider with OAuth client credentials.
   - Configured Site URLs and allowed redirect URLs.
3. **Database Schema & Row Level Security (RLS)**:
   - Created the `public.tasks` table with appropriate data types and constraints.
   - Established strict Row Level Security policies (`auth.uid() = user_id`) to enforce multi-tenant isolation at the database level.
4. **Environment & Secrets Management**:
   - Created `.env.local` with necessary public project keys.
   - Ensured no credentials or secrets were exposed or tracked in Git.
5. **Code Review & Quality Validation**:
   - Verified that AI-generated code followed current Next.js and Supabase SSR guidelines (avoiding deprecated helper packages).
   - Audited route handlers to ensure user identity is never accepted from client inputs.
   - Ran automated TypeScript checks (`tsc --noEmit`) and production builds (`next build`).
   - Conducted manual end-to-end testing across authentication, creation, status updating, and persistence workflows.

---

## 4. Key AI Prompts & Directives Given

During development, AI interactions were guided by deliberate constraints and clear boundaries:

- **Analysis & Inspection Prompt**: Instructed the model to inspect the repository in read-only mode, without making any modifications, to catalogue the tech stack, component tree, and gaps against assessment criteria.
- **Authentication Implementation Prompt**: Instructed the model to connect Supabase Google OAuth using modern `@supabase/ssr` cookie patterns and Next.js middleware, replacing mock buttons while leaving the UI and CSS untouched.
- **Persistence & API Implementation Prompt**: Instructed the model to create Next.js API route handlers for task retrieval, creation, and status updates, ensuring that `user_id` is always derived server-side from the session token.
- **Documentation Prompt**: Instructed the model to produce technical and user documentation reflecting the actual repository state without inventing nonexistent features.

---

## 5. Security & Privacy Notice

At no point were Google Cloud client secrets, Supabase service-role keys, database passwords, or private environment variables shared with or exposed in AI prompts, generated code, or documentation files.
