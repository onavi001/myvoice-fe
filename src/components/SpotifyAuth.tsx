import { useEffect, useState } from "react";
import Button from "./Button";

const SpotifyAuth: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_access_token");
    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "2da5252b72964073af40409d4b230b87";
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://tudominio.netlify.app/callback"
        : "https://192.168.1.238:5173/callback";
    const scopes = [
        "streaming",
        "user-read-email",
        "user-read-private",
        "user-read-playback-state",
        "user-modify-playback-state",
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-public",
        "playlist-modify-private",
        "user-library-read",
        "user-library-modify",
        "user-follow-read",
        "user-follow-modify",
        "user-top-read",
        "user-read-recently-played",
        "user-read-playback-position",
        "user-read-currently-playing",
    ].join(" ");
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
  };

  if (accessToken) {
    return null;
  }

  return (
    <div className="bg-[#4A4A4A] p-4 rounded-md shadow-md text-center">
      <p className="text-white text-sm mb-3">Conecta Spotify para reproducir música durante tus ejercicios</p>
      <Button
        onClick={handleLogin}
        className="bg-[#34C759] text-black hover:bg-[#2DAF47] rounded-md py-2 px-4 text-sm font-semibold border border-[#2DAF47]"
      >
        Conectar con Spotify
      </Button>
    </div>
  );
};

export default SpotifyAuth;