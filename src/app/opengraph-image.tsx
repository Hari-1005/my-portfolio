import { ImageResponse } from "next/og";
import { profile } from "@content/profile";

export const alt = profile.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#121212",
        color: "#f2f2f2",
      }}
    >
      <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: "-0.02em" }}>{profile.name}</div>
      <div style={{ marginTop: 24, fontSize: 36, color: "#a3a3a3" }}>
        {`github.com/${profile.githubUsername}`}
      </div>
    </div>,
    size,
  );
}
