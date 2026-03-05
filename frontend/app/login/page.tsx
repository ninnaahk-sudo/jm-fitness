"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { setLoggedInUsername, setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("trainer1");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await login(username, password);
      setToken(data.token);
      setLoggedInUsername(data.user.username);

      if (data.user.role === "TRAINER") {
        router.push("/trainer");
      } else if (data.user.role === "CLIENT") {
        router.push("/client");
      } else {
        setError("Unsupported account role.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "start center",
        padding: "96px 24px 24px",
        backgroundColor: "#cfb2bc",
        backgroundImage:
          "radial-gradient(120% 70% at 15% 12%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.0) 50%), radial-gradient(90% 55% at 80% 28%, rgba(188,129,151,0.28) 0%, rgba(188,129,151,0.0) 55%), radial-gradient(95% 55% at 20% 74%, rgba(157,97,121,0.22) 0%, rgba(157,97,121,0.0) 55%), linear-gradient(165deg, #d6bcc5 0%, #caa3b2 100%)",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 320,
          display: "grid",
          gap: 22,
        }}
      >
        <label style={{ display: "grid", gap: 8 }}>
          <span
            style={{
              color: "#f8eef2",
              fontSize: 20,
              lineHeight: 1,
              fontFamily: "Georgia, Times New Roman, serif",
              textShadow: "0 1px 2px rgba(0,0,0,0.12)",
            }}
          >
            username:
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            style={{
              width: "100%",
              height: 52,
              borderRadius: 22,
              border: "none",
              outline: "none",
              padding: "0 16px",
              background: "rgba(235,236,240,0.95)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
              fontSize: 18,
              color: "#3f2b35",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 8 }}>
          <span
            style={{
              color: "#f8eef2",
              fontSize: 20,
              lineHeight: 1,
              fontFamily: "Georgia, Times New Roman, serif",
              textShadow: "0 1px 2px rgba(0,0,0,0.12)",
            }}
          >
            password:
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={{
              width: "100%",
              height: 52,
              borderRadius: 22,
              border: "none",
              outline: "none",
              padding: "0 16px",
              background: "rgba(235,236,240,0.95)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
              fontSize: 18,
              color: "#3f2b35",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            justifySelf: "end",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.58)",
            outline: "none",
            background: "linear-gradient(145deg, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0.2) 100%)",
            backdropFilter: "blur(8px)",
            boxShadow:
              "0 10px 16px rgba(48,21,33,0.3), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(255,255,255,0.12)",
            fontFamily: "Georgia, Times New Roman, serif",
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            padding: "8px 10px",
            letterSpacing: "0.5px",
            color: "#241a20",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "..." : "ENTER"}
        </button>

        {error ? (
          <p
            style={{
              marginTop: 2,
              color: "#5d0f29",
              fontWeight: 600,
              background: "rgba(255,255,255,0.45)",
              borderRadius: 12,
              padding: "8px 10px",
              width: "fit-content",
            }}
          >
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}