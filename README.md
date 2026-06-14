# ATR — Academic & Technical Roadmap Tracker (V4)

Welcome to **ATR V4**, an execution-first professional career roadmap tracking platform. Styled with a premium, minimal "Gen-Z Professional" dark aesthetic (inspired by Vercel, Linear, and Notion), ATR helps B.Tech students systematically manage daily roadmaps, DSA progress, Aptitude syllabus, and college attendance.

---

## 🚀 Key Specifications & Features

### 1. Today's Command Center (Dashboard)
* **Status Grid**: Displays key metrics at a glance:
  * 🔥 **Current Streak**: Computed daily (streak increases or holds if target score $\ge 75\%$, otherwise resets).
  * 📅 **Roadmap Day**: Tracks day counter progress (Day $X$ / 504 days total).
  * 🎯 **Phase & Week**: Shows active timeline boundaries (Phase 1–15, Weeks 1–70).
  * 🏫 **Attendance %**: Fast readout of semester-wide attendance tracking.
* **Daily Execution Checklist**: Automatically generates exactly 5 specific, structured subtopics for today (Development, DSA, Aptitude, IP Skills, and English).
* **Expected vs Actual Analytics**: Compares estimated progress against actual completed items, rendering the **Gap %** ($Expected - Actual$) alongside a 30-day historical chart.

### 2. Roadmap Overview (Calendar)
* **Weekly Accordions**: 70 global weeks are organized in collapsible accordions mapping to the current month/phase goals.
* **Subtopic Checkbox Tracking**: Each subtopic includes a checkbox. Completing all subtopics under a category automatically completes the parent topic, dynamically updating Week, Month, and Phase completion percentages.

### 3. DSA Page
* **Accordion Syllabus**: Standardized 15 main DSA topics (Arrays, Strings, Linked Lists, Stack, Queue, Binary Search, Recursion, Trees, BST, Heap, Graphs, Greedy, DP, Trie, Segment Tree).
* **Direct Counters**: Added manual `[-] Questions Done [+]` controls at both parent topic and subtopic levels to quickly log progress.

### 4. Aptitude Page
* **Syllabus Grouping**: Organizes chapters into the 4 standard textbook parts:
  * **Part 1**: Quantitative Aptitude (12 chapters)
  * **Part 2**: Analytical Reasoning (15 chapters)
  * **Part 3**: Grammar & Reading Comprehension (14 chapters)
  * **Part 4**: Vocabulary (4 chapters)
* **Metric Tracker Forms**: Track `[-] Questions Solved [+]` count (primary metric), Accuracy % rate, Revision Count, and custom Formula/Review notes.

---

## 🏫 Attendance Logic & Calculations

The attendance subsystem features a robust scheduler-aware tracking engine designed to keep students informed of their status.

### 1. Overall Percentage Calculation
Overall attendance is calculated as the total present periods divided by the total class periods, rounded to one decimal place:
$$\text{Overall Attendance \%} = \frac{\text{Total Present Periods}}{\text{Total Class Periods}} \times 100$$

### 2. Status Thresholds
* 🟢 **SAFE**: Overall Attendance $\ge 76\%$
* 🟡 **WARNING**: Overall Attendance $< 76\%$ and $\ge 70\%$
* 🔴 **DANGER**: Overall Attendance $< 70\%$

### 3. Mathematical Predictions (Buffer & Consecutive Attendance)
To help students maintain target attendance boundaries, ATR calculates action items dynamically:

#### A. If Attendance is Safe ($\ge 76\%$)
Computes the maximum number of periods a student can **miss** before dropping below the safe threshold of 76%:
$$\text{Max Missable Periods} = \left\lfloor \frac{(\text{Total Present} \times 100) - (76 \times \text{Total Periods})}{76} \right\rfloor$$

#### B. If Attendance is Warning/Danger ($< 76\%$)
Computes the exact number of **consecutive** class periods a student must attend to raise their attendance back up to the safe 76% threshold:
$$\text{Min Consecutive Attended Needed} = \left\lceil \frac{(76 \times \text{Total Periods}) - (100 \times \text{Total Present})}{24} \right\rceil$$
*(Derived from $\frac{P + x}{T + x} \ge 0.76$, solving for $x$.)*

---

### 4. Daily Entry Reversion & Double-Counting Prevention
When a user updates an attendance entry for a specific date, the server implements **automatic reversion logic**:
1. Checks if an attendance entry already exists for that date.
2. If found, the server retrieves the logged periods for each subject and **subtracts** (reverses) them from the database counters.
3. The new log's values are then **applied** (added) to the database counters, preventing double-counting if a date is updated multiple times.

### 5. Day-wise vs Subject-wise Logging
* **Full-Day Log (Present/Absent/Holiday)**: The server checks the subjects scheduled for that day of the week. It adds the scheduled period counts of all subjects to `totalPeriods` (and to `presentPeriods` if "Present").
* **Subject-wise Log**: Users select specific subjects. The server logs the scheduled period count for that day of the week (defaulting to `1` period if the subject has no classes scheduled on that day).

---

## 🛠️ Development Setup

### Technical Stack
* **Frontend**: React (Vite), TailwindCSS, Recharts, Lucide Icons.
* **Backend**: Node.js, Express, Mongoose (MongoDB).
* **Database**: Supports MongoDB Atlas in production and `mongodb-memory-server` in development for zero-config fallback.

### Running Locally
1. Install dependencies:
   ```bash
   npm run install-all
   ```
2. Start development servers concurrently:
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5173`
   * Backend API: `http://localhost:5000`
3. Seeding local database:
   ```bash
   npm run seed --prefix server
   ```
