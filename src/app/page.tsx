"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [passkey, setPasskey] = useState("");

  const createRoom = async () => {
    if (!roomName || passkey.length !== 10) {
      alert("Room name + 10-char passkey required");
      return;
    }

    const { data } = await supabase
      .from("rooms")
      .insert({ room_name: roomName, passkey })
      .select()
      .single();

    router.push(`/host/${data.id}`);
  };

  const adminLogin = async () => {
    const { data } = await supabase
      .from("rooms")
      .select("id")
      .eq("passkey", passkey)
      .single();

    if (!data) return alert("Invalid passkey");

    router.push(`/admin?room=${data.id}&passkey=${passkey}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded space-y-4">
        <h1 className="text-2xl font-bold">🔥 HotShot</h1>

        <input
          className="w-full p-3 rounded bg-slate-700"
          placeholder="Room name"
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-slate-700"
          placeholder="10-char passkey"
          value={passkey}
          onChange={e => setPasskey(e.target.value)}
        />

        <button
          onClick={createRoom}
          className="w-full bg-orange-600 py-3 rounded font-bold"
        >
          Create Room
        </button>

        <button
          onClick={adminLogin}
          className="w-full bg-slate-600 py-2 rounded"
        >
          Admin Login
        </button>
      </div>
    </main>
  );
}
