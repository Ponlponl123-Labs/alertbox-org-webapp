export interface BetterStackPayload {
  data?: {
    attributes?: {
      company_name?: string;
      aggregate_state?: string;
      announcement?: string | null;
      custom_domain?: string;
    };
  };
  included?: Array<{
    type?: string;
    attributes?: {
      title?: string;
      report_type?: string;
      aggregate_state?: string;
      starts_at?: string;
      ends_at?: string;
      message?: string;
    };
  }>;
}
