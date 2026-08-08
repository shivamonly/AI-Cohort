# Build Log — AI Interview Agent

> **Note:** For the system prompt architecture and technical specification, see [PROMPTS.md](./PROMPTS.md).

---

## Phase 1: Initial Scaffold & Core Setup
* **Prompt/Goal:** Request to build a candidate-adaptive technical interview engine grounded in a 31-day AI cohort curriculum.
* **What was built:**
  * Scaffolded Express server backend (`server.ts`, `src/server/app.ts`) and React frontend with Vite & Tailwind CSS.
  * Created foundational data structures: `candidates.json` (20 candidate profiles with cohort historical signals) and `curriculum.json` (31 days of learning objectives and tools across 6 modules).
  * Defined TypeScript contracts in `src/types/interview.ts` and created `sessionStore.ts` for server-side state persistence.
* **Issues Found & Fixed:** Initial TypeScript compiler checks threw errors due to missing optional candidate properties. Standardized candidate payload types and ensured in-memory session initialization defaulted missing arrays safely.

---

## Phase 2: API Contract Implementation
* **Prompt/Goal:** Implement the stateful `/api/interview` REST endpoint supporting turn-by-turn evaluation.
* **What was built:**
  * Created POST `/api/interview` route handling both session initialization (`{ sessionId, candidate }`) and turn progress (`{ sessionId, message }`).
  * Structured response formats for in-progress turns (`{ reply, done: false }`) and final turns (`{ reply, done: true, feedback }`).
* **Issues Found & Fixed:** Under high API load or rate-limiting (Gemini 429 errors), `/api/interview` was crashing with unhandled promise rejections. Added fallback grounded template generators in `interviewEngine.ts` to ensure 100% uptime even if LLM quota is exhausted.

---

## Phase 3: Candidate Personalization & Planning Engine
* **Prompt/Goal:** Ensure interview questions dynamically adapt based on candidate cohort history (skips, high attempts, first-try passes).
* **What was built:**
  * Built priority algorithm in `src/server/interviewEngine.ts` that categorizes curriculum days into:
    1. *Struggle Days* (`attempts >= 3` or `passed: false`)
    2. *Knowledge Gaps* (`skipped: true`)
    3. *Mastery Modules* (`attempts === 1` & `passed: true`)
* **Back-and-Forth / Corrections:** Initially, candidates with many skipped topics received generic introductory questions because the day selector fell back to Day 1. Corrected the priority algorithm to explicitly prioritize skipped days and high-attempt modules in the candidate queue before probing mastery days.

---

## Phase 4: Follow-up Question Logic
* **Prompt/Goal:** Build multi-turn conversational intelligence that probes candidate answers with dynamic follow-ups instead of jumping topics on every turn.
* **What was built:**
  * Added `isFollowUp` state flag and prompt instructions in `interviewEngine.ts`.
  * The engine checks if the previous candidate response contains detailed claims, quotes candidate phrases (e.g., *"That's an interesting point regarding..."*), and asks targeted architectural trade-off questions.
* **Issues Found & Fixed:** Early prompts generated repetitive "Can you elaborate?" follow-ups without naming specific technical concepts. Updated prompt context injection to mandate referencing candidate tools or implementation details directly from their prior message.

---

## Phase 5: Feedback Generation Engine
* **Prompt/Goal:** Produce a comprehensive 4-part feedback report upon interview completion (Turn 8+).
* **What was built:**
  * Implemented `generateFeedbackReport` returning a structured JSON report containing: `summary` (string), `strengths` (array), `gaps` (array), and `next` (actionable recommendations array).
* **Issues Found & Fixed:** LLM output occasionally wrapped feedback in markdown codeblocks (` ```json ... ``` `), causing JSON parsing exceptions on the server. Added a regex sanitization wrapper (`cleanJsonResponse`) to strip markdown fences before parsing.

---

## Phase 6: UI & Testing Suite
* **Prompt/Goal:** Create a polished, responsive user interface with dedicated views for candidates, curriculum, live interview execution, and judge API testing.
* **What was built:**
  * `InterviewRoom.tsx`: Real-time chat interface with progress trackers, active candidate cards, and day topic badges.
  * `JudgeTesterView.tsx`: Interactive API testing tool for hackathon judges to inspect raw payloads, candidate profiles, and trigger 8-turn test runs.
  * `CurriculumView.tsx` & `CandidatesView.tsx`: Interactive explorers for grounded dataset inspection.
  * `PromptsModal.tsx`: Embedded documentation viewer for prompt architecture.

---

## Phase 7: Pre-Submission Audit & Refinements (Fix Pass)
* **Prompt/Goal:** Pre-submission code audit to fix confirmed issues and strictly align with technical specifications.
* **What was built & fixed:**
  1. **Title Tag Fix (`index.html`):** The `<title>` tag was still "My Google AI Studio App". Changed to `"ABTalks | AI Interview Agent"`, added meta descriptions, OpenGraph tags, and SVG favicon.
  2. **API Contract Clean-up (`src/server/app.ts`):** Discovered `/api/interview` was returning an extra `meta` object in responses. Removed `meta` from express JSON responses so API contracts strictly output `{ reply, done }` or `{ reply, done: true, feedback }` as required by automated grader contracts.
  3. **Repository Directory Restructuring:** Fixed nested directory structure when pushing to GitHub (`AI-Cohort/ai-interview-agent` -> root level).
* **Verification:** Created and executed TypeScript integration test scripts verifying 8-turn execution, candidate differentiation, and schema adherence.

---

## Phase 8: Deployment & Final Verification
* **Prompt/Goal:** Prepare Vercel serverless configuration and ensure clean build compilation.
* **What was built:**
  * Validated `vercel.json` rewrites and `api/index.ts` handler.
  * Verified build via `compile_applet` and `lint_applet` (`tsc --noEmit`).
  * Committed all documentation and code changes to Git repository `https://github.com/shivamonly/AI-Cohort.git`.
