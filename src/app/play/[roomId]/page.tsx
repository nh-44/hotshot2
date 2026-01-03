"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSessionToken } from "@/lib/session";
import AddOption from "@/components/AddOption";

export default function PlayPage() {
  const { roomId } = useParams<{ roomId: string }>();

  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);

  const [questions, setQuestions] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);

  const [index, setIndex] = useState(0);
  const [voted, setVoted] = useState(false);

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

  /* ---------------- SAFE CURRENT QUESTION ---------------- */

  const question =
    Array.isArray(questions) && index >= 0 && index < questions.length
      ? questions[index]
      : null;

  /* ---------------- LOAD OPTIONS ---------------- */

  useEffect(() => {
    if (!question) {
      setOptions([]);
      return;
    }

    supabase
      .from("options")
      .select("*")
      .eq("question_id", question.id)
      .then(({ data }) => {
        setOptions(Array.isArray(data) ? data : []);
      });
  }, [question]);

  /* ---------------- JOIN ROOM ---------------- */

  const join = async () => {
    if (!name.trim()) return;

    await supabase.from("players").insert({
      room_id: roomId,
      name,
      session_token: getSessionToken(roomId),
    });

    setJoined(true);
  };

  /* ---------------- VOTE ---------------- */

  const vote = async (optionId: string) => {
    if (!question || voted) return;

    await supabase.from("votes").insert({
      room_id: roomId,
      question_id: question.id,
      option_id: optionId,
    });

    setVoted(true);
  };

  /* ---------------- ADD OPTION + VOTE ---------------- */

  const addOptionAndVote = async (text: string) => {
    if (!question || voted || !text.trim()) return;

    const { data: option } = await supabase
      .from("options")
      .insert({
        question_id: question.id,
        text,
        created_by: name,
      })
      .select()
      .single();

    if (!option) return;

    await supabase.from("votes").insert({
      room_id: roomId,
      question_id: question.id,
      option_id: option.id,
    });

    setVoted(true);
  };

  /* ---------------- JOIN SCREEN ---------------- */

  if (!joined) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-900 text-white p-6">
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

  /* ---------------- FINISH SCREEN ---------------- */

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-2xl font-bold">
        🎉 You finished!
      </div>
    );
  }

  /* ---------------- QUESTION SCREEN ---------------- */

  return (
    <main className="p-6 bg-slate-900 text-white min-h-screen">
      <div className="max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-4">
          {index + 1}. {question.text}
        </h2>

        {Array.isArray(options) &&
          options
            .filter(Boolean)
            .map(o => (
              <div
                key={o.id}
                onClick={() => vote(o.id)}
                className={`bg-slate-800 p-3 rounded mb-2 ${
                  voted
                    ? "opacity-60"
                    : "cursor-pointer hover:bg-slate-700"
                }`}
              >
                {o.text}
              </div>
            ))}

        {!voted && options.length < (question.max_options || 15) && (
          <div className="mt-4">
            <p className="text-sm text-slate-400 mb-2 italic text-center">
              Or add your own:
            </p>
            <AddOption onAdd={addOptionAndVote} />
          </div>
        )}

        <button
          disabled={!voted}
          onClick={() => {
            setIndex(i => i + 1);
            setVoted(false);
          }}
          className="mt-6 bg-green-600 py-2 px-6 rounded font-bold disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </main>
  );
}
