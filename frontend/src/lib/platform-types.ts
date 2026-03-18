export type Role = "public_user" | "client" | "architect" | "admin";

export type UserProfile = {
  id: string;
  _id?: string;
  fullName: string;
  name?: string;
  username?: string;
  email: string;
  archivedEmail?: string;
  archivedPhone?: string;
  archivedAt?: string;
  role: Role;
  studioName?: string;
  phone?: string;
  avatarSeed?: string;
  avatarUrl?: string;
  companyArchitectId?: string;
  isActive?: boolean;
  isOnline?: boolean;
  lastLoginAt?: string;
  lastReportAt?: string;
  specializationTags?: string[];
};

export type FileAsset = {
  _id: string;
  name: string;
  url: string;
  key: string;
  kind: "image" | "video" | "pdf" | "model" | "other";
  mimeType?: string;
  size?: number;
  description?: string;
  version?: number;
  updatedAt?: string;
};

export type PaymentMilestone = {
  label: string;
  amount: number;
  dueDate?: string;
  status: string;
};

export type Project = {
  _id: string;
  projectCode: string;
  title: string;
  slug: string;
  location: string;
  projectType: string;
  category: string;
  serviceType: string;
  summary: string;
  description: string;
  status: "PENDING" | "IN_PROGRESS" | "READY_FOR_REVIEW" | "CHANGES_REQUESTED" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  heroImage?: string;
  gallery?: string[];
  year?: string;
  area?: string;
  duration?: string;
  coordinates?: { lat: number; lng: number };
  modelUrl?: string;
  walkthroughUrl?: string;
  deadline?: string;
  quotation?: {
    amount?: number;
    currency?: string;
    summary?: string;
  };
  portfolio?: {
    isVisible: boolean;
    rows: number;
    columns: number;
  };
  paymentMilestones?: PaymentMilestone[];
  client?: UserProfile;
  architect?: UserProfile;
  mainArchitect?: UserProfile;
  createdByAdmin?: UserProfile;
  readyForReviewAt?: string;
  completedAt?: string;
  latestReportAt?: string;
  files?: FileAsset[];
  timeline?: Array<{
    title: string;
    status: string;
    date: string;
    note: string;
  }>;
  tags?: string[];
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectCollaborator = {
  _id: string;
  project: string;
  architect: UserProfile;
  addedBy: UserProfile;
  addedAt: string;
};

export type ProjectUpdate = {
  _id: string;
  project: string;
  author: UserProfile;
  updateType: string;
  message: string;
  attachmentUrl?: string;
  attachmentName?: string;
  tag?: string;
  createdAt: string;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  notes?: string;
  paymentPhase?: string;
  lineItems?: Array<{ label: string; amount: number }>;
};

export type Meeting = {
  _id: string;
  title: string;
  subject?: string;
  project?: string;
  scheduledAt: string;
  participants: UserProfile[];
  notes?: string;
  description?: string;
  status: string;
  location?: string;
  meetLink?: string;
  outcome?: string;
  createdBy?: UserProfile;
};

export type WorkReport = {
  _id: string;
  architect: UserProfile;
  summary: string;
  images: Array<{
    name: string;
    dataUrl: string;
  }>;
  reportDateKey: string;
  createdAt: string;
  updatedAt: string;
};

export type ArchitectReportBundle = {
  architect: UserProfile;
  reports: WorkReport[];
};

export type SiteVisit = {
  _id: string;
  project: string;
  date: string;
  location: string;
  assignedStaff: UserProfile[];
  notes?: string;
  status: string;
  reportUrl?: string;
};

export type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedProject?: string;
  actionUrl?: string;
  createdAt: string;
};

export type Invite = {
  _id: string;
  email: string;
  role: Role;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  companyArchitectId?: string;
};

export type ContactLead = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  message: string;
  status: string;
  createdAt: string;
};

export type AuditEntry = {
  _id: string;
  action: string;
  actor?: UserProfile;
  targetUser?: UserProfile;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type ProjectBundle = {
  project: Project;
  collaborators: ProjectCollaborator[];
  updates: ProjectUpdate[];
  meetings: Meeting[];
  siteVisits: SiteVisit[];
  invoices: Invoice[];
  auditLog: AuditEntry[];
};

export type AuthResponse = {
  token: string;
  user: UserProfile;
};

export type OtpChannel = "email" | "phone";

export type OtpRequestResponse = {
  message: string;
  channel: OtpChannel;
  recipient: string;
  expiresInMinutes: number;
  debugCode?: string;
};

export type OtpVerifyResponse = {
  message: string;
  channel: OtpChannel;
  recipient: string;
  verified: true;
};

export type ClientDashboardPayload = {
  overview: {
    assignedProjects: number;
    activeProjects: number;
    pendingInvoices: number;
    unreadNotifications: number;
  };
  projects: Project[];
  updates: ProjectUpdate[];
  invoices: Invoice[];
  files: FileAsset[];
  meetings: Meeting[];
  siteVisits: SiteVisit[];
  notifications: NotificationItem[];
};

export type ArchitectDashboardPayload = {
  overview: {
    availableCount: number;
    activeCount: number;
    reviewCount: number;
    overdueCount: number;
  };
  availableWorks: Project[];
  myProjects: Project[];
  readyForReview: Project[];
  completed: Project[];
  dueSoon: Project[];
  overdue: Project[];
  myMainProjects: Project[];
  notifications: NotificationItem[];
  meetings: Meeting[];
  siteVisits: SiteVisit[];
  updates: ProjectUpdate[];
};

export type AdminDashboardPayload = {
  totals: {
    totalProjects: number;
    pendingWorks: number;
    worksInProgress: number;
    reviewQueue: number;
    completed: number;
    architects: number;
    users: number;
  };
  reviewQueue: Project[];
  pendingWorks: Project[];
  availableWorks: Project[];
  inProgress: Project[];
  completed: Project[];
  projects: Project[];
  architects: UserProfile[];
  users: UserProfile[];
  invites: Invite[];
  meetings: Meeting[];
  siteVisits: SiteVisit[];
  notifications: NotificationItem[];
  recentActivity: AuditEntry[];
  architectWorkload: Array<{
    architect: UserProfile;
    total: number;
    active: number;
    review: number;
    completed: number;
  }>;
  categoryBreakdown: Record<string, number>;
};
