import _ from "lodash";


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
  if(substatus === 'RESPONDED') return (bump_count && bump_count > 0) ? `Bumped #${bump_count}` : 'Bumped';
  return _.startCase(substatus.replace('ACTIVE_CONVO_', '').replaceAll('_', ' ').toLowerCase());
}
