import { GoogleGenAI } from "@google/genai";
import type { ModelType, StreamChunk } from "./common/types";
import type { Message } from "@/lib/store/session/types";
import { LLMError, DEFAULT_MODEL } from "./common/types";

export interface GenerateOptions {
  model?: ModelType;
  systemPrompt?: string;
  context?: string;
  signal?: AbortSignal;

  useGoogleSearch?: boolean;
  webContextUris?: string[];
}

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

  private buildConfig(options: GenerateOptions) {
    const tools = [];

    if (options.useGoogleSearch) {
      tools.push({ googleSearch: {} });
    }

    if (options.webContextUris && options.webContextUris.length > 0) {
      tools.push({
        urlContext: { uris: options.webContextUris },
      });
    }

    return {
      systemInstruction: options.systemPrompt,
      tools: tools.length > 0 ? tools : undefined,
    };
  }

  async *stream(
    prompt: string,
    history: Message[],
    options: GenerateOptions = {},
  ): AsyncGenerator<StreamChunk> {
    const { model = DEFAULT_MODEL.type, context, signal } = options;
    let error: LLMError | undefined = undefined;

    const contents = [
      ...(context ? [{ role: "user", parts: [{ text: context }] }] : []),
      ...this.formatHistory(history),
      { role: "user", parts: [{ text: prompt }] },
    ];

    try {
      const stream = await this.llm.models.generateContentStream({
        model: model,
        contents: contents,
        config: this.buildConfig(options),
      });

      for await (const chunk of stream) {
        if (signal?.aborted) {
          throw new LLMError("aborted", "Stream was aborted by user", false);
        }

        const text = chunk.text ?? "";
        const metadata = chunk.candidates?.[0]?.groundingMetadata;

        if (text) {
          yield {
            token: text,
            metadata: metadata,
          };
          console.log(metadata);
        }
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

  async genFromMessages(
    prompt: string,
    messages: Message[],
    options: GenerateOptions = {},
  ): Promise<string> {
    const { model = DEFAULT_MODEL.type } = options;
    const contents = [
      ...this.formatHistory(messages),
      { role: "user", parts: [{ text: prompt }] },
    ];

    try {
      const result = await this.llm.models.generateContent({
        model,
        contents: contents,
      });

      return result.text ?? "empty";
    } catch (err: unknown) {
      throw this.handleError(err);
    }
  }

  async gen(
    prompt: string,
    text: string,
    options: GenerateOptions = {},
  ): Promise<string> {
    const { model = DEFAULT_MODEL.type } = options;

    try {
      const result = await this.llm.models.generateContent({
        model,
        contents: [{ role: "user", parts: [{ text: text }] }],
        config: { systemInstruction: prompt },
      });

      return result.text ?? "";
    } catch (err: unknown) {
      throw this.handleError(err);
    }
  }

  private handleError(err: unknown): LLMError {
    if (err instanceof LLMError) return err;
    return new LLMError(
      "network",
      err instanceof Error ? err.message : "Unknown error",
      true,
    );
  }
}
