# Audit Report

## 1. Executive Summary
- **Top Critical Issues:**
  1. **Security - Hardcoded JWT Secret:** `src/lib/auth.ts` uses a static string fallback. If the env variable is missing, an attacker can craft valid auth tokens for any user.
  2. **Security - Sensitive Data Logging:** The app logs raw AI text responses to `stdout` upon parse failure, exposing potentially private user context to server logs.
  3. **Exposed Server Errors:** `DATABASE_URL` error exposes server paths and prevents build if not set.
  4. **Security - IDOR on Roadmap Route:** Missing robust auth wrappers in `/api/roadmap/latest/route.ts` lack `userId` verification and fetch global latest records. (Note: `src/app/api/mock/[id]/route.ts` was checked and *is* properly secured with `eq(testSessions.userId, userId)`. The routes `src/app/api/diagnostic/[id]/route.ts` and `src/app/api/results/[id]/route.ts` do not exist in the codebase, meaning diagnostic and results fetching likely occurs through `mock/[id]`).
- **Production readiness assessment:** **No**. The app has critical missing environment validations, weak rate limiting for cost-sensitive AI integrations, unhandled IDOR vulnerabilities, and god components that could lead to unpredictable state errors during an exam.

## 2. Statistics
- Critical issues (🔴): 4
- High priority (🟠): 5
- Medium (🟡): 4
- Low (🟢): 2
- Total: 15

## 3. Critical Issues (🔴)

### Issue #1: In-memory Rate Limiter Fails in Serverless/Multi-instance
- Category: Security & AI Integration
- Severity: 🔴
- Estimated Time: 🛠️ Medium (1-3h)
- File(s): `src/lib/ratelimit.ts`
- Problem: The rate limiter uses a Node.js `Map` (`userRequests`). In a serverless environment (Next.js API routes on Vercel) or multi-instance deployment, this memory is ephemeral and not shared, completely bypassing the rate limit.
- Why it matters: Malicious users can bypass the 3-per-day limit and generate infinite roadmaps, draining funds via Dify API costs.
- Suggested fix: Migrate rate limiting to Redis (e.g., Upstash) using `@upstash/ratelimit`.
- Priority: Before production

### Issue #2: Missing Authorization Check (IDOR) on Fetching Roadmap
- Category: Security
- Severity: 🔴
- Estimated Time: 🔧 Small (15-60min)
- File(s): `src/app/api/roadmap/latest/route.ts:11`
- Problem: The API route simply fetches `db.query.studyRoadmaps.findFirst({ orderBy: [desc(...)] })` without filtering by the authenticated user.
- Why it matters: Any user hitting this endpoint gets the latest generated roadmap of *any* user on the platform, exposing private data (current scores, targets).
- Suggested fix: Enforce `getUserIdFromRequest` and add `where: eq(studyRoadmaps.userId, userId)` to the query.
- Priority: Before production

### Issue #3: Hardcoded JWT Secret & Missing Environment Variables Validation
- Category: Architecture & Security
- Severity: 🔴
- Estimated Time: 🔧 Small (15-60min)
- File(s): `src/lib/auth.ts`, `src/db/index.ts:11`, `.env.example`
- Problem: `JWT_SECRET` has a hardcoded fallback (`"ent-prep-ai-secret-key-2024"`). The build fails immediately if `DATABASE_URL` is missing. Moreover, there is no `.env.example` file to document required variables (`DATABASE_URL`, `DIFY_API_KEY`, `JWT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`).
- Why it matters: This is a critical security vulnerability. If `JWT_SECRET` is missing in production, attackers can forge valid authentication tokens using the known open-source fallback string.
- Suggested fix: Remove the JWT fallback. The app should refuse to start if `JWT_SECRET` is undefined. Implement environment validation (e.g., using `zod` in `env.ts`) and create a comprehensive `.env.example` including the new Redis vars.
- Priority: Before production

### Issue #4: Sensitive Data Exposure in API Error Logs
- Category: Security
- Severity: 🔴
- Estimated Time: ⚡ Quick (<15min)
- File(s): `src/lib/dify.ts:123`, `src/app/api/admin/make-admin/route.ts`
- Problem: The application explicitly logs `console.error("Full original response:", text);` when AI JSON parsing fails. The `make-admin` route logs whether an Auth header is present.
- Why it matters: Logging full, raw AI text responses or request contexts exposes potential PII, prompts, and sensitive user data to monitoring tools (like Datadog/Sentry) where it shouldn't be accessible by all developers.
- Suggested fix: Remove or redact sensitive variables from `console.log` and `console.error` calls. Never log raw AI generation bodies to standard output in production.
- Priority: Before production

## 4. High Priority Issues (🟠)

