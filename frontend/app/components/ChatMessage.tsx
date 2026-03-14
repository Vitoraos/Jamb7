interface Props {
  message: string;
  role: "user" | "ai";
}

export default function ChatMessage({ message, role }: Props) {
  const bgColor = role === "user" ? "bg-[#1B1D27]" : "bg-[#2A2C36]";
  const align = role === "user" ? "self-end" : "self-start";

  return (
    <div className={`${align} ${bgColor} p-4 rounded-lg my-2 max-w-[80%] break-words`}>
      <p>{message}</p>
    </div>
  );
}
