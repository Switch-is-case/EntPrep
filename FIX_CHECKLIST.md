# Fix Checklist

## 🔴 Critical (Fix Immediately)
- [ ] **#1** 🛠️ `src/lib/ratelimit.ts`: Migrate from in-memory Map to Redis (`@upstash/ratelimit`) to prevent rate limit bypass and AI cost drain across multiple server instances.
- [ ] **#2** 🔧 `src/app/api/roadmap/latest/route.ts:11`: Fix IDOR vulnerability by adding `userId` verification filter in the DB query instead of fetching the latest global record.
- [ ] **#3** 🔧 `src/db/index.ts:11`: Add startup validation for environment variables (e.g., using `zod`) and create a comprehensive `.env.example` file.

## 🟠 High Priority (Fix Before Release)
- [ ] **#4** 🛠️ `src/components/MockExamInterface.tsx`: Refactor this 300-line God Component. Extract timer and fetching logic to hooks. Fix the fatal `handleFinish` "accessed before declared" error.
- [ ] **#5** 🔧 `src/lib/dify.ts:40`: Update `extractJSON` to gracefully return a fallback static/generic roadmap if all 4 JSON parsing strategies fail, rather than throwing a 503 error.
- [ ] **#6** ⚡ `src/components/MockExamInterface.tsx:35,51` & `src/app/mock-exam/[id]/results/page.tsx:30`: Add missing React dependency arrays (`authHeaders`, `handleFinish`) as flagged by ESLint.
- [ ] **#7** 🔧 `src/app/api/mock/start/route.ts:69`: Remove `ORDER BY RANDOM()` in `Promise.all` mapping. Replace with application-level shuffling or a more performant SQL alternative to prevent DB CPU spikes.
- [ ] **#8** 🛠️ `src/db/schema.ts`: Remove legacy database fields (`profileSubject1`, `subject` string instead of relation ID) after verifying all API routes use the new relations.

## 🟡 Medium Priority
- [ ] **#9** 🛠️ Global Types: Audit and remove usage of `any` types (e.g. `src/services/ai-generator.service.ts`, `src/app/api/mock/start/route.ts`) and `@ts-ignore` (`src/services/universities.service.ts`).
- [ ] **#10** 🔧 `src/components/CareerWizard.tsx`: Refactor the 247-line mixed logic component to separate server data fetching from the interactive client multi-step form.
- [ ] **#11** ⚡ `public/sw.js`: Implement `next-pwa` or Workbox for automated offline cache manifest generation instead of manually updating `ASSETS_TO_CACHE`.
- [ ] **#12** ⚡ `src/app/universities/page.tsx:96`: Replace raw `<img>` tags with `<Image />` from `next/image` to allow automatic optimization.

## 🟢 Low Priority (Nice to Have)
- [ ] **#13** ⚡ `src/app/roadmap/page.tsx:239`: Fix unescaped HTML entities (quotation marks) to clear ESLint errors.
- [ ] **#14** 🔧 `src/app/api/mock/start/route.ts:25`: Add proper error logging to the silent `.catch(() => ({}))` on `req.json()` parsing, and implement generic React Error Boundaries on the mock exam UI.
