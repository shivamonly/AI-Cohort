import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  BrainCircuit,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { CandidateProfile, FeedbackReport, InterviewApiResponse, SessionState, Turn } from '../types/interview';

interface InterviewRoomProps {
  candidate: CandidateProfile;
  session: SessionState | null;
  onStartSession: (cand: CandidateProfile, customSessionId?: string) => Promise<void>;
  onSendTurn: (sessionId: string, message: string) => Promise<InterviewApiResponse | void>;
  onResetSession: () => void;
  isLoading: boolean;
  error: string | null;
  onViewFeedback: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  candidate,
  session,
  onStartSession,
  onSendTurn,
  onResetSession,
  isLoading,
  error,
  onViewFeedback,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.turns, isLoading]);

  // Speech Synthesis for Interviewer questions
  const speakText = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Trigger TTS when new question arrives
  useEffect(() => {
    if (session && session.turns.length > 0) {
      const lastTurn = session.turns[session.turns.length - 1];
      speakText(lastTurn.question);
    }
  }, [session?.turns.length]);

  // Web Speech Recognition handler
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputMessage(transcript);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading || !session) return;

    const msg = inputMessage;
    setInputMessage('');
    await onSendTurn(session.sessionId, msg);
  };

  // Preset suggested answers for fast testing
  const handleQuickAnswer = (starterType: 'detailed' | 'concise' | 'uncertain' | 'tradeoff') => {
    const lastTurn = session?.turns[session.turns.length - 1];
    const dayNum = lastTurn?.day || 7;

    let text = '';
    if (starterType === 'detailed') {
      text = `In my Day ${dayNum} build, I structured the workflow using modular Python classes. For retrieval, I calculated cosine similarity scores over ChromaDB vector collections, configured chunk overlaps of 100 tokens with LangChain text splitters, and set up explicit error handling and retry logic for API timeouts.`;
    } else if (starterType === 'concise') {
      text = `I used sentence transformers to convert text chunks into 384-dimensional embeddings, stored them in ChromaDB with metadata filters for document sections, and routed user queries to vector retrieval.`;
    } else if (starterType === 'uncertain') {
      text = `To be completely honest, I found this topic challenging during the cohort. I skipped some of the advanced optimization steps and relied on standard default parameters. I'd love to understand the best-practice architecture better.`;
    } else if (starterType === 'tradeoff') {
      text = `When designing this pipeline, the primary trade-off was between retrieval accuracy and query latency. Using QLoRA fine-tuning gave us higher domain accuracy, but increased inference time by ~200ms. For low latency, vector index caching with HNSW indexes was key.`;
    }

    setInputMessage(text);
  };

  // If no session started yet, show Start Interview Card
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-zinc-100">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 mx-auto flex items-center justify-center text-white shadow-inner">
              <Bot className="w-7 h-7 text-indigo-400" />
            </div>

            <div>
              <span className="text-[10px] tracking-widest font-mono text-zinc-500 uppercase block mb-1">
                COHORT ADAPTIVE AGENT
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase">
                Technical Interview
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-lg mx-auto">
              Evaluating <strong className="text-white font-semibold">{candidate.member.name}</strong> ({candidate.member.jobRole}).
              The AI agent dynamically tailors multi-turn questions based on cohort performance signals.
            </p>

            {/* Candidate Summary Grid - Big Numbers Style */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/80">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">EXPERIENCE</span>
                <span className="text-2xl font-extrabold text-white tracking-tight">{candidate.member.yearsExperience} YRS</span>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">MISSIONS</span>
                <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">{candidate.signals.missionsCompleted}/31</span>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">FIRST-TRY</span>
                <span className="text-2xl font-extrabold text-indigo-300 tracking-tight">{candidate.signals.missionsFirstTry}</span>
              </div>
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">EDUCATION</span>
                <span className="text-xs font-semibold text-zinc-300 truncate block mt-1">{candidate.member.education}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => onStartSession(candidate)}
                disabled={isLoading}
                className="px-8 py-3.5 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" /> Initializing Session...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" /> Begin Interview • Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const turnsCount = session.turns.length;
  const daysCoveredCount = session.daysCovered.length;
  const isInterviewComplete = session.isComplete;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-zinc-100 flex flex-col lg:flex-row gap-8">
      {/* LEFT / CENTER: CHAT STREAM & INPUT */}
      <div className="flex-1 flex flex-col bg-zinc-950 border border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden min-h-[680px]">
        {/* Chat Room Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 bg-black/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center font-bold text-sm shadow-inner">
              {candidate.member.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-base tracking-wide uppercase">{candidate.member.name}</h2>
                <span className="text-[10px] font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {candidate.member.jobRole}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                SESSION ID: <span className="text-zinc-300">{session.sessionId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speech synthesis toggle */}
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition-colors flex items-center gap-1.5 ${
                ttsEnabled
                  ? 'bg-zinc-800 border-zinc-600 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle Text-To-Speech"
            >
              {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{ttsEnabled ? 'Audio On' : 'Audio Off'}</span>
            </button>

            <button
              onClick={onResetSession}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full transition-colors"
              title="Restart Interview"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-black/40">
          {session.turns.map((turn, idx) => (
            <div key={idx} className="space-y-4">
              {/* Interviewer Message */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center shrink-0 shadow-inner">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>

                <div className="flex-1 max-w-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-zinc-300">INTERVIEWER</span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800">
                      TURN 0{turn.turnIndex} · DAY {turn.day}: {turn.title}
                    </span>
                    {turn.isFollowUp && (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" /> ADAPTIVE FOLLOW-UP
                      </span>
                    )}
                  </div>

                  <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-zinc-100 text-sm leading-relaxed shadow-sm">
                    {turn.question}
                  </div>
                </div>
              </div>

              {/* Candidate Response */}
              {turn.answer && (
                <div className="flex items-start justify-end gap-3">
                  <div className="flex-1 max-w-3xl text-right">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-bold text-xs uppercase tracking-wider text-zinc-300">{candidate.member.name}</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-white text-black font-medium text-sm leading-relaxed shadow-md text-left inline-block border border-zinc-200">
                      {turn.answer}
                    </div>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {candidate.member.name.charAt(0)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Typing Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>EVALUATING RESPONSE & GENERATING NEXT ADAPTIVE PROBE...</span>
              </div>
            </div>
          )}

          {/* Complete Banner */}
          {isInterviewComplete && (
            <div className="p-6 bg-zinc-900 border border-zinc-700 rounded-3xl text-center space-y-3 my-4">
              <div className="w-12 h-12 bg-zinc-800 text-emerald-400 rounded-full mx-auto flex items-center justify-center border border-zinc-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white uppercase tracking-wide">Interview Completed</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Completed {turnsCount} turns covering {daysCoveredCount} distinct curriculum topics. Feedback report ready.
              </p>
              <button
                onClick={onViewFeedback}
                className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> View Full Analysis Report
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {!isInterviewComplete && (
          <div className="p-4 border-t border-zinc-800/80 bg-black/80 space-y-3">
            {/* Quick Answer Starters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[10px] font-mono text-zinc-500 no-scrollbar">
              <span className="shrink-0 text-zinc-400 font-semibold uppercase">QUICK STARTERS:</span>
              <button
                onClick={() => handleQuickAnswer('detailed')}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-full transition-colors whitespace-nowrap"
              >
                Detailed Code
              </button>
              <button
                onClick={() => handleQuickAnswer('concise')}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-full transition-colors whitespace-nowrap"
              >
                Concise Concept
              </button>
              <button
                onClick={() => handleQuickAnswer('tradeoff')}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-full transition-colors whitespace-nowrap"
              >
                Trade-off & Scale
              </button>
              <button
                onClick={() => handleQuickAnswer('uncertain')}
                className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-amber-900/40 rounded-full transition-colors whitespace-nowrap"
              >
                Unsure / Gap
              </button>
            </div>

            <form onSubmit={handleSend} className="relative flex items-center">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Type ${candidate.member.name}'s technical answer... (Press Enter to send)`}
                rows={2}
                disabled={isLoading}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 pl-4 pr-24 py-3 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 resize-none disabled:opacity-50 placeholder-zinc-500 font-sans"
              />

              <div className="absolute right-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`p-2 rounded-full transition-colors ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Voice dictation"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2.5 bg-white hover:bg-zinc-200 text-black rounded-full shadow-md transition-all disabled:opacity-30 disabled:hover:bg-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: LIVE MONITOR & METRICS */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Progress Metrics - Mone High Contrast Style */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
          <span className="text-[10px] tracking-widest font-mono text-zinc-500 uppercase block">
            LIVE SESSION METRICS
          </span>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight block">
                0{turnsCount}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mt-1">TURNS COMPLETED</span>
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight block">
                0{daysCoveredCount}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase block mt-1">DAYS TOUCHED</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-2">CURRICULUM TAGS</span>
            <div className="flex flex-wrap gap-1.5">
              {session.daysCovered.map((dayNum) => (
                <span
                  key={dayNum}
                  className="px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px] font-mono"
                >
                  DAY {dayNum}
                </span>
              ))}
              {session.daysCovered.length === 0 && (
                <span className="text-[10px] text-zinc-600 italic font-mono">No days touched yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Personalized Timeline Strategy - Numbered Mone Style (01/, 02/, 03/) */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
          <span className="text-[10px] tracking-widest font-mono text-zinc-500 uppercase block">
            PERSONALIZATION PLAN
          </span>

          <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar pr-1">
            {session.plan.slice(0, 8).map((item, idx) => {
              const isTurnDone = session.turns.some((t) => t.day === item.day);
              const isCurrentTurn = session.turns.length > 0 && session.turns[session.turns.length - 1].day === item.day;

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs transition-all ${
                    isCurrentTurn
                      ? 'bg-zinc-900 border-zinc-600 shadow-md'
                      : isTurnDone
                      ? 'bg-zinc-950/60 border-zinc-800/50 opacity-60'
                      : 'bg-zinc-900/40 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-zinc-400 shrink-0 text-sm">
                      0{idx + 1}/
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs font-bold">
                          Day {item.day}: {item.title}
                        </strong>
                        {isTurnDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug line-clamp-2">{item.reasoning}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <button
              onClick={onViewFeedback}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-full text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-zinc-800"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" /> {isInterviewComplete ? 'View Final Report' : 'Draft Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
