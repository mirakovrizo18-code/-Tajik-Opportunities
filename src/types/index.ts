// ============================================================
// TAJIK OPPORTUNITIES
// GLOBAL TYPES
// Version: 2026.09
// ============================================================

export type ID = string;

export type ISODateString = string;

// ============================================================
// COMMON
// ============================================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

// ============================================================
// VISITOR
// ============================================================

export interface Visitor {
  id: ID;
  visitor_id: string;

  first_seen_at: ISODateString;
  last_seen_at: ISODateString;

  ip_hash?: string | null;
  user_agent?: string | null;
  language?: string | null;

  country?: string | null;
  region?: string | null;
  city?: string | null;

  is_blocked: boolean;
  blocked_reason?: string | null;

  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// SESSION
// ============================================================

export interface VisitorSession {
  id: ID;
  visitor_id: string;

  session_token_hash?: string | null;
  ip_hash?: string | null;
  user_agent?: string | null;

  started_at: ISODateString;
  last_activity_at: ISODateString;
  expires_at?: ISODateString | null;

  is_active: boolean;
}

// ============================================================
// PROFILE
// ============================================================

export interface UserProfile {
  id: ID;
  visitor_id: string;

  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;

  display_name?: string | null;
  bio?: string | null;

  photo_url?: string | null;

  phone?: string | null;
  email?: string | null;
  telegram?: string | null;

  country?: string | null;
  region?: string | null;
  city?: string | null;
  address?: string | null;

  website?: string | null;

  is_public: boolean;
  is_verified: boolean;
  is_blocked: boolean;

  blocked_reason?: string | null;

  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// CATEGORY
// ============================================================

export interface Category {
  id: ID;

  name: string;
  slug: string;

  description?: string | null;
  icon?: string | null;

  is_active: boolean;

  sort_order: number;

  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// PUBLICATION
// ============================================================

export type PublicationStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "hidden"
  | "deleted";

export type PublicationType =
  | "opportunity"
  | "job"
  | "education"
  | "internship"
  | "grant"
  | "competition"
  | "event"
  | "business"
  | "news"
  | "other";

export interface Publication {
  id: ID;

  type: PublicationType;

  title: string;
  description?: string | null;

  visitor_id?: string | null;
  profile_id?: ID | null;

  author_name?: string | null;
  author_username?: string | null;

  category_id?: ID | null;

  country?: string | null;
  region?: string | null;
  city?: string | null;
  address?: string | null;

  company_name?: string | null;

  salary?: string | null;
  employment_type?: string | null;

  contact_phone?: string | null;
  contact_email?: string | null;
  contact_telegram?: string | null;

  source_url?: string | null;
  application_url?: string | null;

  status: PublicationStatus;

  is_anonymous: boolean;

  is_pinned: boolean;
  is_featured: boolean;

  manual_order: number;
  priority: number;

  views_count: number;
  unique_views_count: number;

  likes_count: number;
  comments_count: number;
  reactions_count: number;

  bookmarks_count: number;

  shares_count: number;
  sends_count: number;

  reports_count: number;

  contacts_count: number;
  applications_count: number;
  downloads_count: number;

  clicks_count: number;
  external_clicks_count: number;

  created_at: ISODateString;
  updated_at: ISODateString;

  published_at?: ISODateString | null;
  expires_at?: ISODateString | null;

  approved_at?: ISODateString | null;
  approved_by?: string | null;

  rejected_at?: ISODateString | null;
  rejected_by?: string | null;
  rejection_reason?: string | null;

  hidden_at?: ISODateString | null;
  hidden_by?: string | null;

  deleted_at?: ISODateString | null;
  deleted_by?: string | null;
}

// ============================================================
// PUBLICATION IMAGE
// ============================================================

export interface PublicationImage {
  id: ID;

  publication_id: ID;

  image_url: string;
  thumbnail_url?: string | null;

  alt_text?: string | null;

  sort_order: number;

  created_at: ISODateString;
}

// ============================================================
// PUBLICATION HISTORY
// ============================================================

export interface PublicationHistory {
  id: ID;

  publication_id: ID;

  action: string;

  actor_type: string;
  actor_id?: string | null;

  field_name?: string | null;

  old_value?: string | null;
  new_value?: string | null;

  reason?: string | null;

  created_at: ISODateString;
}

// ============================================================
// METRICS
// ============================================================

export type MetricType =
  | "views"
  | "unique_views"
  | "likes"
  | "comments"
  | "reactions"
  | "bookmarks"
  | "shares"
  | "sends"
  | "reports"
  | "contacts"
  | "applications"
  | "downloads"
  | "clicks"
  | "external_clicks"
  | string;

export interface PublicationMetric {
  id: ID;

