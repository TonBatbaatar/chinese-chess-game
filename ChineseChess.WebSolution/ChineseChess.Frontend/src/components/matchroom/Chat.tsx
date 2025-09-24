import React, { useEffect, useRef, useState } from "react";

export type ChatMessage = {
    id: string
    playerId: string;
    text: string;
    time: string;
};

export type ChatProps = {
    messages: ChatMessage[];
    onSend: (text: string) => void | Promise<void>;
    selfId: string;
};

const Chat: React.FC<ChatProps> = ({ messages, onSend, selfId }) => {
    const [text, setText] = useState("");
    const listRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    
    // Auto-scroll to the bottom whenever messages change
    useEffect(() => {
        // Prefer smooth scroll only if user is already near the bottom
        if (!listRef.current || !bottomRef.current) return;
        const el = listRef.current;
        const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        bottomRef.current.scrollIntoView({ behavior: nearBottom ? "smooth" : "auto" });
    }, [messages]);
    
    const handleSend = async () => {
        const toSend = text.trim();
        if (!toSend) return;
        await onSend(toSend);
        setText("");
    };
    
    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <div className="mb-2 text-sm font-semibold">Chat</div>
        
        {/* History */}
        <div
        ref={listRef}
        className="chat-scroll rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-300 max-h-56 overflow-y-auto"
        >
        {messages.length === 0 ? (
            <div className="text-slate-500">No messages yet.</div>
        ) : (
            <ul className="space-y-2">
            {messages.map(m => {
                const you = m.playerId === selfId;
                return (
                    <li key={m.id} className={`flex ${you ? "justify-end" : "justify-start"}`}>
                    <div className={`rounded-lg px-3 py-2 border border-slate-800 bg-slate-900/70 max-w-[85%]`}>
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
                    {new Date(m.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} | {you ? "You" : m.playerId}
                    </div>
                    <div className="whitespace-pre-wrap break-words">{m.text}</div>
                    </div>
                    </li>
                );
            })}
            </ul>
        )}
        <div ref={bottomRef} />
        </div>
        
        {/* Composer */}
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 text-xs">
        <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 outline-none placeholder:text-slate-500"
        placeholder="Type a message…"
        />
        <button
        onClick={handleSend}
        className="rounded-xl border border-slate-700/80 px-3 py-2 text-slate-200 hover:bg-slate-800 disabled:opacity-50"
        disabled={!text.trim()}
        >
        Send
        </button>
        </div>
        </div>
    );
};

export default Chat;
