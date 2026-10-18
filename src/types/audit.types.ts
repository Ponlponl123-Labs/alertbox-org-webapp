export interface AuditLogUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface AuditLogItem {
  id: string;
  orgId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  payload: unknown;
  ipAddress: string;
  createdAt: string;
  user: AuditLogUser;
}

export interface AuditLogResponse {
  total: number;
  limit: number;
  offset: number;
  logs: AuditLogItem[];
}
