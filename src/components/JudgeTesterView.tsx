import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Send,
  Code2,
  CheckCircle2,
  Play,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Activity,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import candidatesRaw from '../data/candidates.json' with { type: 'json' };
import { CandidateProfile } from '../types/interview';

export const JudgeTesterView: React.FC = () => {
  const candidates = candidatesRaw.candidates as unknown as CandidateProfile[];

  const [selectedCandidateId, setSelectedCandidateId] = useState('CAND-001');
  const [sessionId, setSessionId] = useState('hackathon-judge-001');
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Personalization comparator state
  const [cand1Id, setCand1Id] = useState('CAND-001'); // Sarah
  const [cand2Id, setCand2Id] = useState('CAND-004'); // David
  const [compResult, setCompResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Active sessions state
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  const selectedCandidate = candidates.find((c) => c.member.id === selectedCandidateId) || candidates[0];

  const fetchActiveSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setActiveSessions(data.sessions || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  // Run turn 1 or turn N API test
  const handleTestApi = async (isStart: boolean) => {
    setIsLoading(true);
    setRawResponse(null);

    try {
      const payload = isStart
        ? { sessionId, candidate: selectedCandidate }
        : { sessionId, message: candidateAnswer || 'I implemented sentence transformers with ChromaDB vector collections.' };

      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setRawResponse({
        status: res.status,
        statusText: res.statusText,
        data,
      });

      fetchActiveSessions();
    } catch (err: any) {
      setRawResponse({
        error: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run Personalization Comparison Test
  const handleRunComparison = async () => {
    setIsComparing(true);
    try {
      const res = await fetch('/api/test-personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate1Id: cand1Id, candidate2Id: cand2Id }),
      });
      const data = await res.json();
      setCompResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-zinc-100 space-y-8">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] tracking-widest font-mono text-zinc-500 uppercase block mb-1">
            API VERIFICATION SUITE • HACKATHON EVALUATION
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
            Judge & API Inspector
          </h1>
          <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed">
            Direct harness for testing <code className="font-mono text-indigo-400">POST /api/interview</code> API contracts, candidate adaptivity, and server session state in real time.
          </p>
        </div>

        <button
          onClick={fetchActiveSessions}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-full text-xs font-mono transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh State Memory
        </button>
      </div>

      {/* SECTION 1: PERSONALIZATION COMPARATOR (PROOF OF NON-SCRIPTED AGENT) */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl space-y-5">
        <div>
          <span className="text-[10px] tracking-widest font-mono text-zinc-500 uppercase block mb-1">
            PROOF OF ADAPTIVITY
          </span>
          <h3 className="text-xl font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
            Candidate Personalization Comparator
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl leading-relaxed">
            Compare how the AI agent generates custom interview question plans for different candidate profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Candidate 1 (High First-Try)</label>
            <select
              value={cand1Id}
              onChange={(e) => setCand1Id(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-full text-xs font-mono focus:outline-none focus:border-zinc-500"
            >
              {candidates.map((c) => (
                <option key={c.member.id} value={c.member.id}>
                  {c.member.name} ({c.member.jobRole}) — {c.signals.missionsFirstTry} first-try
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5 uppercase">Candidate 2 (High Attempts/Skips)</label>
            <select
              value={cand2Id}
              onChange={(e) => setCand2Id(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-full text-xs font-mono focus:outline-none focus:border-zinc-500"
            >
              {candidates.map((c) => (
                <option key={c.member.id} value={c.member.id}>
                  {c.member.name} ({c.member.jobRole}) — {c.signals.missionsFirstTry} first-try
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleRunComparison}
          disabled={isComparing}
          className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-full uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
        >
          {isComparing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          Run Comparison Test
        </button>

        {/* Comparison Results View */}
        {compResult && (
          <div className="mt-6 p-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl space-y-4">
            <p className="text-xs text-amber-300 font-mono italic border-b border-zinc-800 pb-3">
              💡 {compResult.comparison}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-white uppercase">{compResult.candidate1.name} ({compResult.candidate1.role})</h4>
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Target Strategy Plan:</span>
                <ul className="space-y-1.5 text-zinc-300 font-mono text-[11px]">
                  {compResult.candidate1.plannedTopics.map((p: any, idx: number) => (
                    <li key={idx} className="p-2 bg-zinc-900 rounded-xl border border-zinc-800/80">
                      <strong>Day {p.day}: {p.title}</strong> — <span className="text-indigo-400">[{p.focusType}]</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <h4 className="font-extrabold text-white uppercase">{compResult.candidate2.name} ({compResult.candidate2.role})</h4>
                <span className="text-[10px] text-zinc-500 font-mono uppercase block">Target Strategy Plan:</span>
                <ul className="space-y-1.5 text-zinc-300 font-mono text-[11px]">
                  {compResult.candidate2.plannedTopics.map((p: any, idx: number) => (
                    <li key={idx} className="p-2 bg-zinc-900 rounded-xl border border-zinc-800/80">
                      <strong>Day {p.day}: {p.title}</strong> — <span className="text-amber-400">[{p.focusType}]</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: RAW POST /api/interview API TESTER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Request Builder */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase font-mono tracking-wider">
            <Zap className="w-4 h-4" /> Endpoint Test Harness (`POST /api/interview`)
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-zinc-400 mb-1.5">SESSION ID</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-full"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5">CANDIDATE PROFILE</label>
              <select
                value={selectedCandidateId}
                onChange={(e) => setSelectedCandidateId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-full"
              >
                {candidates.map((c) => (
                  <option key={c.member.id} value={c.member.id}>
                    {c.member.name} ({c.member.jobRole})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1.5">RESPONSE MESSAGE (TURN N)</label>
              <textarea
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="Enter candidate's answer text to test adaptive follow-up..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 p-3.5 rounded-2xl resize-none font-sans"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleTestApi(true)}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5" /> Start Turn 1
              </button>

              <button
                onClick={() => handleTestApi(false)}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-semibold rounded-full text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Answer Turn N
              </button>
            </div>
          </div>
        </div>

        {/* API Response JSON Viewer */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
              <span className="font-extrabold text-xs uppercase font-mono text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" /> API Output JSON
              </span>
              {rawResponse && (
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  HTTP {rawResponse.status || 200} OK
                </span>
              )}
            </div>

            <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800/80 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-96 no-scrollbar">
              {isLoading ? (
                <div className="flex items-center gap-2 text-zinc-400 py-8 justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>Processing API Request...</span>
                </div>
              ) : rawResponse ? (
                <pre>{JSON.stringify(rawResponse.data || rawResponse, null, 2)}</pre>
              ) : (
                <span className="text-zinc-500 italic">// Send a test request to inspect JSON payload</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: IN-MEMORY SESSIONS INSPECTOR */}
      <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl space-y-4">
        <h3 className="font-extrabold text-white text-base uppercase font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" /> Active Session State Memory
        </h3>

        <div className="overflow-x-auto text-xs font-mono">
          <table className="w-full text-left text-zinc-300">
            <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="p-3 uppercase">Session ID</th>
                <th className="p-3 uppercase">Candidate</th>
                <th className="p-3 uppercase">Turns</th>
                <th className="p-3 uppercase">Days Covered</th>
                <th className="p-3 uppercase">Status</th>
                <th className="p-3 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {activeSessions.map((s) => (
                <tr key={s.sessionId} className="hover:bg-zinc-900/50">
                  <td className="p-3 font-bold text-indigo-300">{s.sessionId}</td>
                  <td className="p-3">{s.candidate?.member?.name} ({s.candidate?.member?.jobRole})</td>
                  <td className="p-3">{s.turns?.length || 0}</td>
                  <td className="p-3">{s.daysCovered?.join(', ') || 'None'}</td>
                  <td className="p-3">
                    {s.isComplete ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[10px]">Done</span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 text-[10px]">In-Progress</span>
                    )}
                  </td>
                  <td className="p-3 text-zinc-500">{new Date(s.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
              {activeSessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-zinc-500 italic">
                    No active sessions in server memory. Start an interview in the Interview Room!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
