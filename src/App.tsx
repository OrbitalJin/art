import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/layout/layout";
import { Journal } from "@/pages/journal";
import { Chat } from "@/pages/chat";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
