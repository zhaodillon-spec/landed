import { useState } from "react";
import type { ExplainContext } from "../lib/explain";
import { SUGGESTIONS, answerQuestion, greeting } from "../lib/explain";
import { Tango } from "./Tango";

type Message = { role: "you" | "tango"; text: string };

export function TangoPanel({ context }: { context: ExplainContext | null }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  function ask(question: string) {
    const text = question.trim();
    if (!text) return;
    const reply = context
      ? answerQuestion(text, context)
      : "Add a quantity and a unit cost, and I’ll walk through the estimate.";
    setMessages((current) => [...current, { role: "you", text }, { role: "tango", text: reply }]);
    setDraft("");
  }

  const intro = context
    ? greeting(context)
    : "I need a quantity and a unit cost before I can explain an estimate.";

  return (
    <div className="rounded-[36px] border border-line bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-end gap-3">
        <Tango ambient={false} className="h-10 w-10 shrink-0" title="Tango" />
        <p className="max-w-[90%] rounded-[22px] rounded-bl-md bg-canvas px-5 py-3 leading-relaxed">{intro}</p>
      </div>
      <div className="mt-4 space-y-3">
        {messages.map((message, index) =>
          message.role === "you" ? (
            <p key={index} className="ml-auto w-fit max-w-[85%] rounded-[22px] rounded-br-md bg-primary px-5 py-3 text-white">
              {message.text}
            </p>
          ) : (
            <div key={index} className="flex items-end gap-3">
              <Tango ambient={false} className="h-10 w-10 shrink-0" />
              <p className="max-w-[85%] rounded-[22px] rounded-bl-md bg-canvas px-5 py-3 leading-relaxed">{message.text}</p>
            </div>
          ),
        )}
      </div>
      <div className="mt-7 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => ask(suggestion)}
            className="rounded-full border border-line px-3.5 py-1.5 text-left text-sm text-muted transition hover:border-ink hover:text-ink"
          >
            {suggestion}
          </button>
        ))}
      </div>
      <form
        className="mt-4 flex h-14 items-center justify-between gap-2 rounded-full bg-canvas pl-6 pr-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(draft);
        }}
      >
        <label className="sr-only" htmlFor="ask-tango">
          Ask Tango about your estimate
        </label>
        <input
          id="ask-tango"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask Tango about your estimate…"
          className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
        <button
          type="submit"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white"
          aria-label="Ask Tango"
        >
          <ArrowUp />
        </button>
      </form>
      <p className="mono-label mt-5 text-[10px]">Rule-based · not customs advice</p>
    </div>
  );
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 19V5" strokeLinecap="round" />
      <path d="m5 12 7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
