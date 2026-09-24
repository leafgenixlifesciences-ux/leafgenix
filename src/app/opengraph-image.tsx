import { ImageResponse } from "next/og";

export const alt = "Leaf Genix Lifesciences — research-led nutraceuticals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          color: "white",
          background: "linear-gradient(145deg, #07572f 0%, #003c23 48%, #06170f 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ position: "absolute", width: 520, height: 520, borderRadius: 520, right: -100, top: -190, background: "rgba(184,217,59,.22)" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: 400, left: -180, bottom: -240, background: "rgba(237,148,13,.2)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 82px", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 28, fontWeight: 700 }}>
            <div style={{ width: 54, height: 54, borderRadius: 54, background: "#b8d93b", color: "#003c23", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>L</div>
            Leaf Genix Lifesciences
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 82, fontWeight: 800, lineHeight: 0.98, letterSpacing: "-4px", maxWidth: 900 }}>
              <span>Better labels.</span>
              <span>Better choices.</span>
            </div>
            <div style={{ marginTop: 30, fontSize: 27, color: "rgba(255,255,255,.74)" }}>
              Research-led nutraceuticals · Complete quantities · Made in India
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, color: "#b8d93b" }}>
            <span>Lifting and Empowering All Families</span>
            <span>leafgenix.in</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
