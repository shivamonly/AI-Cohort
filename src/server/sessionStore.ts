import { SessionState } from '../types/interview.js';

class SessionStore {
  private sessions = new Map<string, SessionState>();

  public get(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  public set(sessionId: string, session: SessionState): void {
    session.updatedAt = Date.now();
    this.sessions.set(sessionId, session);
  }

  public has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  public delete(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  public listAll(): SessionState[] {
    return Array.from(this.sessions.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public clear(): void {
    this.sessions.clear();
  }
}

export const sessionStore = new SessionStore();
