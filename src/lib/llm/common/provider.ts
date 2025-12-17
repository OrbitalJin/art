export interface Model {
  key: string;
  type: "gemma-3-27b-it" | "gemini-2.5-flash";
}

export const Models: Model[] = [
  {
    key: "genesis",
    type: "gemma-3-27b-it",
  },
  {
    key: "turbo",
    type: "gemini-2.5-flash",
  },
] as const;

export type StreamChunk = {
  token: string;
  isFinal?: boolean;
};

export default interface LLMProvider {
  generate: (prompt: string) => Promise<string>;
  stream: (prompt: string) => AsyncGenerator<StreamChunk>;
  usage: () => Promise<string>;
}
