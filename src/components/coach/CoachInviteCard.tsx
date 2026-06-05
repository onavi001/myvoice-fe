import { useMemo } from "react";
import { LinkIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import type { CoachProfile } from "../../types/coach";
import Button from "../Button";

type Props = {
  profile: CoachProfile | null;
  loading?: boolean;
};

export default function CoachInviteCard({ profile, loading }: Props) {
  const inviteUrl = useMemo(() => {
    if (!profile?.coachCode || typeof window === "undefined") return "";
    return `${window.location.origin}/join-coach/${encodeURIComponent(profile.coachCode)}`;
  }, [profile?.coachCode]);

  const copyCode = async () => {
    if (!profile?.coachCode) return;
    try {
      await navigator.clipboard.writeText(profile.coachCode);
    } catch {
      /* ignore */
    }
  };

  const copyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch {
      /* ignore */
    }
  };

  if (loading && !profile) {
    return (
      <section className="rounded-xl border border-[#3A3A3A] bg-[#252525] p-4 mb-5 animate-pulse h-28" />
    );
  }

  if (!profile) return null;

  return (
    <section className="rounded-xl border border-[#5DD4F7]/25 bg-[#252525] p-4 mb-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#5DD4F7] mb-1">
        Invitar clientes
      </p>
      <p className="text-2xl font-bold text-[#E0E0E0] tracking-wider tabular-nums">{profile.coachCode}</p>
      <p className="text-xs text-[#888] mt-1 mb-3">
        Comparte el código o enlace para que te encuentren sin buscar en la lista.
      </p>
      <div className="flex gap-2 mb-3">
        <Button type="button" variant="outline" onClick={() => void copyCode()} className="flex-1 min-h-10 text-xs rounded-lg">
          <ClipboardDocumentIcon className="w-4 h-4 inline mr-1" aria-hidden />
          Copiar código
        </Button>
        <Button type="button" variant="outline" onClick={() => void copyLink()} className="flex-1 min-h-10 text-xs rounded-lg">
          <LinkIcon className="w-4 h-4 inline mr-1" aria-hidden />
          Copiar enlace
        </Button>
      </div>
      <p className="text-xs text-[#888]">
        Clientes:{" "}
        <span className={profile.atLimit ? "text-[#FF8A80] font-semibold" : "text-[#E0E0E0]"}>
          {profile.clientCount}/{profile.clientLimit}
        </span>
        {profile.atLimit ? " · límite alcanzado" : " · plan gratuito"}
      </p>
    </section>
  );
}