### Issue #5: God Component & Mixed Logic in MockExamInterface
- Category: Clean Code & Architecture
- Severity: 🟠
- Estimated Time: 🛠️ Medium (1-3h)
- File(s): `src/components/MockExamInterface.tsx`
- Problem: The component is 300 lines long, handles fetching, timer logic, API saving, state transitions, and complex UI rendering all in one file. State update for `handleFinish` is flawed (accessed before declaration).
- Why it matters: Extremely prone to bugs (like the current `handleFinish` ESLint error where the auto-finish timer will crash). Hard to test exam logic independently.
- Suggested fix: Extract timer logic into a `useExamTimer` hook. Extract API fetching and saving into a `useMockExam` hook. Split UI into smaller components (e.g., `QuestionRenderer`, `SubjectTabs`).
- Priority: Before production

### Issue #6: AI JSON Parsing Fragility & Malformed Responses
- Category: AI Integration
- Severity: 🟠
- Estimated Time: 🔧 Small (15-60min)
- File(s): `src/lib/dify.ts:40`
- Problem: While `extractJSON` has 4 fallback strategies, it still relies on RegEx and string manipulation. If Dify returns conversational text *with* valid but truncated JSON, it throws an unhandled error leading to a 503 response.
- Why it matters: Users might lose their mock exam session or roadmap generation attempt because the AI decided to be chatty, resulting in a bad UX.
- Suggested fix: Enforce Dify to return strict JSON by tweaking the prompt. Wrap the final parsing in a safe fallback that returns a degraded generic roadmap if parsing completely fails, rather than throwing.
- Priority: Before production

### Issue #7: Missing React Dependency Arrays
- Category: Performance / Clean Code
- Severity: 🟠
- Estimated Time: ⚡ Quick (<15min)
- File(s): `src/components/MockExamInterface.tsx:35, 51`, `src/app/mock-exam/[id]/results/page.tsx:30`
- Problem: `useEffect` hooks are missing dependencies (`authHeaders`, `handleFinish`).
- Why it matters: Can cause stale closures, infinite re-renders, or timers failing to clear correctly.
- Suggested fix: Add missing dependencies to the `useEffect` arrays or wrap functions in `useCallback`.
- Priority: Before production

### Issue #8: Potential N+1 / Unoptimized Queries in Mock Start
- Category: Database & ORM / Performance
- Severity: 🟠
- Estimated Time: 🔧 Small (15-60min)
- File(s): `src/app/api/mock/start/route.ts:69`
- Problem: The code queries questions for each subject in a loop using `Promise.all` but uses `sql\`RANDOM()\`` on potentially thousands of rows, which is a known PostgreSQL performance killer.
- Why it matters: As the questions table grows, starting a mock exam will take progressively longer and consume heavy DB CPU.
- Suggested fix: Optimize the random row selection (e.g., using TABLESAMPLE or picking random IDs in application logic instead of `ORDER BY RANDOM()`).
- Priority: Before production

### Issue #9: Legacy Fields and Database Schema Debt
- Category: Database & ORM
- Severity: 🟠
- Estimated Time: 🛠️ Medium (1-3h)
- File(s): `src/db/schema.ts`
- Problem: `users` table has legacy fields (`profileSubject1`, `profileSubject2`) and `questions` table has `subject` (varchar) alongside `subjectId` (fk).
- Why it matters: Causes confusion for developers, risks data inconsistency if some APIs update legacy fields while others update the new relational fields.
- Suggested fix: Run a data migration to ensure all old fields are moved to relations, then drop the legacy fields from the schema entirely.
- Priority: After production

## 5. Medium Priority (🟡)

### Issue #10: Heavy 'any' Type Usage
- Category: TypeScript Quality
- Severity: 🟡
- Estimated Time: 🛠️ Medium (1-3h)
- File(s): `src/components/MockExamInterface.tsx`, `src/app/api/mock/start/route.ts`, `src/services/ai-generator.service.ts`
- Problem: Widespread use of `any` types for API responses, database queries, and component props. Usage of `@ts-ignore` in `src/services/universities.service.ts` for Next.js cache revalidation.
- Why it matters: Defeats the purpose of using TypeScript and Drizzle ORM, masking potential runtime errors.
- Suggested fix: Define proper interfaces for API responses and use Drizzle's inferred types (`InferSelectModel`).

### Issue #11: Mixed Client/Server Components
- Category: Clean Code & Architecture
- Severity: 🟡
- Estimated Time: 🔧 Small (15-60min)
- File(s): `src/components/CareerWizard.tsx`
- Problem: A large file acting as a client component but seemingly tightly coupled with fetching logic that could be handled server-side.
- Why it matters: Increases client bundle size.
- Suggested fix: Shift data fetching to a server component and pass the initial data as props to the interactive client component.

### Issue #12: PWA Service Worker Hardcoded URLs
- Category: PWA & Mobile UX
- Severity: 🟡
- Estimated Time: ⚡ Quick (<15min)
- File(s): `public/sw.js`
- Problem: The service worker relies on manual `ASSETS_TO_CACHE` updates.
- Why it matters: If files are renamed or added, the PWA will fail to cache them offline.
- Suggested fix: Use `next-pwa` or Workbox to auto-generate the service worker with the correct webpack/turbopack assets.

