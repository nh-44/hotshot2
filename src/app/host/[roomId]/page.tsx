"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HostPage() {
  const { roomId } = useParams<{ roomId: string }>();

  const [room, setRoom] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [limit, setLimit] = useState(10);
  const [publishing, setPublishing] = useState(false);

  /* ================= LOAD ROOM ================= */

  useEffect(() => {
    if (!roomId) return;

    supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single()
      .then(({ data }) => setRoom(data));
  }, [roomId]);

  /* ================= LOAD QUESTIONS ================= */

  useEffect(() => {
    if (!roomId) return;

    supabase
      .from("questions")
      .select("*")
      .eq("room_id", roomId)
      .order("order_index")
      .then(({ data }) => setQuestions(data || []));
  }, [roomId]);

  /* ================= ADD QUESTION ================= */

  const addQuestion = async () => {
    if (!newQuestion.trim()) return;

    const orderIndex = questions.length + 1;

    const { data, error } = await supabase
      .from("questions")
      .insert({
        room_id: roomId,
        text: newQuestion.trim(),
        max_options: limit,
        order_index: orderIndex,
      })
      .select()
      .single();

    if (error || !data) {
      alert("Failed to add question");
      return;
    }

    setQuestions(prev => [...prev, data]);
    setNewQuestion("");
  };

  /* ================= PUBLISH ROOM ================= */

  const publishRoom = async () => {
    if (questions.length === 0) {
      alert("Add at least one question before publishing");
      return;
    }

    setPublishing(true);

    const { error } = await supabase
      .from("rooms")
      .update({ status: "live" })
      .eq("id", roomId);

    setPublishing(false);

    if (error) {
      alert("Failed to publish room");
      return;
    }

    setRoom((r: any) => ({ ...r, status: "live" }));
  };

  /* ================= LOADING ================= */

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading…
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-orange-500">
          Host Dashboard
        </h1>

        {/* ADD QUESTION */}
        {room.status === "draft" && (
          <div className="bg-slate-800 p-4 rounded space-y-3">
            <input
              className="w-full p-3 rounded bg-slate-700"
              placeholder="Enter question"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
            />

            <select
              className="w-full p-3 rounded bg-slate-700"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
            >
              <option value={5}>5 options</option>
              <option value={10}>10 options</option>
              <option value={15}>15 options</option>
            </select>

            <button
              onClick={addQuestion}
              className="w-full bg-orange-600 py-2 rounded font-bold"
            >
              Add Question
            </button>
          </div>
        )}

        {/* QUESTION LIST */}
        <div className="space-y-2">
          {questions.map(q => (
            <div
              key={q.id}
              className="bg-slate-800 p-3 rounded text-sm"
            >
              {q.order_index}. {q.text}
            </div>
          ))}
        </div>

        {/* PUBLISH / SHARE */}
        {room.status === "draft" ? (
          <button
            onClick={publishRoom}
            disabled={publishing}
            className="w-full bg-green-600 py-3 rounded font-bold disabled:opacity-50"
          >
            Publish Room
          </button>
        ) : (
          <div className="bg-slate-800 p-4 rounded border border-slate-700 space-y-2">
            <p className="font-bold text-green-400">
              ✅ Room is LIVE
            </p>

            <p className="text-sm text-slate-300">
              Share this link with players:
            </p>

            <input
              readOnly
              value={
                typeof window !== "undefined"
                  ? `${window.location.origin}/play/${roomId}`
                  : ""
              }
              className="w-full p-2 rounded bg-slate-700 text-sm border border-slate-600 cursor-pointer"
              onClick={e => {
                e.currentTarget.select();
                navigator.clipboard.writeText(e.currentTarget.value);
                alert("Link copied to clipboard!");
              }}
            />

            <p className="text-xs text-slate-400">
              Click the box to copy
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
