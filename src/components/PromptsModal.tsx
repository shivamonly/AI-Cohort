import React, { useEffect, useState } from 'react';
import { X, Copy, Check, FileText, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

interface PromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptsModal: React.FC<PromptsModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [markdown, setMarkdown] = useState('Loading committed PROMPTS.md…');
  const repoPromptsUrl = 'https://github.com/shivamonly/AI-Cohort/blob/main/PROMPTS.md';
  const rawPromptsUrl = 'https://raw.githubusercontent.com/shivamonly/AI-Cohort/main/PROMPTS.md';

  useEffect(() => {
    if (!isOpen) return;
    fetch(rawPromptsUrl)
      .then((response) => response.ok ? response.text() : Promise.reject(new Error('Unable to load PROMPTS.md')))
      .then(setMarkdown)
      .catch(() => setMarkdown('Could not load the committed PROMPTS.md. Use the GitHub link above to view it directly.'));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(repoPromptsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI-Usage Log & Prompts Spec (<code className="font-mono text-indigo-300">PROMPTS.md</code>)
              </h2>
              <p className="text-xs text-slate-400">
                ABTalks Hackathon AI Orchestration & System Prompt Specification
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm">Committed PROMPTS.md</h3>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">{markdown}</pre>
            <a className="text-indigo-300 hover:text-indigo-200 text-xs underline" href="https://github.com/shivamonly/AI-Cohort/blob/main/BUILD_LOG.md" target="_blank" rel="noreferrer">Open committed BUILD_LOG.md</a>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950/40 text-xs">
          {/* Submission URL banner */}
          <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                Hackathon Submission URL
              </span>
              <code className="text-slate-200 font-mono text-xs break-all mt-0.5 block">{repoPromptsUrl}</code>
            </div>

            <button
              onClick={handleCopyUrl}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-md"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Submission URL'}</span>
            </button>
          </div>

          {/* Section 1: Candidate Personalization */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> 1. Candidate Personalization Engine
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Prioritizes topics based on candidate performance signals:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li><strong className="text-amber-300">Struggles (`attempts &gt;= 3` or `passed: false`)</strong>: Focuses on root-cause debugging and core mechanics.</li>
              <li><strong className="text-rose-300">Knowledge Gaps (`skipped: true`)</strong>: Focuses on conceptual awareness and unknown domains.</li>
              <li><strong className="text-emerald-300">Mastery (`attempts === 1`)</strong>: Focuses on scalability, edge cases, and architectural trade-offs.</li>
            </ul>
          </div>

          {/* Section 2: Interviewer System Prompt */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. Grounded System Prompt
            </h3>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
{`You are a senior technical interviewer at an elite AI engineering firm conducting an adaptive, multi-turn technical interview.

Candidate Info: {candidate.member.name} ({candidate.member.jobRole}, {candidate.member.yearsExperience} yrs exp)
Cohort Signals: {candidate.signals.missionsCompleted}/31 missions completed, {candidate.signals.missionsFirstTry} first-try passes.

Target Topic for Turn: Day {targetPlanItem.day}: {targetPlanItem.title}
Objectives: {objectives}
Tools used: {tools}

Instructions:
- Sound like a real human technical interviewer: direct, curious, professional.
- Ground questions strictly in Day {targetPlanItem.day}'s curriculum objectives and tools.
- Maintain adaptive multi-turn flow with targeted follow-ups on candidate responses.`}
            </pre>
          </div>

          {/* Section 3: Adaptive Follow-up Decision Triggers */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <h3 className="font-bold text-white text-sm">3. Dynamic Follow-Up Decision Triggers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-indigo-300 block mb-0.5">Short Answer (&lt; 18 words)</strong>
                <span className="text-slate-400">Triggers prompt for specific code structure and parameters.</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-amber-300 block mb-0.5">Uncertainty Signal</strong>
                <span className="text-slate-400">Triggers supportive probe on mental models and pseudo-code.</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-emerald-300 block mb-0.5">Keyword Drill-down</strong>
                <span className="text-slate-400">Drills into named tools (ChromaDB, LoRA, MCP, LangChain).</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <strong className="text-purple-300 block mb-0.5">Scale & Trade-off Push</strong>
                <span className="text-slate-400">Pushes confident answers to 100x query load scaling.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-400 flex items-center justify-between">
          <span>Compliant with Hackathon AI-Usage Log Requirement</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
