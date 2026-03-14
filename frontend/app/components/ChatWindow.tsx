import ChatMessage from "./ChatMessage";

interface Props {
  messages: { content: string; role: "user" | "ai" }[];
}

export default function ChatWindow({ messages }: Props) {
  return (
    <div className="flex flex-col overflow-y-auto h-[60vh] mb-4 p-2 border border-[#2A2C36] rounded-lg">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg.content} role={msg.role} />
      ))}
    </div>
  );
}
