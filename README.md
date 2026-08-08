# ABTalks | AI Interview Agent

ABTalks runs a curriculum-grounded, multi-turn technical interview from a learner's actual AI Cohort progress. It uses candidate mission history to choose topics, follows up on the candidate's answer, and returns structured feedback at the end.

## Live application

Live demo: [https://aixcohort.vercel.app/](https://aixcohort.vercel.app/)

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. `GEMINI_API_KEY` is optional: without it, ABTalks uses a deterministic curriculum-grounded fallback so the entire flow remains testable.

## API contract

`POST /api/interview` starts or advances an in-memory session.

Start request:

```json
{ "sessionId": "demo-001", "candidate": { "member": {}, "missions": [], "signals": {} } }
```

Every non-final response contains exactly:

```json
{ "reply": "string", "done": false }
```

The final response contains exactly `reply`, `done: true`, and `feedback` with non-empty `summary`, `strengths`, `gaps`, and `next` fields. A message for an unknown session returns HTTP 404 with a JSON error explaining that the session must be started first.

## What is included

- React + Vite interview studio with animated, accessible interactions
- Express API and server-side session memory
- 20 candidate profiles and the 31-day, 8-module curriculum
- Adaptive follow-ups for short, uncertain, and named-tool answers
- Deterministic fallback questions and feedback for LLM outages
- Curriculum, candidate, and contract inspection views

## Verification

```bash
npm run lint
npm run build
```

See [PROMPTS.md](./PROMPTS.md) for the prompt architecture and [BUILD_LOG.md](./BUILD_LOG.md) for the chronological build record.
