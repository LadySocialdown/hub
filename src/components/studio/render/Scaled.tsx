/** Affiche un rendu de largeur fixe (360 px ou 270 px) réduit à une largeur donnée. */
export function Scaled({ base, width, ratio, children }: { base: number; width: number; ratio: number; children: React.ReactNode }) {
  const k = width / base;
  return (
    <div style={{ width, height: width * ratio, position: "relative", flex: "none" }}>
      <div style={{ width: base, transform: `scale(${k})`, transformOrigin: "top left", position: "absolute", left: 0, top: 0 }}>{children}</div>
    </div>
  );
}
