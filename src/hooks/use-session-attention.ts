import { useMemo } from "react";
import { useApprovalStore } from "@/lib/store/use-approval-store";
import { useQuestionStore } from "@/lib/store/use-question-store";

export const useSessionAttention = (sessionId?: string | null): boolean => {
  const hasApproval = useApprovalStore(
    (state) =>
      !!sessionId &&
      Object.values(state.pending).some(
        (entry) => entry.status === "pending" && entry.sessionId === sessionId,
      ),
  );
  const hasQuestion = useQuestionStore(
    (state) =>
      !!sessionId &&
      Object.values(state.pending).some(
        (entry) => entry.status === "pending" && entry.sessionId === sessionId,
      ),
  );
  return hasApproval || hasQuestion;
};

export const useAttentionOwners = (excludeId?: string | null): string[] => {
  const approvals = useApprovalStore((state) => state.pending);
  const questions = useQuestionStore((state) => state.pending);

  return useMemo(() => {
    const latest = new Map<string, number>();
    const consider = (sessionId: string, requestedAt: number) => {
      if (sessionId === excludeId) return;
      latest.set(sessionId, Math.max(latest.get(sessionId) ?? 0, requestedAt));
    };

    for (const entry of Object.values(approvals)) {
      if (entry.status === "pending") consider(entry.sessionId, entry.requestedAt);
    }
    for (const entry of Object.values(questions)) {
      if (entry.status === "pending") consider(entry.sessionId, entry.requestedAt);
    }

    return [...latest.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([sessionId]) => sessionId);
  }, [approvals, questions, excludeId]);
};