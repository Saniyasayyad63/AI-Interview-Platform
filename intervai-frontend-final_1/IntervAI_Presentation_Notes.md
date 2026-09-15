# IntervAI — Complete Technical Presentation Guide

---

## TECH STACK

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, React Router v6, Socket.IO Client, Web Speech API, Web Audio API, WebRTC, LocalStorage, Lucide Icons, Tailwind CSS |
| **Backend** | Node.js, Express.js, Socket.IO, Passport.js (OAuth), JWT, bcrypt, Mongoose |
| **Database** | MongoDB Atlas (cloud-hosted) |
| **External APIs** | Google OAuth 2.0, Microsoft OAuth, Google Gemini AI |
| **Deployment** | Vercel (frontend) + Render (backend) |

---

## 1. AI INTERVIEW

### How It Works

The user configures the interview session by selecting:
- **Role** — 7 options: Software Engineer, Frontend Developer, Backend Developer, Full Stack Developer, Data Scientist, DevOps Engineer, Product Manager
- **Skills** — Up to 5 from 18 options (React, JavaScript, TypeScript, Node.js, Python, Java, DSA, System Design, MongoDB, SQL, AWS, Docker, CSS, Next.js, Express, GraphQL, Redis, Kubernetes)
- **Difficulty** — Easy, Medium, Hard
- **Input Mode** — Text or Voice (Web Speech API)
- **Question Count** — 5, 7, or 10

---

### Question Generation

Questions are pulled from a categorized pool in this fixed order:

| Question # | Category | Example |
|---|---|---|
| Q1 | Introduction | "Tell me about yourself..." |
| Q2–Q4 | Technical | Closures, REST vs GraphQL, React reconciliation, Event loop, SOLID principles |
| Q5–Q7 | Problem Solving | System design, Debugging, Optimization |
| Q8+ | Behavioural | Conflict resolution, Deadlines, Mentoring, Feedback |

Already-used questions are tracked to avoid repetition across the session.

---

### Answer Scoring Algorithm (0–10 per answer)

```
LENGTH SCORE (0–4 points):
  8+ words   → 1 point
  20+ words  → 2 points
  40+ words  → 3 points
  80+ words  → 4 points

STRUCTURE SCORE (0–3 points):
  Keywords: because, therefore, result, solution, approach,
            implemented, achieved, example, specifically, first, second, finally
  1 keyword hit  → 1 point
  2 keyword hits → 2 points
  4+ keyword hits → 3 points

DEPTH SCORE (0–3 points):
  Keywords: experience, project, team, challenge, learned,
            improved, built, designed, optimized, reduced, increased
  1 hit → 1 point
  2 hits → 2 points
  3+ hits → 3 points

FINAL SCORE = min(10, Length + Structure + Depth)
```

---

### Communication Analysis (0–100 each)

**Filler Words Detected:** um, uh, like, you know, basically, literally, actually, sort of, kind of

```
FLUENCY:
  = Answer length score (15–45)
  + Sentence structure score (15–30)
  + Filler word penalty (max 25, minus 3 per filler word)

CONFIDENCE:
  = Base score by average word count (40–70)
  + Filler word penalty (max 30, minus 4 per filler word)

CLARITY:
  = Length score (15–40)
  + Sentence length sweet spot 5–25 words (20–35)
  + Filler word penalty (max 25, minus 3 per filler word)
```

---

### Feedback Messages

| Score | Feedback |
|---|---|
| < 10 words | "Very short answer. Try to elaborate with examples and context." |
| < 25 words | "Good start. Add more detail and specific examples." |
| Score ≥ 8 | "Excellent answer! Well-structured with good depth." |
| Score ≥ 6 | "Good answer. Adding more specific examples would make it stronger." |
| Score ≥ 4 | "Decent response. Focus on structure: situation, action, and result." |
| Below 4 | "Try to provide a more detailed and structured response using the STAR method." |

---

### Voice Input

Uses the browser's **Web Speech API**:
- Continuous recognition with interim results shown live
- Final transcript accumulated per answer
- Timer shows recording duration
- Works on Chrome and Edge

