"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addExerciseVideo,
  createExercise,
  createTrainerClient,
  getExercises,
  getTrainerClients,
  type Exercise,
  type TrainerClient,
} from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function TrainerPage() {
  const router = useRouter();
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [pageAnimClass, setPageAnimClass] = useState("page-slide-in");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClientUsername, setNewClientUsername] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("");
  const [creatingExercise, setCreatingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseDescription, setNewExerciseDescription] = useState("");
  const [addingVideo, setAddingVideo] = useState(false);
  const [videoExerciseId, setVideoExerciseId] = useState<number | "">("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoYoutubeId, setVideoYoutubeId] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        const [clientsData, exercisesData] = await Promise.all([
          getTrainerClients(token),
          getExercises(token),
        ]);
        setClients(clientsData);
        setExercises(exercisesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 3000);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  function logout() {
    clearToken();
    router.push("/login");
  }

  function setNavDirection(direction: "forward" | "back") {
    sessionStorage.setItem("jm_nav_dir", direction);
  }

  async function handleCreateClient(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setError(null);
    setCreatingClient(true);
    try {
      const created = await createTrainerClient(token, {
        username: newClientUsername.trim(),
        password: newClientPassword,
      });
      setClients((prev) => [...prev, created]);
      setNewClientUsername("");
      setNewClientPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
    } finally {
      setCreatingClient(false);
    }
  }

  async function handleCreateExercise(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setError(null);
    setCreatingExercise(true);
    try {
      const created = await createExercise(token, {
        name: newExerciseName.trim(),
        description: newExerciseDescription.trim() || undefined,
      });
      setExercises((prev) => [...prev, created]);
      setNewExerciseName("");
      setNewExerciseDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create exercise");
    } finally {
      setCreatingExercise(false);
    }
  }

  async function handleAddExerciseVideo(e: React.FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    if (!videoExerciseId) {
      setError("Please select an exercise for the video.");
      return;
    }

    setError(null);
    setAddingVideo(true);
    try {
      await addExerciseVideo(token, Number(videoExerciseId), {
        title: videoTitle.trim(),
        youtubeId: videoYoutubeId.trim(),
      });
      setVideoTitle("");
      setVideoYoutubeId("");
      setSuccessMessage("Video added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add video");
    } finally {
      setAddingVideo(false);
    }
  }

  return (
    <main
      className={pageAnimClass}
      style={{
        minHeight: "100dvh",
        padding: "24px 20px 32px",
        backgroundColor: "#b497a0",
        backgroundImage:
          "radial-gradient(90% 40% at 12% 10%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 60%), radial-gradient(70% 40% at 88% 18%, rgba(149,101,117,0.26) 0%, rgba(149,101,117,0) 65%), linear-gradient(165deg, #bea4ad 0%, #aa8d98 60%, #9f7f8c 100%)",
        display: "grid",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1
          style={{
            margin: 0,
            color: "#f6eaef",
            fontFamily: "Georgia, Times New Roman, serif",
            fontSize: 44,
            textShadow: "0 2px 3px rgba(0,0,0,0.22)",
          }}
        >
          Trainer
        </h1>
        <button
          onClick={logout}
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.45)",
            background: "rgba(243,236,240,0.8)",
            color: "#3b2730",
            padding: "10px 14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Log out
        </button>
      </div>

      {loading && (
        <p style={{ color: "#f7edf2", marginTop: 6, fontSize: 18, textShadow: "0 1px 2px rgba(0,0,0,0.22)" }}>
          Loading clients...
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
      {successMessage && (
        <p
          style={{
            color: "#184f29",
            background: "rgba(233,255,242,0.7)",
            borderRadius: 12,
            padding: "8px 10px",
            width: "fit-content",
          }}
        >
          {successMessage}
        </p>
      )}

      {!loading && (
        <>
          <section style={{ padding: 0 }}>
            <h2 style={{ marginTop: 0, color: "#f8ecf1", fontFamily: "Georgia, Times New Roman, serif" }}>
              Clients ✦
            </h2>
            {clients.length === 0 ? <p style={{ color: "#f7edf2" }}>No clients yet.</p> : null}
            <ul style={{ display: "grid", gap: 12, padding: 0, margin: 0, listStyle: "none" }}>
              {clients.map((c) => (
                <li
                  key={c.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.38)",
                    borderRadius: 18,
                    background: "rgba(255,255,255,0.18)",
                    padding: 12,
                  }}
                >
                  <div style={{ color: "#f8edf2", fontSize: 26, fontFamily: "Georgia, Times New Roman, serif" }}>
                    {c.username}
                  </div>
                  <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                    {[1, 2, 3, 4].map((d) => (
                      <Link
                        key={`${c.id}-${d}`}
                        href={`/trainer/client/${c.id}/day/${d}`}
                        style={{
                          textDecoration: "none",
                          borderRadius: 14,
                          border: "1px solid rgba(255,255,255,0.5)",
                          background: "rgba(245,241,243,0.9)",
                          color: "#3d2b33",
                          padding: "7px 6px",
                          fontWeight: 600,
                          fontSize: 15,
                          textAlign: "center",
                        }}
                      >
                        Day {d}
                      </Link>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
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
              Create Client
            </h2>
            <form onSubmit={handleCreateClient} style={{ display: "grid", gap: 10 }}>
              <input
                value={newClientUsername}
                onChange={(e) => setNewClientUsername(e.target.value)}
                placeholder="client username"
                required
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.5)",
                  background: "rgba(244,240,242,0.92)",
                  padding: "0 14px",
                  color: "#3e2b34",
                }}
              />
              <input
                type="password"
                value={newClientPassword}
                onChange={(e) => setNewClientPassword(e.target.value)}
                placeholder="client password"
                required
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.5)",
                  background: "rgba(244,240,242,0.92)",
                  padding: "0 14px",
                  color: "#3e2b34",
                }}
              />
              <button
                type="submit"
                disabled={creatingClient}
                style={{
                  width: 170,
                  height: 46,
                  borderRadius: 16,
                  border: "none",
                  background: "rgba(244,240,242,0.95)",
                  color: "#2f1f26",
                  fontFamily: "Georgia, Times New Roman, serif",
                  fontSize: 20,
                  cursor: creatingClient ? "not-allowed" : "pointer",
                }}
              >
                {creatingClient ? "..." : "CREATE"}
              </button>
            </form>
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
              Exercise Catalog
            </h2>
            <form onSubmit={handleCreateExercise} style={{ display: "grid", gap: 10 }}>
              <input
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                placeholder="exercise name"
                required
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.5)",
                  background: "rgba(244,240,242,0.92)",
                  padding: "0 14px",
                  color: "#3e2b34",
                }}
              />
              <input
                value={newExerciseDescription}
                onChange={(e) => setNewExerciseDescription(e.target.value)}
                placeholder="description (optional)"
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.5)",
                  background: "rgba(244,240,242,0.92)",
                  padding: "0 14px",
                  color: "#3e2b34",
                }}
              />
              <button
                type="submit"
                disabled={creatingExercise}
                style={{
                  width: 170,
                  height: 46,
                  borderRadius: 16,
                  border: "none",
                  background: "rgba(244,240,242,0.95)",
                  color: "#2f1f26",
                  fontFamily: "Georgia, Times New Roman, serif",
                  fontSize: 20,
                  cursor: creatingExercise ? "not-allowed" : "pointer",
                }}
              >
                {creatingExercise ? "..." : "ADD"}
              </button>
            </form>
            <ul style={{ marginTop: 12, display: "grid", gap: 6, color: "#f8ecf1", paddingLeft: 18 }}>
              {exercises.map((e) => (
                <li key={e.id}>
                  {e.name}
                </li>
              ))}
            </ul>
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
              Add Video To Exercise
            </h2>
            <form onSubmit={handleAddExerciseVideo} style={{ display: "grid", gap: 10 }}>
              <select
                value={videoExerciseId}
                onChange={(e) => setVideoExerciseId(e.target.value ? Number(e.target.value) : "")}
                required
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.5)",
                  background: "rgba(244,240,242,0.92)",
                  padding: "0 14px",
                  color: "#3e2b34",
                }}
              >
                <option value="">Select exercise</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
              <input
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="video title"
                required
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.5)",
                  background: "rgba(244,240,242,0.92)",
                  padding: "0 14px",
                  color: "#3e2b34",
                }}
              />
              <input
                value={videoYoutubeId}
                onChange={(e) => setVideoYoutubeId(e.target.value)}
                placeholder="youtube id (not full URL)"
                required
                style={{
                  height: 46,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.5)",
                  background: "rgba(244,240,242,0.92)",
                  padding: "0 14px",
                  color: "#3e2b34",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <button
                  type="submit"
                  disabled={addingVideo}
                  style={{
                    width: 148,
                    height: 40,
                    borderRadius: 16,
                    border: "none",
                    background: "rgba(244,240,242,0.95)",
                    color: "#2f1f26",
                    fontFamily: "Georgia, Times New Roman, serif",
                    fontSize: 17,
                    cursor: addingVideo ? "not-allowed" : "pointer",
                  }}
                >
                  {addingVideo ? "..." : "ADD VIDEO"}
                </button>
                <Link
                  href="/trainer/videos"
                  onClick={() => setNavDirection("forward")}
                  style={{
                    width: 148,
                    height: 40,
                    borderRadius: 16,
                    border: "none",
                    background: "rgba(244,240,242,0.95)",
                    color: "#2f1f26",
                    fontFamily: "Georgia, Times New Roman, serif",
                    fontSize: 17,
                    textDecoration: "none",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  SEE VIDEOS
                </Link>
              </div>
            </form>
          </section>
        </>
      )}
    </main>
  );
}