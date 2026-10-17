import { create } from "zustand";

export type PlanStepStatus = "pending" | "in_progress" | "completed";

export interface PlanStep {
  id: string;
  content: string;
  status: PlanStepStatus;
}

export interface Plan {
  steps: PlanStep[];
  updatedAt: number;
}

export interface PlanWriteInput {
  content: string;
  status: PlanStepStatus;
}

interface PlanState {
  bySession: Record<string, Plan>;
  write: (sessionId: string, steps: PlanWriteInput[]) => Plan;
  clear: (sessionId?: string) => void;
}

export const usePlanStore = create<PlanState>()((set) => ({
  bySession: {},

  write: (sessionId, steps) => {
    const plan: Plan = {
      steps: steps.map((step) => ({
        id: crypto.randomUUID(),
        content: step.content,
        status: step.status,
      })),
      updatedAt: Date.now(),
    };

    set((state) => ({
      bySession: { ...state.bySession, [sessionId]: plan },
    }));

    return plan;
  },

  clear: (sessionId) => {
    if (!sessionId) {
      set({ bySession: {} });
      return;
    }

    set((state) => {
      if (!(sessionId in state.bySession)) return state;
      const next = { ...state.bySession };
      delete next[sessionId];
      return { bySession: next };
    });
  },
}));
