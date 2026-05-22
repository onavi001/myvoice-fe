import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { ThunkError } from "../store/routineSlice";
import { apiClient } from "../utils/apiClient";

import {
  TrashIcon,
  XMarkIcon,
  UserIcon,
  BoltIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useAdMobBottomInset } from "../context/AdMobInsetContext";

interface Message {
  id: string;
  query: string;
  response: string;
}

interface ChatbotProps {
  onClose: () => void;
}

const CHATBOT_STORAGE_KEY = "chatbotMessages";
const MAX_QUERY_LENGTH = 300;

const getInitialMessages = (): Message[] => {
  const saved = localStorage.getItem(CHATBOT_STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as Message[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.query === "string" &&
        typeof item.response === "string"
    );
  } catch {
    return [];
  }
};

export default function Chatbot({ onClose }: ChatbotProps) {
  const adBottomInset = useAdMobBottomInset();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { selectedRoutineId } = useSelector((state: RootState) => state.routine);
  const navigate = useNavigate();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const canSubmit = useMemo(() => query.trim().length > 0 && !loading, [query, loading]);

  useEffect(() => {
    localStorage.setItem(CHATBOT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery || loading) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const chatHistory = messages.slice(-3).map((message) => ({
        query: message.query,
        response: message.response,
      }));

      const data = await apiClient<{ content: string }>("/api/chatBot", {
        method: "POST",
        body: JSON.stringify({
          prompt: normalizedQuery,
          selectedRoutineId,
          chatHistory,
        }),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          query: normalizedQuery,
          response: data.content,
        },
      ]);
      setQuery("");
    } catch (err) {
      const error = err as ThunkError;
      if (error.status === 401) {
        navigate("/login");
        return;
      }
      setErrorMessage(error.message || "No pude responder en este momento. Intenta de nuevo en unos segundos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setErrorMessage(null);
    localStorage.removeItem(CHATBOT_STORAGE_KEY);
  };

  return (
    <div
      className="fixed right-0 left-0 z-50 mx-auto w-[calc(100%-1rem)] max-w-md rounded-2xl border border-[#3A3A3A] bg-[#111111]/95 text-white shadow-2xl backdrop-blur-sm sm:left-auto sm:right-6 sm:w-[26rem]"
      style={{
        bottom: `calc(${adBottomInset}px + max(1rem, env(safe-area-inset-bottom)))`,
      }}
    >
      <div className="flex items-center justify-between border-b border-[#2C2C2C] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-full bg-[#34C759]/15 p-1.5">
            <BoltIcon className="h-5 w-5 text-[#34C759]" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#F5F5F5] sm:text-base">Fit AI Trainer</h3>
            <p className="truncate text-xs text-[#9CA3AF]">Asistente para rutinas y técnica</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClear}
            className="rounded-md p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#1E1E1E] hover:text-[#F59E0B]"
            title="Limpiar conversación"
            aria-label="Limpiar conversación"
            disabled={messages.length === 0}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#1E1E1E] hover:text-[#F5F5F5]"
            title="Cerrar chat"
            aria-label="Cerrar chat"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="max-h-72 space-y-3 overflow-y-auto bg-[#161616] px-4 py-3 sm:max-h-80"
      >
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                <UserIcon className="h-3.5 w-3.5 text-[#60A5FA]" />
                Tú
              </div>
              <div className="rounded-xl bg-[#1F2937] px-3 py-2 text-sm text-[#F3F4F6]">
                {msg.query}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#86EFAC]">
                <BoltIcon className="h-3.5 w-3.5 text-[#34C759]" />
                AI Coach
              </div>
              <div className="whitespace-pre-wrap rounded-xl bg-[#1A2A1E] px-3 py-2 text-sm text-[#ECFDF3]">
                {msg.response}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-[#2E2E2E] bg-[#141414] px-3 py-4 text-center text-sm text-[#9CA3AF]">
            Escribe una meta o ejercicio para empezar.
          </div>
        )}
        {loading && (
          <div className="rounded-xl bg-[#1A2A1E] px-3 py-2 text-sm text-[#A7F3D0]">
            AI Coach está escribiendo...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 border-t border-[#2C2C2C] px-4 py-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ejemplo: Dame una rutina de espalda para hoy"
          className="min-h-[84px] w-full resize-none rounded-xl border border-[#3A3A3A] bg-[#171717] px-3 py-2 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:border-[#34C759] focus:outline-none"
          disabled={loading}
          maxLength={MAX_QUERY_LENGTH}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6B7280]">{query.length}/{MAX_QUERY_LENGTH}</span>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex items-center gap-1 rounded-lg bg-[#34C759] px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#2CA44E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            Enviar
          </button>
        </div>
        {errorMessage && (
          <p className="rounded-md border border-[#7F1D1D] bg-[#2B1515] px-2 py-1 text-xs text-[#FCA5A5]">
            {errorMessage}
          </p>
        )}
        <button
          type="button"
          onClick={handleClear}
          disabled={messages.length === 0}
          className="w-full rounded-lg border border-[#3A3A3A] px-3 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:bg-[#1E1E1E] hover:text-[#E5E7EB] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpiar conversación
        </button>
      </form>
    </div>
  );
}