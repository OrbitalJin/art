import { Sparkles } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";

export function QuickTips() {
  return (
    <div className="bg-card rounded-xl border p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-muted-foreground" />
        Quick Tips
      </h2>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
          <div>
            <strong>Command Palette:</strong> Press{" "}
            <Kbd className="text-xs">Ctrl+K</Kbd> to quickly access all features
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
          <div>
            <strong>Context Memory:</strong> Art maintains context across
            conversations for seamless assistance
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
          <div>
            <strong>Code Highlighting:</strong> Automatic syntax highlighting
            for code blocks
          </div>
        </div>
      </div>
    </div>
  );
}
