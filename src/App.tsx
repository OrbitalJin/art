import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/layout/layout";
import { Journal } from "@/pages/journal";
import { Chat } from "@/pages/chat";
import { Tasks } from "./pages/tasks";
import { useSettingsStore, type FontSize } from "@/lib/store/use-settings-store";

function FontSizeInitializer() {
  const fontSize = useSettingsStore((state) => state.fontSize);

  useEffect(() => {
    const root = window.document.documentElement;
    const sizeMap: Record<FontSize, string> = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    root.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <FontSizeInitializer />
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/tasks" element={<Tasks />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
