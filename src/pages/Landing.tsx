import { Link } from "react-router-dom";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.onavi001.myvoicefit";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-[#E0E0E0]">
      <header className="border-b border-[#2D2D2D] px-6 py-4 flex flex-wrap items-center justify-between gap-4 max-w-5xl mx-auto">
        <p className="text-xl font-bold text-[#34C759]">My Voice Fit</p>
        <nav className="flex flex-wrap gap-4 text-sm">
          <a href="#funciones" className="hover:text-[#34C759] transition-colors">
            Funciones
          </a>
          <a href="#app-android" className="hover:text-[#34C759] transition-colors">
            App Android
          </a>
          <Link to="/login" className="hover:text-[#34C759] transition-colors">
            Iniciar sesión
          </Link>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <section>
          <h1 className="text-3xl md:text-4xl font-bold text-[#34C759] mb-4">
            Rutinas de entrenamiento con seguimiento claro
          </h1>
          <p className="text-lg leading-relaxed text-[#D1D1D1]">
            My Voice Fit te ayuda a crear, organizar y completar rutinas de gimnasio. Puedes
            trabajar día a día, registrar tu progreso y usar generación con IA para armar planes
            según tu objetivo. La web sirve para gestionar tu cuenta; la experiencia completa en
            móvil está disponible en Google Play.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-block rounded-md bg-[#34C759] px-5 py-3 text-sm font-semibold text-black hover:bg-[#2DAF47]"
            >
              Entrar a mi cuenta
            </Link>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md border border-[#4A4A4A] px-5 py-3 text-sm font-semibold hover:border-[#34C759]"
            >
              Descargar en Play Store
            </a>
          </div>
        </section>

        <section id="funciones">
          <h2 className="text-2xl font-semibold text-white mb-3">Qué puedes hacer</h2>
          <ul className="list-disc pl-6 space-y-2 text-[#D1D1D1]">
            <li>Crear rutinas por días y ejercicios, con series, repeticiones y descansos.</li>
            <li>Generar borradores de rutina con IA y guardarlos cuando encajen contigo.</li>
            <li>Ver videos de referencia y marcar ejercicios completados en cada sesión.</li>
            <li>Consultar tu progreso y mantener constancia con recordatorios en la app.</li>
            <li>Exportar rutinas en PDF desde la versión web cuando lo necesites.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">Para quién es</h2>
          <p className="leading-relaxed text-[#D1D1D1]">
            Está pensada para personas que entrenan por su cuenta o con un coach y quieren una
            herramienta simple para no perder el hilo de sus sesiones. No sustituye consejo médico
            ni profesional: antes de empezar un plan intenso, consulta con un especialista si lo
            necesitas.
          </p>
        </section>

        <section id="app-android">
          <h2 className="text-2xl font-semibold text-white mb-3">App Android</h2>
          <p className="leading-relaxed text-[#D1D1D1]">
            El paquete publicado es{" "}
            <code className="text-[#34C759]">com.onavi001.myvoicefit</code>. Instálala desde Play
            Store para entrenar con temporizador, notificaciones y la mascota Happy en pantallas de
            logro.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-3">Privacidad y contacto</h2>
          <p className="leading-relaxed text-[#D1D1D1]">
            Tratamos tus datos según nuestra política de privacidad. Puedes leerla en{" "}
            <a href="/privacy-policy.html" className="text-[#34C759] underline">
              Política de privacidad
            </a>
            . Si tienes dudas sobre tu cuenta o el uso de la app, escríbenos desde el correo de
            soporte indicado en esa página.
          </p>
        </section>
      </main>

      <footer className="border-t border-[#2D2D2D] mt-12 py-6 text-center text-sm text-[#B0B0B0]">
        © {new Date().getFullYear()} My Voice Fit
      </footer>
    </div>
  );
}
