import { useState, useEffect } from "react";
import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { QuickTips } from "@/components/dashboard/info-cards";
import { ShimmerText } from "../ui/shimmer-text";

export function HomePage() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    const greetingMessage =
      hour < 12
        ? "Good morning"
        : hour < 18
          ? "Good afternoon"
          : "Good evening";
    setGreeting(greetingMessage);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {greeting}! <ShimmerText>I'm Art</ShimmerText>
          </h1>
          <p className="text-muted-foreground">
            Your assistant for creative and analytical work
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <RecentSessions />
            <DashboardStats />
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <QuickTips />
          </div>
        </div>
      </div>
    </div>
  );
}
