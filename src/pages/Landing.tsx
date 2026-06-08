import { Link } from "react-router-dom";
import {
  SparklesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.onavi001.myvoicefit";

const FEATURES = [
  {
    icon: SparklesIcon,
    title: "Rutinas con IA",
    text: "Genera un plan según tu objetivo.",
  },
  {
    icon: CheckCircleIcon,
    title: "Entrena día a día",
    text: "Marca ejercicios y sigue tu rutina.",
  },
  {
    icon: ChartBarIcon,
    title: "Tu progreso",
    text: "Ve avances y mantén constancia.",
  },
  {
    icon: ArrowDownTrayIcon,
    title: "Exporta PDF",
    text: "Lleva tu rutina donde quieras.",
  },
] as const;

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#34C759]/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#34C759]/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-[#2D2D2D]/80 bg-[#0A0A0A]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <p className="text-lg font-bold tracking-tight text-[#34C759]">My Voice Fit</p>
          <nav className="flex items-center gap-3 text-sm sm:gap-5">
            <a href="#funciones" className="hidden text-[#B0B0B0] hover:text-[#34C759] sm:inline">
              Funciones
            </a>
            <a href="#sobre" className="hidden text-[#B0B0B0] hover:text-[#34C759] sm:inline">
              Sobre
            </a>
            <a href="/privacy-policy.html" className="hidden text-[#B0B0B0] hover:text-[#34C759] sm:inline">
              Privacidad
            </a>
            <Link
              to="/login"
              className="rounded-full border border-[#3A3A3A] px-4 py-2 text-[#E0E0E0] hover:border-[#34C759] hover:text-[#34C759] transition-colors"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-5xl items-center gap-10 px-5 py-12 md:grid-cols-2 md:py-16 lg:py-20">
          <div className="order-2 md:order-1 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#34C759]/30 bg-[#34C759]/10 px-3 py-1 text-xs font-medium text-[#34C759]">
              <DevicePhoneMobileIcon className="h-4 w-4" />
              App Android · Web
            </p>
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Tu gym,
              <span className="text-[#34C759]"> organizado</span>
            </h1>
            <p className="max-w-md text-base text-[#B0B0B0] sm:text-lg">
              Rutinas, progreso e IA en un solo lugar. Simple de usar, sin complicaciones.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#34C759] px-6 py-3 text-sm font-semibold text-black shadow-[0_0_24px_rgba(52,199,89,0.25)] hover:bg-[#2DAF47] transition-colors"
              >
                Descargar gratis
              </a>
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#4A4A4A] px-6 py-3 text-sm font-semibold text-[#E0E0E0] hover:border-[#34C759] hover:text-[#34C759] transition-colors"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#34C759]/20 to-transparent blur-2xl" />
              <img
                src="/assets/happy/happy-coach-idle.png"
                alt="Happy, mascota de My Voice Fit"
                width={320}
                height={320}
                className="relative h-56 w-56 object-contain drop-shadow-2xl sm:h-72 sm:w-72 lg:h-80 lg:w-80"
              />
            </div>
          </div>
        </section>

        <section id="funciones" className="border-t border-[#2D2D2D]/80 bg-[#111111]">
          <div className="mx-auto max-w-5xl px-5 py-12 md:py-14">
            <h2 className="mb-8 text-center text-xl font-semibold text-white sm:text-2xl">
              Todo lo que necesitas
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-[#2D2D2D] bg-[#1A1A1A] p-5 transition-colors hover:border-[#34C759]/40"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-[#34C759]/15 p-2.5 text-[#34C759]">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mb-1 font-semibold text-white">{title}</h3>
                  <p className="text-sm text-[#B0B0B0]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sobre" className="border-t border-[#2D2D2D]/80">
          <div className="mx-auto max-w-5xl px-5 py-12 md:py-14">
            <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">
              Qué es My Voice Fit
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-[#B0B0B0] sm:text-base">
              <p>
                My Voice Fit es una plataforma de entrenamiento personal que combina planificación de rutinas,
                seguimiento de progreso y asistencia con inteligencia artificial. Puedes usarla desde el navegador
                o descargar la app Android en Google Play.
              </p>
              <p>
                Crea rutinas con ejercicios, series y repeticiones; marca lo completado en cada sesión;
                consulta estadísticas de constancia y exporta tu plan en PDF. La IA te ayuda a generar
                propuestas según tu objetivo (fuerza, resistencia, etc.) sin sustituir el criterio de un
                profesional sanitario o deportivo cuando lo necesites.
              </p>
              <p>
                El servicio incluye cuenta de usuario, sincronización con nuestro backend y, en la versión web,
                espacios publicitarios gestionados por Google AdSense conforme a nuestra{" "}
                <a href="/privacy-policy.html" className="text-[#34C759] hover:underline">
                  política de privacidad
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section id="app-android" className="mx-auto max-w-5xl px-5 py-12 md:py-14">
          <div className="rounded-2xl border border-[#34C759]/30 bg-gradient-to-r from-[#1A1A1A] to-[#142016] p-6 text-center sm:p-8">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              ¿Listo para entrenar?
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-[#B0B0B0]">
              Temporizador, recordatorios y Happy cuando completas una sesión.
            </p>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#34C759] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#2DAF47] transition-colors"
            >
              Ver en Google Play
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#2D2D2D] px-5 py-6 text-center text-xs text-[#888]">
        <p>© {new Date().getFullYear()} My Voice Fit</p>
        <p className="mt-2">
          <a href="/privacy-policy.html" className="text-[#34C759] hover:underline">
            Privacidad
          </a>
          <span className="mx-2 text-[#444]">·</span>
          <span>Entrenamiento informativo; consulta a un profesional si lo necesitas.</span>
        </p>
      </footer>
    </div>
  );
}
