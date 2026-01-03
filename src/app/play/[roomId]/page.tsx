"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSessionToken } from "@/lib/session";
import AddOption from "@/components/AddOption";


export default function PlayPage() {
  const { roomId } = useParams();
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    supabase
      .from("questions")
      .select("*")
      .eq("room_id", roomId)
      .order("order_index")
      .then(({ data }) => setQuestions(data || []));
  }, [roomId]);

  const question = questions[index];

  useEffect(() => {
    if (!question) return;

    supabase
      .from("options")
      .select("*")
      .eq("question_id", question.id)
      .then(({ data }) => setOptions(data || []));
  }, [question]);

  const join = async () => {
    await supabase.from("players").insert({
      room_id: roomId,
      name,
      session_token: getSessionToken(roomId as string),
    });
    setJoined(true);
  };

  const vote = async (optionId: string) => {
    await supabase.from("votes").insert({
      room_id: roomId,
      question_id: question.id,
      option_id: optionId,
    });
    setVoted(true);
  };
  const addOptionAndVote = async (text: string) => {
  if (!text.trim() || voted) return;

  // 1. Create option
  const { data: option } = await supabase
    .from("options")
    .insert({
      question_id: question.id,
      text,
      created_by: name,
    })
    .select()
    .single();

  // 2. Record vote
    await supabase.from("votes").insert({
    room_id: roomId,
    question_id: question.id,
    option_id: option.id,
  });

  setVoted(true);
};


  if (!joined) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="bg-slate-800 p-6 rounded w-80">
          <input
            className="w-full p-3 mb-4 bg-slate-700 rounded"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button
            onClick={join}
            className="w-full bg-orange-600 py-3 rounded"
          >
            Start
          </button>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        🎉 You finished!
      </div>
    );
  }

  return (
    <main className="p-6 bg-slate-900 text-white min-h-screen">
      <h2 className="text-xl font-bold mb-4">{question.text}</h2>

      {options.map(o => (
        <div
          key={o.id}
          onClick={() => vote(o.id)}
          className="bg-slate-800 p-3 rounded mb-2 cursor-pointer"
        >
          {o.text}
        </div>
      ))}

      {!voted && options.length < (question.max_options || 15) && (
        <div className="mt-4">
          <p className="text-sm text-slate-400 mb-2 italic text-center">Or add your own:</p>
          <AddOption onAdd={addOptionAndVote} />
        </div>
      )}

      <button
        disabled={!voted}
        onClick={() => {
          setIndex(i => i + 1);
          setVoted(false);
        }}
        className="mt-6 bg-green-600 py-2 px-6 rounded disabled:opacity-50"
      >
        Next
      </button>
    </main>
  );
}
