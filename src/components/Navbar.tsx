import React from 'react';
import { Bot, Users, BookOpen, Terminal, Sparkles, Activity } from 'lucide-react';
import { CandidateProfile } from '../types/interview';

interface NavbarProps {
  activeTab: 'interview' | 'candidates' | 'curriculum' | 'judge';
  setActiveTab: (tab: 'interview' | 'candidates' | 'curriculum' | 'judge') => void;
  selectedCandidate: CandidateProfile;
  onOpenCandidateSelector: () => void;
  onOpenPromptsModal: () => void;
  sessionActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCandidate,
  onOpenCandidateSelector,
  onOpenPromptsModal,
  sessionActive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800/80 text-zinc-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700/80 text-white flex items-center justify-center font-bold text-sm shadow-inner">
            <Bot className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white uppercase">ABTalks</span>
              <span className="text-[10px] tracking-widest font-mono uppercase px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                Agent • AI
              </span>
            </div>
          </div>
        </div>

        {/* Minimal Pill Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-zinc-900/60 p-1.5 rounded-full border border-zinc-800">
          <button
            onClick={() => setActiveTab('interview')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'interview'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Interview Room</span>
            {sessionActive && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'candidates'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Candidates</span>
            <span className="text-[10px] font-mono opacity-80">(20)</span>
          </button>

          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'curriculum'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Curriculum</span>
            <span className="text-[10px] font-mono opacity-80">(31D)</span>
          </button>

          <button
            onClick={() => setActiveTab('judge')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === 'judge'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-amber-400/90 hover:text-amber-300 hover:bg-zinc-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Judge & API</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
              POST
            </span>
          </button>
        </nav>

        {/* Action Pills */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenPromptsModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300 transition-all shadow-sm"
            title="View PROMPTS.md"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">PROMPTS • MD</span>
          </button>

          <button
            onClick={onOpenCandidateSelector}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-medium text-white transition-all"
            title="Switch Candidate Profile"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              {selectedCandidate.member.name.charAt(0)}
            </div>
            <span className="font-semibold text-xs hidden lg:inline max-w-[100px] truncate">
              {selectedCandidate.member.name}
            </span>
            <span className="text-zinc-400 text-[10px]">▼</span>
          </button>
        </div>
      </div>
    </header>
  );
};
