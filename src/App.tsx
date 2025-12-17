import { useCallback, useEffect, useRef, useState } from "react";
import { Textarea } from "./components/ui/textarea";
import { Loader, Palette } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Models, type Model } from "./lib/llm/common/provider";
import { useLLM } from "./contexts/llm-context";
import { Mode } from "@google/genai";

type Msg = { role: "user" | "assistant"; content: string };

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isSending, setIsSending] = useState(false);
  const { llm, model, setModel } = useLLM();

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = prompt.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setPrompt("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);

    try {
      const stream = llm.stream(text);

      for await (const chunk of stream) {
        setMessages((prev) => {
          const next = [...prev];
          const last = next.at(-1);

          if (last?.role === "assistant") {
            next[next.length - 1] = {
              ...last,
              content: last.content + (chunk.token ?? ""),
            };
          }
          return next;
        });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-dvh w-screen bg-background">
      <main className="mx-auto flex h-dvh w-full max-w-3xl flex-col gap-2">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur">
          <div className="flex items-center justify-center gap-2 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted">
              <Palette className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Art</span>
              <span className="text-xs text-muted-foreground">
                Soft productivity assistant
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable center */}
        <section className="flex-1 min-h-0 ">
          <div className="h-full overflow-y-auto rounded-2xl">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
                  Ask Art anything—planning, studying, motivation, or a quick
                  brainstorm.
                </div>
              ) : null}

              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={[
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    ].join(" ")}
                  >
                    {m.content ||
                      (m.role === "assistant" ? (
                        <Loader className="animate-spin" />
                      ) : (
                        ""
                      ))}
                  </div>
                </div>
              ))}

              <div ref={bottomRef} />
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2 p-2 border rounded-t-2xl">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a message…"
            className="min-h-[48px] resize-none rounded-2xl border-none shadow-none focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex flex-row">
            <SelectModel model={model} setModel={setModel} />
          </div>
        </div>
      </main>
    </div>
  );
}

function SelectModel({
  model,
  setModel,
}: {
  model: Model;
  setModel: (model: Model) => void;
}) {
  const handleSelect = useCallback(
    (key: string) => {
      const m = Models.find((m) => m.key === key);
      if (m) setModel(m);
    },
    [setModel],
  );

  return (
    <Select value={model.key} onValueChange={handleSelect}>
      <SelectTrigger className="w-[180px] border-none focus-visible:ring-0 font-bold">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Models</SelectLabel>
          {Models.map((model) => (
            <SelectItem value={model.key}>{model.key}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
