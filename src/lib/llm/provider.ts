import { GoogleGenAI } from "@google/genai";
import type Config from "./common/config";
import { Memory } from "./common/memory/memory";
import type LLMProviderIface from "./common/types";
import type { MessageIDs, Model, StreamChunk } from "./common/types";

export class LLMProvider implements LLMProviderIface {
  private llm: GoogleGenAI;
  private model: Model;
  readonly memory: Memory;

  constructor(config: Config) {
    this.llm = new GoogleGenAI({ apiKey: config.apiKey });
    this.memory = new Memory(config.systemPrompt);
    this.model = config.model;
  }

  async *stream(
    prompt: string,
    ids: MessageIDs,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    let response: string = "";
    const contents = this.memory.formulate(prompt);
    try {
      const stream = await this.llm.models.generateContentStream({
        model: this.model.type,
        contents: contents,
      });

      for await (const buf of stream) {
        if (signal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        const text = buf.text ?? "";
        if (text.length > 0) {
          response += text;
          yield { token: text };
        }
      }
      yield { token: "", isFinal: true };
    } finally {
      if (!signal?.aborted) {
        this.memory.pushMany([
          { id: ids.userId, role: "user", content: prompt },
          {
            id: ids.assistantId,
            role: "assistant",
            content: response.trim(),
            model: this.model,
          },
        ]);
      }
    }
  }

  async generate(prompt: string, ids: MessageIDs): Promise<string> {
    const contents = this.memory.formulate(prompt);
    const response = await this.llm.models.generateContent({
      model: this.model.type,
      contents: contents,
    });

    const text = response.text ?? "";
    this.memory.pushMany([
      { id: ids.userId, role: "user", content: prompt },
      { id: ids.assistantId, role: "assistant", content: text },
    ]);
    return text;
  }

  async usage(): Promise<string> {
    const limit = await this.llm.models
      .get({ model: this.model.type })
      .then((res) => res.inputTokenLimit as number);

    const used = this.memory.getUsageEstimate();
    return `${((used / limit) * 100).toFixed(1)}%`;
  }
}
