import { GoogleGenAI, Type } from "@google/genai";
import {
  CandidateProfile,
  CurriculumData,
  CurriculumDay,
  FeedbackReport,
  InterviewPlanItem,
  SessionState,
  Turn,
} from '../types/interview.js';
import curriculumRaw from '../data/curriculum.json' with { type: 'json' };

const curriculum = curriculumRaw as unknown as CurriculumData;

// Lazy initialization of Gemini client
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      genAI = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return genAI;
}

/**
 * FR2 — Personalization / Question Targeting Logic
 * Derives a prioritized interview plan rooted in candidate signals & curriculum days.
 */
export function planInterview(candidate: CandidateProfile): InterviewPlanItem[] {
  const planItems: InterviewPlanItem[] = [];
  const processedDays = new Set<number>();

  const getModuleTitle = (dayNum: number): string => {
    const mod = curriculum.modules.find((m) => m.days[0] <= dayNum && dayNum <= m.days[1]);
    return mod ? mod.title : 'Cohort Curriculum';
  };

  const getDayInfo = (dayNum: number): CurriculumDay | undefined => {
    return curriculum.days.find((d) => d.day === dayNum);
  };

  // 1. Skipped missions: assess awareness without assuming implementation experience.
  candidate.missions.forEach((m) => {
    if (m.skipped) {
      const dayInfo = getDayInfo(m.day);
      if (dayInfo && !processedDays.has(m.day)) {
        processedDays.add(m.day);
        planItems.push({
          day: m.day,
          title: m.title || dayInfo.title,
          moduleName: getModuleTitle(m.day),
          focusType: 'SKIPPED',
          skipped: true,
          reasoning: `Candidate skipped Day ${m.day} (${m.title}). Probe for a high-level mental model without assuming implementation experience.`,
        });
      }
    }
  });

  // 2. Struggled missions (attempts >= 3 or passed === false)
  candidate.missions.forEach((m) => {
    if ((m.attempts && m.attempts >= 3) || m.passed === false) {
      const dayInfo = getDayInfo(m.day);
      if (dayInfo && !processedDays.has(m.day)) {
        processedDays.add(m.day);
        planItems.push({
          day: m.day,
          title: m.title || dayInfo.title,
          moduleName: getModuleTitle(m.day),
          focusType: 'STRUGGLE',
          attempts: m.attempts || 1,
          skipped: false,
          reasoning: `Candidate needed ${m.attempts || 'multiple'} attempts on Day ${m.day} (${m.title}). Probe root-cause understanding and debugging.`,
        });
      }
    }
  });

  // 3. First-try passes (attempts === 1) -> Test trade-offs, architecture & edge cases
  candidate.missions.forEach((m) => {
    if (m.passed && m.attempts === 1) {
      const dayInfo = getDayInfo(m.day);
      if (dayInfo && !processedDays.has(m.day)) {
        processedDays.add(m.day);
        planItems.push({
          day: m.day,
          title: m.title || dayInfo.title,
          moduleName: getModuleTitle(m.day),
          focusType: 'MASTERY',
          attempts: 1,
          reasoning: `Candidate passed Day ${m.day} on first try. Push for trade-offs, edge cases, and scaling decisions.`,
        });
      }
    }
  });

  // 4. Integration days are deliberately retained for later systems-level synthesis.
  const priorityKeyDays = [31, 23, 22, 16, 12, 10, 7, 3];
  priorityKeyDays.forEach((dayNum) => {
    if (!processedDays.has(dayNum)) {
      const dayInfo = getDayInfo(dayNum);
      if (dayInfo) {
        processedDays.add(dayNum);
        planItems.push({
          day: dayNum,
          title: dayInfo.title,
          moduleName: getModuleTitle(dayNum),
          focusType: dayNum === 31 ? 'CAPSTONE' : 'MASTERY',
          reasoning: `Curriculum milestone Day ${dayNum} (${dayInfo.title}) to evaluate overall engineering principles.`,
        });
      }
    }
  });

  return planItems.slice(0, 12);
}

