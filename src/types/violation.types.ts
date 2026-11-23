export type ViolationScope = "user" | "org" | "streamer";

export interface ViolationItem {
  timestamp: string;
  message: string;
  level: number;
}

export interface ViolationResponse {
  level: number;
  violate: ViolationItem[];
}

export interface ScopedViolationEntry {
  scope: ViolationScope;
  label: string;
  data: ViolationResponse;
}
