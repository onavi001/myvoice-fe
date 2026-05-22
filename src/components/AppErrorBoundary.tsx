import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0] flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-xl font-semibold text-[#34C759] mb-2">Algo salió mal</h1>
          <p className="text-sm text-[#B0B0B0] mb-6 max-w-sm">
            Ocurrió un error inesperado. Recarga la app para continuar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-12 px-6 rounded-xl bg-[#34C759] text-black font-semibold touch-manipulation"
          >
            Recargar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