---

### Performance Report Shows

- Overall score (0–100%)
- Communication breakdown: Fluency, Confidence, Clarity bars
- Per-answer score and feedback
- Skill tags and role info
- STAR method suggestions when score is low

---

## 2. LIVE TEST MODULE

### Complete Flow

```
Host creates test
  → Selects categories, topics, question count
  → Server samples questions by difficulty
  → Generates unique join code

Participants join with code
  → Server creates LiveTestAttempt record
  → All land in Waiting Room

Host clicks Start
  → All participants see Terms & Conditions Modal
  → Must tick checkbox and accept
  → Fullscreen entered automatically
  → Server-driven countdown begins

Test in progress
  → Answers auto-saved every 4 seconds
  → Timer counts down from server timestamp

Time expires or user submits
  → Server evaluates all answers
  → Leaderboard updated in real-time
  → All participants redirected to results
```

---

### Question Selection Algorithm

```
Step 1: Filter questions by selected categories and topics
Step 2: Allocate by difficulty:
          40% Easy
          40% Medium
          20% Hard
Step 3: Random sample per difficulty bucket
Step 4: If not enough questions, fill remainder from any difficulty
Step 5: Shuffle using seeded random (seed = title + joinCode)
Step 6: Slice to requested count
```

The seeded shuffle ensures the same question order is reproducible for auditing.

---

### Scoring

- Binary: 1 point per correct answer
- Evaluated **server-side** on submission (client cannot manipulate)
- Tracks: score, correct count, wrong count, total questions, time taken in seconds

---

### Leaderboard Ranking (3-Level Sort)

```
Primary:   Score (highest first)
Secondary: Time taken in seconds (lowest first — faster wins ties)
Tertiary:  Submission timestamp (earliest first)
```

---

### Server-Driven Timer

```
On session load:
  serverOffset = serverNow (from API) - Date.now()

Countdown:
  remainingTime = (endAt - (Date.now() + serverOffset)) / 1000

This prevents any client-side time manipulation.
```

---

### Answer Sync Strategy

- Dirty answers tracked in a React `ref` (not state — avoids re-renders)
- Flushed to server every **4 seconds**
- Skipped if no changes AND within 5-second heartbeat window
- Auto-submit triggered when `remainingTime === 0`

---

### Anti-Cheat System

**Terms Modal:**
- Shown in the waiting room before test starts
- Must tick checkbox and click "Start Test in Fullscreen"
- Disabled button until checkbox is selected

**Fullscreen Enforcement:**
- `document.documentElement.requestFullscreen()` called on accept
- If fullscreen exits → violation recorded → re-entry attempted after 800ms

**Violations Detected:**
| Trigger | Event Used |
|---|---|
| Tab switch / minimize | `visibilitychange` |
| Window blur / alt-tab | `window blur` |
| Fullscreen exit (Esc) | `fullscreenchange` |

**Warning System:**
| Warning # | Message Shown |
|---|---|
| Warning 1 | "Warning 1/3: Tab switching is not allowed." |
| Warning 2 | "Warning 2/3: One more violation will terminate your test." |
| Warning 3 | Auto-disqualified. Score set to 0. Test submitted. |

**Additional Blocks:**
- Right-click context menu disabled
- Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+S, Ctrl+A blocked
- F12 (DevTools) blocked
- Ctrl+Shift+I/J/C blocked
- 2-second cooldown between violation triggers to prevent stacking

**Real-Time Host Monitoring:**
- Every violation broadcast via Socket.IO to all room members
- Host sees participant name, warning count, and status live

---

### Socket Events — Live Test

| Event | Direction | Purpose |
|---|---|---|
| `live-test:join-room` | Client → Server | Join test room |
| `live-test:leave-room` | Client → Server | Leave test room |
| `testStarted` | Server → Client | Test went live |
| `live-test:update` | Server → Client | Status change |
| `live-test:leaderboard:update` | Server → Client | Score changed |
| `live-test:violation` | Server → Client | Anti-cheat alert |

---

### Database Models

