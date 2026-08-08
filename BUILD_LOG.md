# ABTalks build log

This is a factual record of the current project work. Prompt architecture is documented separately in [PROMPTS.md](./PROMPTS.md).

## Foundation

- Added a React/Vite frontend and Express API.
- Wired the provided synthetic data: 20 candidate profiles and 31 curriculum days across 8 modules.
- Added in-memory sessions keyed by `sessionId`.

## Interview engine

- Implemented `POST /api/interview` start and conversation turns.
- Kept successful responses contract-safe: `{ reply, done }` before completion and `{ reply, done, feedback }` at completion.
- Added planning priority for skipped missions, struggled missions, first-try mastery, and integration milestones.
- Added deterministic follow-up triggers and a Gemini-backed generator with a grounded fallback.

## Reliability corrections

- Changed unknown-session turns to a clear JSON 404 instead of silently creating a session.
- Removed extra success-response metadata from the endpoint.
- Grounded fallback feedback in the real session transcript and curriculum days.
- Verified locally with TypeScript, a production build, and an 8+ turn API run that returned the expected response fields.

## Interface rebuild

- Replaced the original dashboard shell with the ABTalks interview studio.
- Added live candidate and curriculum loading, a session-based chat flow, roster and curriculum browsers, and an API contract view.
- Added staged entry, message, hover, ambient, typing, and reduced-motion interactions.

## Known deployment work

- `vercel.json` is present and the production build succeeds locally.
- A live deployment must still be verified after deployment: homepage title and a real `POST /api/interview` response should be checked against the public URL.
