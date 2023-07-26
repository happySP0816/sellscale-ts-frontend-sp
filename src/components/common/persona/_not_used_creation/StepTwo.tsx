
import { personaCreationState } from '@atoms/personaAtoms';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

export default function StepTwo(props: { onChange: (data: {
  fitReason: string,
  icpMatchingPrompt: string,
  contactObjective: string
}) => void }) {

  const creationData = useRecoilValue(personaCreationState);

  const [fitReason, setFitReason] = useState(creationData.persona.fitReason);
  const [icpMatchingPrompt, setICPMatchingPrompt] = useState(creationData.persona.icp_matching_prompt);
  const [contactObjective, setContactObjective] = useState(creationData.persona.contactObjective || 'Set up a discovery call in order to identify a pain point');

  useEffect(() => {
    props.onChange({ fitReason: fitReason, icpMatchingPrompt: icpMatchingPrompt, contactObjective: contactObjective });
  }, [fitReason, icpMatchingPrompt, contactObjective]);

  return (
    <>
      <TextAreaWithAI
        withAsterisk
        value={fitReason}
        onChange={(e) => setFitReason(e.target.value)}
        placeholder='To help their outbound team increase...'
        label='Why would this persona buy your product?'
        description="This information is used by the AI to construct value prop messages"
      />

      <TextAreaWithAI
        withAsterisk
        value={
          icpMatchingPrompt ||
          'Role(s): \nSeniority: \nLocations: \nOther Notes:\n-\n-\n-\nTiers:\n- VERY HIGH FIT: \n- HIGH FIT: \n- MEDIUM FIT: \n- LOW FIT: \n- VERY LOW FIT:'
        }
        onChange={(e) => setICPMatchingPrompt(e.target.value)}
        description='Describe the roles, seniority, location, tiers, and other notes to rank prospects in this persona.'
        minRows={4}
        label='In rich detail, describe this persona for SellScale AI'
      />

      <TextAreaWithAI
        withAsterisk
        value={contactObjective}
        label='Contact Objective'
        description='Describe the objective of the outreach.'
        placeholder='To get a demo scheduled with the goal of potentially integrating our product into their workflow.'
        onChange={(e) => setContactObjective(e.target.value)}
      />
    </>
  );
}