**LiveTest:**
```
testId, title, joinCode
createdBy (host ID)
categories, topics, questionIds (ordered array)
questionCount, totalDurationSec
status: waiting → live → expired / completed
startAt, endAt (server timestamps)
settings: { antiCheatEnabled, maxWarnings, preventMultipleSessions }
leaderboardVersion (incremented on every score change)
```

**LiveTestAttempt:**
```
testId, participantKey (unique identifier)
participantName, sessionToken (UUID)
questionOrder (copy of test's questionIds)
answers: Map<questionId, { selectedOptionId, answeredAt }>
answeredCount, score, correct, wrong, total
warnings, tabSwitchCount, fullscreenExits
status: joined → submitted / expired / disqualified
timeTakenSec, submittedAt, lastSeenAt
```

---

## 3. GROUP DISCUSSION (GD) — with Video and Audio

### Architecture

- **Host** — Moderator panel: read-only chat, participant management controls
- **Participants** — Video grid + text chat

---

### WebRTC — Mesh Topology

```
Each participant creates one RTCPeerConnection per other participant.
For N participants: N × (N-1) / 2 total connections.
Maximum supported: 6 users.
```

**ICE / STUN Servers Used:**
- stun.l.google.com:19302 (4 variants)
- stun.stunprotocol.org:3478

---

### WebRTC Signaling Flow via Socket.IO

```
Peer A joins room
  → Sends "gd:offer" to Peer B (targeted by userId)
Peer B receives offer
  → Sends "gd:answer" back to Peer A
Both peers exchange "gd:ice-candidate" messages
RTCPeerConnection established
Video and audio streams flow peer-to-peer
```

---

### Speaking Detection Algorithm

```
Web Audio API AnalyserNode attached to each remote stream
→ getByteFrequencyData() called every 100ms
→ Calculate average frequency amplitude across all bins
→ If average > 20 threshold → user is speaking
→ 800ms debounce to prevent flicker
→ Speaking user gets teal border highlight on video tile
```

---

### Host Controls

| Control | What It Does |
|---|---|
| Kick | Removes participant from room immediately |
| Force Mic On/Off | Toggles microphone for a specific participant |
| Force Camera On/Off | Toggles camera for a specific participant |
| Start Discussion | Starts the countdown timer |
| End Discussion | Manually ends the session |

---

### Chat Rules

- Minimum 10 characters per message
- 3-second spam cooldown between messages
- Profanity filter applied server-side (replaces with ***)
- All messages saved to MongoDB

---

### GD Scoring Algorithm

```
PARTICIPATION (0–10):
  = (your message count / highest message count in room) × 10

COMMUNICATION (0–10):
  Average message length 30–80 chars → 10 points
  Average message length 15–30 chars → 7 points
  Average message length > 0 chars   → 4 points

RELEVANCE (0–10):
  = (number of topic keywords in your messages / total topic keywords) × 10

OVERALL SCORE:
  = (Participation × 0.4) + (Communication × 0.3) + (Relevance × 0.3)
```

Results are ranked by overall score and saved to MongoDB with rank, individual scores, message stats, and feedback.

---

### 2-Minute Bell Warning

Server-side `setTimeout` fires at `totalDuration - 2 minutes`, emits `gd:bell` event to all participants in the room.

---

### Socket Events — GD

| Event | Purpose |
|---|---|
| `gd:join` / `gd:leave` | Room membership |
| `gd:user-joined` / `gd:user-left` | Broadcast to room |
| `gd:offer` / `gd:answer` / `gd:ice-candidate` | WebRTC signaling (targeted) |
| `gd:media-state` | Broadcast mic/camera state |
| `gd:force-media` | Host forces participant media |
| `gd:kick` | Host removes participant |
| `gd:chat` | Save and broadcast message |
| `gd:started` / `gd:ended` | Discussion control |
| `gd:bell` | 2-minute warning |

---

## 4. GTG (GROUP-TO-GROUP) — Text-Based Discussion

Same architecture as GD but with these differences:

