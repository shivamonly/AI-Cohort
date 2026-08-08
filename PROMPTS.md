# ABTalks prompt architecture

This document describes the prompt and fallback strategy used by the current application. The chronological development record is in [BUILD_LOG.md](./BUILD_LOG.md).

## Planning

For each start request, ABTalks constructs a bounded topic plan from the supplied candidate profile and the local 31-day, 8-module curriculum. The order is:

1. Skipped missions — assess a mental model without assuming implementation experience.
2. Struggled missions — `attempts >= 3` or `passed: false`; probe root cause and debugging.
3. First-try passes — probe trade-offs, edge cases, and scaling.
4. Integration milestones — including Days 31, 23, and 22, used to maintain breadth.

## Interview generation

Each LLM call receives the candidate background, selected real curriculum day, day objectives, day tools, plan rationale, previous transcript, and latest answer. It is instructed to return only interviewer text and to ground every question in the selected curriculum day.

The follow-up router is deterministic in code:

- fewer than 18 words → ask for concrete steps or implementation details;
- uncertainty phrases such as `not sure`, `don't know`, or `skipped` → ask for a supportive high-level model;
- mentions of RAG, vector search, MCP, LangChain, agents, or Docker → drill into the named area;
- otherwise → move to the next unused plan day.

The transcript is held server-side by `sessionId` and supplied to each generation call.

## Completion and feedback

The API completes when at least 8 questions have been asked across at least 4 different days. It returns only `{ reply, done, feedback }` on completion. Feedback contains `summary`, `strengths`, `gaps`, and `next`; the fallback generator uses only days and answers present in the stored transcript.

## Reliability

Gemini is optional. If the model is unavailable or returns an unusable result, the server creates a grounded fallback question or feedback report. This preserves valid JSON responses and avoids exposing model failures to the candidate.
