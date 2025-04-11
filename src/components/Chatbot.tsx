import { useState, useEffect } from "react";
import { ThunkError } from "../store/routineSlice";

import {
  TrashIcon,
  XMarkIcon,
  UserIcon,
  BoltIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

interface Message {
  query: string;
  response: string;
}

interface ChatbotProps {
  onClose: () => void;
}

export default function Chatbot({ onClose }: ChatbotProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatbotMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("chatbotMessages", JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/chatBot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error generating exercises");
      setMessages((prev) => [...prev, { query, response: data.content }]);
      setQuery("");
    } catch (err) {
      const error = err as ThunkError;
      if (error.message === "Unauthorized" && error.status === 401) navigate("/login");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    localStorage.removeItem("chatbotMessages");
  };

  return (
    <div className="fixed bottom-6 right-0 left-0 mx-auto w-full max-w-sm bg-[#0A0A0A] border-2 border-[#34C759]/80 rounded-lg shadow-[0_0_20px_rgba(52,199,89,0.4)] p-3 z-50 text-white font-sans sm:right-6 sm:left-auto sm:mx-0 sm:w-80 chatbot-container">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <BoltIcon className="w-6 h-6 text-[#34C759]" />
          <h3 className="text-lg font-extrabold text-[#34C759] tracking-tight uppercase">
            Fit AI Trainer
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="text-[#FF9800] hover:text-[#FFB300] transition-colors duration-200"
            title="Limpiar conversación"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="text-[#FF9800] hover:text-[#FFB300] transition-colors duration-200"
            title="Cerrar chat"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Historial de mensajes */}
      <div className="max-h-60 overflow-y-auto bg-[#1A1A1A] rounded-md p-2 border border-[#34C759]/30 shadow-[inset_0_0_10px_rgba(52,199,89,0.2)]">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className="mb-3">
              <div className="flex items-center gap-1 text-xs text-[#B0B0B0] font-bold uppercase tracking-wide">
                <UserIcon className="w-4 h-4 text-[#34C759]" />
                Atleta:
              </div>
              <div className="text-sm bg-[#2A2A2A] text-white p-2 rounded-md border border-[#34C759]/40 shadow-[0_0_5px_rgba(52,199,89,0.2)]">
                {msg.query}
              </div>
              <div className="flex items-center gap-1 text-xs text-[#34C759] font-bold uppercase mt-2 tracking-wide">
                <BoltIcon className="w-4 h-4 text-[#34C759]" />
                AI Coach:
              </div>
              <div className="text-sm bg-[#2A2A2A] text-white p-2 rounded-md border border-[#34C759]/40 shadow-[0_0_5px_rgba(52,199,89,0.2)]">
                {msg.response}
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-[#B0B0B0]/70 italic tracking-wide flex items-center gap-1">
            <UserIcon className="w-4 h-4 text-[#34C759]" />
                Empieza tu entrenamiento...
          </div>
        )}
      </div>

      {/* Input y botón */}
      <div className="mt-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="> PREGUNTA A TU COACH"
          className="w-full bg-[#1A1A1A] text-white p-2 rounded-md border border-[#34C759]/50 focus:outline-none focus:border-[#34C759] focus:shadow-[0_0_12px_rgba(52,199,89,0.6)] transition-all duration-200 placeholder:text-[#34C759]/60 uppercase text-sm font-medium"
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-2 bg-[#34C759] text-black p-2 rounded-md font-extrabold uppercase tracking-wide hover:bg-[#2ca44e] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_0_15px_rgba(52,199,89,0.5)] flex items-center justify-center gap-2"
        >
          {loading ? (
            "Procesando..."
          ) : (
            <>
              <ArrowUpTrayIcon className="w-5 h-5" />
              Enviar
            </>
          )}
        </button>
      </div>
    </div>
  );
}