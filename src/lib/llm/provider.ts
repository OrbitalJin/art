import { GoogleGenAI } from "@google/genai";
import type Config from "./common/config";
import type LLMProviderIface from "./common/types";
import type { MessageIDs, Model, StreamChunk } from "./common/types";
import { LLMError } from "./common/error";
import type { Session } from "./common/session/type";

export class LLMProvider implements LLMProviderIface {
  private llm: GoogleGenAI;
  private model: Model;

  constructor(config: Config) {
    this.llm = new GoogleGenAI({ apiKey: config.apiKey });
    this.model = config.model;
  }

  async *stream(
    prompt: string,
    ids: MessageIDs,
    session: Session,
    signal?: AbortSignal,
  ): AsyncGenerator<StreamChunk> {
    let response: string = "";
    let error: LLMError | undefined = undefined;

    const contents = session.memory.formulate(prompt);
    try {
      const stream = await this.llm.models.generateContentStream({
        model: this.model.type,
        contents: contents,
      });

      for await (const buf of stream) {
        if (signal?.aborted) {
          throw new LLMError("aborted", "Stream was aborted by user", false);
        }

        const text = buf.text ?? "";
        if (text.length > 0) {
          response += text;
          yield { token: text };
        }
      }
      yield { token: "", isFinal: true };
    } catch (err: unknown) {
      if (err instanceof LLMError) {
        error = err;
      } else if (err instanceof Error && err.name === "AbortError") {
        error = new LLMError("aborted", "Stream was aborted", false);
      } else {
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
    } finally {
      session.memory.pushMany([
        { id: ids.userId, role: "user", content: prompt },
        {
          id: ids.assistantId,
          role: "assistant",
          content: response.trim(),
          model: this.model,
          status: error
            ? error.type === "aborted"
              ? "aborted"
              : "error"
            : "complete",
          error,
        },
      ]);
    }
  }

  async gen(prompt: string, session: Session): Promise<string> {
    const content = session.memory.history();
    return (await this.llm.models
      .generateContent({
        model: this.model.type,
        contents: prompt + content,
      })
      .then((res) => res.text)) as string;
  }

  usage(session: Session): string {
    const used = session.memory.getUsageEstimate();
    return `${((used / this.model.limit) * 100).toFixed(1)}%`;
  }
}
