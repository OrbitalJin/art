import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Models, type Model } from "@/lib/ai/common/types";
import { useStreamingState } from "@/hooks/use-streaming-state";
import { useSessionStore } from "@/lib/ai/store/use-session-store";

export const SelectModel = () => {
  const setSessionModel = useSessionStore((store) => store.setSessionModel);
  const session = useSessionStore((state) =>
    state.sessions.find((s) => s.id === state.activeId),
  );
  const { isCurrentSessionStreaming } = useStreamingState();
  const model = session?.preferredModel as Model;

  const handleSelect = (key: string) => {
    if (session) {
      const m = Models.find((m) => m.key === key);
      if (m) setSessionModel(session.id, m);
    }
  };

  return (
    <Select
      value={model.key}
      onValueChange={handleSelect}
      disabled={isCurrentSessionStreaming}
    >
      <SelectTrigger
        className="
        w-[140px] h-8 text-xs
        border shadow-none focus:ring-0 transition-colors"
      >
        <SelectValue placeholder="Model" />
      </SelectTrigger>
      <SelectContent side="top">
        <SelectGroup>
          <SelectLabel className="text-xs">Available Models</SelectLabel>
          {Models.map((m) => (
            <SelectItem key={m.key} value={m.key} className="text-xs">
              {m.key}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
