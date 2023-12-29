import { currentInboxCountState } from '@atoms/personaAtoms';
import { isWithinLastXDays } from "@utils/general";
import _ from "lodash";
import { useRecoilState } from 'recoil';
import { Prospect } from "src";


export const prospectStatuses = [
  {
    label: "Scheduling",
    value: "ACTIVE_CONVO_SCHEDULING",
  },
  {
    label: "Next Steps",
    value: "ACTIVE_CONVO_NEXT_STEPS",
  },
  {
    label: "Question",
    value: "ACTIVE_CONVO_QUESTION",
  },
  {
    label: "Objection",
    value: "ACTIVE_CONVO_OBJECTION",
  },
  {
    label: "Qual Needed",
    value: "ACTIVE_CONVO_QUAL_NEEDED",
  },
  {
    label: "Queued for AI Revival",
    value: "ACTIVE_CONVO_REVIVAL",
  },
  {
    label: "Queued for Snooze",
    value: "ACTIVE_CONVO_QUEUED_FOR_SNOOZE",
  },
  {
    label: "Demoing",
    value: "DEMO_SET",
  },
  {
    label: "Uncategorized",
    value: "ACTIVE_CONVO",
  },
];

export const prospectEmailStatuses = [
  {
    label: "Scheduling",
    value: "ACTIVE_CONVO_SCHEDULING",
  },
  {
    label: "Next Steps",
    value: "ACTIVE_CONVO_NEXT_STEPS",
  },
  {
    label: "Question",
    value: "ACTIVE_CONVO_QUESTION",
  },
  {
    label: "Objection",
    value: "ACTIVE_CONVO_OBJECTION",
  },
  {
    label: "Qual Needed",
    value: "ACTIVE_CONVO_QUAL_NEEDED",
  },
  {
    label: "Queued for AI Revival",
    value: "ACTIVE_CONVO_REVIVAL",
  },
  {
    label: "Out of Office",
    value: "ACTIVE_CONVO_OOO",
  },
  {
    label: "Demoing",
    value: "DEMO_SET",
  },
  {
    label: "Uncategorized",
    value: "ACTIVE_CONVO",
  },
];

export const nurturingProspectStatuses = [
  {
    label: "Accepted",
    value: "ACCEPTED",
  },
  {
    label: "Bumped",
    value: "RESPONDED",
  },
];

export function labelizeConvoSubstatus(substatus: string, bump_count?: number) {
  if(substatus === 'ACTIVE_CONVO') return 'Uncategorized';
  if(substatus.startsWith('DEMO_')) return 'Demoing';
  if(substatus === 'RESPONDED') return (bump_count && bump_count > 0) ? `Bumped #${bump_count}` : 'Bumped';
  if (substatus == 'ACTIVE_CONVO_REVIVAL') return "Queued for AI Revival"
  return _.startCase(substatus.replace('ACTIVE_CONVO_', '').replaceAll('_', ' ').toLowerCase());
}


export function populateInboxNotifs(prospects: Prospect[]){

  let recommendedProspects = _.cloneDeep(prospects);
  recommendedProspects = recommendedProspects.filter((p) => p.overall_status === 'ACTIVE_CONVO');
  recommendedProspects = recommendedProspects.filter((p) => !p.li_is_last_message_from_sdr || isWithinLastXDays(new Date(p.li_last_message_timestamp), 3));
  recommendedProspects = recommendedProspects.filter((p) => {
    return prospectStatuses.find((option) => option.value === p.linkedin_status);
  });
  recommendedProspects = recommendedProspects.filter((p) => !(p.hidden_until ? new Date(p.hidden_until).getTime() > new Date().getTime() : false));

  const inboxNotifs = new Map<string, number>();
  for (const prospect of recommendedProspects) {
    const count = inboxNotifs.get(prospect.archetype_id+'');
    if (count === undefined) {
      inboxNotifs.set(prospect.archetype_id+'', 1);
    } else {
      inboxNotifs.set(prospect.archetype_id+'', count + 1);
    }
  }

  const obj: Record<string, number> = {};
  for (const [projectId, count] of inboxNotifs.entries()) {
    obj[projectId] = count;
  }

  return recommendedProspects.length;
}


export function getStatusDetails(status: string) {
  const descriptions = getStatusDescriptions();
  for(const [key, value] of Object.entries(descriptions)) {
    if(value.enum_val === status) return value;
  }
  return null;
}

