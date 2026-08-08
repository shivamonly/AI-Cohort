import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ArrowUp, BarChart3, ChevronRight, CircleDot, Code2, Copy, FileText, Sparkles } from 'lucide-react';
import type { CandidateProfile, CurriculumData } from './types/interview';

type Chat = { by: 'agent' | 'candidate'; text: string };

export default function App() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [candidateId, setCandidateId] = useState('');
  const [sessionId] = useState(() => `abtalks-${crypto.randomUUID().slice(0, 8)}`);
  const [chat, setChat] = useState<Chat[]>([]);
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<'room' | 'roster' | 'curriculum' | 'api'>('room');
  const selected = useMemo(() => candidates.find(c => c.member.id === candidateId), [candidates, candidateId]);

  useEffect(() => {
    Promise.all([fetch('/api/candidates').then(r => r.json()), fetch('/api/curriculum').then(r => r.json())])
      .then(([people, course]) => { setCandidates(people.candidates); setCandidateId(people.candidates[0]?.member.id || ''); setCurriculum(course); })
      .catch(() => setChat([{ by: 'agent', text: 'Unable to load interview data. Refresh to reconnect to ABTalks.' }]));
  }, []);

  async function start() {
    if (!selected) return;
    setBusy(true);
    try { const r = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, candidate: selected }) }); const data = await r.json(); setChat([{ by: 'agent', text: data.reply || data.error }]); }
    catch { setChat([{ by: 'agent', text: 'The interview service is unavailable. Please try again.' }]); } finally { setBusy(false); }
  }
  async function send(e: FormEvent) {
    e.preventDefault(); if (!answer.trim() || busy) return;
    const message = answer.trim(); setAnswer(''); setChat(old => [...old, { by: 'candidate', text: message }]); setBusy(true);
    try { const r = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, message }) }); const data = await r.json(); setChat(old => [...old, { by: 'agent', text: data.done ? `${data.reply}\n\n${data.feedback.summary}` : (data.reply || data.error) }]); }
    catch { setChat(old => [...old, { by: 'agent', text: 'Connection lost. Your answer is still visible above; please try again.' }]); } finally { setBusy(false); }
  }
  const nav = (id: typeof view, label: string) => <button className={view === id ? 'nav active' : 'nav'} onClick={() => setView(id)}>{label}</button>;
  return <main className="shell">
    <header><a className="brand" href="#"><span>AB</span>Talks</a><nav>{nav('room','Interview room')}{nav('roster',`People / ${candidates.length || '—'}`)}{nav('curriculum','Curriculum')}{nav('api','API console')}</nav><div className="live"><i /> system online</div></header>
    {view === 'room' && <section className="room">
      <aside className="rail"><p className="eyebrow">INTERVIEW CONTROL</p><h1>Make the conversation count.</h1><p className="muted">Adaptive technical interviews, grounded in the work someone actually completed.</p><label>Candidate<select value={candidateId} onChange={e => { setCandidateId(e.target.value); setChat([]); }}><option value="">Choose candidate</option>{candidates.map(c => <option value={c.member.id} key={c.member.id}>{c.member.name} · {c.member.jobRole}</option>)}</select></label>{selected && <div className="profile"><b>{selected.member.name}</b><small>{selected.member.jobRole} · {selected.member.yearsExperience} years</small><div><span>{selected.signals.missionsCompleted}/31<br/><small>missions</small></span><span>{selected.signals.missionsFirstTry}<br/><small>first try</small></span></div></div>}<button className="start" onClick={start} disabled={busy || !selected}>{chat.length ? 'Restart interview' : 'Begin interview'} <ChevronRight size={16}/></button><p className="session">SESSION · {sessionId}</p></aside>
      <section className="conversation"><div className="conversation-head"><div><p className="eyebrow">LIVE ROOM</p><h2>{chat.length ? 'In conversation' : 'A better way to assess technical depth.'}</h2></div><div className="meter"><CircleDot size={16}/> {chat.length} turns</div></div><div className="messages">{chat.length === 0 ? <div className="empty"><Sparkles size={24}/><h3>Ready when you are</h3><p>Select a profile and ABTalks will build a focused route through real curriculum evidence.</p></div> : chat.map((m, i) => <article className={`bubble ${m.by}`} key={i}><small>{m.by === 'agent' ? 'ABTALKS / INTERVIEWER' : selected?.member.name?.toUpperCase()}</small><p>{m.text}</p></article>)}{busy && <div className="typing">ABTalks is thinking<span>.</span><span>.</span><span>.</span></div>}</div><form onSubmit={send}><textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder={chat.length ? 'Write a thoughtful answer…' : 'Start the interview first'} disabled={!chat.length || busy}/><button aria-label="Send" disabled={!chat.length || busy}><ArrowUp size={19}/></button></form></section>
    </section>}
    {view === 'roster' && <section className="page"><p className="eyebrow">COHORT DIRECTORY</p><h1>People, not profiles.</h1><div className="cards">{candidates.map(c => <button className="person" key={c.member.id} onClick={() => { setCandidateId(c.member.id); setChat([]); setView('room'); }}><b>{c.member.name}</b><span>{c.member.jobRole}</span><em>{c.signals.missionsCompleted}/31 missions · {c.signals.commitDays} active days</em></button>)}</div></section>}
    {view === 'curriculum' && <section className="page"><p className="eyebrow">31-DAY ATLAS</p><h1>What the interview is grounded in.</h1><div className="days">{curriculum?.days.map(d => <article key={d.day}><b>{String(d.day).padStart(2,'0')}</b><div><h3>{d.title}</h3><p>{d.objectives.join(' · ')}</p></div><span>{d.tools.join(', ')}</span></article>)}</div></section>}
    {view === 'api' && <section className="page api"><p className="eyebrow">NO HIDDEN LAYERS</p><h1>Inspect the contract.</h1><div className="api-grid"><article><Code2/><h3>POST /api/interview</h3><pre>{`{ "sessionId": "demo-001",\n  "candidate": { "...": "profile" } }`}</pre><button onClick={() => navigator.clipboard.writeText('/api/interview')}><Copy size={14}/> Copy endpoint</button></article><article><BarChart3/><h3>Response shape</h3><pre>{`{ "reply": "string",\n  "done": false }`}</pre><p>Final responses add a grounded feedback report.</p></article><article><FileText/><h3>Server-side state</h3><p>Conversation history and coverage live in memory for the interview lifetime, keyed only by session ID.</p></article></div></section>}
  </main>;
}
