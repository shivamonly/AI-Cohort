import React, { useState } from 'react';
import { Search, Users, Award, AlertTriangle, AlertCircle, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { CandidateProfile } from '../types/interview';

interface CandidatesViewProps {
  candidates: CandidateProfile[];
  onSelectCandidate: (candidate: CandidateProfile) => void;
}

export const CandidatesView: React.FC<CandidatesViewProps> = ({ candidates, onSelectCandidate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [inspectedCandidate, setInspectedCandidate] = useState<CandidateProfile | null>(null);

  const roles = Array.from(new Set(candidates.map((c) => c.member.jobRole)));

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.member.jobRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.member.id.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterRole !== 'ALL' && c.member.jobRole !== filterRole) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-zinc-100 space-y-8">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl">
        <div>
          <span className="text-[10px] tracking-widest font-mono text-zinc-500 uppercase block mb-1">
            COHORT GRADUATES DIRECTORY • 20 PROFILES
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            Candidates Directory
          </h1>
          <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed">
            Personalized performance signals, struggle days, and skipped topics. The AI agent inspects candidate history before generating adaptive interview probes.
          </p>
        </div>

        {/* Search & Filter Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search candidate, role, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 pl-9 pr-4 py-2 rounded-full text-xs focus:outline-none focus:border-zinc-500 placeholder-zinc-500 font-mono"
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-full text-xs font-mono focus:outline-none focus:border-zinc-500"
          >
            <option value="ALL">All Roles ({candidates.length})</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map((cand) => {
          const highAttemptMissions = cand.missions.filter((m) => (m.attempts && m.attempts >= 3) || m.passed === false);
          const skippedMissions = cand.missions.filter((m) => m.skipped);

          return (
            <div
              key={cand.member.id}
              className="bg-zinc-950 border border-zinc-800/80 hover:border-zinc-600 rounded-3xl p-6 shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-700 text-white font-extrabold flex items-center justify-center text-base shadow-inner shrink-0">
                      {cand.member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-base group-hover:text-indigo-300 transition-colors uppercase tracking-wide">
                        {cand.member.name}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">{cand.member.jobRole}</p>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] bg-zinc-900 text-zinc-500 px-2.5 py-0.5 rounded-full border border-zinc-800">
                    {cand.member.id}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 font-mono mt-3">
                  {cand.member.yearsExperience} YOE · {cand.member.education}
                </p>

                {/* Big Stats Row */}
                <div className="mt-5 grid grid-cols-3 gap-2 text-center pt-3 border-t border-zinc-900">
                  <div className="p-2.5 bg-zinc-900/60 rounded-2xl border border-zinc-800/80">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">COMPLETED</span>
                    <strong className="text-emerald-400 text-sm font-extrabold">{cand.signals.missionsCompleted}/31</strong>
                  </div>
                  <div className="p-2.5 bg-zinc-900/60 rounded-2xl border border-zinc-800/80">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">FIRST-TRY</span>
                    <strong className="text-indigo-300 text-sm font-extrabold">{cand.signals.missionsFirstTry}</strong>
                  </div>
                  <div className="p-2.5 bg-zinc-900/60 rounded-2xl border border-zinc-800/80">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">COMMITS</span>
                    <strong className="text-zinc-200 text-sm font-extrabold">{cand.signals.commitDays}d</strong>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="mt-3 space-y-1.5 text-[10px] font-mono">
                  {highAttemptMissions.length > 0 && (
                    <div className="text-amber-400 flex items-center gap-1.5 bg-amber-950/30 p-2 rounded-xl border border-amber-900/30">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        STRUGGLES: {highAttemptMissions.map((m) => `D${m.day}`).join(', ')}
                      </span>
                    </div>
                  )}

                  {skippedMissions.length > 0 && (
                    <div className="text-rose-400 flex items-center gap-1.5 bg-rose-950/30 p-2 rounded-xl border border-rose-900/30">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">SKIPPED: {skippedMissions.map((m) => `D${m.day}`).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between gap-2">
                <button
                  onClick={() => setInspectedCandidate(cand)}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full text-xs font-mono transition-colors border border-zinc-800"
                >
                  Inspect History
                </button>

                <button
                  onClick={() => onSelectCandidate(cand)}
                  className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-full text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 shadow-md"
                >
                  Interview <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Missions Modal Inspector */}
      {inspectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl p-8 shadow-2xl text-zinc-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">
                  MISSION LOG INSPECTOR
                </span>
                <h3 className="text-xl font-extrabold text-white uppercase">{inspectedCandidate.member.name}</h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {inspectedCandidate.member.jobRole} · {inspectedCandidate.member.yearsExperience} YOE
                </p>
              </div>
              <button
                onClick={() => setInspectedCandidate(null)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-full text-xs font-mono border border-zinc-800"
              >
                Close
              </button>
            </div>

            <div className="mt-4 overflow-y-auto space-y-2 flex-1 pr-1 text-xs no-scrollbar">
              {inspectedCandidate.missions.map((m, idx) => (
                <div key={idx} className="p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-indigo-400">Day {m.day}: </span>
                    <span className="text-zinc-200 font-medium">{m.title}</span>
                  </div>

                  <div>
                    {m.skipped ? (
                      <span className="px-2.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-800/60 rounded-full text-[10px] font-mono">
                        Skipped
                      </span>
                    ) : m.passed ? (
                      <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/60 rounded-full text-[10px] font-mono">
                        Passed ({m.attempts} {m.attempts === 1 ? 'try' : 'tries'})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-800/60 rounded-full text-[10px] font-mono">
                        Failed ({m.attempts} tries)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => {
                  onSelectCandidate(inspectedCandidate);
                  setInspectedCandidate(null);
                }}
                className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-full text-xs font-semibold uppercase tracking-wider shadow-lg"
              >
                Select & Launch Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
