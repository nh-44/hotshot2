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

export default function AdminClient() {
  const search = useSearchParams();
  const roomId = search.get("room");
  const passkey = search.get("passkey");

  const [questions, setQuestions] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !passkey) return;

    const load = async () => {
      // 1️⃣ Validate admin access
      const { data: room } = await supabase
        .from("rooms")
        .select("id")
        .eq("id", roomId)
        .eq("passkey", passkey.trim())
        .single();

      if (!room) {
        alert("Invalid access");
        return;
      }

      // 2️⃣ Load questions
      const { data: qs } = await supabase
        .from("questions")
        .select("*")
        .eq("room_id", roomId)
        .order("order_index");

      // 3️⃣ Load raw tables (NO JOINS)
      const { data: votesRaw } = await supabase
        .from("votes")
        .select("id, question_id, option_id, player_id")
        .eq("room_id", roomId);

      const { data: optionsRaw } = await supabase
        .from("options")
        .select("id, text");

      const { data: playersRaw } = await supabase
        .from("players")
        .select("id, name");

      // 4️⃣ Manual join (RLS-safe)
      const joinedVotes = (votesRaw || []).map(v => ({
        ...v,
        options: optionsRaw?.find(o => o.id === v.option_id),
        players: playersRaw?.find(p => p.id === v.player_id),
      }));

      setQuestions(qs || []);
      setVotes(joinedVotes);
      setLoading(false);
    };

    load();
  }, [roomId, passkey]);

  const downloadCSV = () => {
    const rows = votes.map(v => ({
      player: v.players?.name ?? "Unknown",
      question:
        questions.find(q => q.id === v.question_id)?.text ?? "Unknown",
      option: v.options?.text ?? "Unknown",
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
        Loading admin dashboard…
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
              const opt = v.options?.text ?? "Unknown";
              dist[opt] = (dist[opt] || 0) + 1;
            });

          const data = Object.entries(dist).map(([name, value]) => ({
            name,
            value,
          }));

          return (
            <div key={q.id} className="bg-slate-800 p-6 rounded mb-10">
              <h2 className="font-bold mb-4">
                {qi + 1}. {q.text}
              </h2>

              {data.length === 0 ? (
                <p className="text-slate-400 italic">
                  No responses for this question
                </p>
              ) : (
                <div className="flex justify-center overflow-x-auto">
                  <PieChart width={350} height={300}>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      label
                    >
                      {data.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
