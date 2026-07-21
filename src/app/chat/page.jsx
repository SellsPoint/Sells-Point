"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ChatWindow from "@/components/ChatWindow";

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ChatPage() {
  const { currentUser, userChats, getUserById, getListingById, markChatAsRead, getUnreadCount } = useApp();
  const router = useRouter();
  const [activeChatId, setActiveChatId] = useState(null);
  const [mobileConversationOpen, setMobileConversationOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (!activeChatId && userChats.length > 0) {
      setActiveChatId(userChats[0].id);
    }
  }, [userChats, activeChatId]);

  useEffect(() => {
    if (activeChatId) {
      markChatAsRead(activeChatId);
    }
  }, [activeChatId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentUser) return null;

  return (
    <div className="page-container">
      <h1 className="mb-6 font-display text-2xl font-bold text-ink-900">Messages</h1>
      <div className="grid h-[calc(100dvh-10rem)] min-h-[32rem] rounded-2xl border border-ink-100 shadow-soft md:h-[70vh] md:grid-cols-3">
        <div className={`${mobileConversationOpen ? "hidden" : "flex"} flex-col overflow-hidden md:col-span-1 md:flex md:border-r`}>
          {userChats.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-ink-400">
              <MessageCircle size={28} />
              No conversations yet. Chat with a seller from any listing page.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {userChats.map((chat) => {
                const otherId = chat.participantIds.find((id) => id !== currentUser.id);
                const other = getUserById(otherId);
                const listing = getListingById(chat.listingId);
                const last = chat.messages[chat.messages.length - 1];
                return (
                  <button
                    key={chat.id}
                    onClick={() => { setActiveChatId(chat.id); setMobileConversationOpen(true); }}
                    className={`flex min-h-16 w-full items-center gap-3 border-b border-ink-100 p-4 text-left transition-colors hover:bg-ink-50 ${
                      activeChatId === chat.id ? "bg-brand-50" : ""
                    }`}
                  >
                    <img src={other?.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-semibold text-ink-900">{other?.name}</p>
                        {last && <span className="shrink-0 text-[11px] text-ink-400">{timeAgo(last.createdAt)}</span>}
                      </div>
                      <p className="truncate text-xs text-ink-500">{listing?.title}</p>
                      <p className="truncate text-xs text-ink-400">
                        {last ? (last.text || "📷 Photo") : "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className={`${mobileConversationOpen ? "block" : "hidden"} overflow-hidden md:col-span-2 md:block`}>
          <button type="button" onClick={() => setMobileConversationOpen(false)} className="flex h-11 items-center gap-1 px-3 text-sm font-semibold text-ink-600 hover:bg-ink-50 md:hidden">
            <ChevronLeft size={18} /> Conversations
          </button>
          <ChatWindow chatId={activeChatId} />
        </div>
      </div>
    </div>
  );
}
