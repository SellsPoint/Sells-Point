"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Paperclip, Send, Flag, ShieldOff, MoreVertical } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabaseClient";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWindow({ chatId }) {
  const {
    chats,
    currentUser,
    getUserById,
    getListingById,
    sendMessage,
    appendIncomingMessage,
    reportContent,
    blockUser,
    isBlocked,
    hasBlockingRelationship,
  } = useApp();
  const chat = chats.find((c) => c.id === chatId);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [attaching, setAttaching] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    const messagesEl = messagesRef.current;
    if (!messagesEl) return;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }, [chat?.messages?.length]);

  useEffect(() => {
    if (!chatId) return;
    const channel = supabase
      .channel(`messages-${chatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` },
        (payload) => appendIncomingMessage(chatId, payload.new)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, appendIncomingMessage]);

  if (!chat || !currentUser) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-ink-400">
        Select a conversation to start chatting.
      </div>
    );
  }

  const otherUserId = chat.participantIds.find((id) => id !== currentUser.id);
  const otherUser = getUserById(otherUserId);
  const listing = getListingById(chat.listingId);
  const blocked = hasBlockingRelationship(otherUserId);
  const blockedByMe = isBlocked(otherUserId);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || blocked) return;
    sendMessage(chatId, text.trim(), null);
    setText("");
  };

  const handleAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file || blocked) return;
    setAttaching(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) return;
      const { url } = await res.json();
      await sendMessage(chatId, "", url);
    } finally {
      setAttaching(false);
    }
  };

  const submitReport = () => {
    if (!reportReason.trim()) return;
    reportContent("user", otherUserId, reportReason.trim());
    setReportReason("");
    setReportOpen(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-16 items-center justify-between border-b border-ink-100 px-3 py-3 sm:px-4">
        <Link href={`/profile/${otherUserId}`} className="flex items-center gap-3">
          <img src={otherUser?.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="text-sm font-semibold text-ink-900">{otherUser?.name}</p>
            {listing && <p className="line-clamp-1 text-xs text-ink-500">Re: {listing.title}</p>}
          </div>
        </Link>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink-400 hover:bg-ink-100"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-soft">
              <button
                onClick={() => {
                  setReportOpen(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink-700 hover:bg-ink-50"
              >
                <Flag size={14} /> Report user
              </button>
              <button
                onClick={() => {
                  blockUser(otherUserId);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
              >
                <ShieldOff size={14} /> Block user
              </button>
            </div>
          )}
        </div>
      </div>

      {reportOpen && (
        <div className="border-b border-ink-100 bg-ink-50 p-4">
          <p className="mb-2 text-sm font-medium text-ink-700">Why are you reporting this user?</p>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={2}
            className="input-field resize-none"
            placeholder="Describe the issue..."
          />
          <div className="mt-2 flex gap-2">
            <button onClick={submitReport} className="btn-primary px-4 py-1.5 text-sm">
              Submit
            </button>
            <button onClick={() => setReportOpen(false)} className="btn-ghost px-4 py-1.5 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto p-3 sm:p-4">
        {chat.messages.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-400">
            No messages yet. Say hello to {otherUser?.name}!
          </p>
        )}
        {chat.messages.map((m) => {
          const mine = m.senderId === currentUser.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] break-words rounded-2xl px-4 py-2.5 text-sm shadow-soft sm:max-w-[75%] ${
                  mine ? "bg-brand-gradient text-white" : "bg-white text-ink-800"
                }`}
              >
                {m.image && (
                  <img src={m.image} alt="attachment" className="mb-1.5 max-h-52 rounded-lg object-cover" />
                )}
                {m.text && <p>{m.text}</p>}
                <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-ink-400"}`}>
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {blocked ? (
        <div className="border-t border-ink-100 p-4 text-center text-sm text-ink-400">
          {blockedByMe
            ? "You have blocked this user. Unblock from your dashboard to continue chatting."
            : "This conversation is blocked."}
        </div>
      ) : (
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-ink-100 p-3">
          <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-ink-400 hover:bg-ink-100">
            <Paperclip size={18} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={attaching}
              onChange={handleAttach}
            />
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary h-11 w-11 shrink-0 !px-0">
            <Send size={17} />
          </button>
        </form>
      )}
    </div>
  );
}
