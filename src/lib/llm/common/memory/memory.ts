import type { Message } from "./types";

type Listener = (messages: readonly Message[]) => void;

export class Memory {
  private messages: Message[] = [];
  private listeners = new Set<Listener>();
  private systemPrompt: string;

  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
  }

  read(): readonly Message[] {
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
    listener(this.read());

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const snapshot = this.read();
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
