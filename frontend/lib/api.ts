const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type LoginResponse = {
  token: string;
  user: {
    id: number;
    username: string;
    role: "TRAINER" | "CLIENT" | string;
  };
};

export type TrainerClient = {
  id: number;
  clientUserId: number;
  username: string;
};

export type Exercise = {
  id: number;
  name: string;
  description: string | null;
};

async function handleJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handleJson<LoginResponse>(res);
}

export async function getTrainerClients(token: string) {
  const res = await fetch(`${API_BASE_URL}/trainer/clients`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<TrainerClient[]>(res);
}

export async function createTrainerClient(
  token: string,
  payload: { username: string; password: string }
) {
  const res = await fetch(`${API_BASE_URL}/trainer/clients`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleJson<TrainerClient>(res);
}

export async function getExercises(token: string) {
  const res = await fetch(`${API_BASE_URL}/exercises`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<Exercise[]>(res);
}

export type TrainerExerciseVideosResponse = {
  id: number;
  name: string;
  videos: {
    id: number;
    title: string;
    youtubeId: string;
  }[];
};

export async function createExercise(
  token: string,
  payload: { name: string; description?: string }
) {
  const res = await fetch(`${API_BASE_URL}/exercises`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleJson<Exercise>(res);
}

export async function addExerciseVideo(
  token: string,
  exerciseId: number,
  payload: { title: string; youtubeId: string }
) {
  const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}/videos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleJson<{ id: number; exerciseId: number; title: string; youtubeId: string }>(res);
}

export async function getTrainerExerciseVideos(token: string, exerciseId: number) {
  const res = await fetch(`${API_BASE_URL}/exercises/${exerciseId}/videos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<TrainerExerciseVideosResponse>(res);
}

export type DayItem = {
  id: number;
  exerciseId: number;
  exerciseName: string;
  set1Kg: number | null;
  set2Kg: number | null;
  set3Kg: number | null;
  set4Kg: number | null;
  clientSet1Kg: number | null;
  clientSet2Kg: number | null;
  clientSet3Kg: number | null;
  clientSet4Kg: number | null;
  orderIndex: number;
};

export type TrainerDayResponse = {
  dayNumber: number;
  dayComment: string | null;
  warmup: DayItem[];
  training: DayItem[];
};

export type ClientDashboardResponse = {
  username: string;
  joinedAt: string;
  days: { dayNumber: number }[];
  hasVideos: boolean;
};

export type ClientDayItem = {
  id: number;
  exerciseName: string;
  sets: string[];
  clientSet1Kg: number | null;
  clientSet2Kg: number | null;
  clientSet3Kg: number | null;
  clientSet4Kg: number | null;
  orderIndex: number;
};

export type ClientDayResponse = {
  dayNumber: number;
  dayComment: string | null;
  warmup: ClientDayItem[];
  training: ClientDayItem[];
};

export type ClientVideoExercise = {
  id: number;
  name: string;
};

export type ClientExerciseVideosResponse = {
  id: number;
  name: string;
  videos: {
    id: number;
    title: string;
    youtubeId: string;
  }[];
};

export async function getTrainerDay(
  token: string,
  clientId: number,
  dayNumber: number
) {
  const res = await fetch(
    `${API_BASE_URL}/trainer/clients/${clientId}/days/${dayNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return handleJson<TrainerDayResponse>(res);
}

type UpsertDayPayload = {
  dayComment?: string | null;
  warmup: {
    exerciseId: number;
    set1Kg?: number | null;
    set2Kg?: number | null;
    set3Kg?: number | null;
    set4Kg?: number | null;
  }[];
  training: {
    exerciseId: number;
    set1Kg?: number | null;
    set2Kg?: number | null;
    set3Kg?: number | null;
    set4Kg?: number | null;
  }[];
};

export async function updateTrainerDay(
  token: string,
  clientId: number,
  dayNumber: number,
  payload: UpsertDayPayload
) {
  const res = await fetch(
    `${API_BASE_URL}/trainer/clients/${clientId}/days/${dayNumber}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  return handleJson<{ success: boolean }>(res);
}

export async function getClientDashboard(token: string) {
  const res = await fetch(`${API_BASE_URL}/client/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<ClientDashboardResponse>(res);
}

export async function getClientDay(token: string, dayNumber: number) {
  const res = await fetch(`${API_BASE_URL}/client/days/${dayNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<ClientDayResponse>(res);
}

export async function updateClientDayItem(
  token: string,
  dayNumber: number,
  itemId: number,
  payload: {
    clientSet1Kg?: number | null;
    clientSet2Kg?: number | null;
    clientSet3Kg?: number | null;
    clientSet4Kg?: number | null;
  }
) {
  const res = await fetch(
    `${API_BASE_URL}/client/days/${dayNumber}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  return handleJson<{ success: boolean }>(res);
}

export async function getClientVideoExercises(token: string) {
  const res = await fetch(`${API_BASE_URL}/client/videos/exercises`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<{ exercises: ClientVideoExercise[] }>(res);
}

export async function getClientExerciseVideos(token: string, exerciseId: number) {
  const res = await fetch(`${API_BASE_URL}/client/videos/exercises/${exerciseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleJson<ClientExerciseVideosResponse>(res);
}
