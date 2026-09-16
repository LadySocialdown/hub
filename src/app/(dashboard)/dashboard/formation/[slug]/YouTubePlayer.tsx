"use client";

import { useEffect, useRef, useState } from "react";

interface YTPlayerInstance {
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YOUTUBE_ERROR_MESSAGES: Record<number, string> = {
  2: "ID de vidéo invalide. Vérifie l'ID collé dans l'admin (juste la partie après ?v=, sans autre caractère).",
  5: "Cette vidéo ne peut pas être lue dans ce lecteur.",
  100: "Vidéo introuvable ou en mode \"Privé\" sur YouTube. Passe-la en \"Non répertorié\" pour qu'elle soit lisible ici.",
  101: "L'intégration de cette vidéo est désactivée par son propriétaire. Dans YouTube Studio, autorise l'intégration (\"Autoriser l'intégration\").",
  150: "L'intégration de cette vidéo est désactivée par son propriétaire. Dans YouTube Studio, autorise l'intégration (\"Autoriser l'intégration\").",
};

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiLoadPromise;
}

/** Vidéo YouTube non répertoriée, intégrée en iframe. Marque le module terminé à la fin de la vidéo. */
export function YouTubePlayer({ videoId, onEnded }: { videoId: string; onEnded: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let player: YTPlayerInstance | null = null;
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;
      player = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState.ENDED) onEnded();
          },
          onError: (event) => {
            setError(
              YOUTUBE_ERROR_MESSAGES[event.data] ?? "Cette vidéo n'a pas pu être chargée."
            );
          },
        },
      });
    });

    return () => {
      cancelled = true;
      player?.destroy();
    };
  }, [videoId, onEnded]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <div ref={containerRef} className="h-full w-full" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95 px-6 text-center text-sm text-white">
          {error}
        </div>
      )}
    </div>
  );
}
