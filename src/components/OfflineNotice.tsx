import { useEffect, useState } from "react";

export default function OfflineNotice() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (isOnline) {
    return <></>;
  }

  return (
    <div className="bg-red-500 text-white text-center py-2 text-sm">
      Sin conexión. Algunas funciones pueden estar limitadas.
    </div>
  );
}