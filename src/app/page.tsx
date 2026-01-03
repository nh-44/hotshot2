"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getSessionToken } from "@/lib/session";

export default function HomePage() {
  const router = useRouter();

  const [roomName, setRoomName] = useState("");
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomName.trim() || !passkey.trim()) {
      alert("Room name and passkey are required");
      return;
    }

    setLoading(true);

    const hostSession = getSessionToken("host");

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        room_name: roomName.trim(),
        passkey: passkey.trim(),
        status: "draft",
        host_session: hostSession,
      })
      .select()
      .single();

    if (error) {
      console.error("CREATE ROOM ERROR:", error);
      alert(error.message);
      setLoading(false);
      return;
    }

    // ✅ Redirect host to room setup screen
    router.push(`/room/${data.id}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 p-6 text-white">
      <form
        onSubmit={createRoom}
        className="w-full max-w-md bg-slate-800 p-8 rounded-xl space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">🔥 HotShot</h1>

        <input
          className="w-full p-3 rounded bg-slate-700"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-slate-700"
          placeholder="Admin passkey"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 py-3 rounded font-bold disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Room"}
        </button>
      </form>
    </main>
  );
}
