import { userDataState, userTokenState } from '@atoms/userAtoms';
import { logout } from '@auth/core';
import ComingSoonCard from '@common/library/ComingSoonCard';
import TextAreaWithAI from '@common/library/TextAreaWithAI';
import { API_URL } from '@constants/data';
import {
  TextInput,
  Tabs,
  Box,
  Button,
  Flex,
  Select,
  Text,
  Title,
  Accordion,
  Container,
  Progress,
  createStyles,
  Group,
  Badge,
} from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { ArchetypeCreation } from '@modals/CreatePersonaModal';
import { IconUser, IconPencil, IconTrashX } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { deleteCTA } from '@utils/requests/createCTA';
import toggleCTA from '@utils/requests/toggleCTA';
import { chunk, sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { CTA, Archetype, PersonaOverview } from 'src';
import LinkedInCTAsStep from './linkedin/LinkedInCTAsStep';
import LinkedInVoiceBuilderStep from './linkedin/LinkedInVoiceBuilderStep';
import BumpFrameworksPage from '@pages/BumpFrameworksPage';

type LiStepProgress = 'COMPLETE' | 'INCOMPLETE' | 'COMING_SOON' | 'OPTIONAL';

const useStyles = createStyles((theme) => ({
  item: {
    fontSize: theme.fontSizes.sm,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[7],
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[1],
  },
}));
export default function PersonaLiSetup(props: { persona: PersonaOverview; personas: PersonaOverview[] }) {
  const { classes } = useStyles();
  const userData = useRecoilValue(userDataState);

  console.log(userData)

  const [stepOneComplete, setStepOneComplete] = useState<LiStepProgress>('INCOMPLETE');
  const [stepTwoComplete, setStepTwoComplete] = useState<LiStepProgress>('OPTIONAL');
  const [stepThreeComplete, setStepThreeComplete] = useState<LiStepProgress>('INCOMPLETE');
  const [stepFourComplete, setStepFourComplete] = useState<LiStepProgress>('COMING_SOON');

  let percentage = 0;
  if (stepOneComplete !== 'INCOMPLETE') {
    percentage += 33.3;
  }
  if (stepTwoComplete !== 'INCOMPLETE') {
    percentage += 33.3;
  }
  if (stepThreeComplete !== 'INCOMPLETE') {
    percentage += 33.3;
  }
  if (stepFourComplete !== 'INCOMPLETE') {
    //
  }
  percentage = Math.ceil(percentage);

  return (
    <>
      <Container mb='lg'>
        <Progress color='blue' size={5} value={percentage} radius='lg' />
      </Container>

      <Accordion chevronPosition='right' variant='separated'>
        <Accordion.Item className={classes.item} value='li-step-1'>
          <Accordion.Control>
            <Group position='apart'>
              <div>
                <Title order={3}>Step 1/4: First Message CTAs</Title>
                <Text fs='italic' c='dimmed' fz='sm'>
                  SellScale will use these call-to-actions to influence initial LinkedIn messages.
                </Text>
              </div>
              <ProgressBadge complete={stepOneComplete} />
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <LinkedInCTAsStep
              persona={props.persona}
              personas={props.personas}
              onPopuateCTAs={(ctas) => {
                if (ctas.length > 0) {
                  setStepOneComplete('COMPLETE');
                }
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value='li-step-2'>
          <Accordion.Control>
            <Group position='apart'>
              <div>
                <Title order={3}>Step 2/4: Voice Style Builder</Title>
                <Text fs='italic' c='dimmed' fz='sm'>
                  SellScale will use this to customize the messaging for this specific persona.
                </Text>
              </div>
              <ProgressBadge complete={stepTwoComplete} />
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <LinkedInVoiceBuilderStep
              persona={props.persona}
              personas={props.personas}
            />
            <Text ta="center">If you do not make a custom voice, we will use the tuned model for {userData?.client?.company}.</Text>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value='li-step-3'>
          <Accordion.Control>
            <Group position='apart'>
              <div>
                <Title order={3}>Step 3/4: Follow-Up Frameworks</Title>
                <Text fs='italic' c='dimmed' fz='sm'>
                  SellScale uses this to influence how the follow ups work.
                </Text>
              </div>
              <ProgressBadge complete={stepThreeComplete} />
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <BumpFrameworksPage
              predefinedPersonaId={props.persona.id}
              onPopulateBumpFrameworks={(buckets) => {
                if (buckets.ACCEPTED.total > 0 || Object.values(buckets.BUMPED).find(d => d.total > 0) || buckets.ACTIVE_CONVO.total > 0) {
                  setStepThreeComplete('COMPLETE');
                }
              }}
            />
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value='li-step-4'>
          <Accordion.Control>
            <Group position='apart'>
              <div>
                <Title order={3}>Step 4/4: Simulate</Title>
                <Text fs='italic' c='dimmed' fz='sm'>
                  Simulate your SellScale AI and how it would converse with a specific prospect.
                </Text>
              </div>
              <ProgressBadge complete={stepFourComplete} />
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <ComingSoonCard />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
}

function ProgressBadge(props: { complete: LiStepProgress }) {

  let text = 'Coming Soon';
  let color = 'gray';
  if (props.complete === 'COMPLETE') {
    text = 'Complete';
    color = 'green';
  } else if (props.complete === 'INCOMPLETE') {
    text = 'Incomplete';
    color = 'red';
  } else if (props.complete === 'OPTIONAL') {
    text = 'Optional';
    color = 'yellow';
  }

  return (
    <Badge
      size='xl'
      variant='outline'
      color={color}
      styles={{ root: { textTransform: 'initial' } }}
    >
      {text}
    </Badge>
  );
}
