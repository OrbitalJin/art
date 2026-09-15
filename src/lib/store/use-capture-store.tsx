import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";
import type { AddCaptureInput, Capture } from "./capture/types";
import { captureStorage } from "./capture/adapter";

const TITLE_MAX = 60;

const deriveTitle = (input: AddCaptureInput): string => {
  if (input.title) return input.title;

  const firstLine =
    input.content
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "Untitled";

  return firstLine.length > TITLE_MAX
    ? `${firstLine.slice(0, TITLE_MAX)}…`
    : firstLine;
};

export interface CaptureState {
  captures: Capture[];

  add: (input: AddCaptureInput) => string;
  remove: (id: string) => void;
  update: (id: string, capture: Partial<Capture>) => void;
  toggleStar: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  setTitle: (id: string, title: string) => void;
  clear: () => void;
  getFn: (id: string) => Capture | undefined;
}

export const useCaptureStore = create<CaptureState>()(
  persist(
    (set, get) => ({
      captures: [],

      update(id: string, capture: Partial<Capture>) {
        set((state) => ({
          captures: state.captures.map((c) =>
            c.id === id ? { ...c, ...capture } : c,
          ),
        }));
      },

      add(input: AddCaptureInput): string {
        const createdAt = Date.now();
        const capture: Capture = {
          id: crypto.randomUUID(),
          kind: input.kind,
          title: deriveTitle(input),
          content: input.content,
          source: input.source,
          starred: false,
          createdAt,
        };

        set((state) => ({ captures: [capture, ...state.captures] }));
        return capture.id;
      },

      remove(id: string) {
        set((state) => ({
          captures: state.captures.filter((capture) => capture.id !== id),
        }));
      },

      toggleStar(id: string) {
        set((state) => ({
          captures: state.captures.map((capture) =>
            capture.id === id
              ? { ...capture, starred: !capture.starred }
              : capture,
          ),
        }));
      },

      updateContent(id: string, content: string) {
        set((state) => ({
          captures: state.captures.map((capture) =>
            capture.id === id ? { ...capture, content } : capture,
          ),
        }));
      },

      setTitle(id: string, title: string) {
        set((state) => ({
          captures: state.captures.map((capture) =>
            capture.id === id ? { ...capture, title } : capture,
          ),
        }));
      },

      clear() {
        set({ captures: [] });
        toast.success("Cleared all captures");
      },

      getFn(id: string) {
        return get().captures.find((capture) => capture.id === id);
      },
    }),
    {
      name: "capture-storage",
      version: 1,
      storage: createJSONStorage(() => captureStorage),
    },
  ),
);
