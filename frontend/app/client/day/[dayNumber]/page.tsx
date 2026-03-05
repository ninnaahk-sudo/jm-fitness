"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getClientDay, updateClientDayItem, type ClientDayItem, type ClientDayResponse } from "@/lib/api";

export default function ClientDayPage() {
  const router = useRouter();
  const params = useParams<{ dayNumber: string }>();
  const dayNumber = useMemo(() => Number(params.dayNumber), [params.dayNumber]);
  const [day, setDay] = useState<ClientDayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [pageAnimClass, setPageAnimClass] = useState("page-slide-in");
  const [clientKgDraft, setClientKgDraft] = useState<Record<string, string>>({});

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
      if (!dayNumber) {
        setError("Invalid day number.");
        setLoading(false);
        return;
      }
      try {
        const data = await getClientDay(token, dayNumber);
        setDay(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load day");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [dayNumber, router]);

  function toggleItem(key: string) {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setNavDirection(direction: "forward" | "back") {
    sessionStorage.setItem("jm_nav_dir", direction);
  }

  async function handleClientKgChange(
    itemId: number,
    setIdx: number,
    value: string,
    item: { clientSet1Kg: number | null; clientSet2Kg: number | null; clientSet3Kg: number | null; clientSet4Kg: number | null }
  ) {
    const key = `${itemId}-${setIdx}`;
    setClientKgDraft((prev) => ({ ...prev, [key]: value }));
    if (value.length > 4) return;
    const num = value.trim() === "" ? null : Number(value);
    if (num !== null && (!Number.isFinite(num) || num < 0)) return;
    const token = getToken();
    if (!token) return;
    const payload = {
      clientSet1Kg: setIdx === 0 ? num : item.clientSet1Kg,
      clientSet2Kg: setIdx === 1 ? num : item.clientSet2Kg,
      clientSet3Kg: setIdx === 2 ? num : item.clientSet3Kg,
      clientSet4Kg: setIdx === 3 ? num : item.clientSet4Kg,
    };
    try {
      await updateClientDayItem(token, dayNumber, itemId, payload);
      setDay((prev) => {
        if (!prev) return prev;
        const upd = (i: ClientDayItem) =>
          i.id === itemId
            ? {
                ...i,
                clientSet1Kg: setIdx === 0 ? num : i.clientSet1Kg,
                clientSet2Kg: setIdx === 1 ? num : i.clientSet2Kg,
                clientSet3Kg: setIdx === 2 ? num : i.clientSet3Kg,
                clientSet4Kg: setIdx === 3 ? num : i.clientSet4Kg,
              }
            : i;
        return {
          ...prev,
          warmup: prev.warmup.map(upd),
          training: prev.training.map(upd),
        };
      });
    } catch {
      // keep draft on error
    }
  }

  return (
    <main
      className={pageAnimClass}
      style={{
        minHeight: "100dvh",
        padding: "24px 20px 32px",
        backgroundColor: "#9e7a88",
        backgroundImage:
          "radial-gradient(120% 70% at 10% 0%, rgba(255,255,255,0.27) 0%, rgba(255,255,255,0) 55%), radial-gradient(80% 55% at 90% 8%, rgba(129,74,97,0.38) 0%, rgba(129,74,97,0) 58%), radial-gradient(90% 50% at 14% 82%, rgba(208,158,183,0.24) 0%, rgba(208,158,183,0) 62%), radial-gradient(130% 100% at 50% 120%, rgba(47,22,34,0.55) 0%, rgba(47,22,34,0) 55%), linear-gradient(165deg, #c09aa9 0%, #a57f8f 45%, #865f72 100%)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <p style={{ margin: 0 }}>
          <Link
            href="/client"
            onClick={() => setNavDirection("back")}
            style={{ color: "#f8ecf1", textDecoration: "none" }}
          >
            ← Back to dashboard
          </Link>
        </p>
      </div>
      <h1
        style={{
          marginTop: 10,
          marginBottom: 0,
          color: "#f6eaef",
          fontFamily: "Georgia, Times New Roman, serif",
          fontSize: 44,
          textShadow: "0 2px 3px rgba(0,0,0,0.22)",
        }}
      >
        Day {dayNumber}
      </h1>

      {loading && (
        <p style={{ color: "#f7edf2", marginTop: 6, fontSize: 18, textShadow: "0 1px 2px rgba(0,0,0,0.22)" }}>
          Loading day...
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

      {!loading && !error && day && (
        <div style={{ display: "grid", gap: 16, marginTop: 14 }}>
          <section
            style={{
              padding: 0,
            }}
          >
            <h2 style={{ marginTop: 0, color: "#f8ecf1", fontFamily: "Georgia, Times New Roman, serif" }}>
              <span
                style={{
                  textShadow: "0 2px 6px rgba(46,18,30,0.3)",
                }}
              >
                Warmup ✦
              </span>
            </h2>
            {day.warmup.length === 0 ? (
              <p style={{ color: "#f7edf2" }}>No warmup items.</p>
            ) : (
              <ul style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {day.warmup.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.5)",
                      outline: "1px solid rgba(255,255,255,0.55)",
                      outlineOffset: -1,
                      borderRadius: 20,
                      padding: 12,
                      background:
                        "linear-gradient(160deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 60%, rgba(179,122,147,0.2) 100%)",
                      boxShadow: "0 10px 20px rgba(44,18,30,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(`warmup-${item.id}`)}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        color: "#f8edf2",
                        fontWeight: 600,
                        fontSize: 24,
                        fontFamily: "Georgia, Times New Roman, serif",
                      }}
                    >
                      <span style={{ textShadow: "0 2px 6px rgba(46,18,30,0.45)" }}>{item.exerciseName}</span>
                      <span>{expandedItems[`warmup-${item.id}`] ? "▴" : "▾"}</span>
                    </button>
                    {expandedItems[`warmup-${item.id}`] && (
                      <>
                        <div
                          style={{
                            marginTop: 10,
                            height: 1,
                            background:
                              "linear-gradient(90deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 100%)",
                          }}
                        />
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: 12 }}>
                            {item.sets.map((setText, idx) => (
                              <div
                                key={`${item.id}-set-${idx}`}
                                style={{
                                  color: "#f8edf2",
                                  padding: "6px 0",
                                  fontSize: 18,
                                  fontFamily: "Georgia, Times New Roman, serif",
                                }}
                              >
                                {setText}
                              </div>
                            ))}
                          </div>
                          <div
                            style={{
                              width: 1,
                              alignSelf: "stretch",
                              background:
                                "linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 100%)",
                            }}
                          />
                          <div
                            style={{
                              flex: 1,
                              paddingLeft: 12,
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            {item.sets.map((_, idx) => {
                              const val = item[`clientSet${idx + 1}Kg` as keyof typeof item];
                              const displayVal = clientKgDraft[`${item.id}-${idx}`] ?? (val != null ? String(val) : "");
                              return (
                                <div key={`${item.id}-kg-${idx}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={displayVal}
                                    onChange={(e) => handleClientKgChange(item.id, idx, e.target.value, item)}
                                    placeholder="—"
                                    style={{
                                      width: 56,
                                      borderRadius: 10,
                                      border: "1px solid rgba(255,255,255,0.5)",
                                      background: "rgba(255,255,255,0.2)",
                                      color: "#f8edf2",
                                      padding: "6px 8px",
                                      fontSize: 16,
                                      fontFamily: "Georgia, Times New Roman, serif",
                                    }}
                                  />
                                  <span style={{ color: "#f8edf2", fontSize: 16, fontFamily: "Georgia, Times New Roman, serif" }}>
                                    kg
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            style={{
              padding: 0,
            }}
          >
            <h2 style={{ marginTop: 0, color: "#f8ecf1", fontFamily: "Georgia, Times New Roman, serif" }}>
              <span
                style={{
                  textShadow: "0 2px 6px rgba(46,18,30,0.3)",
                }}
              >
                Training ✦
              </span>
            </h2>
            {day.training.length === 0 ? (
              <p style={{ color: "#f7edf2" }}>No training items.</p>
            ) : (
              <ul style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {day.training.map((item) => (
                  <li
                    key={item.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.5)",
                      outline: "1px solid rgba(255,255,255,0.55)",
                      outlineOffset: -1,
                      borderRadius: 20,
                      padding: 12,
                      background:
                        "linear-gradient(160deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 60%, rgba(179,122,147,0.2) 100%)",
                      boxShadow: "0 10px 20px rgba(44,18,30,0.28), inset 0 1px 0 rgba(255,255,255,0.25)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(`training-${item.id}`)}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        color: "#f8edf2",
                        fontWeight: 600,
                        fontSize: 24,
                        fontFamily: "Georgia, Times New Roman, serif",
                      }}
                    >
                      <span style={{ textShadow: "0 2px 6px rgba(46,18,30,0.45)" }}>{item.exerciseName}</span>
                      <span>{expandedItems[`training-${item.id}`] ? "▴" : "▾"}</span>
                    </button>
                    {expandedItems[`training-${item.id}`] && (
                      <>
                        <div
                          style={{
                            marginTop: 10,
                            height: 1,
                            background:
                              "linear-gradient(90deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 100%)",
                          }}
                        />
                        <div
                          style={{
                            marginTop: 10,
                            display: "flex",
                          }}
                        >
                          <div style={{ flex: 1, paddingRight: 12 }}>
                            {item.sets.map((setText, idx) => (
                              <div
                                key={`${item.id}-set-${idx}`}
                                style={{
                                  color: "#f8edf2",
                                  padding: "6px 0",
                                  fontSize: 18,
                                  fontFamily: "Georgia, Times New Roman, serif",
                                }}
                              >
                                {setText}
                              </div>
                            ))}
                          </div>
                          <div
                            style={{
                              width: 1,
                              alignSelf: "stretch",
                              background:
                                "linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 100%)",
                            }}
                          />
                          <div
                            style={{
                              flex: 1,
                              paddingLeft: 12,
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            {item.sets.map((_, idx) => {
                              const val = item[`clientSet${idx + 1}Kg` as keyof typeof item];
                              const displayVal = clientKgDraft[`${item.id}-${idx}`] ?? (val != null ? String(val) : "");
                              return (
                                <div key={`${item.id}-kg-${idx}`} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={displayVal}
                                    onChange={(e) => handleClientKgChange(item.id, idx, e.target.value, item)}
                                    placeholder="—"
                                    style={{
                                      width: 56,
                                      borderRadius: 10,
                                      border: "1px solid rgba(255,255,255,0.5)",
                                      background: "rgba(255,255,255,0.2)",
                                      color: "#f8edf2",
                                      padding: "6px 8px",
                                      fontSize: 16,
                                      fontFamily: "Georgia, Times New Roman, serif",
                                    }}
                                  />
                                  <span style={{ color: "#f8edf2", fontSize: 16, fontFamily: "Georgia, Times New Roman, serif" }}>
                                    kg
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 style={{ marginTop: 0, marginBottom: 0, color: "#f8ecf1", fontFamily: "Georgia, Times New Roman, serif" }}>
              Trainer's Comment ✦
            </h2>
            <div
              style={{
                marginTop: 10,
                border: "1px solid rgba(255,255,255,0.55)",
                background:
                  "linear-gradient(150deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.12) 55%, rgba(196,149,171,0.18) 100%)",
                backdropFilter: "blur(8px)",
                borderRadius: 24,
                padding: 16,
                boxShadow:
                  "0 18px 28px rgba(52,22,36,0.35), inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(255,255,255,0.1)",
              }}
            >
              <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#f8edf2" }}>
                {day.dayComment?.trim() ? day.dayComment : "No comment for this day yet."}
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
