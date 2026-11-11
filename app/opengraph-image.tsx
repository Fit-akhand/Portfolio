// The card shown when the site link is shared (LinkedIn, WhatsApp, X, Slack...).
// Built from data/content.ts and the profile photo at build time.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/data/content";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = await readFile(join(process.cwd(), "public/akhand.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "70px 80px",
          backgroundColor: "#000000",
          backgroundImage: "radial-gradient(circle at 82% 50%, rgba(255,122,26,0.30), rgba(0,0,0,0) 55%)",
          color: "#f5f5f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 690 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 26, color: "#98989d" }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#3ddc84", marginRight: 14 }} />
            {profile.status}
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 34, fontSize: 62, fontWeight: 700, lineHeight: 1.06, letterSpacing: -2.5 }}>
            <div style={{ color: "#8e8e93" }}>{profile.headline}</div>
            <div>{profile.headlineAccent}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 44, fontSize: 30 }}>
            <div style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: "#ff7a1a", marginRight: 18 }} />
            <div style={{ fontWeight: 700 }}>{profile.name}</div>
            <div style={{ color: "#98989d", marginLeft: 16 }}>{`· ${profile.role}`}</div>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={300}
          height={400}
          style={{ width: 300, height: 400, borderRadius: 40, objectFit: "cover", border: "6px solid #ff7a1a" }}
        />
      </div>
    ),
    size
  );
}
