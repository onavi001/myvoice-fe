import { useState } from "react";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";
import Chatbot from "../components/Chatbot";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <main>{children}</main>
      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 bg-[#34C759] text-black p-3 rounded-full shadow-[0_0_15px_rgba(52,199,89,0.5)] hover:bg-[#2ca44e] transition-all duration-300 z-30 font-extrabold flex items-center gap-1"
      >
        <ChatBubbleLeftIcon className="w-5 h-5" />
      </button>
      {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
    </div>
  );
}