import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CandidateSelectorModal } from './components/CandidateSelectorModal';
import { InterviewRoom } from './components/InterviewRoom';
import { FeedbackReportModal } from './components/FeedbackReportModal';
import { PromptsModal } from './components/PromptsModal';
import { CandidatesView } from './components/CandidatesView';
import { CurriculumView } from './components/CurriculumView';
import { JudgeTesterView } from './components/JudgeTesterView';
import candidatesRaw from './data/candidates.json' with { type: 'json' };
import curriculumRaw from './data/curriculum.json' with { type: 'json' };
import { CandidateProfile, InterviewApiResponse, SessionState } from './types/interview';

export default function App() {
  const [candidatesList, setCandidatesList] = useState<CandidateProfile[]>(candidatesRaw.candidates as unknown as CandidateProfile[]);

  const [activeTab, setActiveTab] = useState<'interview' | 'candidates' | 'curriculum' | 'judge'>('interview');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile>(candidatesList[0]);
  const [session, setSession] = useState<SessionState | null>(null);

  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The browser always refreshes the project data from the API; the bundled data
  // is only a resilient first paint if a judge opens the interface offline.
  useEffect(() => {
    fetch('/api/candidates')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Candidates unavailable')))
      .then((data) => setCandidatesList(data.candidates as CandidateProfile[]))
      .catch(() => undefined);
  }, []);

  // Initialize or fetch session when candidate changes
  const handleStartSession = async (candidate: CandidateProfile, customSessionId?: string) => {
    setIsLoading(true);
    setError(null);

    const sessionId = customSessionId || `session-${candidate.member.id.toLowerCase()}-${Date.now().toString(36)}`;

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, candidate }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: InterviewApiResponse = await response.json();

      // Fetch newly created session object
      const sessionRes = await fetch(`/api/sessions/${sessionId}`);
      if (sessionRes.ok) {
        const sessionData: SessionState = await sessionRes.json();
        setSession(sessionData);
      }
    } catch (err: any) {
      console.error('Error starting interview session:', err);
      setError(err.message || 'Failed to start interview session');
    } finally {
      setIsLoading(false);
    }
  };

  // Send Turn Message
  const handleSendTurn = async (sessionId: string, message: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: InterviewApiResponse = await response.json();

      // Refresh session state
      const sessionRes = await fetch(`/api/sessions/${sessionId}`);
      if (sessionRes.ok) {
        const sessionData: SessionState = await sessionRes.json();
        setSession(sessionData);

        // If interview ended, auto-open feedback report modal
        if (sessionData.isComplete) {
          setIsFeedbackModalOpen(true);
        }
      }

      return data;
    } catch (err: any) {
      console.error('Error sending turn:', err);
      setError(err.message || 'Failed to process candidate response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    if (session) {
      fetch(`/api/sessions/${session.sessionId}`, { method: 'DELETE' }).catch(() => {});
    }
    setSession(null);
  };

  const handleSelectCandidate = (candidate: CandidateProfile) => {
    setSelectedCandidate(candidate);
    handleResetSession();
    setActiveTab('interview');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex flex-col selection:bg-white selection:text-black">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCandidate={selectedCandidate}
        onOpenCandidateSelector={() => setIsCandidateModalOpen(true)}
        onOpenPromptsModal={() => setIsPromptsModalOpen(true)}
        sessionActive={session !== null && !session.isComplete}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {activeTab === 'interview' && (
          <InterviewRoom
            candidate={selectedCandidate}
            session={session}
            onStartSession={handleStartSession}
            onSendTurn={handleSendTurn}
            onResetSession={handleResetSession}
            isLoading={isLoading}
            error={error}
            onViewFeedback={() => setIsFeedbackModalOpen(true)}
          />
        )}

        {activeTab === 'candidates' && (
          <CandidatesView candidates={candidatesList} onSelectCandidate={handleSelectCandidate} />
        )}

        {activeTab === 'curriculum' && <CurriculumView />}

        {activeTab === 'judge' && <JudgeTesterView />}
      </main>

      {/* Candidate Selection Modal */}
      <CandidateSelectorModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        candidates={candidatesList}
        selectedCandidate={selectedCandidate}
        onSelectCandidate={handleSelectCandidate}
      />

      {/* Feedback Report Modal */}
      <FeedbackReportModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        session={session}
        feedback={session?.feedback}
      />

      {/* Prompts Spec / AI Log Modal */}
      <PromptsModal
        isOpen={isPromptsModalOpen}
        onClose={() => setIsPromptsModalOpen(false)}
      />
    </div>
  );
}
