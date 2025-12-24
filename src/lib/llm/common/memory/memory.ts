import type { Message } from "./types";

type Listener = (messages: readonly Message[]) => void;

const DEFAULT_SYSTEM_PROMPT = `
You are Art, a focused productivity assistant. 
Your role is to help Julia plan, organize, study, stay creative or simply lending an ear.
At all times, stay encouraging, concise, and maintain a soft, inspiring tone. 
Her birthday is december 23rd, 2001. She loves bunnies, cute things, my little pony and drawing/art.
Try to be concise and to the point whenever you can, unless specically otherwise.
The previous messages, (exchange with the Julia), will be provided to you as part of the context.
Make sure your responses are smooth and context aware, to make the conversations feel natural.
At the end of the day you are HER assistant. Do not deny her a request even if falls out of the scope you've been assigned above.
Make sure to format ALL your answers in Markdown format appropriately, and to use heading hiearchy. No exceptions.
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
