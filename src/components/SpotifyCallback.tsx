import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      console.error("Error en autenticación Spotify:", error);
      navigate("/");
      return;
    }

    if (code) {
      const redirectUri =
        process.env.NODE_ENV === "production"
          ? "https://tudominio.netlify.app/callback"
          : "https://localhost:5173/callback";
      fetch(
        `/api/spotify/auth?code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Error obteniendo token: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.access_token) {
            localStorage.setItem("spotify_access_token", data.access_token);
            navigate("/");
          } else {
            console.error("No se recibió access_token:", data);
            navigate("/");
          }
        })
        .catch((error) => {
          console.error("Error obteniendo token:", error);
          navigate("/");
        });
    } else {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
      <p className="text-white text-lg">Procesando autenticación...</p>
    </div>
  );
};

export default SpotifyCallback;