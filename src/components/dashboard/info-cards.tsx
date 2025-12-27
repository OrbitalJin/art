import { Command, Brain, Code2 } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";

export function QuickTips() {
  const tips = [
    {
      icon: Command,
      title: "Command Palette",
      description: "Quickly access all features",
      kbds: ["Ctrl", "K"],
    },
    {
      icon: Brain,
      title: "Context Memory",
      description: "Maintains context & persists memory",
    },
    {
      icon: Code2,
      title: "Code Highlighting",
      description: "Automatic syntax highlighting for code blocks",
    },
  ];

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      <div className="p-6 space-y-4">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-sm">{tip.title}</h3>
                  <div className="flex items-center gap-1 ml-auto">
                    {tip.kbds?.map((key, i) => (
                      <span key={key} className="flex items-center gap-1">
                        <Kbd className="text-xs">{key}</Kbd>
                        {i < tip.kbds.length - 1 && (
                          <span className="text-xs text-muted-foreground">
                            +
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tip.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
