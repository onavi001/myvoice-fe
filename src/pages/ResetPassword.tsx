import { useState, useEffect } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (!token) {
      setError("Token no proporcionado");
    }else{
      setError("");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Error al restablecer la contraseña");
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white flex items-center justify-center">
      <div className="p-6 max-w-md w-full bg-[#2D2D2D] rounded-lg shadow-md">
        <h1 className="text-xl font-semibold mb-4">Restablecer contraseña</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium">
              Nueva contraseña
            </label>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirmar contraseña
            </label>
            <Input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <Button
            type="submit"
            disabled={!token}
          >
            Restablecer contraseña
          </Button>
        </form>
        {message && <p className="mt-4 text-green-500">{message}</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
}