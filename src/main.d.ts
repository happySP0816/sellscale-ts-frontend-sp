

export interface Campaign {
  uuid: string;
  id: number;
  name: string;
  prospect_ids: number[];
  campaign_type: 'EMAIL' | 'LINKEDIN';
  ctas: number[];
  client_archetype_id: number;
  client_sdr_id: number;
  campaign_start_date: Date;
  campaign_end_date: Date; 
  status: 'PENDING' | 'NEEDS_REVIEW' | 'IN_PROGRESS' | 'INITIAL_EDIT_COMPLETE' | 'READY_TO_SEND' | 'COMPLETE' | 'CANCELLED';
}

