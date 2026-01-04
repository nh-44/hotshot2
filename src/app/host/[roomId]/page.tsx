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

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [newOption, setNewOption] = useState("");

  /* ---------- LOAD ROOM ---------- */
  useEffect(() => {
    if (!roomId) return;

    supabase
      .from("rooms")
      .select("*")
      .eq("id", roomId)
      .single()
      .then(({ data }) => setRoom(data));
  }, [roomId]);

  /* ---------- LOAD QUESTIONS ---------- */
  useEffect(() => {
    if (!roomId) return;

    supabase
      .from("questions")
      .select("*")
      .eq("room_id", roomId)
      .order("order_index")
      .then(({ data }) => setQuestions(data || []));
  }, [roomId]);

  /* ---------- ADD QUESTION ---------- */
  const addQuestion = async () => {
    if (!newQuestion.trim()) return;

    const { data, error } = await supabase
      .from("questions")
      .insert({
        room_id: roomId,
        text: newQuestion.trim(),
        max_options: limit,
        order_index: questions.length + 1,
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

  /* ---------- ADD PRESET OPTION ---------- */
  const addPresetOption = async () => {
    if (!newOption.trim() || !activeQuestionId) return;

    const { error } = await supabase.from("options").insert({
      question_id: activeQuestionId,
      text: newOption.trim(),
      is_preset: true,
    });

    if (error) {
      alert("Failed to add option");
      return;
    }

    setNewOption("");
  };

  /* ---------- PUBLISH ---------- */
  const publishRoom = async () => {
    if (questions.length === 0) {
      alert("Add at least one question");
      return;
    }

    await supabase
      .from("rooms")
      .update({ status: "live" })
      .eq("id", roomId);

    setRoom((r: any) => ({ ...r, status: "live" }));
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading…
      </div>
    );
  }

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
              className="w-full p-3 bg-slate-700 rounded"
              placeholder="Enter question"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
            />

            <select
              className="w-full p-3 bg-slate-700 rounded"
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

        {/* QUESTIONS + PRESET OPTIONS */}
        {questions.map(q => (
          <div key={q.id} className="bg-slate-800 p-4 rounded space-y-2">
            <p className="font-semibold">
              {q.order_index}. {q.text}
            </p>

            <button
              onClick={() => setActiveQuestionId(q.id)}
              className="text-sm text-orange-400 underline"
            >
              Add preset options
            </button>

            {activeQuestionId === q.id && (
              <div className="space-y-2">
                <input
                  className="w-full p-2 bg-slate-700 rounded"
                  placeholder="Preset option text"
                  value={newOption}
                  onChange={e => setNewOption(e.target.value)}
                />
                <button
                  onClick={addPresetOption}
                  className="bg-green-600 px-3 py-1 rounded text-sm"
                >
                  Add Option
                </button>
              </div>
            )}
          </div>
        ))}

        {/* PUBLISH */}
        {room.status === "draft" ? (
          <button
            onClick={publishRoom}
            className="w-full bg-green-600 py-3 rounded font-bold"
          >
            Publish Room
          </button>
        ) : (
          <div className="bg-slate-800 p-4 rounded border border-slate-700 space-y-2">
            <p className="font-bold text-green-400">✅ Room is LIVE</p>
            <input
              readOnly
              value={`${window.location.origin}/play/${roomId}`}
              className="w-full p-2 bg-slate-700 rounded cursor-pointer"
              onClick={e => {
                e.currentTarget.select();
                navigator.clipboard.writeText(e.currentTarget.value);
                alert("Link copied");
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
