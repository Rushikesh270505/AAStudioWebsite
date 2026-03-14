import type { Role, UserProfile } from "@/lib/platform-types";

const TOKEN_KEY = "aa_token";
const USER_KEY = "aa_user";
const ROLE_KEY = "aa_role";
const SESSION_EVENT = "aa-session-change";

export type SessionSnapshot = {
  token: string;
  user: UserProfile | null;
  role: Role | null;
};

function emitSessionChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getWorkspacePath(role?: Role | null) {
  if (role === "architect") return "/architect/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/client/dashboard";
}

export function saveSession(token: string, user: UserProfile) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ROLE_KEY, user.role);
  emitSessionChange();
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
  emitSessionChange();
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(TOKEN_KEY) || "";
}

export function getStoredUser(): UserProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function getStoredRole(): Role | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (localStorage.getItem(ROLE_KEY) as Role | null) || null;
}

export function getEmptySessionSnapshot(): SessionSnapshot {
  return {
    token: "",
    user: null,
    role: null,
  };
}

export function readSessionSnapshot(): SessionSnapshot {
  return {
    token: getStoredToken(),
    user: getStoredUser(),
    role: getStoredRole(),
  };
}

export function subscribeToSession(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(SESSION_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(SESSION_EVENT, handler);
  };
}
