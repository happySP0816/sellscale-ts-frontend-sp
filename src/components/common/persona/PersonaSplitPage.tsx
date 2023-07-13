import { currentProjectState } from '@atoms/personaAtoms';
import PageFrame from '@common/PageFrame';
import { useRecoilValue } from 'recoil';
import PersonaSplit from './PersonaSplit';
import { Card, Text, Title } from '@mantine/core';

export const PersonaSplitPage = () => {
  const currentProject = useRecoilValue(currentProjectState);

  return <PageFrame>
    <Title>Persona Splitting</Title>
    <Text>
      Use this tool to split your prospects in the '{currentProject?.name}' persona into other personas.
      <br/>
      Note that this will split your prospects into the other personas, and will not be easily reversible.
      
    </Text>
    {currentProject?.is_unassigned_contact_archetype ? 
      <Card withBorder mt='sm'>
        <PersonaSplit archetype_id={currentProject?.id ?? -1} />
      </Card>
      :
      <Card withBorder mt='sm'>
        <Text>
          You can only split prospects from the "Unassigned Contacts" persona at the moment. Please contact a SellScale 
          engineer if you would like to split prospects from this, non-unassigned persona.
        </Text>
      </Card>
    }
  </PageFrame>
}