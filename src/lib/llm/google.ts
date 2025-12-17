import { GoogleGenAI } from "@google/genai";
import type { Model, StreamChunk } from "./common/provider";
import { Memory } from "./common/memory";
import type Config from "./common/config";

export class LLMProvider {
  private llm: GoogleGenAI;
  private model: Model;
  private memory: Memory;

  constructor(config: Config) {
    this.llm = new GoogleGenAI({ apiKey: config.apiKey });
    this.memory = new Memory(config.systemPrompt);
    this.model = config.model;
  }

  async *stream(prompt: string): AsyncGenerator<StreamChunk> {
    let response: string = "";
    const contents = this.memory.formulate(prompt);
    try {
      const stream = await this.llm.models.generateContentStream({
        model: this.model.type,
        contents: contents,
      });

      for await (const buf of stream) {
        const text = buf.text ?? "";
        if (text.length > 0) {
          response += text;
          yield { token: text };
        }
      }
      yield { token: "", isFinal: true };
    } finally {
      this.memory.push({ role: "user", text: prompt });
      this.memory.push({ role: "assistant", text: response.trim() });
    }
  }

  async generate(prompt: string): Promise<string> {
    const contents = this.memory.formulate(prompt);
    const response = await this.llm.models.generateContent({
      model: this.model.type,
      contents: contents,
    });

    const text = response.text ?? "";
    this.memory.push({ role: "user", text: prompt });
    this.memory.push({ role: "assistant", text: text });
    return text;
  }

  async usage(): Promise<string> {
    const context: number = await this.llm.models
      .get({
        model: this.model.type,
      })
      .then((res) => res.inputTokenLimit as number);

    const usage = this.memory.getUsage();

    return `${(usage / context) * 100}%`;
  }
}
