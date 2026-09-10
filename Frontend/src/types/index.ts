/** Envelope every paginated list endpoint returns: `{ data, pagination }`. */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: PaginationMeta;
}

export type Role = 'System Admin' | 'Head Office' | 'Director' | 'Team Leader' | 'Employee';

export type Department =
  | 'Administration'
  | 'Finance'
  | 'Research & Development'
  | 'Planning & Strategy'
  | 'ICT Bureau';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  department: Department;
  title: string;
  avatarColor: string;
  status: 'active' | 'inactive';
  online?: boolean;
  phone?: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  department: Department;
  title: string;
  avatarColor: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  timestamp: string;
  attachment?: string;
}

export interface DirectThread {
  id: string;
  participantId: string; // other user
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  lastMessage: string;
  lastTimestamp: string;
  unread: number;
}

export type MemoType = 'Official Memo' | 'Circular' | 'Notice' | 'Directive';
export type MemoStage = 'Issued' | 'Received' | 'Reviewed' | 'Forwarded' | 'Acknowledged' | 'Completed';
export type MemoStatus = 'Draft' | 'Pending Approval' | 'Revision Requested' | 'Approved' | 'Rejected' | 'Completed';
export type Priority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface ReadReceipt {
  userId: string;
  status: 'delivered' | 'read' | 'pending';
  timestamp?: string;
}

export interface MemoAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'image';
  dataUrl?: string;
  url?: string;
}

export interface Memo {
  id: string;
  reference: string;
  type: MemoType;
  subject: string;
  body: string;
  senderId: string;
  recipients: string[]; // user or department ids/names
  priority: Priority;
  status: MemoStatus;
  stage: MemoStage;
  createdAt: string;
  attachments: MemoAttachment[];
  approvalChain: {
    role: Role;
    userId: string;
    action?: 'Approved' | 'Endorsed' | 'Rejected' | 'Forwarded' | 'Revision Requested';
    comment?: string;
    timestamp?: string;
    actedBy?: string;
    title?: string;
  }[];
  readReceipts: ReadReceipt[];
  stageHistory: { stage: MemoStage; timestamp: string; note?: string }[];
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link: string;
  kind: 'memo' | 'message' | 'system' | 'approval';
}

export interface ArchiveDoc {
  id: string;
  subject: string;
  type: MemoType | 'Report' | 'Letter';
  sender: string;
  department: Department;
  date: string;
  status: MemoStatus | 'Archived';
}

export interface AuditLogEntry {
  id: string;
  user: string;
  role?: string;
  department?: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