/**
 * FR3 & FR4 — Question Generation & Adaptive Follow-ups
 */
export async function generateNextTurn(
  session: SessionState,
  candidateAnswer?: string
): Promise<{ reply: string; dayUsed: number; titleUsed: string; isFollowUp: boolean; followUpReason?: string }> {
  const currentTurnCount = session.turns.length;
  const candidate = session.candidate;
  const plan = session.plan;

  // Decide if we should do an adaptive follow-up or move to next plan item
  let isFollowUp = false;
  let followUpReason = '';
  let targetPlanItem: InterviewPlanItem;

  const lastTurn = currentTurnCount > 0 ? session.turns[currentTurnCount - 1] : undefined;

  // Follow-up evaluation if there's a previous question & candidate answer
  if (candidateAnswer && lastTurn && !lastTurn.isFollowUp) {
    const trimmed = candidateAnswer.trim();
    const wordCount = trimmed.split(/\s+/).length;

    if (wordCount < 18) {
      isFollowUp = true;
      followUpReason = 'Short/vague response — probing for specific technical details or code implementation.';
    } else if (
      trimmed.toLowerCase().includes('don\'t know') ||
      trimmed.toLowerCase().includes('not sure') ||
      trimmed.toLowerCase().includes('skipped')
    ) {
      isFollowUp = true;
      followUpReason = 'Candidate indicated uncertainty — probing foundational concept gently.';
    } else if (
      trimmed.toLowerCase().includes('rag') ||
      trimmed.toLowerCase().includes('vector') ||
      trimmed.toLowerCase().includes('mcp') ||
      trimmed.toLowerCase().includes('langchain') ||
      trimmed.toLowerCase().includes('agent') ||
      trimmed.toLowerCase().includes('docker')
    ) {
      isFollowUp = true;
      followUpReason = 'Candidate mentioned a specific technical tool — drilling into its implementation trade-offs.';
    }
  }

  if (isFollowUp && lastTurn) {
    targetPlanItem = plan.find((p) => p.day === lastTurn.day) || plan[0];
  } else {
    // Advance plan
    const usedDays = new Set(session.turns.map((t) => t.day));
    const unusedPlanItems = plan.filter((p) => !usedDays.has(p.day));
    if (unusedPlanItems.length > 0) {
      targetPlanItem = unusedPlanItems[0];
    } else {
      // Fallback cycle
      targetPlanItem = plan[currentTurnCount % plan.length];
    }
  }

  const dayObj = curriculum.days.find((d) => d.day === targetPlanItem.day);
  const objectives = dayObj ? dayObj.objectives.join('; ') : targetPlanItem.title;
  const tools = dayObj ? dayObj.tools.join(', ') : 'Standard Stack';

  // Construct Prompt for Gemini
  const prompt = `
You are a senior technical interviewer at an elite AI engineering firm conducting an adaptive, multi-turn technical interview.

Candidate Info:
- Name: ${candidate.member.name}
- Job Role: ${candidate.member.jobRole} (${candidate.member.yearsExperience} yrs exp, ${candidate.member.education})
- Status: ${candidate.member.status}
- Cohort Performance Signals: ${candidate.signals.missionsCompleted} missions completed, ${candidate.signals.missionsFirstTry} first-try passes, ${candidate.signals.commitDays} active commit days.

Target Curriculum Topic for this Turn:
- Day ${targetPlanItem.day}: ${targetPlanItem.title} (${targetPlanItem.moduleName})
- Objectives: ${objectives}
- Tools used in mission: ${tools}
- Candidate Background for this Day: ${targetPlanItem.reasoning}

Current Interview Context:
- Question Number: ${currentTurnCount + 1}
- Days Covered so far: ${Array.from(new Set(session.turns.map((t) => t.day))).join(', ') || 'None (Turn 1)'}
- Mode: ${isFollowUp ? `ADAPTIVE FOLLOW-UP (${followUpReason})` : 'NEW TOPIC PROBE'}

Previous Turn History:
${session.turns
  .map(
    (t, idx) =>
      `Turn ${idx + 1} [Day ${t.day} - ${t.title}]:
Interviewer: ${t.question}
Candidate Answer: ${t.answer || '(No answer recorded)'}`
  )
  .join('\n\n')}

Candidate's Latest Response: "${candidateAnswer || 'N/A - This is Turn 1'}"

Instructions:
${
  currentTurnCount === 0
    ? `Greet ${candidate.member.name} briefly and professionally (1-2 sentences), acknowledging their background as a ${candidate.member.jobRole}. Then ask your first technical question grounded specifically in Day ${targetPlanItem.day} (${targetPlanItem.title}). Reference what they built in their mission.`
    : isFollowUp
    ? `Provide a concise, adaptive follow-up question that directly addresses what ${candidate.member.name} just said in their response "${candidateAnswer}". Reference a specific term or phrase they used, or probe deeper into the trade-offs/edge cases of Day ${targetPlanItem.day} (${targetPlanItem.title}).`
    : `Acknowledge the previous answer briefly (1 sentence), then transition smoothly to Day ${targetPlanItem.day}: ${targetPlanItem.title}. Ask a grounded open-ended question about how they implemented ${objectives} using ${tools}, or why they chose that approach.`
}

Requirements:
- Sound like a real human technical interviewer: direct, curious, professional.
- Do NOT output preamble, markdown formatting headers, or meta commentary. Return ONLY the spoken interviewer text.
- Ground the question strictly in Day ${targetPlanItem.day}'s curriculum objectives and tools.
`;

  const ai = getGenAI();
  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });

      const text = res.text?.trim();
      if (text) {
        return {
          reply: text,
          dayUsed: targetPlanItem.day,
          titleUsed: targetPlanItem.title,
          isFollowUp,
          followUpReason: isFollowUp ? followUpReason : undefined,
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to grounded template:', err);
    }
  }

  // Grounded Deterministic Fallback Generator
  const fallbackReply = generateFallbackQuestion(
    session,
    candidate,
    targetPlanItem,
    dayObj,
    isFollowUp,
    candidateAnswer
  );

  return {
    reply: fallbackReply,
    dayUsed: targetPlanItem.day,
    titleUsed: targetPlanItem.title,
    isFollowUp,
    followUpReason: isFollowUp ? followUpReason : undefined,
  };
}

