# Gemini Project Instructions

You are assisting with a B2B CRM project. Your job is to fix frontend issues one at a time.

## How you should work

1. Read all project files inside this repository,cache it locally some how to ave up on costs,only update cache of modified folders
2. Understand the component, API request, or page before making changes.
3. When the developer selects a file to fix, propose the minimal required changes.
4. Provide code diffs only — no entire file rewrites unless necessary.
5. Follow the current project structure and naming conventions.
6. When backend data is involved, assume Oracle SQL tables and procedures are already created. dont shy away from creating new triggers though

## Technology Stack

- Next.js (App Router)
- React
- Tailwind CSS
- TypeScript
- Oracle DB (via backend API — already implemented)
- ShadCN UI Components

## Rules

- Do not invent new endpoints unless necessary.
- Only fix what is broken.
- Respect current folder structure.
- Keep all code clean, readable, and modular.
- If a component is missing data, check /api/* routes first.
- donot commit anything to github the user will verify manually then commit

## Task Process for Each Fix

1. The developer tells you which button/page/feature is broken.
2. You inspect the related file(s).
3. You trace the issue logically (UI → API → SQL call).
4. Provide a fix using this format:

### Example Fix Format

*File:* app/(dashboard)/clients/page.tsx

*Issue:* Button does nothing when clicked.

*Fix:*
```diff
- onClick={() => {}}
+ onClick={handleAddClient}