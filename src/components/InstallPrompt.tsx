import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | undefined>(undefined);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;

    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setPromptEvent(undefined);
    }
  };
  console.log("promptEvent", promptEvent);
  if (!promptEvent) {
    return <></>;
  }

  return (
    <button
      onClick={handleInstall}
      className="px-6 py-3 text-base font-semibold rounded-md transition-all duration-200 bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-md py-2 px-4 text-sm font-semibold border border-[#2DAF47] shadow-md"
      //className={`px-6 py-3 text-base font-semibold rounded-md transition-all duration-200 ${className}`}
    >
      Instalar My Voice
    </button>
  );
}