import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/layout/layout";
import { Notes } from "@/pages/notes";
import { Chat } from "@/pages/chat";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
