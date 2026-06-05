import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { AppDispatch, RootState } from "../../store";
import {
  createCoachRequest,
  fetchUserCoachRequest,
} from "../../store/userManagementSlice";
import { verifyUser } from "../../store/userSlice";
import Button from "../Button";
import Textarea from "../Textarea";
import { SmallLoader } from "../Loader";

type Props = {
  onSuccess?: () => void;
};

export default function BecomeCoachApplication({ onSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.user);
  const { userCoachRequest, loading, error } = useSelector(
    (state: RootState) => state.userManagement
  );
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.role === "user") {
      void dispatch(fetchUserCoachRequest());
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (userCoachRequest?.status === "approved" && user?.role === "user") {
      void dispatch(verifyUser());
    }
  }, [userCoachRequest?.status, user?.role, dispatch]);

  if (user?.role === "coach") {
    return (
      <div className="rounded-2xl border border-[#34C759]/40 bg-[#34C759]/10 p-5 text-center">
        <CheckCircleIcon className="w-10 h-10 text-[#34C759] mx-auto mb-2" aria-hidden />
        <p className="text-sm font-semibold text-[#E0E0E0]">Ya eres coach</p>
        <p className="text-xs text-[#B0B0B0] mt-1">
          Entra a Mis clientes desde el menú para gestionar tu panel.
        </p>
      </div>
    );
  }

  if (user?.role !== "user") {
    return null;
  }

  const isPending = userCoachRequest?.status === "pending";
  const isRejected = userCoachRequest?.status === "rejected";
  const canApply = !userCoachRequest || isRejected;

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      setFormError("Cuéntanos por qué quieres ser coach.");
      return;
    }
    if (trimmed.length > 500) {
      setFormError("Máximo 500 caracteres.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await dispatch(createCoachRequest({ message: trimmed })).unwrap();
      setMessage("");
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message ?? "No se pudo enviar la solicitud.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !userCoachRequest) {
    return (
      <div className="flex justify-center py-8">
        <SmallLoader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#B0B0B0] leading-relaxed">
        Envía tu solicitud al equipo de My Voice. Si la aprueban, podrás asignar rutinas y
        seguir el progreso de tus clientes desde la app.
      </p>

      {error && (
        <p className="text-sm text-[#FF8A80] text-center" role="alert">
          {error}
        </p>
      )}

      {isPending && (
        <div className="rounded-xl border border-[#5DD4F7]/30 bg-[#5DD4F7]/5 p-4 flex gap-3">
          <ClockIcon className="w-6 h-6 text-[#5DD4F7] shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-[#E0E0E0]">Solicitud en revisión</p>
            <p className="text-xs text-[#888] mt-1">
              Te avisaremos cuando un administrador la revise. Mientras tanto puedes seguir
              entrenando con tu cuenta normal.
            </p>
            {userCoachRequest.message && (
              <p className="text-xs text-[#B0B0B0] mt-2 italic border-t border-[#3A3A3A] pt-2">
                «{userCoachRequest.message}»
              </p>
            )}
          </div>
        </div>
      )}

      {isRejected && (
        <p className="text-xs text-[#FF8A80] bg-[#3d2a2a] border border-[#EF5350]/30 rounded-lg px-3 py-2">
          Tu solicitud anterior fue rechazada. Puedes enviar una nueva con más detalle.
        </p>
      )}

      {canApply && (
        <>
          <div>
            <label className="block text-sm font-medium text-[#E0E0E0] mb-1.5">
              Mensaje para el equipo
            </label>
            <Textarea
              name="becomeCoachMessage"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setFormError(null);
              }}
              placeholder="Ej.: Soy entrenador personal, quiero usar My Voice con mis clientes…"
              className="w-full bg-[#2D2D2D] border border-[#3A3A3A] text-[#E0E0E0] rounded-xl p-3 text-sm min-h-[120px] resize-none"
            />
            <p className="text-[10px] text-[#666] mt-1 text-right tabular-nums">
              {message.length}/500
            </p>
            {formError && (
              <p className="text-xs text-[#FF8A80] mt-1" role="alert">
                {formError}
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting}
            className="w-full min-h-12 rounded-xl font-semibold disabled:opacity-60"
          >
            {submitting ? <SmallLoader /> : "Enviar solicitud"}
          </Button>
          {submitted && (
            <p className="text-xs text-[#34C759] text-center" role="status">
              Solicitud enviada correctamente.
            </p>
          )}
        </>
      )}
    </div>
  );
}
