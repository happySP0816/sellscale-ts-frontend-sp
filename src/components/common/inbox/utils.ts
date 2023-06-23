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

export function labelizeConvoSubstatus(substatus: string) {
  if(substatus === 'ACTIVE_CONVO') return 'Uncategorized';
  return _.startCase(substatus.replace('ACTIVE_CONVO_', '').replaceAll('_', ' ').toLowerCase());
}
