
export interface MsgResponse {
  status: 'success' | 'error';
  title: string;
  message: string;
  extra?: any;
}

export interface Campaign {
  uuid: string;
  id: number;
  name: string;
  prospect_ids: number[];
  campaign_type: Channel;
  ctas: number[];
  client_archetype_id: number;
  client_sdr_id: number;
  campaign_start_date: Date;
  campaign_end_date: Date;
  status:
    | "PENDING"
    | "NEEDS_REVIEW"
    | "IN_PROGRESS"
    | "INITIAL_EDIT_COMPLETE"
    | "READY_TO_SEND"
    | "COMPLETE"
    | "CANCELLED";
}

export interface Prospect {
  approved_outreach_message_id: number | null;
  approved_prospect_email_id: number | null;
  archetype_id: number;
  batch: string;
  client_id: number;
  client_sdr_id: number;
  company: string;
  company_url: string;
  deactivate_ai_engagement: boolean;
  email: string;
  employee_count: string;
  first_name: string;
  full_name: string;
  id: number;
  industry: string;
  is_lead: null;
  last_name: string;
  last_position: null;
  last_reviewed: Date;
  li_conversation_thread_id: string;
  li_is_last_message_from_sdr: boolean;
  li_last_message_from_prospect: string;
  li_last_message_timestamp: Date;
  linkedin_bio: string | null;
  linkedin_url: string;
  times_bumped: null;
  title: string;
  twitter_url: string | null;
  overall_status: string;
  linkedin_status: string;
  email_status: string;
}

export interface CTA {
  id: number;
  archetype_id: number;
  active: boolean;
  text_value: string;
  performance?: {
    status_map: Record<string, number>;
    total_count: number;
  };
}

export interface Archetype {
  active: boolean;
  archetype: string;
  client_id: number;
  client_sdr_id: number;
  disable_ai_after_prospect_engaged: boolean;
  filters: null; // TODO: 
  id: number;
  performance: {
    status_map: Record<string, number>;
    total_prospects: number;
  };
  transformer_blocklist: null; // TODO: 
  uploads?: any[];
}

export interface LinkedInMessage {
  author: string;
  connection_degree: string;
  conversation_url: string;
  date: string;
  first_name: string;
  last_name: string;
  headline: string;
  img_url: string;
  li_url: string;
  message: string;
  profile_url: string;
  urn_id: string;
}

export interface ProspectNote {
  created_at: string,
  id: number,
  note: string,
  prospect_id: number,
}

export interface ProspectEmail extends Record<string, unknown> {
  email: string,
  subject: string,
  body: string,
  date: Date
}

export type Channel = 'EMAIL' | 'LINKEDIN' | 'SELLSCALE';
