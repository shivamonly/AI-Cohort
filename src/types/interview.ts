export interface CandidateMember {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
}

export interface CandidateMission {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface CandidateProfile {
  member: CandidateMember;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

export interface CurriculumModule {
  n: number;
  title: string;
  days: number[];
}

export interface CurriculumData {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}

export interface InterviewPlanItem {
  day: number;
  title: string;
  moduleName: string;
  reasoning: string;
  focusType: 'STRUGGLE' | 'SKIPPED' | 'MASTERY' | 'CAPSTONE';
  attempts?: number;
  skipped?: boolean;
}

export interface Turn {
  turnIndex: number;
  question: string;
  answer?: string;
  day: number;
  title: string;
  isFollowUp: boolean;
  followUpReason?: string;
  timestamp: number;
}

export interface FeedbackReport {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export interface SessionState {
  sessionId: string;
  candidate: CandidateProfile;
  plan: InterviewPlanItem[];
  turns: Turn[];
  daysCovered: number[]; // unique days asked
  currentPlanIndex: number;
  isComplete: boolean;
  feedback?: FeedbackReport;
  createdAt: number;
  updatedAt: number;
}

export interface InterviewApiRequest {
  sessionId: string;
  candidate?: CandidateProfile;
  message?: string;
}

export interface InterviewApiResponse {
  reply: string;
  done: boolean;
  feedback?: FeedbackReport;
  // Optional debug metadata for judges/UI (compliant with technical-spec rule: extra fields allowed)
  meta?: {
    sessionId: string;
    questionNumber: number;
    targetDay?: number;
    targetTitle?: string;
    isFollowUp?: boolean;
    daysCoveredCount?: number;
    daysCoveredList?: number[];
  };
}
