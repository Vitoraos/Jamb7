"use client";
import { useState } from "react";
import { sendMessage } from "../lib/api";

export default function ChatInput({ addMessage }: { addMessage: (msg: any) => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { content: input, role: "user" };
    addMessage(userMessage);

    setLoading(true);
    const response = await sendMessage({ userPrompt: input });
    addMessage({ content: response, role: "ai" });
    setLoading(false);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="flex-1 p-3 rounded-lg bg-[#1B1D27] text-[#E6E6E6] border border-[#2A2C36] focus:outline-none focus:ring-2 focus:ring-[#FFB500]"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask a physics question..."
      />
      <button
        className="bg-[#FFB500] text-[#0F111A] px-4 rounded-lg font-bold disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "..." : "Send"}
      </button>
    </form>
  );
}
