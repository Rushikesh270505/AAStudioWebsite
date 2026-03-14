const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.message === "string" ? payload.message : "Request failed. Check backend connectivity.";
    throw new Error(message);
  }

  return payload;
}

export async function loginUser(email: string, password: string) {
  return request<{ token: string; user: { role: string; email: string; name: string } }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
}

export async function createProject(
  token: string,
  payload: Record<string, unknown>,
) {
  return request("/projects", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function fetchProjects() {
  return request("/projects");
}
