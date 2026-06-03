import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  GiftIcon,
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Button from "../components/Button";
import Textarea from "../components/Textarea";
import { SmallLoader } from "../components/Loader";
import { fetchMyFeedback, submitFeedback } from "../services/feedbackApi";
import {
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
  type FeedbackItem,
} from "../types/feedback";

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  idea: "Idea",
  bug: "Problema",
  help: "Ayuda",
  praise: "Me gusta",
  other: "Otro",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function YourVoice() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<FeedbackCategory>("idea");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState<FeedbackItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const items = await fetchMyFeedback();
      setHistory(items);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      setError("Cuéntanos un poco más (mínimo 10 caracteres).");
      return;
    }

    setSending(true);
    try {
      let platform: string | undefined;
      let appVersion: string | undefined;
      if (Capacitor.isNativePlatform()) {
        platform = Capacitor.getPlatform();
        try {
          const info = await App.getInfo();
          appVersion = info.version;
        } catch {
          /* optional */
        }
      } else {
        platform = "web";
      }

      await submitFeedback({
        category,
        message: trimmed,
        rating: rating ?? undefined,
        platform,
        appVersion,
      });

      setSuccess(true);
      setMessage("");
      setRating(null);
      void loadHistory();
    } catch (err) {
      const apiErr = err as { message?: string };
      setError(apiErr.message ?? "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] pb-10">
      <div className="max-w-lg mx-auto px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#888] hover:text-[#E0E0E0] touch-manipulation min-h-11 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </button>

        <div className="rounded-2xl border border-[#3C3C3C] bg-gradient-to-br from-[#34C759]/10 via-[#1A1A1A] to-[#5DD4F7]/8 p-5 mb-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[#34C759]/20 p-2.5 shrink-0">
              <ChatBubbleLeftRightIcon className="w-7 h-7 text-[#34C759]" aria-hidden />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#E0E0E0] tracking-tight">Tu opinión</h1>
              <p className="text-sm text-[#B0B0B0] mt-1 leading-relaxed">
                Estoy construyendo My Voice contigo. Cuéntame qué te ayudaría, qué falla o qué te
                encanta — leo cada mensaje.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#5DD4F7]/25 bg-[#5DD4F7]/5 px-4 py-3 mb-5 flex gap-3">
          <GiftIcon className="w-5 h-5 text-[#5DD4F7] shrink-0 mt-0.5" aria-hidden />
          <p className="text-xs text-[#B0B0B0] leading-relaxed">
            <span className="text-[#5DD4F7] font-semibold">Próximamente:</span> ideas que ayuden a
            mejorar la app podrán recibir reconocimientos en la app (medallas, menciones en novedades).
            Nada de dinero — solo agradecer tu voz.
          </p>
        </div>

        {success ? (
          <div
            className="rounded-xl border border-[#34C759]/40 bg-[#34C759]/10 p-5 mb-5 text-center"
            role="status"
          >
            <CheckCircleIcon className="w-12 h-12 text-[#34C759] mx-auto mb-2" />
            <p className="font-semibold text-[#E0E0E0]">¡Gracias por escribir!</p>
            <p className="text-sm text-[#B0B0B0] mt-1">
              Tu mensaje ya está conmigo. Si hace falta, te contactaré por el correo de tu cuenta.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-4 text-sm text-[#34C759] font-medium touch-manipulation"
            >
              Enviar otro comentario
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 mb-6">
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wide text-[#888] mb-2">
                ¿De qué se trata?
              </legend>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_CATEGORIES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCategory(opt.id)}
                    className={`min-h-10 px-3 py-2 rounded-full text-sm font-medium touch-manipulation transition-colors border ${
                      category === opt.id
                        ? "bg-[#34C759]/20 border-[#34C759] text-[#34C759]"
                        : "bg-[#252525] border-[#4A4A4A] text-[#B0B0B0] hover:border-[#666]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[#666] mt-1.5">
                {FEEDBACK_CATEGORIES.find((c) => c.id === category)?.hint}
              </p>
            </fieldset>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-[#888] mb-2 block">
                Tu mensaje
              </label>
              <Textarea
                name="message"
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= 2000) {
                    setMessage(e.target.value);
                    setError(null);
                  }
                }}
                placeholder="Ej.: Me gustaría ver un resumen semanal más claro, o la app se cierra al abrir el timer..."
                className="min-h-[120px] resize-y"
              />
              <p className="text-[10px] text-[#666] mt-1 text-right tabular-nums">
                {message.trim().length}/2000
              </p>
            </div>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wide text-[#888] mb-2 flex items-center gap-1">
                <HeartIcon className="w-3.5 h-3.5" aria-hidden />
                ¿Cómo te sientes con la app? (opcional)
              </legend>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(rating === n ? null : n)}
                    className={`flex-1 min-h-11 rounded-lg border text-sm font-semibold touch-manipulation ${
                      rating === n
                        ? "bg-[#FFD54F]/20 border-[#FFD54F] text-[#FFD54F]"
                        : "bg-[#252525] border-[#4A4A4A] text-[#888]"
                    }`}
                    aria-label={`${n} de 5`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && (
              <p className="text-sm text-[#EF5350]" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={sending}
              className="w-full min-h-12 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <SmallLoader />
                  <span>Enviando…</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Enviar comentario
                </>
              )}
            </Button>
          </form>
        )}

        <section aria-label="Tus comentarios anteriores">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#888] mb-2">
            Lo que ya compartiste
          </h2>
          {loadingHistory ? (
            <div className="flex justify-center py-6">
              <SmallLoader />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-[#666] py-4 text-center">
              Aún no has enviado comentarios. El primero puede marcar la diferencia.
            </p>
          ) : (
            <ul className="space-y-2">
              {history.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-[#3C3C3C] bg-[#252525] px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[#34C759]">
                      {CATEGORY_LABEL[item.category]}
                    </span>
                    <span className="text-[10px] text-[#666]">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[#B0B0B0] line-clamp-3">{item.message}</p>
                  {item.rating != null && (
                    <p className="text-[10px] text-[#888] mt-1">Valoración: {item.rating}/5</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
