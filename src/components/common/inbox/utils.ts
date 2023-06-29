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
    label: " Revival (AI Follow Ups Needed)",
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
  if (substatus == 'ACTIVE_CONVO_REVIVAL') return "🤖 Revival (AI Follow Ups Needed)"
  return _.startCase(substatus.replace('ACTIVE_CONVO_', '').replaceAll('_', ' ').toLowerCase());
}
