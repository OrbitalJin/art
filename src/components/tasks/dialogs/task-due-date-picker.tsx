import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TaskDueDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
}

export const TaskDueDatePicker: React.FC<TaskDueDatePickerProps> = ({
  value,
  onChange,
  required,
}) => (
  <div className="space-y-2">
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <CalendarIcon className="h-3 w-3" />
      Due Date
    </label>
    <div className="flex w-full flex-row gap-1">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <span className="truncate">
              {value ? format(value, "PPP") : "Pick a date"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date: Date | undefined) => onChange(date || null)}
            required={required}
          />
        </PopoverContent>
      </Popover>
      <Button
        size="icon"
        variant="outline"
        onClick={() => onChange(null)}
        type="button"
      >
        <X />
      </Button>
    </div>
  </div>
);
