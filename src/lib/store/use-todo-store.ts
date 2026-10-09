import { create } from "zustand";

export type TodoStatus = "pending" | "in_progress" | "completed";

export interface TodoItem {
  id: string;
  content: string;
  status: TodoStatus;
}

export interface TodoPlan {
  todos: TodoItem[];
  updatedAt: number;
}

export interface TodoWriteInput {
  content: string;
  status: TodoStatus;
}

interface TodoState {
  bySession: Record<string, TodoPlan>;
  write: (sessionId: string, todos: TodoWriteInput[]) => TodoPlan;
  clear: (sessionId?: string) => void;
}

export const useTodoStore = create<TodoState>()((set) => ({
  bySession: {},

  write: (sessionId, todos) => {
    const plan: TodoPlan = {
      todos: todos.map((todo) => ({
        id: crypto.randomUUID(),
        content: todo.content,
        status: todo.status,
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
