# Gemini Project Instructions

B2B CRM project using Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI, and Oracle DB.

## Workflow

1. Developer identifies broken feature
2. You inspect related files only
3. Trace issue: UI → API → Backend
4. Provide minimal fix

## Fix Format

**File:** `path/to/file.tsx`  
**Issue:** Brief description  
**Fix:**
```diff
- old code
+ new code
```

## Rules

- Fix only what's broken
- Follow existing structure and conventions
- Check `/api/*` routes for missing data
- Keep code clean and modular
- No auto-commits (user verifies first)