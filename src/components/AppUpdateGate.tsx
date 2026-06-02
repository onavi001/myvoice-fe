import AppUpdateModal from "./AppUpdateModal";
import { useAppUpdateCheck } from "../hooks/useAppUpdateCheck";

/** Comprueba versión en app nativa y muestra aviso para ir a la tienda. */
export default function AppUpdateGate() {
  const { visible, forceUpdate, latestVersion, storeUrl, currentVersion, dismiss } =
    useAppUpdateCheck();

  return (
    <AppUpdateModal
      visible={visible}
      forceUpdate={forceUpdate}
      currentVersion={currentVersion}
      latestVersion={latestVersion}
      storeUrl={storeUrl}
      onDismiss={dismiss}
    />
  );
}
