"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getExercises, getTrainerClients, getTrainerDay, updateTrainerDay, type Exercise } from "@/lib/api";

type EditableItem = {
  exerciseId: number;
  exerciseQuery: string;
  set1Kg: string;
  set2Kg: string;
  set3Kg: string;
  set4Kg: string;
  clientSet1Kg: number | null;
  clientSet2Kg: number | null;
  clientSet3Kg: number | null;
  clientSet4Kg: number | null;
};

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function TrainerDayPage() {
  const router = useRouter();
  const params = useParams<{ clientId: string; dayNumber: string }>();

  const clientId = useMemo(() => Number(params.clientId), [params.clientId]);
  const dayNumber = useMemo(() => Number(params.dayNumber), [params.dayNumber]);

  const [warmup, setWarmup] = useState<EditableItem[]>([]);
  const [training, setTraining] = useState<EditableItem[]>([]);
  const [dayComment, setDayComment] = useState("");
  const [clientUsername, setClientUsername] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState("");

  const currentSnapshot = useMemo(
    () =>
      JSON.stringify({
        dayComment,
        warmup,
        training,
      }),
    [dayComment, warmup, training]
  );
  const hasUnsavedChanges = Boolean(initialSnapshot) && currentSnapshot !== initialSnapshot;

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }
      if (!clientId || !dayNumber) {
        setError("Invalid route params.");
        setLoading(false);
        return;
      }

      try {
        const [data, exercisesData, clientsData] = await Promise.all([
          getTrainerDay(token, clientId, dayNumber),
          getExercises(token),
          getTrainerClients(token),
        ]);
        setExercises(exercisesData);
        const matchedClient = clientsData.find((client) => client.id === clientId);
        setClientUsername(matchedClient?.username ?? `Client ${clientId}`);
        setDayComment(data.dayComment ?? "");
        setWarmup(
          data.warmup.map((item) => ({
            exerciseId: item.exerciseId,
            exerciseQuery: item.exerciseName,
            set1Kg: item.set1Kg?.toString() ?? "",
            set2Kg: item.set2Kg?.toString() ?? "",
            set3Kg: item.set3Kg?.toString() ?? "",
            set4Kg: item.set4Kg?.toString() ?? "",
            clientSet1Kg: item.clientSet1Kg ?? null,
            clientSet2Kg: item.clientSet2Kg ?? null,
            clientSet3Kg: item.clientSet3Kg ?? null,
            clientSet4Kg: item.clientSet4Kg ?? null,
          }))
        );
        setTraining(
          data.training.map((item) => ({
            exerciseId: item.exerciseId,
            exerciseQuery: item.exerciseName,
            set1Kg: item.set1Kg?.toString() ?? "",
            set2Kg: item.set2Kg?.toString() ?? "",
            set3Kg: item.set3Kg?.toString() ?? "",
            set4Kg: item.set4Kg?.toString() ?? "",
            clientSet1Kg: item.clientSet1Kg ?? null,
            clientSet2Kg: item.clientSet2Kg ?? null,
            clientSet3Kg: item.clientSet3Kg ?? null,
            clientSet4Kg: item.clientSet4Kg ?? null,
          }))
        );
        setInitialSnapshot(
          JSON.stringify({
            dayComment: data.dayComment ?? "",
            warmup: data.warmup.map((item) => ({
              exerciseId: item.exerciseId,
              exerciseQuery: item.exerciseName,
              set1Kg: item.set1Kg?.toString() ?? "",
              set2Kg: item.set2Kg?.toString() ?? "",
              set3Kg: item.set3Kg?.toString() ?? "",
              set4Kg: item.set4Kg?.toString() ?? "",
              clientSet1Kg: item.clientSet1Kg ?? null,
              clientSet2Kg: item.clientSet2Kg ?? null,
              clientSet3Kg: item.clientSet3Kg ?? null,
              clientSet4Kg: item.clientSet4Kg ?? null,
            })),
            training: data.training.map((item) => ({
              exerciseId: item.exerciseId,
              exerciseQuery: item.exerciseName,
              set1Kg: item.set1Kg?.toString() ?? "",
              set2Kg: item.set2Kg?.toString() ?? "",
              set3Kg: item.set3Kg?.toString() ?? "",
              set4Kg: item.set4Kg?.toString() ?? "",
              clientSet1Kg: item.clientSet1Kg ?? null,
              clientSet2Kg: item.clientSet2Kg ?? null,
              clientSet3Kg: item.clientSet3Kg ?? null,
              clientSet4Kg: item.clientSet4Kg ?? null,
            })),
          })
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load day.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [clientId, dayNumber, router]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 3000);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(null), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  function addRow(type: "warmup" | "training") {
    const newItem: EditableItem = {
      exerciseId: exercises[0]?.id ?? 0,
      exerciseQuery: exercises[0]?.name ?? "",
      set1Kg: "",
      set2Kg: "",
      set3Kg: "",
      set4Kg: "",
      clientSet1Kg: null,
      clientSet2Kg: null,
      clientSet3Kg: null,
      clientSet4Kg: null,
    };
    if (type === "warmup") {
      setWarmup((prev) => [...prev, newItem]);
    } else {
      setTraining((prev) => [...prev, newItem]);
    }
  }

  function removeRow(type: "warmup" | "training", index: number) {
    if (type === "warmup") {
      setWarmup((prev) => prev.filter((_, i) => i !== index));
    } else {
      setTraining((prev) => prev.filter((_, i) => i !== index));
    }
  }

  function updateField(type: "warmup" | "training", index: number, field: "set1Kg" | "set2Kg" | "set3Kg" | "set4Kg", value: string) {
    const updater = (rows: EditableItem[]) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    if (type === "warmup") {
      setWarmup((prev) => updater(prev));
    } else {
      setTraining((prev) => updater(prev));
    }
  }

  function updateExerciseQuery(type: "warmup" | "training", index: number, query: string) {
    const match = exercises.find((exercise) => exercise.name.toLowerCase() === query.trim().toLowerCase());
    const updater = (rows: EditableItem[]) =>
      rows.map((row, i) =>
        i === index
          ? {
              ...row,
              exerciseQuery: query,
              exerciseId: match?.id ?? 0,
            }
          : row
      );
    if (type === "warmup") {
      setWarmup((prev) => updater(prev));
    } else {
      setTraining((prev) => updater(prev));
    }
  }

  function confirmNavigateAway(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasUnsavedChanges) return;
    const ok = window.confirm("You have unsaved changes. Leave this page?");
    if (!ok) {
      e.preventDefault();
    }
  }

  async function saveDay() {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const hasInvalidExercise = [...warmup, ...training].some((item) => !item.exerciseId);
      if (hasInvalidExercise) {
        setError("Please choose a valid exercise from suggestions for each row.");
        setSaving(false);
        return;
      }

      await updateTrainerDay(token, clientId, dayNumber, {
        dayComment: dayComment.trim() || null,
        warmup: warmup.map((item) => ({
          exerciseId: Number(item.exerciseId),
          set1Kg: toNumberOrNull(item.set1Kg),
          set2Kg: toNumberOrNull(item.set2Kg),
          set3Kg: toNumberOrNull(item.set3Kg),
          set4Kg: toNumberOrNull(item.set4Kg),
        })),
        training: training.map((item) => ({
          exerciseId: Number(item.exerciseId),
          set1Kg: toNumberOrNull(item.set1Kg),
          set2Kg: toNumberOrNull(item.set2Kg),
          set3Kg: toNumberOrNull(item.set3Kg),
          set4Kg: toNumberOrNull(item.set4Kg),
        })),
      });
      setSuccess("Saved.");
      setInitialSnapshot(
        JSON.stringify({
          dayComment,
          warmup,
          training,
        })
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save day.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "24px 20px 32px",
        backgroundColor: "#b497a0",
        backgroundImage:
          "radial-gradient(90% 40% at 12% 10%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 60%), radial-gradient(70% 40% at 88% 18%, rgba(149,101,117,0.26) 0%, rgba(149,101,117,0) 65%), linear-gradient(165deg, #bea4ad 0%, #aa8d98 60%, #9f7f8c 100%)",
        display: "grid",
        gap: 16,
      }}
    >
      <p style={{ margin: 0 }}>
        <Link
          href="/trainer"
          onClick={confirmNavigateAway}
          style={{ color: "#f8ecf1", textDecoration: "none" }}
        >
          ← Back to trainer dashboard
        </Link>
      </p>
      <h1
        style={{
          margin: 0,
          color: "#f6eaef",
          fontFamily: "Georgia, Times New Roman, serif",
          fontSize: 42,
          lineHeight: 1.08,
          maxWidth: "100%",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          textShadow: "0 2px 3px rgba(0,0,0,0.22)",
        }}
      >
          {clientUsername || `Client ${clientId}`}
      </h1>
      <div style={{ display: "flex", flexWrap: "nowrap", gap: 8, marginBottom: 16 }}>
        {[1, 2, 3, 4].map((d) => (
          <Link
            key={d}
            href={`/trainer/client/${clientId}/day/${d}`}
            onClick={confirmNavigateAway}
            style={{
              textDecoration: "none",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.5)",
              background: d === dayNumber ? "rgba(244,240,242,0.95)" : "rgba(255,255,255,0.18)",
              color: d === dayNumber ? "#3d2b33" : "#f8ecf1",
              padding: "8px 12px",
              fontWeight: 600,
              width: 88,
              minWidth: 88,
              height: 48,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            Day {d}
          </Link>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#f7edf2", marginTop: 6, fontSize: 18, textShadow: "0 1px 2px rgba(0,0,0,0.22)" }}>
          Loading day...
        </p>
      ) : null}
      {error ? (
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
      ) : null}
      {success ? (
        <p
          style={{
            color: "#184f29",
            background: "rgba(233,255,242,0.7)",
            borderRadius: 12,
            padding: "8px 10px",
            width: "fit-content",
          }}
        >
          {success}
        </p>
      ) : null}
      {!loading && exercises.length === 0 ? (
        <p
          style={{
            color: "#5d0f29",
            background: "rgba(255,255,255,0.5)",
            borderRadius: 12,
            padding: "8px 10px",
            width: "fit-content",
          }}
        >
          No exercises found. Add exercises on trainer dashboard first.
        </p>
      ) : null}

      {!loading && (
        <>
          <datalist id="trainer-exercise-options">
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.name} />
            ))}
          </datalist>

          <section
            style={{
              border: "1px solid rgba(255,255,255,0.42)",
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(7px)",
              borderRadius: 22,
              padding: 16,
              boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h2 style={{ marginTop: 0, color: "#f8ecf1", fontFamily: "Georgia, Times New Roman, serif" }}>
                Warmup
              </h2>
              <button
                type="button"
                onClick={() => addRow("warmup")}
                disabled={exercises.length === 0}
                style={{
                  borderRadius: 14,
                  border: "none",
                  background: "rgba(244,240,242,0.95)",
                  color: "#2f1f26",
                  padding: "8px 12px",
                  fontWeight: 700,
                  cursor: exercises.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                + Add
              </button>
            </div>
            {warmup.map((row, index) => (
              <div key={`warmup-${index}`} style={{ marginTop: 10 }}>
                <div style={{ marginBottom: 6 }}>
                  <input
                    list="trainer-exercise-options"
                    value={row.exerciseQuery}
                    onChange={(e) => updateExerciseQuery("warmup", index, e.target.value)}
                    placeholder="Start typing exercise name..."
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 10px",
                      height: 42,
                      color: "#3e2b34",
                      width: "100%",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.set1Kg}
                    onChange={(e) => updateField("warmup", index, "set1Kg", e.target.value)}
                    placeholder="RIR"
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 6px",
                      height: 42,
                      color: "#3e2b34",
                      width: 48,
                    }}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.set2Kg}
                    onChange={(e) => updateField("warmup", index, "set2Kg", e.target.value)}
                    placeholder="RIR"
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 6px",
                      height: 42,
                      color: "#3e2b34",
                      width: 48,
                    }}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.set3Kg}
                    onChange={(e) => updateField("warmup", index, "set3Kg", e.target.value)}
                    placeholder="RIR"
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 6px",
                      height: 42,
                      color: "#3e2b34",
                      width: 48,
                    }}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.set4Kg}
                    onChange={(e) => updateField("warmup", index, "set4Kg", e.target.value)}
                    placeholder="RIR"
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 6px",
                      height: 42,
                      color: "#3e2b34",
                      width: 48,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow("warmup", index)}
                    style={{
                      borderRadius: 12,
                      border: "none",
                      background: "rgba(84,34,52,0.86)",
                      color: "#fff",
                      padding: "0 10px",
                      height: 42,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    X
                  </button>
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {[row.clientSet1Kg, row.clientSet2Kg, row.clientSet3Kg, row.clientSet4Kg].map((val, idx) => (
                    <input
                      key={idx}
                      type="text"
                      readOnly
                      value={val != null ? String(val) : ""}
                      placeholder="—"
                      style={{
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.15)",
                        color: "rgba(248,236,241,0.95)",
                        padding: "6px 8px",
                        fontSize: 14,
                        width: 48,
                        fontFamily: "Georgia, Times New Roman, serif",
                      }}
                    />
                  ))}
                  <span style={{ fontSize: 14, color: "rgba(248,236,241,0.8)", fontFamily: "Georgia, Times New Roman, serif" }}>
                    kg (client)
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section
            style={{
              border: "1px solid rgba(255,255,255,0.42)",
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(7px)",
              borderRadius: 22,
              padding: 16,
              boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <h2 style={{ marginTop: 0, color: "#f8ecf1", fontFamily: "Georgia, Times New Roman, serif" }}>
                Training
              </h2>
              <button
                type="button"
                onClick={() => addRow("training")}
                disabled={exercises.length === 0}
                style={{
                  borderRadius: 14,
                  border: "none",
                  background: "rgba(244,240,242,0.95)",
                  color: "#2f1f26",
                  padding: "8px 12px",
                  fontWeight: 700,
                  cursor: exercises.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                + Add
              </button>
            </div>
            {training.map((row, index) => (
              <div key={`training-${index}`} style={{ marginTop: 10 }}>
                <div style={{ marginBottom: 6 }}>
                  <input
                    list="trainer-exercise-options"
                    value={row.exerciseQuery}
                    onChange={(e) => updateExerciseQuery("training", index, e.target.value)}
                    placeholder="Start typing exercise name..."
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 10px",
                      height: 42,
                      color: "#3e2b34",
                      width: "100%",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "nowrap",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.set1Kg}
                    onChange={(e) => updateField("training", index, "set1Kg", e.target.value)}
                    placeholder="RIR"
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 6px",
                      height: 42,
                      color: "#3e2b34",
                      width: 48,
                    }}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.set2Kg}
                    onChange={(e) => updateField("training", index, "set2Kg", e.target.value)}
                    placeholder="RIR"
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 6px",
                      height: 42,
                      color: "#3e2b34",
                      width: 48,
                    }}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.set3Kg}
                    onChange={(e) => updateField("training", index, "set3Kg", e.target.value)}
                    placeholder="RIR"
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 6px",
                      height: 42,
                      color: "#3e2b34",
                      width: 48,
                    }}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.set4Kg}
                    onChange={(e) => updateField("training", index, "set4Kg", e.target.value)}
                    placeholder="RIR"
                    style={{
                      borderRadius: 12,
                      border: "none",
                      padding: "0 6px",
                      height: 42,
                      color: "#3e2b34",
                      width: 48,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow("training", index)}
                    style={{
                      borderRadius: 12,
                      border: "none",
                      background: "rgba(84,34,52,0.86)",
                      color: "#fff",
                      padding: "0 10px",
                      height: 42,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    X
                  </button>
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  {[row.clientSet1Kg, row.clientSet2Kg, row.clientSet3Kg, row.clientSet4Kg].map((val, idx) => (
                    <input
                      key={idx}
                      type="text"
                      readOnly
                      value={val != null ? String(val) : ""}
                      placeholder="—"
                      style={{
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.15)",
                        color: "rgba(248,236,241,0.95)",
                        padding: "6px 8px",
                        fontSize: 14,
                        width: 48,
                        fontFamily: "Georgia, Times New Roman, serif",
                      }}
                    />
                  ))}
                  <span style={{ fontSize: 14, color: "rgba(248,236,241,0.8)", fontFamily: "Georgia, Times New Roman, serif" }}>
                    kg (client)
                  </span>
                </div>
              </div>
            ))}
          </section>

          <section
            style={{
              border: "1px solid rgba(255,255,255,0.42)",
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(7px)",
              borderRadius: 22,
              padding: 16,
              boxShadow: "0 12px 24px rgba(0,0,0,0.18)",
            }}
          >
            <h2 style={{ marginTop: 0, color: "#f8ecf1", fontFamily: "Georgia, Times New Roman, serif" }}>
              Comment for client
            </h2>
            <textarea
              value={dayComment}
              onChange={(e) => setDayComment(e.target.value)}
              rows={4}
              placeholder="Write a short note for the client for this day..."
              style={{
                width: "100%",
                marginTop: 8,
                borderRadius: 14,
                border: "none",
                padding: "10px 12px",
                color: "#3e2b34",
              }}
            />
          </section>

          <section style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              disabled={saving}
              onClick={saveDay}
              style={{
                width: "100%",
                maxWidth: 260,
                height: 50,
                borderRadius: 16,
                border: "none",
                background: "rgba(244,240,242,0.95)",
                color: "#2f1f26",
                fontFamily: "Georgia, Times New Roman, serif",
                fontSize: 20,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.8 : 1,
              }}
            >
              {saving ? "Saving..." : "SAVE"}
            </button>
          </section>
        </>
      )}
    </main>
  );
}
