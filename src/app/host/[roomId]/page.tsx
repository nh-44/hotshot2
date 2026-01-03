"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HostPage() {
  const { roomId } = useParams();
  const [text, setText] = useState("");
  const [limit, setLimit] = useState(10);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("questions")
      .select("*")
      .eq("room_id", roomId)
      .order("order_index")
      .then(({ data }) => setQuestions(data || []));
  }, [roomId]);

  const addQuestion = async () => {
    const order = questions.length + 1;

    const { data } = await supabase
      .from("questions")
      .insert({
        room_id: roomId,
        text,
        order_index: order,
        max_options: limit,
      })
      .select()
      .single();

    setQuestions([...questions, data]);
    setText("");
  };

  const publish = async () => {
    await supabase
      .from("rooms")
      .update({ status: "live" })
      .eq("id", roomId);

    alert(`Room live!\nShare: /play/${roomId}`);
  };

  return (
    <main className="p-6 bg-slate-900 text-white min-h-screen">
      <h1 className="text-xl font-bold mb-4">Host Dashboard</h1>

      <div className="bg-slate-800 p-4 rounded mb-4">
        <input
          className="w-full p-3 bg-slate-700 rounded mb-2"
          placeholder="Question"
          value={text}
          onChange={e => setText(e.target.value)}
        />

        <select
          className="w-full p-3 bg-slate-700 rounded mb-2"
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
        >
          <option value={5}>5 options</option>
          <option value={10}>10 options</option>
          <option value={15}>15 options</option>
        </select>

        <button
          onClick={addQuestion}
          className="w-full bg-orange-600 py-2 rounded"
        >
          Add Question
        </button>
      </div>

      {Array.isArray(questions) &&
      questions
      .filter(Boolean)
      .map(q => (
      <div key={q.id}>
        {q.order_index}. {q.text}
      </div>
    ))}


      <button
        onClick={publish}
        className="mt-6 w-full bg-green-600 py-3 rounded font-bold"
      >
        Publish Room
      </button>
      <div className="mt-6 bg-slate-800 p-4 rounded border border-slate-700">
        <p className="font-bold mb-2 text-orange-500">Share this link with players:</p>
        <input
          readOnly
          value={typeof window !== "undefined" ? `${window.location.origin}/play/${roomId}` : ""}
          className="w-full p-2 rounded bg-slate-700 text-sm border border-slate-600 focus:outline-none focus:border-orange-500 cursor-pointer"
          onClick={(e) => {
            e.currentTarget.select();
            navigator.clipboard.writeText(e.currentTarget.value);
            alert("Link copied to clipboard!");
          }}
        />
        <p className="text-xs text-slate-400 mt-2">Click the box to copy the URL</p>
      </div>
    </main>
  );
}
