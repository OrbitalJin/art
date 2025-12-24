import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Models, type Model } from "@/lib/llm/common/types";

interface Props {
  disabled?: boolean;
  model: Model;
  setModel: (model: Model) => void;
}

export const SelectModel: React.FC<Props> = ({ model, setModel, disabled }) => {
  const handleSelect = useCallback(
    (key: string) => {
      const m = Models.find((m) => m.key === key);
      if (m) setModel(m);
    },
    [setModel],
  );

  return (
    <Select value={model.key} onValueChange={handleSelect} disabled={disabled}>
      <SelectTrigger
        className="
        w-[140px] h-8 text-xs
        border shadow-none focus:ring-0 transition-colors"
      >
        <SelectValue placeholder="Model" />
      </SelectTrigger>
      <SelectContent align="end">
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
