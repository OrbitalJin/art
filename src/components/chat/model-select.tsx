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
import { Models, type Model } from "@/lib/llm/common/provider";

const SelectModel = ({
  model,
  setModel,
}: {
  model: Model;
  setModel: (model: Model) => void;
}) => {
  const handleSelect = useCallback(
    (key: string) => {
      const m = Models.find((m) => m.key === key);
      if (m) setModel(m);
    },
    [setModel],
  );

  return (
    <Select value={model.key} onValueChange={handleSelect}>
      <SelectTrigger
        className="
        w-[140px] h-8 text-xs 
        border-transparent shadow-none focus:ring-0 hover:bg-muted/80 transition-colors"
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

export default SelectModel;
