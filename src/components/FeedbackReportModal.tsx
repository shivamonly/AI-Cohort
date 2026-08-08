import React, { useState } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Copy,
  Check,
  Award,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { FeedbackReport, SessionState } from '../types/interview';

interface FeedbackReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionState | null;
  feedback?: FeedbackReport;
}

export const FeedbackReportModal: React.FC<FeedbackReportModalProps> = ({
  isOpen,
  onClose,
  session,
  feedback,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !session) return null;

  const currentFeedback: FeedbackReport = feedback || session.feedback || {
    summary: 'Candidate completed the adaptive technical interview. Evaluated across cohort curriculum objectives.',
    strengths: ['Demonstrated understanding of core build concepts.', 'Responded adaptively to technical probes.'],
    gaps: ['Could provide deeper architectural details on fine-tuning and deployment.'],
    next: ['Revisit Day 12 Prompt Engineering objectives.', 'Practice articulating system trade-offs.'],
  };

  const candidate = session.candidate;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentFeedback, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    let text = `====================================================\n`;
    text += `AI INTERVIEW REPORT — ${candidate.member.name}\n`;
    text += `Job Role: ${candidate.member.jobRole} (${candidate.member.yearsExperience} yrs exp)\n`;
    text += `Session ID: ${session.sessionId}\n`;
    text += `Date: ${new Date(session.createdAt).toLocaleString()}\n`;
    text += `====================================================\n\n`;

    text += `EXECUTIVE SUMMARY:\n${currentFeedback.summary}\n\n`;

    text += `STRENGTHS:\n` + currentFeedback.strengths.map((s) => `- ${s}`).join('\n') + `\n\n`;
    text += `GAPS:\n` + currentFeedback.gaps.map((g) => `- ${g}`).join('\n') + `\n\n`;
    text += `RECOMMENDED NEXT STEPS:\n` + currentFeedback.next.map((n) => `- ${n}`).join('\n') + `\n\n`;

    text += `====================================================\n`;
    text += `FULL TRANSCRIPT:\n`;
    text += `====================================================\n\n`;

    session.turns.forEach((t, idx) => {
      text += `[Turn ${idx + 1} - Day ${t.day}: ${t.title}]\n`;
      text += `Interviewer: ${t.question}\n`;
      text += `Candidate: ${t.answer || '(No response)'}\n\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${candidate.member.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-zinc-900 text-white border border-zinc-700 rounded-full shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">
                EVALUATION REPORT
              </span>
              <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">Interview Evaluation Report</h2>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Candidate: <strong className="text-white">{candidate.member.name}</strong> ({candidate.member.jobRole})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-full text-xs font-mono transition-colors flex items-center gap-1.5"
              title="Copy JSON Feedback object"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownloadTranscript}
              className="px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-full text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Download className="w-3.5 h-3.5" /> Download TXT
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-zinc-950 no-scrollbar">
          {/* Executive Summary Card */}
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">
              EXECUTIVE SUMMARY
            </span>
            <p className="text-sm text-zinc-200 leading-relaxed font-sans">{currentFeedback.summary}</p>
          </div>

          {/* Strengths & Gaps Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-6 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl space-y-3">
              <h3 className="font-extrabold text-emerald-400 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Demonstrated Strengths
              </h3>
              <ul className="space-y-2 text-xs text-zinc-300">
                {currentFeedback.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-zinc-900/80 p-3 rounded-xl border border-emerald-900/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className="p-6 bg-amber-950/20 border border-amber-900/30 rounded-2xl space-y-3">
              <h3 className="font-extrabold text-amber-400 text-xs font-mono uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Technical Gaps
              </h3>
              <ul className="space-y-2 text-xs text-zinc-300">
                {currentFeedback.gaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 bg-zinc-900/80 p-3 rounded-xl border border-amber-900/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-3">
            <h3 className="font-extrabold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Actionable Curriculum Recommendations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300 font-mono">
              {currentFeedback.next.map((item, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Stats Bar */}
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
            <div>
              <span className="text-zinc-500 uppercase block text-[10px]">Total Questions</span>
              <span className="font-extrabold text-white text-base mt-0.5 block">{session.turns.length}</span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase block text-[10px]">Days Covered</span>
              <span className="font-extrabold text-emerald-400 text-base mt-0.5 block">{session.daysCovered.length}</span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase block text-[10px]">First-Try Missions</span>
              <span className="font-extrabold text-indigo-300 text-base mt-0.5 block">{candidate.signals.missionsFirstTry}</span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase block text-[10px]">Commit Days</span>
              <span className="font-extrabold text-zinc-200 text-base mt-0.5 block">{candidate.signals.commitDays}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-500 flex items-center justify-between">
          <span>SPECIFICATION COMPLIANT • PRD V1 EVALUATION</span>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white hover:bg-zinc-200 text-black rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
