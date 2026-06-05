import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { AppDispatch, RootState } from "../store";
import { fetchCoachByCode } from "../store/coachSlice";
import Button from "../components/Button";
import { SmallLoader } from "../components/Loader";
import CoachRequestProfileSheet from "../components/coach/CoachRequestProfileSheet";
import { useSubmitCoachRequest } from "../hooks/useSubmitCoachRequest";
import {
  buildCoachRequestProfileForm,
  emptyCoachRequestProfileForm,
  type CoachRequestProfileForm,
} from "../utils/coachRequestProfile";
import { fetchTrainingProfile } from "../store/trainingProfileSlice";

export default function JoinCoach() {
  const { code: routeCode } = useParams<{ code: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.user);
  const { coachCodePreview, loading, error } = useSelector((state: RootState) => state.coach);
  const { profile: trainingProfile, loaded: trainingProfileLoaded, loading: trainingProfileLoading } =
    useSelector((state: RootState) => state.trainingProfile);
  const [manualCode, setManualCode] = useState(routeCode ?? "");
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { submitCoachRequest, submitting } = useSubmitCoachRequest();

  const profileInitial = useMemo(
    () =>
      user
        ? buildCoachRequestProfileForm(user, trainingProfile)
        : emptyCoachRequestProfileForm(),
    [user, trainingProfile]
  );

  useEffect(() => {
    if (profileSheetOpen && token && !trainingProfileLoaded && !trainingProfileLoading) {
      void dispatch(fetchTrainingProfile());
    }
  }, [profileSheetOpen, token, trainingProfileLoaded, trainingProfileLoading, dispatch]);

  useEffect(() => {
    const code = (routeCode ?? "").trim();
    if (!code) return;
    void dispatch(fetchCoachByCode(code));
  }, [routeCode, dispatch]);

  const activeCode = (routeCode ?? manualCode).trim().toUpperCase();

  const handleLookup = () => {
    if (!manualCode.trim()) return;
    void dispatch(fetchCoachByCode(manualCode.trim()));
  };

  const handleOpenRequest = () => {
    if (!token) {
      navigate("/login", { state: { from: `/join-coach/${activeCode}` } });
      return;
    }
    if (user?.role !== "user") {
      navigate("/home");
      return;
    }
    setActionError(null);
    setProfileSheetOpen(true);
  };

  const handleSubmitRequest = async (profile: CoachRequestProfileForm) => {
    setActionError(null);
    try {
      await submitCoachRequest({ mode: "code", code: activeCode }, profile);
      setProfileSheetOpen(false);
      setSuccess(true);
    } catch {
      setActionError("No se pudo enviar la solicitud");
      throw new Error("No se pudo enviar la solicitud");
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0]">
      <div className="p-4 max-w-lg mx-auto pb-10">
        <button
          type="button"
          onClick={() => navigate(token ? "/coaches" : "/")}
          className="mb-4 flex items-center gap-1.5 text-sm text-[#B0B0B0] touch-manipulation min-h-10"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Volver
        </button>

        <header className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#34C759]">Unirme a un coach</p>
          <h1 className="text-xl font-bold mt-0.5">Código de invitación</h1>
        </header>

        {!routeCode && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="MV-XXXXXX"
              className="flex-1 min-h-11 px-3 rounded-xl bg-[#252525] border border-[#3A3A3A] text-sm uppercase"
            />
            <Button type="button" onClick={handleLookup} className="min-h-11 px-4 rounded-xl text-sm">
              Buscar
            </Button>
          </div>
        )}

        {(error || actionError) && !profileSheetOpen && (
          <p className="text-sm text-[#FF8A80] mb-4 text-center" role="alert">
            {error || actionError}
          </p>
        )}

        {loading && !coachCodePreview ? (
          <div className="flex justify-center py-10">
            <SmallLoader />
          </div>
        ) : null}

        {coachCodePreview && (
          <div className="rounded-2xl border border-[#34C759]/30 bg-[#252525] p-5">
            <p className="text-lg font-bold">{coachCodePreview.username}</p>
            {coachCodePreview.bio && (
              <p className="text-sm text-[#B0B0B0] mt-2 leading-relaxed">{coachCodePreview.bio}</p>
            )}
            {coachCodePreview.specialties?.length ? (
              <p className="text-xs text-[#888] mt-2">{coachCodePreview.specialties.join(" · ")}</p>
            ) : null}
            <p className="text-xs text-[#666] mt-3">Código: {coachCodePreview.coachCode}</p>

            {success ? (
              <p className="text-sm text-[#34C759] mt-4 text-center">
                Solicitud enviada. Tu coach debe aceptarla.
              </p>
            ) : (
              <Button
                type="button"
                onClick={handleOpenRequest}
                disabled={!coachCodePreview.acceptingClients}
                className="w-full min-h-12 rounded-xl mt-4 font-semibold disabled:opacity-60"
              >
                <UserPlusIcon className="w-5 h-5 inline mr-1" aria-hidden />
                {coachCodePreview.acceptingClients ? "Solicitar coach" : "Coach sin plazas"}
              </Button>
            )}
          </div>
        )}
      </div>

      <CoachRequestProfileSheet
        open={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
        coachName={coachCodePreview?.username}
        initial={profileInitial}
        loadingInitial={profileSheetOpen && !trainingProfileLoaded}
        submitting={submitting}
        error={actionError}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
}
