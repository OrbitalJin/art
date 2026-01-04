import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/layout/layout";
import { Notes } from "@/pages/notes";
import { Home } from "@/pages/home";
import { Chat } from "@/pages/chat";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/notes" element={<Notes />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
