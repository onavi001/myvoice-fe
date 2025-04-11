import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { loginUser, registerUser } from "../store/userSlice";

import Button from "../components/Button";
import Input from "../components/Input";
import { motion } from "framer-motion";
import gymAI from "/gymAI.png";

import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const dispatch: AppDispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
        navigate("/");
    }
  }, [user, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (isRegister) {
        await dispatch(registerUser(formData)).unwrap();
      } else {
        await dispatch(loginUser({ email: formData.email, password: formData.password })).unwrap();
      }
      navigate("/");
    } catch {
      setFormError("Error al procesar. Verifica tus datos.");
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.4, ease: "easeOut" } },
  };

  return (
    <>
      <div>
        <title>My Voice - Tu Compañero de Fitness</title>
        <meta name="description" content="Lleva tus rutinas al siguiente nivel con My Voice" />
      </div>
      <div className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center p-4">
        {/* Hero Section */}
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Texto y formulario */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-[#34C759] mb-4"
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              My Voice
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-[#D1D1D1] mb-6"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              Tu compañero perfecto para crear, seguir y optimizar tus rutinas de entrenamiento.
            </motion.p>

            {/* Formulario */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4 max-w-md mx-auto md:mx-0"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              key={isRegister ? "register" : "login"}
            >
              {isRegister && (
                <Input
                  name="username"
                  type="text"
                  placeholder="Nombre de usuario"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:border-transparent"
                  required
                />
              )}
              <Input
                name="email"
                type="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:border-transparent"
                required
              />
              <Input
                name="password"
                type="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#2D2D2D] border border-[#4A4A4A] text-white placeholder-[#B0B0B0] rounded-md p-3 text-sm focus:ring-2 focus:ring-[#34C759] focus:border-transparent"
                required
              />
              {formError && (
                <motion.p
                  className="text-[#EF5350] text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {formError}
                </motion.p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-md py-3 px-4 text-sm font-semibold border border-[#2DAF47] shadow-md transition-all disabled:opacity-50"
              >
                {loading ? "Cargando..." : isRegister ? "Registrarse" : "Iniciar Sesión"}
              </Button>
            </motion.form>

            {/* Alternar entre login y register + forgot-password */}
            <motion.div
              className="mt-4 text-[#B0B0B0] text-sm space-y-2"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="block w-full text-center hover:text-[#34C759] transition-colors"
              >
                {isRegister ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
              </button>
              <Link
                to="/forgot-password"
                className="block w-full text-center hover:text-[#34C759] transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </motion.div>
          </div>

          {/* Imagen decorativa */}
          <motion.div
            className="flex-1 hidden md:block"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <img
              src={gymAI}
              alt="Persona entrenando"
              width={400}
              height={400}
              className="object-cover rounded-lg shadow-lg"
            />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          className="mt-12 text-[#B0B0B0] text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          © {new Date().getFullYear()} My Voice. Todos los derechos reservados.
        </motion.footer>
      </div>
    </>
  );
}