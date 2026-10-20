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
import { TaskField } from "./task-field";

interface TaskDueDatePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
}

export const TaskDueDatePicker: React.FC<TaskDueDatePickerProps> = ({
  value,
  onChange,
  required,
}) => {
  const label = value ? format(value, "MMM d, yyyy") : "Pick a date";

  return (
    <TaskField label="Due Date">
      <div className="flex w-full gap-1.5">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "min-w-0 flex-1 justify-start gap-2 font-normal h-9",
                !value && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{label}</span>
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

        {value && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Clear due date"
            onClick={() => onChange(null)}
            className="size-9 shrink-0"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </TaskField>
  );
};
