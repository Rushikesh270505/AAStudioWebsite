import type {
  AdminDashboardPayload,
  ArchitectReportBundle,
  ArchitectDashboardPayload,
  AuthResponse,
  ClientDashboardPayload,
  ContactLead,
  Invite,
  Meeting,
  NotificationItem,
  OtpChannel,
  OtpRequestResponse,
  OtpVerifyResponse,
  Project,
  ProjectBundle,
  ProjectUpdate,
  SiteVisit,
  UserProfile,
  WorkReport,
} from "@/lib/platform-types";

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

  return payload as T;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function registerUser(payload: {
  username: string;
  email: string;
  password: string;
  phone?: string;
  studioName?: string;
  avatarSeed: string;
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(identifier: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function staffLoginUser(identifier: string, password: string) {
  return request<AuthResponse>("/auth/staff-login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
}

export function logoutCurrentUser(token: string) {
  return request<{ message: string }>("/auth/logout", {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function requestLoginOtp(email: string) {
  return request<OtpRequestResponse>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ channel: "email", recipient: email, purpose: "login" }),
  });
}

export function loginWithOtp(email: string, code: string) {
  return request<AuthResponse>("/auth/login-with-otp", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export function requestPasswordReset(email: string) {
  return request<OtpRequestResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function requestSignupOtp(channel: OtpChannel, recipient: string) {
  return request<OtpRequestResponse>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ channel, recipient, purpose: "signup" }),
  });
}

export function verifySignupOtp(channel: OtpChannel, recipient: string, code: string) {
  return request<OtpVerifyResponse>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ channel, recipient, code, purpose: "signup" }),
  });
}

export function fetchCurrentUser(token: string) {
  return request<{ user: UserProfile }>("/auth/me", {
    headers: authHeaders(token),
  });
}

