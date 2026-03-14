"use client";
import { useState } from "react";
import Layout from "./components/Layout";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

export default function Home() {
  const [messages, setMessages] = useState<{ content: string; role: "user" | "ai" }[]>([]);

  const addMessage = (msg: { content: string; role: "user" | "ai" }) => {
    setMessages((prev) => [...prev, msg]);
  };

  return (
    <Layout>
      <Header />
      <ChatWindow messages={messages} />
      <ChatInput addMessage={addMessage} />
    </Layout>
  );
}
