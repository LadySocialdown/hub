"use client";

import { useEffect } from "react";
import { BODY_FONTS, TITLE_FONTS, googleFontsHref } from "@/lib/studio/constants";

/**
 * Charge les polices de l'élève, uniquement pour ses aperçus et ses contenus :
 * les polices Google de la liste et ses polices importées.
 */
export function FontLoader({ custom = [] }: { custom?: { name: string; url: string }[] }) {
  useEffect(() => {
    const id = "studio-google-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = googleFontsHref([...TITLE_FONTS, ...BODY_FONTS]);
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const id = "studio-custom-fonts";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = custom
      .map((f) => `@font-face{font-family:'${f.name.replace(/'/g, "")}';src:url('${f.url}');font-display:swap}`)
      .join("\n");
  }, [custom]);

  return null;
}
