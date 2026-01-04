# 🔥 HotShot

HotShot is a lightweight **audience interaction & live polling platform**.  
An organizer creates a room, adds questions with preset options, publishes it, and participants vote or add their own responses. Results are visualized live and exportable as CSV.

Built using **Next.js (App Router)** and **Supabase**.

---

## ✨ Features

### 👤 Organizer (Host)
- Create a room with a **unique room name** and **10-character passkey**
- Add multiple questions
- Set **maximum options per question**
- Add **preset options** for each question
- Publish the room when ready
- Share responder link with **one-click copy**
- View results in an admin dashboard
- Download results as **CSV**

### 🧑 Participants (Responders)
- Join via shared link
- Enter name (no login required)
- Choose preset options or add their own
- One vote per question per participant
- Session-based identity to prevent duplicate voting

### 📊 Admin Dashboard
- Passkey-protected access
- Pie-chart visualization per question
- CSV export containing:
  - Player name
  - Question text
  - Selected option

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router, Client Components)
- **Backend / Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **CSV Export**: PapaParse
- **Styling**: Tailwind CSS
- **Auth (Lightweight)**: Session token (no OAuth)

---

## 📁 Project Structure

src/
├── app/
│ ├── page.tsx # Home (Create Room / Admin Login)
│ ├── host/[roomId]/page.tsx # Host dashboard
│ ├── play/[roomId]/page.tsx # Player voting page
│ └── admin/
│ ├── page.tsx
│ └── AdminClient.tsx # Results + charts + CSV
│
├── components/
│ └── AddOption.tsx
│
├── lib/
│ ├── supabase.ts
│ └── session.ts


---

## 🗄 Database Schema (Core Tables)

### rooms
- `id`
- `room_name` (unique, case-insensitive)
- `passkey`
- `status` (`draft` | `live`)

### questions
- `id`
- `room_id`
- `text`
- `order_index`
- `max_options`

### options
- `id`
- `question_id`
- `text`
- `is_preset`
- `created_by`

### players
- `id`
- `room_id`
- `name`
- `session_token`

### votes
- `id`
- `room_id`
- `question_id`
- `option_id`
- `player_id`

**Constraints**
- One vote per player per question
- Foreign keys enforced for all relations

---

## 🔐 Data Integrity & Safety

- Session token ensures one vote per user per question
- Database uniqueness constraints prevent duplicate voting
- Preset options + custom options supported
- Admin access validated via room ID + passkey
- Client & database checks for race conditions

---

## 🚀 Getting Started

1️⃣ Clone the repository
git clone <your-repo-url>
cd hotshot

2️⃣ Install dependencies
npm install

3️⃣ Configure Supabase - Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

4️⃣ Run locally
npm run dev
--------------------

🧪 Typical Flow

Organizer creates a room
Adds questions and preset options
Publishes the room
Shares /play/[roomId] link
Participants join and vote
Organizer views results at /admin
CSV downloaded if needed

------------------------
### Future Enhancements 
OAuth (Google / GitHub)
Live realtime result updates
Host-controlled voting timers
Result anonymization
Mobile-first UI polish
