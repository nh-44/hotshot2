"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();

  const [roomName, setRoomName] = useState("");
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);

  const createRoom = async () => {
    const cleanRoom = roomName.trim();
    const cleanPasskey = passkey.trim();

    if (!cleanRoom || cleanPasskey.length !== 10) {
      alert("Room name and a 10-character passkey are required");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        room_name: cleanRoom,
        passkey: cleanPasskey,
        status: "draft",
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        alert("Room name already exists. Choose a different name.");
        return;
      }

      console.error(error);
      alert("Failed to create room");
      return;
    }

    router.push(`/host/${data.id}`);
  };

  const adminLogin = async () => {
    const cleanPasskey = passkey.trim();

    if (cleanPasskey.length !== 10) {
      alert("Enter a valid 10-character passkey");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("rooms")
      .select("id")
      .eq("passkey", cleanPasskey)
      .limit(1);

    setLoading(false);

    if (error || !data || data.length === 0) {
      alert("Invalid passkey");
      return;
    }

    router.push(`/admin?room=${data[0].id}&passkey=${cleanPasskey}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <div className="max-w-md w-full bg-slate-800 p-6 rounded space-y-4 border border-slate-700">
        <h1 className="text-2xl font-bold text-orange-500 text-center">
          🔥 HotShot
        </h1>

        <input
          className="w-full p-3 rounded bg-slate-700"
          placeholder="Room name"
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-slate-700"
          placeholder="10-character passkey"
          value={passkey}
          onChange={e => setPasskey(e.target.value)}
        />

        <button
          onClick={createRoom}
          disabled={loading}
          className="w-full bg-orange-600 py-3 rounded font-bold disabled:opacity-50"
        >
          Create Room
        </button>

        <button
          onClick={adminLogin}
          disabled={loading}
          className="w-full bg-slate-600 py-2 rounded disabled:opacity-50"
        >
          Admin Login
        </button>
      </div>
    </main>
  );
}