export function updateProfile(
  token: string,
  payload: {
    fullName?: string;
    phone?: string;
    studioName?: string;
    avatarSeed?: string;
    bio?: string;
  },
) {
  return request<UserProfile>("/users/profile", {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function fetchProjects(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<Project[]>(`/projects${query}`);
}

export function fetchProjectBySlug(slug: string) {
  return request<{
    project: Project;
    collaborators: Array<{ _id: string; architect: UserProfile; addedBy: UserProfile; addedAt: string }>;
    updates: ProjectUpdate[];
  }>(`/projects/slug/${slug}`);
}

export function fetchProjectBundle(token: string, projectId: string) {
  return request<ProjectBundle>(`/projects/${projectId}`, {
    headers: authHeaders(token),
  });
}

export function createProject(token: string, payload: Record<string, unknown>) {
  return request<ProjectBundle>("/projects", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function claimProject(token: string, projectId: string) {
  return request<ProjectBundle>(`/projects/${projectId}/claim`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function addCollaborators(token: string, projectId: string, architectIds: string[]) {
  return request<{ createdCount: number; project: ProjectBundle }>(`/projects/${projectId}/collaborators`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ architectIds }),
  });
}

export function removeCollaborator(token: string, projectId: string, architectId: string) {
  return request<ProjectBundle>(`/projects/${projectId}/collaborators/${architectId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function postProjectUpdate(
  token: string,
  projectId: string,
  payload: {
    updateType?: string;
    message: string;
    attachmentUrl?: string;
    attachmentName?: string;
    tag?: string;
  },
) {
  return request<ProjectUpdate>(`/projects/${projectId}/updates`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function submitProjectForReview(token: string, projectId: string, message?: string) {
  return request<ProjectBundle>(`/projects/${projectId}/submit-review`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });
}

export function reviewProject(
  token: string,
  projectId: string,
  action: "approve" | "changes",
  comment?: string,
) {
  return request<ProjectBundle>(`/projects/${projectId}/review`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ action, comment }),
  });
}

export function assignProjectClient(token: string, projectId: string, clientId: string) {
  return request<ProjectBundle>(`/projects/${projectId}/assign`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ clientId }),
  });
}

export function fetchClientDashboard(token: string) {
  return request<ClientDashboardPayload>("/dashboard/client", {
    headers: authHeaders(token),
  });
}

export function fetchArchitectDashboard(token: string) {
  return request<ArchitectDashboardPayload>("/dashboard/architect", {
    headers: authHeaders(token),
  });
}

export function fetchAdminDashboard(token: string) {
  return request<AdminDashboardPayload>("/dashboard/admin", {
    headers: authHeaders(token),
  });
}

export function fetchArchitectDirectory(token: string) {
  return request<Array<UserProfile & { workload: { total: number; active: number; review: number } }>>(
    "/users/architects",
    {
      headers: authHeaders(token),
    },
  );
}

export function fetchUsers(token: string) {
  return request<UserProfile[]>("/users", {
    headers: authHeaders(token),
  });
}

export function createArchitectAccount(
  token: string,
  payload: {
    username: string;
    email: string;
    phone?: string;
    specializationTags?: string[];
    companyArchitectId?: string;
    password: string;
    archivedSourceId?: string;
  },
) {
  return request<{ user: UserProfile; temporaryPassword?: string; message?: string }>("/users/architects", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function archiveArchitectAccount(token: string, userId: string) {
  return request<{ message: string; user: UserProfile }>(`/users/architects/${userId}/archive`, {
    method: "POST",
    headers: authHeaders(token),
  });
}

export function terminateArchitectAccount(token: string, userId: string) {
  return request<{ message: string }>(`/users/architects/${userId}/terminate`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
}

export function updateUserStatus(token: string, userId: string, isActive: boolean) {
  return request<UserProfile>(`/users/${userId}/status`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ isActive }),
  });
}

export function fetchInvites(token: string) {
  return request<Invite[]>("/users/invites", {
    headers: authHeaders(token),
  });
}

export function createInvite(
  token: string,
  payload: { email: string; role: "architect" | "client"; companyArchitectId?: string },
) {
  return request<Invite>("/users/invites", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function fetchMeetings(token: string, projectId?: string) {
  const query = projectId ? `?projectId=${projectId}` : "";
  return request<Meeting[]>(`/meetings${query}`, {
    headers: authHeaders(token),
  });
}

export function createMeeting(token: string, payload: Record<string, unknown>) {
  return request<Meeting>("/meetings", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function fetchSiteVisits(token: string, projectId?: string) {
  const query = projectId ? `?projectId=${projectId}` : "";
  return request<SiteVisit[]>(`/site-visits${query}`, {
    headers: authHeaders(token),
  });
}

export function createSiteVisit(token: string, payload: Record<string, unknown>) {
  return request<SiteVisit>("/site-visits", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function fetchNotifications(token: string) {
  return request<NotificationItem[]>("/notifications", {
    headers: authHeaders(token),
  });
}

export function markNotificationRead(token: string, notificationId: string) {
  return request<NotificationItem>(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
}

export function submitContactLead(payload: {
  fullName: string;
  email: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  message: string;
}) {
  return request<{ message: string; leadId: string }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchContactLeads(token: string) {
  return request<ContactLead[]>("/contact", {
    headers: authHeaders(token),
  });
}

export function createWorkReport(
  token: string,
  payload: {
    summary: string;
    images: Array<{ name: string; dataUrl: string }>;
  },
) {
  return request<WorkReport>("/work-reports", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
}

export function fetchMyWorkReports(token: string) {
  return request<WorkReport[]>("/work-reports/my", {
    headers: authHeaders(token),
  });
}

export function fetchArchitectReportStatus(token: string) {
  return request<{ hasReportedForSession: boolean; lastReportAt: string | null }>("/work-reports/status", {
    headers: authHeaders(token),
  });
}

export function fetchArchitectReportBundles(token: string) {
  return request<ArchitectReportBundle[]>("/work-reports/architects", {
    headers: authHeaders(token),
  });
}
