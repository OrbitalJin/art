import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function HomePage() {
  const tools = [
    {
      path: "/chat",
      title: "Chat",
      description:
        "Chat with Art, your AI assistant for brainstorming and planning",
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="mx-auto flex flex-col items-center justify-center max-w-4xl h-full w-full px-6 py-8">
        <h1 className="text-3xl font-bold mx-auto">Welcome back! I'm Art</h1>
        <div className="flex flex-row gap-6 py-6 my-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.path}
                className="flex flex-col h-full bg-card p-4 rounded-md border "
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                    tool.color,
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                  {tool.description}
                </p>
                <Link to={tool.path}>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Open
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="bg-muted/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <strong>Command Palette:</strong> Press{" "}
                <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+K</kbd>{" "}
                to open command palette
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <strong>Context Switching:</strong> Art maintains context across
                all tools for seamless assistance
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
