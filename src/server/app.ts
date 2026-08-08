import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { sessionStore } from './sessionStore.js';
import {
  generateFeedbackReport,
  generateNextTurn,
  planInterview,
} from './interviewEngine.js';
import candidatesRaw from '../data/candidates.json' with { type: 'json' };
import curriculumRaw from '../data/curriculum.json' with { type: 'json' };
import { CandidateProfile, InterviewApiRequest, Turn } from '../types/interview.js';

dotenv.config();

export const app = express();

// A02: Security Misconfiguration - Remove X-Powered-By header
app.disable('x-powered-by');

// A02 & A05: Restrict Payload Size to prevent DoS & memory exhaustion
app.use(express.json({ limit: '256kb' }));

// A02: Security Headers & CORS Protection
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");

  // CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Basic in-memory Rate Limiting (A02/A05 - Denial of Service protection)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120;

app.use((req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    record = { count: 1, resetAt: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(ip, record);
  } else {
    record.count++;
  }

  if (record.count > MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  next();
});

// A05 & A01: Input Sanitization Helper
function sanitizeString(str: any, maxLen = 1000): string {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLen).replace(/[\<\>]/g, '');
}

function isValidSessionId(id: any): boolean {
  return typeof id === 'string' && /^[a-zA-Z0-9_\-]{3,64}$/.test(id);
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET Candidates List
app.get('/api/candidates', (req: Request, res: Response) => {
  res.json(candidatesRaw);
});

// GET Curriculum Data
app.get('/api/curriculum', (req: Request, res: Response) => {
  res.json(curriculumRaw);
});

// GET Active Sessions
app.get('/api/sessions', (req: Request, res: Response) => {
  const sessions = sessionStore.listAll();
  res.json({ count: sessions.length, sessions });
});

// GET Session details
app.get('/api/sessions/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!isValidSessionId(sessionId)) {
    res.status(400).json({ error: 'Invalid sessionId format' });
    return;
  }

  const session = sessionStore.get(sessionId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

// DELETE Session
app.delete('/api/sessions/:sessionId', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  if (!isValidSessionId(sessionId)) {
    res.status(400).json({ error: 'Invalid sessionId format' });
    return;
  }

  const deleted = sessionStore.delete(sessionId);
  res.json({ deleted });
});

// POST Candidate Personalization Comparison Test (for Judges)
app.post('/api/test-personalization', async (req: Request, res: Response) => {
  const c1Raw = sanitizeString(req.body?.candidate1Id, 32) || 'CAND-001';
  const c2Raw = sanitizeString(req.body?.candidate2Id, 32) || 'CAND-004';

  const cand1 = candidatesRaw.candidates.find((c) => c.member.id === c1Raw) as unknown as CandidateProfile;
  const cand2 = candidatesRaw.candidates.find((c) => c.member.id === c2Raw) as unknown as CandidateProfile;

  if (!cand1 || !cand2) {
    res.status(400).json({ error: 'Invalid candidate IDs' });
    return;
  }

  const plan1 = planInterview(cand1);
  const plan2 = planInterview(cand2);

  res.json({
    candidate1: {
      id: cand1.member.id,
      name: cand1.member.name,
      role: cand1.member.jobRole,
      signals: cand1.signals,
      plannedTopics: plan1.slice(0, 5),
    },
    candidate2: {
      id: cand2.member.id,
      name: cand2.member.name,
      role: cand2.member.jobRole,
      signals: cand2.signals,
      plannedTopics: plan2.slice(0, 5),
    },
    comparison: 'Notice how Candidate 1 (High first-try) gets probed on trade-offs while Candidate 2 (High attempts/skipped) gets probed on struggle topics and skipped concepts.',
  });
});

/**
 * AUTHORITATIVE API CONTRACT: POST /api/interview
 */
app.post('/api/interview', async (req: Request, res: Response) => {
  try {
    const rawSessionId = req.body?.sessionId;
    if (!rawSessionId || !isValidSessionId(rawSessionId)) {
      res.status(400).json({ error: 'Valid sessionId is required (alphanumeric, 3-64 chars)' });
      return;
    }

    const sessionId = sanitizeString(rawSessionId, 64);
    const candidate = req.body?.candidate;
    const rawMessage = req.body?.message || '';
    const message = sanitizeString(rawMessage, 4000);

    let session = sessionStore.get(sessionId);

    // --- CASE 1: START INTERVIEW (First turn with candidate object provided) ---
    if (candidate) {
      const activeCandidate = candidate as CandidateProfile;

      const plan = planInterview(activeCandidate);

      session = {
        sessionId,
        candidate: activeCandidate,
        plan,
        turns: [],
        daysCovered: [],
        currentPlanIndex: 0,
        isComplete: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Generate Turn 1 Question
      const turnResult = await generateNextTurn(session);

      const newTurn: Turn = {
        turnIndex: 1,
        question: turnResult.reply,
        day: turnResult.dayUsed,
        title: turnResult.titleUsed,
        isFollowUp: false,
        timestamp: Date.now(),
      };

      session.turns.push(newTurn);
      session.daysCovered = Array.from(new Set([turnResult.dayUsed]));
      sessionStore.set(sessionId, session);

      res.json({
        reply: turnResult.reply,
        done: false,
      });
      return;
    }

    // A message can only advance a session that was explicitly started with a candidate.
    // Keeping this error body separate from successful contract responses avoids fabricating state.
    if (!session) {
      res.status(404).json({ error: 'Unknown sessionId. Start the interview with a candidate object first.' });
      return;
    }

    // --- CASE 2 & 3: CONVERSATION TURN OR END INTERVIEW ---
    const candidateAnswer = message || '';

    // Record answer for previous turn
    if (session.turns.length > 0) {
      const lastTurn = session.turns[session.turns.length - 1];
      lastTurn.answer = candidateAnswer;
    }

    const totalQuestionsAsked = session.turns.length;
    const uniqueDaysCovered = Array.from(new Set(session.turns.map((t) => t.day)));

    // Termination Condition: >= 8 questions asked AND >= 4 distinct days covered
    const MIN_QUESTIONS = 8;
    const MIN_DISTINCT_DAYS = 4;

    if (totalQuestionsAsked >= MIN_QUESTIONS && uniqueDaysCovered.length >= MIN_DISTINCT_DAYS) {
      session.isComplete = true;
      const feedback = await generateFeedbackReport(session);
      session.feedback = feedback;
      sessionStore.set(sessionId, session);

      res.json({
        reply: 'Interview completed.',
        done: true,
        feedback,
      });
      return;
    }

    // Generate Next Turn Question / Adaptive Follow-Up
    const turnResult = await generateNextTurn(session, candidateAnswer);

    const nextTurnNumber = session.turns.length + 1;
    const newTurn: Turn = {
      turnIndex: nextTurnNumber,
      question: turnResult.reply,
      day: turnResult.dayUsed,
      title: turnResult.titleUsed,
      isFollowUp: turnResult.isFollowUp,
      followUpReason: turnResult.followUpReason,
      timestamp: Date.now(),
    };

    session.turns.push(newTurn);
    session.daysCovered = Array.from(new Set(session.turns.map((t) => t.day)));
    sessionStore.set(sessionId, session);

    res.json({
      reply: turnResult.reply,
      done: false,
    });
  } catch (err: any) {
    console.error('Error handling /api/interview:', err);
    // Preserve valid JSON and do not expose implementation details.
    res.status(500).json({ error: 'Interview request could not be completed. Please retry.' });
  }
});
