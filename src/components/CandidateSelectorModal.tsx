import React, { useState } from 'react';
import { Search, X, Check, Award, AlertTriangle, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { CandidateProfile } from '../types/interview';

interface CandidateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: CandidateProfile[];
  selectedCandidate: CandidateProfile;
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

export const CandidateSelectorModal: React.FC<CandidateSelectorModalProps> = ({
  isOpen,
  onClose,
  candidates,
  selectedCandidate,
  onSelectCandidate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'HIGH_ATTEMPTS' | 'SKIPPED' | 'MASTERY'>('ALL');

  if (!isOpen) return null;

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.member.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.member.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'HIGH_ATTEMPTS') {
      return c.missions.some((m) => (m.attempts && m.attempts >= 3) || m.passed === false);
    }
    if (filterType === 'SKIPPED') {
      return c.missions.some((m) => m.skipped);
    }
    if (filterType === 'MASTERY') {
      return c.signals.missionsFirstTry >= 20;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl text-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-0.5">
              CANDIDATE SELECTION
            </span>
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Select Cohort Candidate
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Choose from 20 synthetic cohort profiles to test personalized technical probes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-full border border-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search candidate name, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 pl-9 pr-4 py-2 rounded-full text-xs font-mono focus:outline-none focus:border-zinc-500 placeholder-zinc-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs no-scrollbar">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-colors ${
                filterType === 'ALL' ? 'bg-white text-black font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              All (20)
            </button>
            <button
              onClick={() => setFilterType('HIGH_ATTEMPTS')}
              className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-colors ${
                filterType === 'HIGH_ATTEMPTS' ? 'bg-amber-500 text-black font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              High Attempts
            </button>
            <button
              onClick={() => setFilterType('SKIPPED')}
              className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-colors ${
                filterType === 'SKIPPED' ? 'bg-rose-500 text-black font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              Skipped
            </button>
            <button
              onClick={() => setFilterType('MASTERY')}
              className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] transition-colors ${
                filterType === 'MASTERY' ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
              }`}
            >
              First-Try Masters
            </button>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 no-scrollbar">
          {filteredCandidates.map((cand) => {
            const isSelected = cand.member.id === selectedCandidate.member.id;
            const highAttemptCount = cand.missions.filter((m) => (m.attempts && m.attempts >= 3) || m.passed === false).length;
            const skippedCount = cand.missions.filter((m) => m.skipped).length;

            return (
              <div
                key={cand.member.id}
                onClick={() => {
                  onSelectCandidate(cand);
                  onClose();
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-white/60 shadow-lg ring-1 ring-white/20'
                    : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-4 right-4 px-3 py-0.5 rounded-full bg-white text-black text-[10px] font-mono font-bold flex items-center gap-1 uppercase">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}

                <div>
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-white font-extrabold flex items-center justify-center text-sm shadow-inner shrink-0">
                      {cand.member.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-white text-sm truncate uppercase tracking-wide">{cand.member.name}</h3>
                        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded-full border border-zinc-800">
                          {cand.member.id}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{cand.member.jobRole}</p>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {cand.member.yearsExperience} yrs exp · {cand.member.education}
                      </p>

                      {/* Signals & Badges */}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-950 text-zinc-300 border border-zinc-800 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-400" />
                          {cand.signals.missionsFirstTry} First-Try
                        </span>

                        {highAttemptCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-800/40 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            {highAttemptCount} Struggles
                          </span>
                        )}

                        {skippedCount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-950/40 text-rose-300 border border-rose-800/40 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            {skippedCount} Skipped
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>Commit Days: <strong className="text-zinc-200">{cand.signals.commitDays}d</strong></span>
                  <span className="text-white hover:underline font-bold flex items-center gap-1 uppercase tracking-wider">
                    Select Candidate <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 text-xs font-mono text-zinc-500 flex items-center justify-between">
          <span>Showing {filteredCandidates.length} of {candidates.length} profiles</span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full border border-zinc-800 text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