/**
 * FR7 — Structured Feedback Generation at Interview End
 */
export async function generateFeedbackReport(session: SessionState): Promise<FeedbackReport> {
  const candidate = session.candidate;
  const transcriptStr = session.turns
    .map(
      (t, idx) => `Q${idx + 1} (Day ${t.day} - ${t.title}):
Interviewer: ${t.question}
Candidate Answer: ${t.answer || '(Blank)'}`
    )
    .join('\n\n');

  const prompt = `
Analyze the following technical interview transcript for ${candidate.member.name} (${candidate.member.jobRole}, ${candidate.member.yearsExperience} yrs exp).
Candidate Cohort Signals: ${candidate.signals.missionsCompleted}/31 missions completed, ${candidate.signals.missionsFirstTry} first-try passes.

Interview Transcript:
${transcriptStr}

Generate structured, actionable feedback evaluating candidate's performance across the cohort curriculum topics discussed.
Return a valid JSON object matching this exact schema:
{
  "summary": "2-4 sentence overall assessment of technical depth, clarity, and readiness.",
  "strengths": ["3-4 concrete strengths tied to specific days/topics discussed"],
  "gaps": ["3-4 specific technical gaps or areas needing improvement observed in answers"],
  "next": ["3-4 actionable study recommendations referencing specific curriculum days/objectives"]
}
`;

  const ai = getGenAI();
  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              gaps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              next: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['summary', 'strengths', 'gaps', 'next'],
          },
        },
      });

      if (res.text) {
        const parsed = JSON.parse(res.text) as FeedbackReport;
        if (
          parsed.summary &&
          Array.isArray(parsed.strengths) &&
          Array.isArray(parsed.gaps) &&
          Array.isArray(parsed.next)
        ) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini Feedback Generation failed, using deterministic evaluator:', err);
    }
  }

  // Deterministic Fallback Feedback Generator
  return generateFallbackFeedback(session);
}

