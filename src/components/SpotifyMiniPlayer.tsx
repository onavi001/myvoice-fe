import React, { useState, useEffect } from "react";
import { usePlaybackState, useSpotifyPlayer } from "react-spotify-web-playback-sdk";
import { PlayIcon, PauseIcon, ForwardIcon, BackwardIcon } from "@heroicons/react/24/solid";

interface SpotifyMiniPlayerProps {
  accessToken: string | null;
  isExerciseStarted: boolean;
  playlistUri?: string;
}

const SpotifyMiniPlayer: React.FC<SpotifyMiniPlayerProps> = ({
  accessToken,
  isExerciseStarted,
  playlistUri = "spotify:playlist:37i9dQZF1DX0UrRvztWcAU",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const player = useSpotifyPlayer();
  const playbackState = usePlaybackState();

  useEffect(() => {
    if (isExerciseStarted && player && accessToken) {
      player
        .connect()
        .then(() => {
          console.log("Spotify Player conectado");
          fetch("https://api.spotify.com/v1/me/player/play", {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              context_uri: playlistUri,
              position_ms: 0,
            }),
          })
            .then((res) => {
              if (!res.ok) {
                throw new Error("Error iniciando reproducción");
              }
              setIsPlaying(true);
              console.log("Reproducción iniciada:", playlistUri);
            })
            .catch((error) => console.error("Error iniciando reproducción:", error));
        })
        .catch((error) => console.error("Error conectando Spotify Player:", error));
    }
  }, [isExerciseStarted, player, accessToken, playlistUri]);

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pause().then(() => setIsPlaying(false));
      } else {
        player.resume().then(() => setIsPlaying(true));
      }
    }
  };

  const nextTrack = () => {
    if (player) {
      player.nextTrack().then(() => console.log("Siguiente pista"));
    }
  };

  const previousTrack = () => {
    if (player) {
      player.previousTrack().then(() => console.log("Pista anterior"));
    }
  };

  if (!accessToken || !isExerciseStarted) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] text-white p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-3">
        {playbackState?.track_window.current_track ? (
          <>
            <img
              src={playbackState.track_window.current_track.album.images[0]?.url}
              alt="Album"
              className="w-12 h-12 rounded"
            />
            <div>
              <p className="text-sm font-semibold">
                {playbackState.track_window.current_track.name}
              </p>
              <p className="text-xs text-gray-400">
                {playbackState.track_window.current_track.artists[0].name}
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm">Cargando pista...</p>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={previousTrack}
          className="text-gray-400 hover:text-[#34C759] focus:outline-none"
          aria-label="Pista anterior"
        >
          <BackwardIcon className="h-5 w-5" />
        </button>
        <button
          onClick={togglePlay}
          className="bg-[#34C759] text-black rounded-full p-3 hover:bg-[#2DAF47] focus:outline-none"
          aria-label={isPlaying ? "Pausar" : "Reproducir"}
        >
          {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </button>
        <button
          onClick={nextTrack}
          className="text-gray-400 hover:text-[#34C759] focus:outline-none"
          aria-label="Siguiente pista"
        >
          <ForwardIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default SpotifyMiniPlayer;