  publication_id: ID;

  metric_type: MetricType;

  count: number;

  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// REACTIONS
// ============================================================

export interface ReactionType {
  id: ID;

  name: string;
  slug: string;

  emoji?: string | null;

  is_active: boolean;

  sort_order: number;

  created_at: ISODateString;
}

export interface Reaction {
  id: ID;

  publication_id: ID;

  visitor_id: string;

  reaction_type: string;

  created_at: ISODateString;
}

// ============================================================
// COMMENTS
// ============================================================

export type CommentStatus =
  | "published"
  | "hidden"
  | "deleted"
  | "pending";

export interface Comment {
  id: ID;

  publication_id: ID;

  visitor_id?: string | null;
  profile_id?: ID | null;

  parent_comment_id?: ID | null;

  author_name?: string | null;
  author_username?: string | null;

  text: string;

  status: CommentStatus;

  likes_count: number;
  reports_count: number;

  created_at: ISODateString;
  updated_at: ISODateString;

  deleted_at?: ISODateString | null;
  deleted_by?: string | null;
}

export interface CommentHistory {
  id: ID;

  comment_id: ID;

  actor_type: string;
  actor_id?: string | null;

  action: string;

  old_text?: string | null;
  new_text?: string | null;

  reason?: string | null;

  created_at: ISODateString;
}

// ============================================================
// BOOKMARK
// ============================================================

export interface Bookmark {
  id: ID;

  publication_id: ID;

  visitor_id: string;

  created_at: ISODateString;
}

// ============================================================
// SHARE
// ============================================================

export interface Share {
  id: ID;

  publication_id: ID;

  visitor_id?: string | null;

  share_type: string;

  target?: string | null;

  created_at: ISODateString;
}

// ============================================================
// VIEW
// ============================================================

export interface PublicationView {
  id: ID;

  publication_id: ID;

  visitor_id?: string | null;

  source?: string | null;

  user_agent?: string | null;
  ip_hash?: string | null;

  created_at: ISODateString;
}

// ============================================================
// REPORT
// ============================================================

export type ReportStatus =
  | "pending"
  | "reviewing"
  | "confirmed"
  | "rejected"
  | "resolved"
  | "closed";

export interface Report {
  id: ID;

  reporter_id?: string | null;

  target_type: string;
  target_id: ID;

  reason: string;
  description?: string | null;

  status: ReportStatus;

  assigned_admin_id?: string | null;

  admin_note?: string | null;
  resolution?: string | null;

  created_at: ISODateString;
  updated_at: ISODateString;

  resolved_at?: ISODateString | null;
}

export interface ReportHistory {
  id: ID;

  report_id: ID;

  actor_type: string;
  actor_id?: string | null;

  action: string;

  old_status?: string | null;
  new_status?: string | null;

  note?: string | null;

  created_at: ISODateString;
}

// ============================================================
// CHAT
// ============================================================

export type ConversationStatus =
  | "open"
  | "pending"
  | "closed"
  | "archived";

export interface Conversation {
  id: ID;

  visitor_id?: string | null;
  profile_id?: ID | null;

  assigned_admin_id?: string | null;

  status: ConversationStatus;

  subject?: string | null;

  created_at: ISODateString;
  updated_at: ISODateString;

  last_message_at?: ISODateString | null;

  closed_at?: ISODateString | null;
}

export interface ConversationParticipant {
  id: ID;

  conversation_id: ID;

  participant_type: "visitor" | "admin";

  participant_id: string;

  joined_at: ISODateString;

  left_at?: ISODateString | null;
}

export interface Message {
  id: ID;

  conversation_id: ID;

  sender_type: "visitor" | "admin";
  sender_id?: string | null;

  message: string;

  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;

  is_read: boolean;
  is_deleted: boolean;

  created_at: ISODateString;
  updated_at: ISODateString;

  deleted_at?: ISODateString | null;
  deleted_by?: string | null;
}

export interface MessageRead {
  id: ID;

  message_id: ID;

  reader_type: "visitor" | "admin";
  reader_id: string;

  read_at: ISODateString;
}

export interface MessageReaction {
  id: ID;

  message_id: ID;

  visitor_id?: string | null;

  reaction_type: string;

