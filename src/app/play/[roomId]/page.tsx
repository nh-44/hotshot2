"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSessionToken } from "@/lib/session";
import AddOption from "@/components/AddOption";

export default function PlayPage() {
  const { roomId } = useParams<{ roomId: string }>();

  const [room, setRoom] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ROOM ================= */

  useEffect(() => {
    if (!roomId) return;

    supabase
      .from("rooms")
      .select("status")
      .eq("id", roomId)
      .single()
      .then(({ data }) => {
        setRoom(data);
        setLoading(false);
      });
  }, [roomId]);

  /* ================= LOAD QUESTIONS ================= */

  useEffect(() => {
    if (!roomId) return;

    supabase
      .from("questions")
      .select("*")
      .eq("room_id", roomId)
      .order("order_index")
      .then(({ data }) => {
        setQuestions(Array.isArray(data) ? data : []);
      });
  }, [roomId]);

  /* ================= CURRENT QUESTION ================= */

  const question =
    index >= 0 && index < questions.length ? questions[index] : null;

  /* ================= LOAD OPTIONS ================= */

  useEffect(() => {
    if (!question) {
      setOptions([]);
      return;
    }

    supabase
      .from("options")
      .select("*")
      .eq("question_id", question.id)
      // ✅ PRESET OPTIONS FIRST
      .order("is_preset", { ascending: false })
      .then(({ data }) => {
        setOptions(Array.isArray(data) ? data : []);
      });
  }, [question]);

  /* ================= JOIN ROOM ================= */

  const join = async () => {
    if (!name.trim()) return;

    const sessionToken = getSessionToken(roomId);

    const { error: insertError } = await supabase
      .from("players")
      .insert({
        room_id: roomId,
        name: name.trim(),
        session_token: sessionToken,
      });

    // Ignore duplicate join
    if (insertError && insertError.code !== "23505") {
      console.error("PLAYER INSERT ERROR:", insertError);
      alert("Failed to join room");
      return;
    }

    const { data: player, error: fetchError } = await supabase
      .from("players")
      .select("id")
      .eq("room_id", roomId)
      .eq("session_token", sessionToken)
      .single();

    if (fetchError || !player) {
      console.error("PLAYER FETCH ERROR:", fetchError);
      alert("Failed to load player");
      return;
    }

    setPlayerId(player.id);
    setJoined(true);
  };

  /* ================= VOTE ================= */

  const vote = async (optionId: string) => {
    if (!question || !playerId || voted) return;

    // ✅ HARD GUARD AGAINST DOUBLE CLICK
    setVoted(true);

    const { error } = await supabase.from("votes").insert({
      room_id: roomId,
      question_id: question.id,
      option_id: optionId,
      player_id: playerId,
    });

    if (error) {
      console.error("VOTE INSERT ERROR:", error);
      setVoted(false);
    }
  };

  /* ================= ADD OPTION + VOTE ================= */

  const addOptionAndVote = async (text: string) => {
    if (!question || !playerId || voted || !text.trim()) return;

    // ✅ HARD GUARD AGAINST DOUBLE CLICK
    setVoted(true);

    const { data: option, error: optError } = await supabase
      .from("options")
      .insert({
        question_id: question.id,
        text: text.trim(),
        created_by: playerId,
        is_preset: false,
      })
      .select()
      .single();

    if (optError || !option) {
      console.error("OPTION INSERT ERROR:", optError);
      setVoted(false);
      return;
    }

    const { error: voteError } = await supabase.from("votes").insert({
      room_id: roomId,
      question_id: question.id,
      option_id: option.id,
      player_id: playerId,
    });

    if (voteError) {
      console.error("VOTE INSERT ERROR:", voteError);
      setVoted(false);
    }
  };

  /* ================= RENDER ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading…
      </div>
    );
  }

  if (!room || room.status !== "live") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        ⏳ This room is not live yet
      </div>
    );
  }

  if (!joined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
        <div className="bg-slate-800 p-6 rounded w-full max-w-sm">
          <input
            className="w-full p-3 mb-4 bg-slate-700 rounded"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button
            onClick={join}
            className="w-full bg-orange-600 py-3 rounded font-bold"
          >
            Start
          </button>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-2xl font-bold">
        🎉 You finished!
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">
          {index + 1}. {question.text}
        </h2>

        {options.map(o => (
          <div
            key={o.id}
            onClick={() => vote(o.id)}
            className={`bg-slate-800 p-3 rounded mb-2 ${
              voted ? "opacity-60" : "cursor-pointer hover:bg-slate-700"
            }`}
          >
            {o.text}
          </div>
        ))}

        {!voted && options.length < (question.max_options || 15) && (
          <AddOption onAdd={addOptionAndVote} />
        )}

        <button
          disabled={!voted}
          onClick={() => {
            setIndex(i => i + 1);
            setVoted(false);
          }}
          className="mt-6 bg-green-600 py-2 px-6 rounded font-bold disabled:opacity-50"
        >
          {index === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </main>
  );
}
