# 🔥 HotShot

**HotShot** is a lightweight, high-performance **audience interaction and live polling platform**. It empowers organizers to crowdsource ideas in real-time by allowing participants to not only vote on existing choices but also contribute their own responses.

---

## 🚀 Quick Links
- **Tech Stack**: Next.js 15+, Supabase, Tailwind CSS, Recharts
- **Key Logic**: Crowdsourced option creation with session-based identity
- **Deployment**: Optimized for Vercel

---

## ✨ Features

### 🎙️ For the Organizer (Host)
* **Secure Room Setup**: Create rooms with a **unique room name** and a private **10-character passkey**.
* **Dynamic Question Builder**: Add multiple questions with custom **maximum option limits** (5, 10, or 15).
* **Crowdsourced Logic**: Pre-fill preset options or allow the first responder to define the initial choice.
* **One-Click Sharing**: Share `/play/[roomId]` responder links instantly with a one-click copy tool.
* **Data Portability**: Download results as a **CSV** containing player names, questions, and selected options.

### 🎮 For the Participants (Responders)
* **Zero-Friction Entry**: No login or OAuth required; join simply by entering a name.
* **Evolutionary Polling**: Choose from existing options or add a completely new response for others to vote on.
* **Identity Protection**: Session tokens ensure one vote per question per participant to prevent duplicate voting.

### 📊 Admin Dashboard
* **Passkey Protection**: Secured access to sensitive result data using the room's unique passkey.
* **Visual Analytics**: Gamified result visualization with **Pie charts** and **Bar charts**.
* **Probability Tables**: View options broken down by vote percentages in an animated table.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Next.js 15+](https://nextjs.org/) (App Router) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Charts** | [Recharts](https://recharts.org/) |
| **CSV Engine** | [PapaParse](https://www.papaparse.com/) |
| **Auth** | Session-based Identity (UUID) |

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── page.tsx               # Home (Create Room / Admin Login)
│   ├── host/[roomId]/         # Host Dashboard (Question Management)
│   ├── play/[roomId]/         # Participant Voting Interface
│   └── admin/                 # Results, Charts, and CSV Export
├── components/                # Reusable UI (AddOption.tsx, PieChart.tsx)
├── lib/                       # Supabase client, Session, and CSV helpers
└── types/                     # TypeScript Interfaces
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
```
--------------------

### Typical Flow

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