### Issue #13: Using `<img>` instead of `next/image`
- Category: Performance
- Severity: 🟡
- Estimated Time: ⚡ Quick (<15min)
- File(s): `src/app/universities/page.tsx:96`, `src/app/universities/[id]/page.tsx:47`
- Problem: ESLint warns about raw `<img>` tags.
- Why it matters: Misses out on Next.js automatic image optimization, slowing down page loads on mobile.
- Suggested fix: Replace with `<Image />` from `next/image`.

## 6. Low Priority (🟢)

### Issue #14: Unescaped Entities in Roadmap Page
- Category: Clean Code
- Severity: 🟢
- Estimated Time: ⚡ Quick (<15min)
- File(s): `src/app/roadmap/page.tsx:239`
- Problem: Unescaped quotation marks in JSX text.
- Why it matters: Fails linting, might cause minor rendering quirks.
- Suggested fix: Replace `"` with `&quot;`.

### Issue #15: Empty Catch Blocks & Missing Error Boundaries
- Category: Error Handling
- Severity: 🟢
- Estimated Time: 🔧 Small (15-60min)
- File(s): `src/app/api/mock/start/route.ts:25`
- Problem: `.catch(() => ({}))` on `req.json()` silently ignores malformed JSON payloads. No global React Error Boundary implemented for the mock exam.
- Why it matters: Makes debugging API failures harder.
- Suggested fix: Log the error, return a 400 Bad Request, and add a React Error Boundary for the exam UI.

## 7. AI-Specific Concerns
- **Cost overflow risks:** The in-memory rate limiter completely fails in serverless environments, opening the system up to abuse. Needs Redis implementation immediately.
- **Reliability concerns:** AI parsing fallback strategies are good, but if they completely fail, the UI gets a 503 error. Consider returning a static generic roadmap as a last-resort fallback instead of throwing.
- **Security:** `DIFY_API_KEY` could be silently missing without breaking the build, leading to runtime crashes.

## 8. Production Readiness Checklist
- [ ] All critical fixed (Auth checks, Rate Limiting, Env vars)
- [ ] Documentation complete (`.env.example`)
- [ ] Environment variables validated on startup
- [ ] Error handling robust (No silent JSON parses)
- [ ] Mobile tested
- [ ] Performance acceptable (`ORDER BY RANDOM()` fixed)
- [ ] Security validated (IDOR fixed on roadmap route, `mock/[id]` confirmed secure)
- [ ] AI cost protected (Redis rate limiting)

## 9. Recommended Action Plan
1. **Security & AI Cost (0-2h):** Fix `roadmap/latest` IDOR and implement Redis Rate Limiting.
2. **Build & Env (1h):** Add `zod` env validation, create `.env.example`, remove hardcoded JWT secret fallback.
3. **Refactor MockExamInterface (2-4h):** Split the 300-line God Component, fix the `handleFinish` declaration bug to prevent exam crashes.
4. **Database Optimization (1-2h):** Replace `ORDER BY RANDOM()` with an optimized query or application-level shuffling.
5. **Clean Up Types & UI (2-4h):** Remove `any`, fix missing `useEffect` dependencies, swap `<img>` for `next/image`.

## 10. Files That Need Most Attention
1. `src/lib/ratelimit.ts` (CRITICAL: In-memory rate limiting)
2. `src/components/MockExamInterface.tsx` (Buggy god component)
3. `src/app/api/roadmap/latest/route.ts` (IDOR vulnerability)
4. `src/app/api/mock/start/route.ts` (Performance & silent errors)
5. `src/db/schema.ts` (Legacy technical debt)
6. `src/lib/dify.ts` (Fallback parsing strategy)
7. `src/services/universities.service.ts` (`@ts-ignore` usage)
8. `src/app/roadmap/page.tsx` (Linting errors)
9. `src/db/index.ts` (Env variable validation)
10. `public/sw.js` (Manual PWA caching)

# Appendix: Raw Tools Output

### npm install
```
npm warn deprecated @esbuild-kit/esm-loader@2.6.5: Merged into tsx: https://tsx.is
npm warn deprecated @esbuild-kit/core-utils@3.3.2: Merged into tsx: https://tsx.is

added 555 packages, and audited 556 packages in 39s

233 packages are looking for funding
  run `npm fund` for details

6 moderate severity vulnerabilities
```

### npm run lint
```
/app/src/app/mock-exam/[id]/results/page.tsx
  30:6  warning  React Hook useEffect has a missing dependency: 'authHeaders'.

/app/src/app/roadmap/page.tsx
  239:19  error  `"` can be escaped with `&quot;`

/app/src/components/MockExamInterface.tsx
  44:11  error    Error: Cannot access variable before it is declared
`handleFinish` is accessed before it is declared...
```

### npx tsc --noEmit
(Exited successfully, no errors outputted)

### npm run build
```
▲ Next.js 16.2.3 (Turbopack)
...
DIFY_API_KEY not set - AI features disabled
Error: DATABASE_URL is required
    at <unknown> (.next/server/chunks/[root-of-the-server]__0-.nc4i._.js:25:55965)

> Build error occurred
Error: Failed to collect page data for /api/admin/make-admin
```
