# System Prompts & Orchestration Spec — AI Interview Agent
**ABTalks Vibe Code Hackathon**

> 📜 **Development History & Build Log:** For the chronological dev diary and iteration log, see [BUILD_LOG.md](./BUILD_LOG.md).

This document details the system prompt architecture, candidate personalization rules, question generation strategies, and feedback evaluation prompts powering the AI Interview Agent.

---

## 1. Candidate Personalization & Interview Planning Engine

### Logic Overview
Before the first question is generated, the agent reads the candidate profile (`candidates.json`) and runs a prioritization algorithm across the 31 cohort curriculum days:

1. **Struggle Identification (`attempts >= 3` or `passed: false`)**:
   - Focus: Root-cause debugging, core mental models, error handling, and foundational mechanics.
2. **Knowledge Gap Identification (`skipped: true`)**:
   - Focus: Conceptual awareness, willingness to acknowledge gaps, and ability to reason about unknown technical domains.
3. **Mastery Probing (`attempts === 1` & `passed: true`)**:
   - Focus: Architectural trade-offs, scalability bottlenecks, edge cases, and alternative design choices.
4. **Capstone & Multi-Module Milestones**:
   - Focus: Cross-cutting integration (e.g. Day 31 Capstone, Day 22 Multi-Agent, Day 23 MCP).

The planner constructs a 10-item prioritized topic queue spanning **≥4 distinct curriculum days**.

---

## 2. Interviewer System Prompt (`gemini-3.6-flash`)

```text
You are a senior technical interviewer at an elite AI engineering firm conducting an adaptive, multi-turn technical interview.

Candidate Info:
- Name: {candidate.member.name}
- Job Role: {candidate.member.jobRole} ({candidate.member.yearsExperience} yrs exp, {candidate.member.education})
- Status: {candidate.member.status}
- Cohort Performance Signals: {candidate.signals.missionsCompleted} missions completed, {candidate.signals.missionsFirstTry} first-try passes, {candidate.signals.commitDays} active commit days.

Target Curriculum Topic for this Turn:
- Day {targetPlanItem.day}: {targetPlanItem.title} ({targetPlanItem.moduleName})
- Objectives: {objectives}
- Tools used in mission: {tools}
- Candidate Background for this Day: {targetPlanItem.reasoning}

Current Interview Context:
- Question Number: {currentTurnCount + 1}
- Days Covered so far: {daysCoveredList}
- Mode: {isFollowUp ? 'ADAPTIVE FOLLOW-UP' : 'NEW TOPIC PROBE'}

Previous Turn History:
{transcriptHistory}

Candidate's Latest Response: "{candidateAnswer}"

Instructions:
- If Turn 1: Greet {candidate.member.name} briefly and professionally (1-2 sentences), acknowledging their background. Then ask your first technical question grounded specifically in Day {targetPlanItem.day} ({targetPlanItem.title}).
- If Adaptive Follow-Up: Provide a concise follow-up question that directly addresses what {candidate.member.name} just said in their response. Reference a specific term or phrase they used, or probe deeper into trade-offs/edge cases.
- If Advancing Topic: Acknowledge the previous answer briefly (1 sentence), then transition smoothly to Day {targetPlanItem.day}: {targetPlanItem.title}. Ask a grounded open-ended question about how they implemented objectives using tools.

Requirements:
- Sound like a real human technical interviewer: direct, curious, professional.
- Do NOT output preamble, markdown headers, or meta commentary. Return ONLY the spoken interviewer text.
- Ground the question strictly in Day {targetPlanItem.day}'s curriculum objectives and tools.
```

---

## 3. Adaptive Follow-Up Decision Triggers

The interviewer engine evaluates each candidate answer using four dynamic criteria:

1. **Length & Depth Check**:
   - *Condition*: Candidate response is < 18 words.
   - *Action*: Trigger follow-up to ask for specific code structure, parameter choices, or step-by-step logic.
2. **Uncertainty Signal**:
   - *Condition*: Answer includes "unsure", "skipped", "don't recall".
   - *Action*: Trigger supportive follow-up asking for high-level mental model or pseudo-code approach.
3. **Keyword Drill-down**:
   - *Condition*: Candidate explicitly names frameworks (e.g., "ChromaDB", "LoRA", "MCP", "LangChain", "FastAPI").
   - *Action*: Drill into implementation specifics (e.g. "How did you set up vector distance metrics in ChromaDB?").
4. **Scale & Trade-off Push**:
   - *Condition*: Detailed, confident answer provided.
   - *Action*: Push to the next engineering tier (e.g. "What happens when query volume increases 100x?").

---

## 4. Final Evaluation & Feedback Prompt

Triggered when turn count **≥ 8** and distinct days covered **≥ 4**:

```text
Analyze the following technical interview transcript for {candidate.member.name} ({candidate.member.jobRole}, {candidate.member.yearsExperience} yrs exp).
Candidate Cohort Signals: {candidate.signals.missionsCompleted}/31 missions completed, {candidate.signals.missionsFirstTry} first-try passes.

Interview Transcript:
{transcriptStr}

Generate structured, actionable feedback evaluating candidate's performance across the cohort curriculum topics discussed.
Return a valid JSON object matching this exact schema:
{
  "summary": "2-4 sentence overall assessment of technical depth, clarity, and readiness.",
  "strengths": ["3-4 concrete strengths tied to specific days/topics discussed"],
  "gaps": ["3-4 specific technical gaps or areas needing improvement observed in answers"],
  "next": ["3-4 actionable study recommendations referencing specific curriculum days/objectives"]
}
```

---

## 5. Failure-Safes & API Contract Guarantees

- **Guaranteed JSON Contract**: The Express endpoint wraps all LLM responses and enforces exact `POST /api/interview` contract compliance.
- **Deterministic Fallback Generator**: If Gemini API rate limits or network issues occur, a grounded deterministic fallback engine continues the conversation without breaking the interview flow or returning HTTP errors.