| Feature | GD | GTG |
|---|---|---|
| Video | Yes | No |
| Audio | Yes | Audio only |
| Host role | Moderator + controls | Read-only moderator |
| Transcript | Saved | Saved for host review |
| Scoring | Same algorithm | Same algorithm |

---

## 5. TAKE TEST (Aptitude Test)

### Adaptive Difficulty Algorithm

```
User answers correctly → next question difficulty = "hard"
User answers wrong    → next question difficulty = "easy"

Remaining questions are reordered to prioritize the next difficulty.
Already-answered questions maintain their original position.
```

### Per-Question Timer

Each question has its own individual countdown. Time remaining is stored per question ID in component state.

### Question Palette

Visual grid showing:
- Green = answered
- Red = not attempted
- Teal = current question

### Scoring

- Binary: 1 point per correct answer
- Evaluated server-side on each advance and on final submit
- Returns: isCorrect, explanation, nextDifficulty for adaptive reordering

---

## 6. VERSANT ASSESSMENT

Four modules:

| Module | Format | How It Works |
|---|---|---|
| Grammar | Spot the Error MCQ | Single document with multiple sentences |
| Reading Comprehension | Passage + MCQ | Grouped by passage, submitted per passage |
| Listening Comprehension | Audio + MCQ | Same logic as reading |
| Speaking Assessment | Voice prompt | Records transcript, AI evaluates |

The Speaking module uses the **Web Speech API** for recording. The transcript is sent to the backend where **Google Gemini AI** evaluates fluency, pronunciation, and content.

---

## 7. RESUME UPLOAD

- Accepts: PDF, DOC, DOCX (maximum 5MB)
- Drag-and-drop or file picker interface
- Sent to backend via `multipart/form-data`
- **Google Gemini AI** analyzes the resume and returns:

```
{
  summary:             "Overall assessment of the candidate",
  languages:           ["Python", "JavaScript", ...],
  skills:              ["React", "Node.js", ...],
  projectTitles:       ["Project A", "Project B", ...],
  technicalStrengths:  ["Strength 1", "Strength 2", ...]
}
```

---

## 8. LEARNING HUB (Question Bank)

**Total: 349 questions**

| Category | Count |
|---|---|
| DSA Problems | 142 |
| System Design | 64 |
| Frontend | 88 |
| Behavioural | 55 |

**Filtering options:** Category, Difficulty (Easy/Medium/Hard), Search by title or tag

Each question card shows: title, difficulty badge, tags, companies that asked it, and a practice button.

---

## 9. DASHBOARD AND ANALYTICS

### KPI Cards (live data from backend)

| KPI | Source |
|---|---|
| Average Score | Aggregated from all interview sessions |
| Total Interviews | Count of completed sessions |
| Hours Practiced | Calculated from session durations |
| Day Streak | Consecutive days with activity |

Each KPI card has a **sparkline SVG chart** showing the trend.

### Analytics Page Shows

- 7-day score trend (bar chart)
- Communication breakdown: Fluency, Confidence, Clarity, Technical, Overall
- Skill analysis: ranked by score with Strong / Medium / Weak tags
- 7-week practice heatmap
- Last 5 interview sessions with scores

---

## 10. AUTHENTICATION

| Method | How It Works |
|---|---|
| Email / Password | bcrypt hashed password, JWT issued on login |
| Google OAuth 2.0 | Passport.js strategy, creates user if not exists |
| Microsoft OAuth | Passport.js strategy, links via email |

JWT stored in localStorage. Sent as `Authorization: Bearer <token>` on every API call. Auto-redirect to `/login` on 401 response (except auth endpoints themselves).

---

## 11. REAL-TIME ARCHITECTURE SUMMARY

Three separate Socket.IO namespaces / room patterns:

| Module | Room Pattern | Key Events |
|---|---|---|
| Live Test | `live-test:{testId}` | leaderboard update, violation, test start |
| GD | `gd:{roomId}` | WebRTC signaling, media state, chat, kick |
| GTG | `gtg:{roomId}` | WebRTC signaling, media state, chat, bell |

