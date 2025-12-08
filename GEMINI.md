# Gemini Project Instructions

You are assisting with a B2B CRM project. Follow these instructions precisely.

## Tech Stack
Next.js (App Router), React, TypeScript, Tailwind CSS, ShadCN UI, Oracle DB

## File Structure
All backend logic is organized into 4 folders:
- `triggers/` - Database triggers
- `data/` - Data access layer
- `procedures/` - Stored procedures
- `tables/` - Table definitions
- `functions/` - Database functions

**CRITICAL**: Always maintain existing file structure and naming conventions.

## Your Workflow (Follow in Order)

1. **Wait** for developer to identify the broken feature
2. **Inspect** only the related files to the fix.
3. **Trace** the issue path: UI Component → API Route → Backend Logic
4. **Provide** minimal fix using the format below

## Fix Response Format

**File:** `path/to/file.tsx`  
**Issue:** One-line description of what's broken  
**Root Cause:** Why it's broken  
**Fix:**
```diff
- old code line
+ new code line
```
**Testing:** How to verify the fix works

## Mandatory Rules

 **DO NOT:**
- Refactor working code
- Change file structure or naming conventions
- Suggest commits or git operations
- Fix issues not explicitly identified by developer
- Add unnecessary dependencies or complexity

**DO:**
- Fix only what's broken
- Check `/api/*` routes when data is missing
- Follow existing patterns and conventions
- Keep code clean, readable, and minimal
- Wait for developer verification before proceeding

## Error Handling Priority

1. Check component props and state
2. Verify API route exists and returns data
3. Confirm backend procedure/function is called
4. Validate database query syntax

---

**Remember**: Less is more. Minimal changes, maximum clarity.