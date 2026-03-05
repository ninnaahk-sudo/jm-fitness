"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getLoggedInUsername, getToken } from "@/lib/auth";
import { getClientDashboard, type ClientDashboardResponse } from "@/lib/api";

export default function ClientDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<ClientDashboardResponse | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageAnimClass, setPageAnimClass] = useState("page-slide-in");
  const [showGlossary, setShowGlossary] = useState(false);

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
      setUsername(getLoggedInUsername() ?? "");
      try {
        const data = await getClientDashboard(token);
        setUsername(data.username);
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
        setUsername((prev) => prev || "Client");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  function setNavDirection(direction: "forward" | "back") {
    sessionStorage.setItem("jm_nav_dir", direction);
  }

  function formatJoinedDate(value?: string) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <main
      className={pageAnimClass}
      style={{
        minHeight: "100dvh",
        padding: "24px 20px 92px",
        backgroundColor: "#9e7a88",
        backgroundImage:
          "radial-gradient(120% 70% at 10% 0%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 55%), radial-gradient(80% 55% at 90% 8%, rgba(129,74,97,0.35) 0%, rgba(129,74,97,0) 58%), radial-gradient(130% 100% at 50% 120%, rgba(47,22,34,0.5) 0%, rgba(47,22,34,0) 55%), linear-gradient(165deg, #c09aa9 0%, #a57f8f 45%, #865f72 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <h1
          style={{
            margin: 0,
            flex: 1,
            minWidth: 0,
            color: "#f6eaef",
            fontFamily: "Georgia, Times New Roman, serif",
            fontSize: 34,
            lineHeight: 1.1,
            overflowWrap: "anywhere",
            wordBreak: "break-word",
            textShadow: "0 2px 3px rgba(0,0,0,0.22)",
          }}
        >
          Welcome, {username}!
        </h1>
        <button
          onClick={logout}
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.45)",
            background: "rgba(243,236,240,0.8)",
            color: "#3b2730",
            padding: "8px 10px",
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>

      {loading && (
        <p style={{ color: "#f7edf2", marginTop: 6, fontSize: 18, textShadow: "0 1px 2px rgba(0,0,0,0.22)" }}>
          Loading...
        </p>
      )}
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

      {!loading && !error && dashboard && (
        <>
          <div style={{ display: "grid", gap: 14 }}>
            {dashboard.days.map((d) => (
              <Link
                className="tap-card"
                key={d.dayNumber}
                href={`/client/day/${d.dayNumber}`}
                onClick={() => setNavDirection("forward")}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid rgba(255,255,255,0.55)",
                  outline: "1px solid rgba(255,255,255,0.6)",
                  outlineOffset: -1,
                  background:
                    "linear-gradient(150deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 55%, rgba(196,149,171,0.2) 100%)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 24,
                  padding: "16px 14px",
                  boxShadow:
                    "0 18px 28px rgba(52,22,36,0.35), inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(255,255,255,0.1)",
                  color: "#f8ecf1",
                  fontFamily: "Georgia, Times New Roman, serif",
                  fontSize: 36,
                  lineHeight: 1,
                  transition: "transform 200ms ease, box-shadow 200ms ease",
                }}
              >
                <span style={{ textShadow: "0 2px 6px rgba(46,18,30,0.45)" }}>Day {d.dayNumber}</span>
                <span style={{ fontSize: 26, opacity: 0.9, textShadow: "0 2px 6px rgba(46,18,30,0.4)" }}>›</span>
              </Link>
            ))}

            <Link
              className="tap-card"
              href="/client/videos"
              onClick={() => setNavDirection("forward")}
              style={{
                marginTop: 6,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid rgba(255,255,255,0.6)",
                background:
                  "linear-gradient(150deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 55%, rgba(196,149,171,0.22) 100%)",
                backdropFilter: "blur(8px)",
                borderRadius: 24,
                padding: "16px 14px",
                boxShadow:
                  "0 18px 28px rgba(52,22,36,0.35), inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(255,255,255,0.1)",
                color: "#f8ecf1",
                fontFamily: "Georgia, Times New Roman, serif",
                fontSize: 36,
                lineHeight: 1,
                transition: "transform 200ms ease, box-shadow 200ms ease",
              }}
            >
              <span style={{ textShadow: "0 2px 6px rgba(46,18,30,0.45)" }}>Videos</span>
              <span style={{ fontSize: 26, opacity: 0.9, textShadow: "0 2px 6px rgba(46,18,30,0.4)" }}>›</span>
            </Link>
          </div>

          <footer
            style={{
              position: "fixed",
              right: 20,
              bottom: 14,
              color: "#3b2730",
              fontSize: 13,
              fontWeight: 600,
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <button
              type="button"
              onClick={() => setShowGlossary(true)}
              style={{
                all: "unset",
                cursor: "pointer",
                color: "#3b2730",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Instrukcije
            </button>
            <span>Joined: {formatJoinedDate(dashboard.joinedAt) || "Unknown date"}</span>
          </footer>

          {showGlossary && (
            <>
              <div
                role="presentation"
                onClick={() => setShowGlossary(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.4)",
                  zIndex: 1000,
                }}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Instrukcije"
                style={{
                  position: "fixed",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "#fff",
                  borderRadius: 16,
                  padding: 20,
                  maxWidth: 420,
                  width: "calc(100% - 48px)",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  zIndex: 1001,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", marginBottom: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowGlossary(false)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 20,
                      color: "#3b2730",
                      cursor: "pointer",
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
                <div
                  style={{
                    color: "#3b2730",
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontFamily: "Georgia, Times New Roman, serif",
                  }}
                >
                  <p style={{ margin: "0 0 12px" }}>
                    <strong>„F“</strong> – radna serija. „F“ znači <em>failure</em> ili otkaz. Ovakvu seriju treba da radiš uz nečiju pomoć/nadgledanje, tako da možeš da pređeš granicu.
                  </p>
                  <p style={{ margin: "0 0 12px" }}>
                    <strong>„W“</strong> – warm-up serija, zagrevajuća. Radiš sa 50% kilaže radne serije.
                  </p>
                  <p style={{ margin: "0 0 12px" }}>
                    <strong>„RIR“</strong> – Reps in Reserve ili ponavljanja u rezervi. Predstavlja broj ponavljanja koji ti je ostao do/blizu otkaza.
                  </p>
                  <p style={{ margin: "0 0 12px" }}>
                    <strong>„RIR0“</strong> – radna serija, bez ponavljanja u rezervi, blizu otkaza koji postižeš sama.
                  </p>
                  <p style={{ margin: "0 0 12px" }}>
                    <strong>„RIR1“</strong> – ostalo ti je jedno ponavljanje u rezervi.
                  </p>
                  <p style={{ margin: "0 0 0" }}>
                    <strong>„RIR2“</strong> – ostala su ti dva ponavljanja u rezervi.
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