  created_at: ISODateString;
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export interface Notification {
  id: ID;

  visitor_id?: string | null;
  profile_id?: ID | null;

  type: string;

  title: string;
  message: string;

  related_type?: string | null;
  related_id?: ID | null;

  is_read: boolean;

  created_at: ISODateString;

  read_at?: ISODateString | null;
}

// ============================================================
// ACTIVITY
// ============================================================

export interface UserActivity {
  id: ID;

  visitor_id?: string | null;
  profile_id?: ID | null;

  action_type: string;

  target_type?: string | null;
  target_id?: ID | null;

  metadata?: string | null;

  created_at: ISODateString;
}

// ============================================================
// ADMIN
// ============================================================

export type AdminRole =
  | "superadmin"
  | "admin"
  | "moderator"
  | "editor"
  | "support"
  | "analyst";

export interface AdminUser {
  id: ID;

  username: string;

  display_name?: string | null;

  password_hash: string;

  role: AdminRole;

  is_active: boolean;

  last_login_at?: ISODateString | null;

  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface AdminSession {
  id: ID;

  admin_id: ID;

  token_hash: string;

  ip_hash?: string | null;
  user_agent?: string | null;

  created_at: ISODateString;
  last_activity_at: ISODateString;

  expires_at?: ISODateString | null;

  is_active: boolean;
}

// ============================================================
// ADMIN PERMISSIONS
// ============================================================

export interface AdminPermission {
  id: ID;

  permission_key: string;

  description?: string | null;

  created_at: ISODateString;
}

export interface AdminRolePermission {
  id: ID;

  role: AdminRole;

  permission_id: ID;

  allowed: boolean;
}

// ============================================================
// ADMIN ACTIVITY LOG
// ============================================================

export interface AdminActivityLog {
  id: ID;

  admin_id?: ID | null;

  action: string;

  target_type?: string | null;
  target_id?: ID | null;

  field_name?: string | null;

  old_value?: string | null;
  new_value?: string | null;

  reason?: string | null;

  ip_hash?: string | null;
  user_agent?: string | null;

  created_at: ISODateString;
}

// ============================================================
// SETTINGS
// ============================================================

export interface SystemSetting {
  id: ID;

  setting_key: string;

  setting_value?: string | null;

  value_type: "string" | "number" | "boolean" | "json";

  description?: string | null;

  is_public: boolean;

  updated_by?: string | null;

  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface FeatureFlag {
  id: ID;

  feature_key: string;

  enabled: boolean;

  description?: string | null;

  config?: string | null;

  updated_by?: string | null;

  created_at: ISODateString;
  updated_at: ISODateString;
}

// ============================================================
// SEARCH
// ============================================================

export interface SearchHistory {
  id: ID;

  visitor_id?: string | null;

  query?: string | null;

  category_id?: ID | null;

  filters?: string | null;

  created_at: ISODateString;
}

// ============================================================
// PUBLICATION EVENTS
// ============================================================

export type PublicationEventType =
  | "view"
  | "unique_view"
  | "like"
  | "unlike"
  | "reaction"
  | "comment"
  | "bookmark"
  | "unbookmark"
  | "share"
  | "send"
  | "contact"
  | "application"
  | "download"
  | "click"
  | "external_click"
  | "report"
  | string;

export interface PublicationEvent {
  id: ID;

  publication_id: ID;

  visitor_id?: string | null;

  event_type: PublicationEventType;

  metadata?: string | null;

  created_at: ISODateString;
}

// ============================================================
// ADMIN METRIC UPDATE
// Используется админ-панелью для ручного изменения чисел
// ============================================================

export interface MetricUpdateRequest {
  publication_id: ID;

  metric_type: MetricType;

  action: "set" | "increment" | "decrement" | "reset";

  value?: number;
}

// ============================================================
// PUBLICATION FILTERS
// ============================================================

export interface PublicationFilters {
  search?: string;

  category_id?: ID;

  type?: PublicationType;

  status?: PublicationStatus;

  country?: string;

  region?: string;

  city?: string;

  company_name?: string;

  date_from?: string;

  date_to?: string;

  sort?:
    | "newest"
    | "oldest"
    | "popular"
    | "most_viewed"
    | "most_liked"
    | "most_commented"
    | "most_saved"
    | "most_shared"
    | "priority";

  page?: number;

  limit?: number;
}

// ============================================================
// ADMIN SEARCH
// ============================================================

export interface AdminSearchFilters {
  search?: string;

  visitor_id?: string;

  username?: string;

  email?: string;

  phone?: string;

  country?: string;

  city?: string;

  status?: string;

  date_from?: string;

  date_to?: string;

  page?: number;

  limit?: number;
}
