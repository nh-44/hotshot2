"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Papa from "papaparse";

const COLORS = [
  "#f97316",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
];

export default function AdminPage() {
  const search = useSearchParams();
  const roomId = search.get("room");
  const passkey = search.get("passkey");

  const [questions, setQuestions] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Validate & Load ---------- */
  useEffect(() => {
    if (!roomId || !passkey) return;

    const load = async () => {
      const { data: room } = await supabase
        .from("rooms")
        .select("id")
        .eq("id", roomId)
        .eq("passkey", passkey)
        .single();

      if (!room) {
        alert("Invalid access");
        return;
      }

      const { data: qs } = await supabase
        .from("questions")
        .select("*")
        .eq("room_id", roomId)
        .order("order_index");

      const { data: v } = await supabase
      .from("votes")
      .select(`
        id,
        question_id,
        option:options(text),
        players(name)
        `)
        .eq("room_id", roomId);

      setQuestions(qs || []);
      setVotes(v || []);
      setLoading(false);
    };

    load();
  }, [roomId, passkey]);

  /* ---------- CSV ---------- */
  const downloadCSV = () => {
  const rows = votes.map(v => ({
    player: v.players?.name ?? "Unknown" ,
    question: questions.find(q => q.id === v.question_id)?.text ?? "Unknown",
    option: v.option?.text ?? "Unknown",
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "hotshot_results.csv";
  a.click();
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">📊 Results Dashboard</h1>

        <button
          onClick={downloadCSV}
          className="mb-8 bg-green-600 px-4 py-2 rounded font-bold"
        >
          Download CSV
        </button>

        {questions.map((q, qi) => {
          const dist: Record<string, number> = {};

          votes
            .filter(v => v.question_id === q.id)
            .forEach(v => {
              dist[v.option.text] = (dist[v.option.text] || 0) + 1;
            });

          const data = Object.entries(dist).map(([k, v]) => ({
            name: k,
            value: v,
          }));

          return (
            <div
              key={q.id}
              className="bg-slate-800 p-6 rounded mb-10"
            >
              <h2 className="font-bold mb-4">
                {qi + 1}. {q.text}
              </h2>

              <PieChart width={400} height={300}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          );
        })}
      </div>
    </main>
  );
}
