"use client";

import { toPng } from "html-to-image";
import { uploadFile } from "../ui";

/**
 * Exporte des nœuds rendus en taille de référence (360 px ou 270 px de large)
 * en PNG haute définition, les envoie dans le bucket et renvoie leurs URL.
 */
export async function exportNodes(nodes: HTMLElement[], pixelRatio: number, baseName: string) {
  await document.fonts?.ready;
  const urls: string[] = [];
  const dataUrls: string[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const dataUrl = await toPng(nodes[i], { pixelRatio, cacheBust: true });
    dataUrls.push(dataUrl);
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `${baseName}-${i + 1}.png`, { type: "image/png" });
    const { url } = await uploadFile(file, "export");
    urls.push(url);
  }
  return { urls, dataUrls };
}

export function downloadAll(dataUrls: string[], baseName: string) {
  dataUrls.forEach((u, i) => {
    const a = document.createElement("a");
    a.href = u;
    a.download = `${baseName}-${i + 1}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
}

export function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "contenu";
}
