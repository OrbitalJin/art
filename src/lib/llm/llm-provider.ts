import { GoogleGenAI } from "@google/genai";
import type { Model, StreamChunk } from "./common/types";
import type { Message } from "@/lib/store/session/types";
import { LLMError, DefaultModel } from "./common/types";

export class LLMProvider {
  private llm: GoogleGenAI;

  constructor(apiKey: string) {
    this.llm = new GoogleGenAI({ apiKey: apiKey });
  }

  private formatHistory(messages: Message[]) {
    return messages.map((m) => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  }

  async *stream(
    prompt: string,
    history: Message[],
    systemPrompt?: string,
    context?: string,
    model: Model = DefaultModel,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
    let error: LLMError | undefined = undefined;
    const contents = [
      { role: "user", parts: [{ text: context }] },
      ...this.formatHistory(history),
      { role: "user", parts: [{ text: prompt }] },
    ];

    try {
      const stream = await this.llm.models.generateContentStream({
        model: model.type,
        contents: contents,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      for await (const buf of stream) {
        if (signal?.aborted) {
          throw new LLMError("aborted", "Stream was aborted by user", false);
        }

        const text = buf.text ?? "";
        if (text) yield { token: text };
      }
      yield { token: "", isFinal: true };
    } catch (err: unknown) {
      if (err instanceof LLMError) {
        error = err;
      } else if (err instanceof Error && err.name === "AbortError") {
        error = new LLMError("aborted", "Stream was aborted", false);
      } else {
        console.error(err);
        error = new LLMError(
          "network",
          err instanceof Error ? err.message : "Network error",
          true,
        );
      }

      yield {
        token: "",
        isFinal: true,
        error,
      };
    }
  }

  async gen(prompt: string, model: Model = DefaultModel): Promise<string> {
    const contents = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];
    const result = await this.llm.models.generateContent({
      model: model.type,
      contents: contents,
    });

    return result.text as string;
  }

  async genWithContext(
    prompt: string,
    history: Message[],
    model: Model = DefaultModel,
  ): Promise<string> {
    if (history.length === 0) {
      return "";
    }

    const formattedHistory = this.formatHistory(history);
    const contents = [
      ...formattedHistory,
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];
    const result = await this.llm.models.generateContent({
      model: model.type,
      contents: contents,
    });

    return result.text as string;
  }
}
