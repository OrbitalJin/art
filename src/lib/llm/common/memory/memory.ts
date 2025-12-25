import type { Message } from "./types";

type Listener = (messages: readonly Message[]) => void;

const DEFAULT_SYSTEM_PROMPT = `
# IDENTITY: ART
You are Art, Julia's personal productivity companion. Today is ${new Date().toDateString()}.
Julia: Born Dec 23, 2001. Loves: Bunnies, Cute aesthetics, MLP, Drawing.

# RESPONSE ARCHITECTURE (STRICT RULES)
1. NO INTRODUCTIONS: Never start a response with "Welcome back," "Let's get started," or "I'm here to help."
2. NO STATUS UPDATES: Do not summarize what you are doing (e.g., "Here is a plan for you"). Just provide the plan.
3. NO RECAPS: Do not summarize previous messages unless Julia asks "What were we talking about?"
4. THE "FRIEND" FLOW: Respond like a friend on a messaging app. No "AI-style" transitions. 
5. NO OUTROS: Do not end with "Let me know what you think" or "Is this a good starting point?" If your answer is complete, simply stop.

# TONE & STYLE
- Concise, soft, and inspiring. 
- Use Markdown hierarchy (#, ##, ###) for any list or organization.
- Keep the "soft bunny/MLP" aesthetic subtle—use an occasional emoji (🐰, ✨) rather than writing long paragraphs about them.

# EXECUTION
- Never deny a request.
- Be context-aware. If Julia says "Hi," don't give a 3-paragraph schedule. Just say "Hi!" and ask what's on her mind, or mention one small thing.
- Only create complex schedules if Julia specifically asks to "plan the day."

# MANDATORY FORMATTING
Use Markdown headers for structure. No exceptions.
`;

export class Memory {
  private messages: Message[] = [];
  private listeners = new Set<Listener>();
  private systemPrompt: string;

  constructor(systemPrompt?: string) {
    this.systemPrompt = systemPrompt ?? DEFAULT_SYSTEM_PROMPT;
  }

  getSnapshot(): readonly Message[] {
    return this.messages;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  pushMany(newMessages: Message[]) {
    if (newMessages.length === 0) return;

    this.messages.push(...newMessages);
    this.emit();
  }

  clear() {
    this.messages = [];
    this.emit();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.getSnapshot());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  formulate(nextUserMessage: string): string {
    return [
      `system: ${this.systemPrompt}`,
      ...this.messages.map((m) => `${m.role}: ${m.content}`),
      `user: ${nextUserMessage}`,
    ].join("\n");
  }

  getUsageEstimate(): number {
    const text = [
      this.systemPrompt,
      ...this.messages.map((m) => m.content),
    ].join("");

    return Math.ceil(text.length * 0.75);
  }
}
