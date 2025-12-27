import { Plus, MessageSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Kbd } from "@/components/ui/kbd";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/lib/ai/store/use-session-store";

export function QuickActions() {
  const navigate = useNavigate();
  const createSession = useSessionStore((state) => state.createSession);

  const handleNewChat = () => {
    createSession();
    navigate("/chat");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button
        onClick={handleNewChat}
        className="h-24 flex-col gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        <Plus className="h-6 w-6" />
        <span className="font-medium">New Chat</span>
      </Button>
      
      <Link to="/chat" className="block">
        <Button
          variant="outline"
          className="h-24 w-full flex-col gap-2 hover:bg-muted/50"
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="font-medium">Continue Chat</span>
        </Button>
      </Link>

      <Button
        variant="outline"
        className="h-24 flex-col gap-2 hover:bg-muted/50"
        size="lg"
        onClick={() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
        }}
      >
        <Search className="h-6 w-6" />
        <span className="font-medium">Quick Search</span>
        <Kbd className="text-xs">Ctrl+K</Kbd>
      </Button>
    </div>
  );
}