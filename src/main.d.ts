

export interface Campaign {

  uuid: string;
  id: number;
  name: string;
  prospectIds: number[];
  type: 'EMAIL' | 'LINKEDIN';
  ctaIds: number[];
  personaId: number;
  clientSDRId: number;
  startDate: Date;
  endDate: Date; 
  status: 'PENDING' | 'NEEDS_REVIEW' | 'IN_PROGRESS' | 'INITIAL_EDIT_COMPLETE' | 'READY_TO_SEND' | 'COMPLETE' | 'CANCELLED';
  briefFeedbackSummary: string;
  editingDueDate: Date;

}