**Broadcast Patterns:**
- Room-wide: Most events go to all members in the room
- Targeted: WebRTC offers and answers sent to specific peer by userId
- Host-only: Force-media and kick events

---

## 12. SECURITY MEASURES

| Area | Measure |
|---|---|
| Passwords | bcrypt hashing |
| API Auth | JWT Bearer tokens |
| Social Login | OAuth 2.0 (Google + Microsoft) |
| Live Test Sessions | UUID session tokens per participant |
| Anti-Cheat | Fullscreen + tab detection + auto-disqualification |
| Timer | Server-driven (client cannot manipulate) |
| File Upload | Type and size validation (PDF/DOC/DOCX, max 5MB) |
| Chat | Profanity filter + minimum length + spam cooldown |
| Input | Join code sanitization, answer normalization |

---

## 13. PERFORMANCE OPTIMIZATIONS

| Optimization | Where Used |
|---|---|
| Dirty answer tracking (ref, not state) | Live Test — avoids re-renders |
| 5-second heartbeat debounce | Live Test — reduces DB writes |
| Seeded shuffle | Live Test — reproducible question order |
| useMemo for computed values | Live Test, Take Test |
| Adaptive question reordering | Take Test — only reorders remaining |
| Sparkline SVG (no chart library) | Dashboard — lightweight |
| 2-second violation cooldown | Anti-Cheat — prevents event stacking |
| 800ms speaking detection debounce | GD — prevents UI flicker |

---

## 14. KEY NUMBERS FOR YOUR PRESENTATION

| Metric | Value |
|---|---|
| Total questions in bank | 349 |
| Live test difficulty split | 40% Easy / 40% Medium / 20% Hard |
| Leaderboard sort levels | 3 (score → time → submission time) |
| Max GD participants (mesh) | 6 |
| WebRTC STUN servers | 6 |
| Anti-cheat max warnings | 3 |
| Answer sync interval | 4 seconds |
| GD scoring weights | 40% participation / 30% communication / 30% relevance |
| Violation cooldown | 2 seconds |
| Speaking detection threshold | Frequency amplitude > 20 |
| Speaking detection debounce | 800ms |
| Chat minimum length | 10 characters |
| Chat spam cooldown | 3 seconds |
| Bell warning before end | 2 minutes |
| Resume max file size | 5MB |

---

## 15. DATA FLOW DIAGRAMS

### Live Test Flow

```
1. CREATE TEST
   Host selects: categories, topics, question count
   Server: samples questions by difficulty → generates join code → saves to DB

2. JOIN TEST
   Participant enters join code
   Server: creates LiveTestAttempt → returns session payload

3. WAITING ROOM
   Participants wait → Terms Modal shown → accepted
   Host clicks Start → server sets status = "live" → emits testStarted

4. TAKE TEST
   Questions displayed → answers selected
   Dirty answers flushed every 4 seconds
   Server-driven countdown running

5. SUBMIT
   Server evaluates answers → calculates score and rank
   Leaderboard broadcast via Socket.IO
   Participant redirected to leaderboard page
```

---

### AI Interview Flow

```
1. SETUP
   User selects role, skills, difficulty, mode, count

2. QUESTION LOOP
   Display question (intro → technical → problem solving → behavioural)
   User types or speaks answer
   Score calculated: length + structure + depth (0–10)
   Feedback shown
   Move to next question

3. RESULTS
   Overall score (0–100%)
   Communication: fluency, confidence, clarity
   Per-answer feedback
   Skill tags and role summary
```

---

### GD Flow

```
1. CREATE ROOM
   Host enters title, topic, duration (10/15/20 min)
   Server generates join code

2. JOIN ROOM
   Participants enter code + name
   WebRTC peer connections established (mesh)
   Video grid displayed

3. DISCUSSION
   Host starts timer
   Participants chat + video
   2-minute bell warning fires
   Auto-end on timer expiry

4. SCORING
   Server calculates participation, communication, relevance
   Ranks all participants
   Results saved to MongoDB
   All redirected to results page
```

---

*Document generated for IntervAI presentation — May 2026*
