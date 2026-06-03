import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Button from "../Button";
import Input from "../Input";
import Select from "../Select";
import Loader from "../Loader";
import { fetchAdminFeedback } from "../../services/feedbackApi";
import type { ApiError } from "../../utils/apiClient";
import {
  CATEGORY_LABEL,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUS_LABEL,
  type AdminFeedbackItem,
  type FeedbackCategory,
} from "../../types/feedback";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

const STATUS_STYLES: Record<string, string> = {
  new: "bg-[#5DD4F7]/15 text-[#5DD4F7] border-[#5DD4F7]/30",
  read: "bg-[#B0B0B0]/10 text-[#B0B0B0] border-[#B0B0B0]/30",
  replied: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

type Props = {
  onUnauthorized: () => void;
};

export default function AdminFeedbackSection({ onUnauthorized }: Props) {
  const [items, setItems] = useState<AdminFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | "all">("all");

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminFeedback();
      setItems(data);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401 || apiErr.status === 403) {
        onUnauthorized();
        return;
      }
      setError(apiErr.message || "No se pudieron cargar los comentarios");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void loadFeedback();
  }, [loadFeedback]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (!q) return true;
      const haystack = [
        item.message,
        item.username,
        item.email,
        CATEGORY_LABEL[item.category],
        item.platform,
        item.appVersion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, searchQuery, categoryFilter]);

  return (
    <section className="mt-6" aria-labelledby="admin-feedback-heading">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 id="admin-feedback-heading" className="text-base sm:text-lg text-[#E0E0E0]">
          Comentarios (Tu opinión)
        </h2>
        <Button
          type="button"
          onClick={() => void loadFeedback()}
          disabled={loading}
          className="bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] hover:bg-[#3A3A3A] rounded-lg px-2.5 py-1.5 text-xs sm:text-sm min-h-9 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          aria-label="Actualizar comentarios"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <Input
          name="feedback-search"
          type="search"
          placeholder="Buscar por mensaje, usuario o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] placeholder-[#B0B0B0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto focus:ring-2 focus:ring-[#E0E0E0] transition-all"
          aria-label="Buscar comentarios"
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as FeedbackCategory | "all")}
          className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm h-8 sm:h-auto"
          aria-label="Filtrar por categoría"
        >
          <option value="all">Todas las categorías</option>
          {FEEDBACK_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      {loading && !items.length ? (
        <div className="flex justify-center py-6">
          <Loader />
        </div>
      ) : error ? (
        <p className="text-[#FF8A80] text-xs sm:text-sm text-center py-4" role="alert">
          {error}
        </p>
      ) : filteredItems.length === 0 ? (
        <p className="text-[#B0B0B0] text-xs sm:text-sm text-center py-4">
          {items.length === 0
            ? "Aún no hay comentarios enviados."
            : "Ningún comentario coincide con el filtro."}
        </p>
      ) : (
        <div className="space-y-2">
          <p className="text-[#B0B0B0] text-xs">
            Mostrando {filteredItems.length} de {items.length} (máx. 100 recientes)
          </p>
          {filteredItems.map((item) => (
            <motion.article
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#252525] border border-[#3A3A3A] rounded-lg p-2 sm:p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-[#E0E0E0] font-medium truncate">
                    {item.username || "Usuario"}
                    {item.email ? (
                      <span className="text-[#B0B0B0] font-normal"> · {item.email}</span>
                    ) : null}
                  </p>
                  <p className="text-[10px] sm:text-xs text-[#B0B0B0]">{formatDate(item.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full border border-[#3A3A3A] bg-[#2D2D2D] text-[#E0E0E0]">
                    {CATEGORY_LABEL[item.category]}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border ${
                      STATUS_STYLES[item.status] ?? STATUS_STYLES.new
                    }`}
                  >
                    {FEEDBACK_STATUS_LABEL[item.status] ?? item.status}
                  </span>
                </div>
              </div>

              {item.rating != null ? (
                <p className="text-xs text-[#B0B0B0] mb-1">
                  Valoración:{" "}
                  <span className="text-[#FFD54F]" aria-label={`${item.rating} de 5`}>
                    {"★".repeat(item.rating)}
                    {"☆".repeat(5 - item.rating)}
                  </span>
                </p>
              ) : null}

              {(item.platform || item.appVersion) && (
                <p className="text-[10px] sm:text-xs text-[#808080] mb-2">
                  {[item.platform, item.appVersion && `v${item.appVersion}`].filter(Boolean).join(" · ")}
                </p>
              )}

              <p className="text-xs sm:text-sm text-[#E0E0E0] whitespace-pre-wrap break-words leading-relaxed">
                {item.message}
              </p>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
