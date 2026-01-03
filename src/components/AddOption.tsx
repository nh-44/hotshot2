"use client";

import { useState } from "react";

export default function AddOption({
  onAdd,
}: {
  onAdd: (text: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <div className="mt-4 flex gap-2">
      <input
        className="flex-1 p-3 rounded bg-slate-700 text-white"
        placeholder="Add a new option"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        onClick={() => {
          if (!text.trim()) return;
          onAdd(text);
          setText("");
        }}
        className="bg-blue-600 px-4 rounded font-bold"
      >
        Add
      </button>
    </div>
  );
}
