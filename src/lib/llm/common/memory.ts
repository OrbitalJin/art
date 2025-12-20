import type { Model } from "./provider";

export type Role = "user" | "assistant" | "system";
export type Message = {
  role: Role;
  content: string;
  model?: Model;
};

export interface Shard {
  text: string;
  role: Role;
}

export class Memory {
  private shards: Shard[];
  private systemPrompt: string;

  constructor(systemPrompt: string) {
    this.systemPrompt = systemPrompt;
    this.shards = [];
  }

  clear = () => (this.shards = []);
  push = (shard: Shard) => this.shards.push(shard);
  read = (): Shard[] => {
    return this.shards;
  };

  formulate = (message: string): string => {
    return this.systemPrompt.concat(
      `system: ${this.systemPrompt}`,
      this.shards
        .map((shard: Shard) => `${shard.role}: ${shard.text}`)
        .join("\n"),
      `\nuser:${message}`,
    );
  };

  getUsage = (): number => {
    return (
      this.systemPrompt.concat(
        `system: ${this.systemPrompt}`,
        this.shards
          .map((shard: Shard) => `${shard.role}: ${shard.text}`)
          .join("\n"),
      ).length * 0.75
    );
  };
}
