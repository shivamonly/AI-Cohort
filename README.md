<div align="center">

# 🎙️ Adaptive AI Technical Interview Engine

**Personalized, curriculum-grounded technical evaluation engine powered by Gemini 2.5 Flash**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini_2.5-8E7CC3?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![OWASP Top 10](https://img.shields.io/badge/OWASP_Top_10-Secured-brightgreen?style=for-the-badge&logo=shield&logoColor=white)](#security--compliance)

---

</div>

## 📌 Overview

The **Adaptive AI Technical Interview Engine** is an intelligent, candidate-aware technical interviewer designed to evaluate engineers based on their actual learning history and past performance signals.

Unlike static question banks or rigid scripts, this engine dynamically plans multi-turn interviews, generates context-aware follow-ups based on candidate responses, probes struggle areas (skipped or high-attempt topics), and produces comprehensive 4-part feedback reports upon completion.

---

## ✨ Key Features

* **🧠 Candidate-Aware Personalization**: Dynamically analyzes candidate profiles (first-try passes, high attempts, skipped topics) to personalize the target question queue.
* **📚 31-Day Curriculum Grounding**: Strictly maps interview topics directly to real curriculum modules without fabricating topics or using static scripts.
* **💬 Dynamic Multi-Turn Follow-Ups**: Probes specific code choices, tradeoffs, and candidate answers in real time with dynamic follow-up logic.
* **📊 Comprehensive 4-Part Feedback**: Generates granular post-interview reports with summary, key strengths, identified gaps, and actionable next steps.
* **🔒 Enterprise OWASP Top 10 Security**: Implements strict rate limiting, input sanitization, security response headers (CSP, HSTS, frame options), and payload guards.
* **🧪 Integrated Judge & API Suite**: Includes interactive testing interfaces for judges, candidate inspection, full curriculum exploration, and raw JSON API testing.

---

## 🛠️ Architecture & Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide React Icons
* **Backend**: Node.js, Express.js (REST API server with Vercel serverless support)
* **AI Engine**: Google `@google/genai` SDK using Gemini 2.5 Flash
* **State Engine**: In-memory session store with strict server-side state enforcement
* **Validation & Linting**: Strict TypeScript, ESLint, OWASP Top 10 Hardened

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+ or Bun
* A Gemini API key set in `GEMINI_API_KEY`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/AI-Interview-Agent.git
   cd AI-Interview-Agent
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=development
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🔌 API Reference

### `POST /api/interview`

The primary stateful endpoint for starting and continuing interviews.

#### 1. Start Interview (First Turn)
```json
{
  "sessionId": "SESSION-101",
  "candidate": {
    "member": { "id": "CAND-001", "name": "Alice Chen", "jobRole": "Full Stack Engineer" },
    "signals": { ... }
  }
}
```

**Response**:
```json
{
  "reply": "Welcome Alice! Let's start with system design...",
  "done": false,
  "meta": {
    "sessionId": "SESSION-101",
    "questionNumber": 1,
    "targetDay": 4,
    "targetTitle": "Distributed Caching"
  }
}
```

#### 2. Send Candidate Response
```json
{
  "sessionId": "SESSION-101",
  "message": "I would use Redis with a LRU eviction policy..."
}
```

#### 3. Interview Completion Response (Turn 8+)
```json
{
  "reply": "Interview completed.",
  "done": true,
  "feedback": {
    "summary": "Alice demonstrated strong depth in state management...",
    "strengths": ["Clear understanding of cache invalidation", "Good architectural decisions"],
    "gaps": ["Needs deeper familiarity with async worker queues"],
    "next": ["Review Day 18 distributed systems messaging patterns"]
  }
}
```

---

## 🛡️ Security & Compliance

This application adheres strictly to **OWASP Top 10 (2025)** guidelines:

* **A01: Broken Access Control** — Server-side session ownership and input validation.
* **A02: Security Misconfiguration** — Disabled `X-Powered-By`, strict CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
* **A05: Injection & Payload Control** — Strict JSON body limits (256KB), HTML entity sanitization on string inputs.
* **Denial of Service Guard** — In-memory rate limiting (120 req/min per IP).

---

## 📂 Project Structure

```
.
├── api/                   # Serverless edge function entry points
├── src/
│   ├── components/        # Modular UI components (InterviewRoom, JudgeTesterView, etc.)
│   ├── data/              # Grounding data (candidates.json, curriculum.json)
│   ├── server/            # Express app, interview logic & session store
│   └── types/             # TypeScript interfaces for API & Candidate domain
├── PROMPTS.md             # Development prompt history
├── server.ts              # Local dev & production server launcher
└── vercel.json            # Deployment configuration
```

---

<div align="center">

Crafted with care for candidate-centric technical evaluations.

</div>