/**
 * Grounded Fallback Question Generator
 */
function generateFallbackQuestion(
  session: SessionState,
  candidate: CandidateProfile,
  planItem: InterviewPlanItem,
  dayObj: CurriculumDay | undefined,
  isFollowUp: boolean,
  candidateAnswer?: string
): string {
  const turnIndex = session.turns.length;
  const name = candidate.member.name;
  const tools = dayObj ? dayObj.tools.join(', ') : 'the required tools';
  const primaryObj = dayObj ? dayObj.objectives[0] : planItem.title;

  if (turnIndex === 0) {
    return `Welcome ${name}! As a ${candidate.member.jobRole}, thank you for joining today's technical interview. Let's start by reflecting on Day ${planItem.day}: "${planItem.title}". Could you walk me through how you implemented ${primaryObj} and what key choices you made using ${tools}?`;
  }

  if (isFollowUp && candidateAnswer) {
    return `That's an interesting point you mentioned regarding "${candidateAnswer.slice(0, 45)}...". On Day ${planItem.day} (${planItem.title}), what trade-offs did you consider when using ${tools}, and how did you verify that your approach handled edge cases or unexpected failures?`;
  }

  if (planItem.focusType === 'STRUGGLE') {
    return `Thanks. Moving forward, let's look at Day ${planItem.day}: "${planItem.title}". I noticed this was a topic that required multiple iteration attempts during the cohort. Looking back, what was the root technical challenge when working with ${tools}, and how did you debug it?`;
  }

  if (planItem.focusType === 'SKIPPED') {
    return `Understood. Next, I'd like to touch on Day ${planItem.day}: "${planItem.title}". How would you approach ${primaryObj} in a production setup using ${tools}?`;
  }

  return `Great. Next, let's discuss Day ${planItem.day}: "${planItem.title}". Walk me through your implementation of ${primaryObj}. What were the architectural trade-offs when integrating ${tools}?`;
}

/**
 * Deterministic Fallback Feedback Evaluator
 */
function generateFallbackFeedback(session: SessionState): FeedbackReport {
  const candidate = session.candidate;
  const daysDiscussed = Array.from(new Set(session.turns.map((t) => t.day)));
  const referencedDays = daysDiscussed.slice(0, 3);
  const dayLabel = (day: number | undefined) => {
    const item = curriculum.days.find((entry) => entry.day === day);
    return item ? `Day ${item.day} — ${item.title}` : 'the discussed curriculum topic';
  };
  const shortAnswers = session.turns.filter((turn) => (turn.answer || '').trim().split(/\s+/).filter(Boolean).length < 18);

  return {
    summary: `${candidate.member.name} completed an 8-turn technical interview covering ${daysDiscussed.length} distinct cohort curriculum days. Overall, they demonstrated solid foundational awareness as a ${candidate.member.jobRole}, with particular clarity on practical build missions.`,
    strengths: [
      `Engaged with the interview prompts on ${dayLabel(referencedDays[0])}.`,
      `Provided technical communication across ${dayLabel(referencedDays[1] || referencedDays[0])}.`,
      `Completed a multi-topic discussion spanning ${daysDiscussed.length} real curriculum days.`,
    ],
    gaps: [
      shortAnswers.length ? `Several answers were brief, including the response to ${dayLabel(shortAnswers[0].day)}; add implementation steps and concrete decisions.` : `Continue adding concrete implementation details when discussing ${dayLabel(referencedDays[0])}.`,
      `Practice connecting the choices from ${dayLabel(referencedDays[1] || referencedDays[0])} to trade-offs and edge cases.`,
    ],
    next: [
      `Revisit ${dayLabel(referencedDays[0])} and explain its first objective aloud with an implementation example.`,
      `Review ${dayLabel(referencedDays[1] || referencedDays[0])} and document one trade-off for its tools.`,
      `Use ${dayLabel(referencedDays[2] || referencedDays[0])} for a short build-and-explain practice session.`,
    ],
  };
}
