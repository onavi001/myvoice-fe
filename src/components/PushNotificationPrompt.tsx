// src/components/PushNotificationPrompt.tsx
import { useState, useEffect } from "react";
import Button from "./Button";
import { registerPushNotifications, savePushSubscription } from "../utils/push";

// Clave VAPID pública (sustituye con la tuya después de generarla en el backend)
const VAPID_PUBLIC_KEY = "BNutL-NB7mld99p1-0GI4Td7LD6x8T8DCGDOnvZzOX8Ozj7On0kXjUnvc-SsJvIa6g4MIqXHNtcsBdjlTI8mT_c";

export default function PushNotificationPrompt() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window && "Notification" in window) {
      setIsSupported(true);

      // Verificar si ya está suscrito
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const handleEnableNotifications = async () => {
    if (!isSupported) return;

    // Pedir permiso
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Permiso de notificaciones denegado");
      return;
    }

    // Registrar suscripción
    const subscription = await registerPushNotifications(VAPID_PUBLIC_KEY);
    if (!subscription) {
      console.warn("No se pudo registrar la suscripción");
      return;
    }

    // Guardar en el backend
    const saved = await savePushSubscription(subscription);
    if (saved) {
      setIsSubscribed(true);
    }
  };
  console.log(isSubscribed);
  console.log(isSupported);
  

  return (
    <div className="bg-[#4A4A4A] p-4 rounded-md shadow-md text-center">
      <p className="text-white text-sm mb-3">Activa las notificaciones para recibir recordatorios de tus rutinas</p>
      <Button
        onClick={handleEnableNotifications}
        className="bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-md py-2 px-4 text-sm font-semibold border border-[#2DAF47]"
      >
        Activar Notificaciones
      </Button>
    </div>
  );
}