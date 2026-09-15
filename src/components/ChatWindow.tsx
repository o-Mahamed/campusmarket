"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";

interface ChatMessage {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
}

interface ChatWindowProps {
  listingId: string;
  otherUserId: string;
  otherUserName: string;
}

export function ChatWindow({ listingId, otherUserId, otherUserName }: ChatWindowProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wsUrl = `${process.env.NEXT_PUBLIC_CHAT_WS_URL}?listingId=${listingId}&otherUserId=${otherUserId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("closed");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    return () => {
      ws.close();
    };
  }, [listingId, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    const body = input.trim();
    if (!body || wsRef.current?.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ body }));
    setInput("");
  }

  const myId = session?.user?.id;

  return (
    <div className="mt-6 flex h-96 flex-col rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 px-4 py-2 text-sm font-medium">
        Chat with {otherUserName}
        {status !== "open" && (
          <span className="ml-2 text-xs text-gray-400">
            ({status === "connecting" ? "connecting..." : "disconnected"})
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.senderId === myId ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  m.senderId === myId ? "bg-black text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.body}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-gray-200 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={status !== "open"}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status !== "open"}
          className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}