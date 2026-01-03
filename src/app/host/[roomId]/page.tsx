"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HostPage() {
  const { roomId } = useParams<{ roomId: string }>();

  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [limit, setLimit] = useState(10);

  /* ---------------- LOAD QUESTIONS ---------------- */

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

  /* ---------------- ADD QUESTION ---------------- */

  const addQuestion = async () => {
    if (!newQuestion.trim()) return;

    const { data, error } = await supabase
      .from("questions")
      .insert({
        room_id: roomId,
        text: newQuestion.trim(),
        order_index: questions.length + 1,
        max_options: limit,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Failed to add question");
      return;
    }

    // 🔑 Update UI immediately
    setQuestions(prev => [...prev, data]);
    setNewQuestion("");
  };

  /* ---------------- PUBLISH ROOM ---------------- */

  const publish = async () => {
    const { error } = await supabase
      .from("rooms")
      .update({ status: "live" })
      .eq("id", roomId);

    if (error) {
      alert("Failed to publish room");
      return;
    }

    alert("Room is live!");
  };

  /* ---------------- RENDER ---------------- */

  return (
    <main className="p-6 bg-slate-900 text-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Host Dashboard</h1>

        {/* ADD QUESTION */}
        <div className="bg-slate-800 p-4 rounded mb-6">
          <input
            className="w-full p-3 bg-slate-700 rounded mb-3"
            placeholder="Enter question"
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
          />

          <select
            className="w-full p-3 bg-slate-700 rounded mb-3"
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

        {/* QUESTION LIST */}
        {Array.isArray(questions) &&
          questions
            .filter(Boolean)
            .map(q => (
              <div
                key={q.id}
                className="bg-slate-800 p-3 rounded mb-2"
              >
                {q.order_index}. {q.text}
              </div>
            ))}

        {/* PUBLISH */}
        <button
          onClick={publish}
          className="mt-6 w-full bg-green-600 py-3 rounded font-bold"
        >
          Publish Room
        </button>

        {/* SHARE LINK */}
        <div className="mt-6 bg-slate-800 p-4 rounded border border-slate-700">
          <p className="font-bold mb-2 text-orange-500">
            Share this link with players:
          </p>

          <input
            readOnly
            value={
              typeof window !== "undefined"
                ? `${window.location.origin}/play/${roomId}`
                : ""
            }
            className="w-full p-2 rounded bg-slate-700 text-sm cursor-pointer"
            onClick={e => {
              e.currentTarget.select();
              navigator.clipboard.writeText(e.currentTarget.value);
            }}
          />

          <p className="text-xs text-slate-400 mt-2">
            Click to copy the URL
          </p>
        </div>
      </div>
    </main>
  );
}
