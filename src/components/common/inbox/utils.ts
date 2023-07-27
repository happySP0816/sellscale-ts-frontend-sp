import { currentInboxCountState } from '@atoms/personaAtoms';
import { isWithinLastXDays } from "@utils/general";
import _ from "lodash";
import { useRecoilState } from 'recoil';
import { Prospect } from "src";


export const prospectStatuses = [
  {
    label: "Objection",
    value: "ACTIVE_CONVO_OBJECTION",
  },
  {
    label: "Qual Needed",
    value: "ACTIVE_CONVO_QUAL_NEEDED",
  },
  {
    label: "Question",
    value: "ACTIVE_CONVO_QUESTION",
  },
  {
    label: "Scheduling",
    value: "ACTIVE_CONVO_SCHEDULING",
  },
  {
    label: "Next Steps",
    value: "ACTIVE_CONVO_NEXT_STEPS",
  },
  {
    label: " Revival (Needs a Follow Up)",
    value: "ACTIVE_CONVO_REVIVAL",
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
  if(substatus === 'DEMO_SET') return 'Demoing';
  if(substatus === 'RESPONDED') return (bump_count && bump_count > 0) ? `Bumped #${bump_count}` : 'Bumped';
  if (substatus == 'ACTIVE_CONVO_REVIVAL') return "🤖 Revival (Needs a Follow Up)"
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
