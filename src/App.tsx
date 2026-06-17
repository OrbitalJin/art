import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/layout/layout";
import { useAppearanceEffects } from "./hooks/use-appearance-effects";
import { Spinner } from "@/components/ui/spinner";

const Chat = lazy(() =>
  import("@/pages/chat").then((m) => ({ default: m.Chat })),
);
const Journal = lazy(() =>
  import("@/pages/journal").then((m) => ({ default: m.Journal })),
);
const Tasks = lazy(() =>
  import("@/pages/tasks").then((m) => ({ default: m.Tasks })),
);
const Interval = lazy(() =>
  import("@/pages/interval").then((m) => ({ default: m.Interval })),
);

export default function App() {
  useAppearanceEffects();
  return (
    <BrowserRouter>
      <Layout>
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <Spinner className="size-8" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/interval" element={<Interval />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
