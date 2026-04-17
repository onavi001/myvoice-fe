import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Error al enviar la solicitud");
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center">
      <div className="p-6 max-w-md w-full bg-[#2D2D2D] rounded-lg shadow-md">
        <h1 className="text-xl font-semibold mb-4">Olvidé mi contraseña</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 space-y-4">
            <label htmlFor="email" className="block text-sm font-medium">
              Correo electrónico
            </label>
            <Input
              type="email"
              name="email"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <Button
            type="submit"
            
          >
            Enviar enlace de restablecimiento
          </Button>
        </form>
        {message && <p className="mt-4 text-green-500">{message}</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
}