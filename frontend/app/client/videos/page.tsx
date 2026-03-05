"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getClientVideoExercises, type ClientVideoExercise } from "@/lib/api";

export default function ClientVideosPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ClientVideoExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageAnimClass, setPageAnimClass] = useState("page-slide-in");

  useEffect(() => {
    const direction = sessionStorage.getItem("jm_nav_dir");
    setPageAnimClass(direction === "back" ? "page-slide-back" : "page-slide-in");
    sessionStorage.removeItem("jm_nav_dir");

    async function load() {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const data = await getClientVideoExercises(token);
        setExercises(data.exercises);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  function setNavDirection(direction: "forward" | "back") {
    sessionStorage.setItem("jm_nav_dir", direction);
  }

  return (
    <main
      className={pageAnimClass}
      style={{
        minHeight: "100dvh",
        padding: "24px 20px 32px",
        backgroundColor: "#9e7a88",
        backgroundImage:
          "radial-gradient(120% 70% at 10% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 55%), radial-gradient(80% 55% at 90% 8%, rgba(129,74,97,0.35) 0%, rgba(129,74,97,0) 58%), radial-gradient(130% 100% at 50% 120%, rgba(47,22,34,0.5) 0%, rgba(47,22,34,0) 55%), linear-gradient(165deg, #c09aa9 0%, #a57f8f 45%, #865f72 100%)",
      }}
    >
      <p style={{ margin: 0 }}>
        <Link href="/client" onClick={() => setNavDirection("back")} style={{ color: "#f8ecf1", textDecoration: "none" }}>
          ← Back to days
        </Link>
      </p>
      <h1
        style={{
          margin: "10px 0 14px",
          color: "#f6eaef",
          fontFamily: "Georgia, Times New Roman, serif",
          fontSize: 44,
          textShadow: "0 2px 3px rgba(0,0,0,0.22)",
        }}
      >
        Videos
      </h1>

      {loading && <p style={{ color: "#f7edf2" }}>Loading...</p>}
      {error && (
        <p
          style={{
            color: "#5d0f29",
            background: "rgba(255,255,255,0.5)",
            borderRadius: 12,
            padding: "8px 10px",
            width: "fit-content",
          }}
        >
          {error}
        </p>
      )}

      {!loading && !error && (
        <div style={{ display: "grid", gap: 8 }}>
          {exercises.map((exercise) => (
            <Link
              className="tap-card"
              key={exercise.id}
              href={`/client/videos/${exercise.id}`}
              onClick={() => setNavDirection("forward")}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid rgba(255,255,255,0.6)",
                background:
                  "linear-gradient(150deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 55%, rgba(196,149,171,0.22) 100%)",
                backdropFilter: "blur(8px)",
                borderRadius: 16,
                padding: "10px 12px",
                boxShadow:
                  "0 18px 28px rgba(52,22,36,0.35), inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(255,255,255,0.1)",
                color: "#f8ecf1",
                fontFamily: "Georgia, Times New Roman, serif",
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              <span>{exercise.name}</span>
              <span style={{ fontSize: 16, opacity: 0.9 }}>›</span>
            </Link>
          ))}
          {exercises.length === 0 ? <p style={{ color: "#f7edf2" }}>No video exercises yet.</p> : null}
        </div>
      )}
    </main>
  );
}
