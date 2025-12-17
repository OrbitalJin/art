import type { Model } from "./provider";

export default interface Config {
  model: Model;
  apiKey: string;
  systemPrompt: string;
}