export function getStatusDescriptions() {
  return {
    'PROSPECTED': {
      name: "Prospected",
      description: "Prospect has been added to the system.",
      enum_val: 'PROSPECTED',
      sellscale_enum_val: 'PROSPECTED',
    },
    'NOT_QUALIFIED': {
      name: "Not Qualified",
      description: "Prospect is not qualified to receive outreach.",
      enum_val: 'NOT_QUALIFIED',
      sellscale_enum_val: 'REMOVED',
    },
    'QUEUED_FOR_OUTREACH': {
      name: "Queued for Outreach",
      description: "Prospect is queued for outreach.",
      enum_val: 'QUEUED_FOR_OUTREACH',
      sellscale_enum_val: 'PROSPECTED',
    },
    'SEND_OUTREACH_FAILED': {
      name: "Send Outreach Failed",
      description: "Outreach was unable to be sent to the Prospect.",
      enum_val: 'SEND_OUTREACH_FAILED',
      sellscale_enum_val: 'REMOVED',
    },
    'SENT_OUTREACH': {
      name: "Sent Outreach",
      description: "Prospect has been sent an invitation to connect on LinkedIn.",
      enum_val: 'SENT_OUTREACH',
      sellscale_enum_val: 'SENT_OUTREACH',
    },
    'ACCEPTED': {
      name: "Accepted",
      description: "Prospect has accepted the invitation to connect on LinkedIn.",
      enum_val: 'ACCEPTED',
      sellscale_enum_val: 'ACCEPTED',
    },
    'RESPONDED': {
      name: "Bumped",
      description: "The Prospect has been bumped by a follow-up message on LinkedIn",
      enum_val: 'RESPONDED',
      sellscale_enum_val: 'BUMPED',
    },
    'ACTIVE_CONVO': {
      name: "Active Convo",
      description: "The Prospect has been engaged in an active conversation on LinkedIn.",
      enum_val: 'ACTIVE_CONVO',
      sellscale_enum_val: 'ACTIVE_CONVO',
    },
    'SCHEDULING': {
      name: "Scheduling",
      description: "The Prospect is scheduling a time to meet.",
      enum_val: 'SCHEDULING',
      sellscale_enum_val: 'ACTIVE_CONVO',
    },
    'NOT_INTERESTED': {
      name: "Not Interested",
      description: "The Prospect is not interested.",
      enum_val: 'NOT_INTERESTED',
      sellscale_enum_val: 'REMOVED',
    },
    'DEMO_SET': {
      name: "Demo Set",
      description: "The Prospect has set a time to meet.",
      enum_val: 'DEMO_SET',
      sellscale_enum_val: 'DEMO',
    },
    'DEMO_WON': {
      name: "Demo Complete",
      description: "The Prospect is engaged and interested in continuing, following a meeting.",
      enum_val: 'DEMO_WON',
      sellscale_enum_val: 'DEMO',
    },
    'DEMO_LOSS': {
      name: "Demo Missed",
      description: "The Prospect is not interested in continuing, following a meeting.",
      enum_val: 'DEMO_LOSS',
      sellscale_enum_val: 'DEMO',
    },
    'ACTIVE_CONVO_QUESTION': {
      name: "Active Convo - Question",
      description: "The Prospect has a question.",
      enum_val: 'ACTIVE_CONVO_QUESTION',
      sellscale_enum_val: 'ACTIVE_CONVO',
    },
    'ACTIVE_CONVO_QUAL_NEEDED': {
      name: "Active Convo - Qualification Needed",
      description: "The Prospect's qualifications need to be clarified.",
      enum_val: 'ACTIVE_CONVO_QUAL_NEEDED',
      sellscale_enum_val: 'ACTIVE_CONVO',
    },
    'ACTIVE_CONVO_OBJECTION': {
      name: "Active Convo - Objection",
      description: "The Prospect has an objection.",
      enum_val: 'ACTIVE_CONVO_OBJECTION',
      sellscale_enum_val: 'ACTIVE_CONVO',
    },
    'ACTIVE_CONVO_SCHEDULING': {
      name: "Active Convo - Scheduling",
      description: "The Prospect is discussing scheduling.",
      enum_val: 'ACTIVE_CONVO_SCHEDULING',
      sellscale_enum_val: 'ACTIVE_CONVO',
    },
    'ACTIVE_CONVO_NEXT_STEPS': {
      name: "Active Convo - Next Steps",
      description: "The Prospect gave a short reply and needs follow-up.",
      enum_val: 'ACTIVE_CONVO_NEXT_STEPS',
      sellscale_enum_val: 'ACTIVE_CONVO',
    },
    'ACTIVE_CONVO_REVIVAL': {
      name: "Active Convo - Revival",
      description: "The Prospect has been revived.",
      enum_val: 'ACTIVE_CONVO_REVIVAL',
      sellscale_enum_val: 'ACTIVE_CONVO',
    },
  };
}
