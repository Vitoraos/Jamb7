export async function sendMessage(payload: { userPrompt: string }) {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, keywords: [] }) // backend expects keywords array
    });
    const data = await res.json();
    return data.aiResponse || "No response";
  } catch (err) {
    console.error(err);
    return "Error contacting backend";
  }
}
