import { ActionIcon, Box, Button, Card, Code, Container, Flex, List, Loader, Popover, Text, Title } from '@mantine/core';
import PersonaSelect from './PersonaSplitSelect';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import PersonaRecentSplitRequests from './PersonaRecentSplitRequests';
import { IconQuestionMark } from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';
type PropsType = {
  archetype_id: number;
};

export default function PersonaSplit(props: PropsType) {
  const [disablePersonaSplitButton, setDisablePersonaSplitButton] = useState(false);
  const [splittingPersonas, setSplittingPersonas] = useState(false);
  const [destinationPersonaIDs, setDestinationPersonaIDs] = useState<number[]>([]);
  const [userToken] = useRecoilState(userTokenState);
  const [openedInfo, { open: openInfo, close: closeInfo }] = useDisclosure(false);

  const triggerPersonaSplit = async () => {
    postSplitRequest();
  };

  const postSplitRequest = () => {
    fetch(`${API_URL}/personas/split_prospects`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source_archetype_id: props.archetype_id,
        target_archetype_ids: destinationPersonaIDs,
      }),
    }).then((res) => {
      if (res.status === 200) {
        setSplittingPersonas(true);
        setDisablePersonaSplitButton(true);
        console.log('Splitting prospects into personas...');
      }
    });
  };

  return (
    <Flex>
      <Container w='60%'>
        <Title order={4}>Split Contacts into Personas</Title>
        <Text size='sm' mb='lg'>
          Select the personas you want to split your contacts into and then click the button{' '}
          <Code>Split into Personas</Code> to automatically split your contacts into the selected personas.
        </Text>
        <PersonaSelect
          disabled={disablePersonaSplitButton}
          onChange={setDestinationPersonaIDs}
          selectMultiple={true}
          label='Select Personas to Split Prospects Into'
          description='The prospects will be split into the selected personas using the splitting AI'
        />
        <Flex align='center'>
          <Button
            color='grape'
            mt='lg'
            onClick={triggerPersonaSplit}
            disabled={disablePersonaSplitButton || destinationPersonaIDs.length === 0}
          >
            Split into {destinationPersonaIDs.length} Personas
          </Button>
          <Popover width={360} position='bottom' withArrow shadow='md' opened={openedInfo}>
            <Popover.Target>
              <ActionIcon
                mt='md'
                mx='md'
                color='yellow'
                variant='outline'
                radius='xl'
                size='sm'
                onMouseEnter={openInfo}
                onMouseLeave={closeInfo}
              >
                <IconQuestionMark size='1.3rem' />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
              <Text size='sm'>
                By splitting, the contacts in this persona will be divided into the selected personas
                automatically based on best fit.
              </Text>
              <Text size='sm'>
                Best fit is determined by the following criteria:
              </Text>
              <List>
                <List.Item><Text size='sm'>Name</Text></List.Item>
                <List.Item><Text size='sm'>Role or responsibility</Text></List.Item>
                <List.Item><Text size='sm'>Company</Text></List.Item>
                <List.Item><Text size='sm'>Geographical location</Text></List.Item>
                <List.Item><Text size='sm'>Industry</Text></List.Item>
              </List>
            </Popover.Dropdown>
          </Popover>
        </Flex>
        {splittingPersonas && (
          <Card mt='lg'>
            <Flex>
              <Loader mr='lg' />
              <Box>
                <Text>Splitting prospects into personas...</Text>
                <Text size='xs'>This may take a few minutes. Feel free to check back in in a little bit.</Text>
              </Box>
            </Flex>
          </Card>
        )}
      </Container>
      <Container w='40%'>
        <PersonaRecentSplitRequests archetype_id={props.archetype_id} />
      </Container>
    </Flex>
  );
}
