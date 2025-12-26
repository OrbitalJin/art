import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Models } from "@/lib/ai/common/types";
import { useChat } from "@/contexts/chat-context";

export const SelectModel = () => {
  const { model, session, setSessionModel } = useChat();

  const handleSelect = (key: string) => {
    if (session) {
      const m = Models.find((m) => m.key === key);
      if (m) setSessionModel(session.id, m);
    }
  };

  return (
    <Select value={model.key} onValueChange={handleSelect} disabled={false}>
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
