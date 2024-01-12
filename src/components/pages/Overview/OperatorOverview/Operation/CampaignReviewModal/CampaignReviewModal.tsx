import { FC } from 'react';
import {
  Box,
  Text,
  Flex,
  Badge,
  Button,
  Modal,
  Avatar,
  Divider,
  rem,
  Title,
  ActionIcon,
  ModalProps,
  Anchor,
  useMantineTheme,
  Stack,
  Grid,
} from '@mantine/core';
import {
  IconChartAreaLine,
  IconCheck,
  IconClock,
  IconExternalLink,
  IconMessages,
  IconUsers,
  IconX,
} from '@tabler/icons';
import { FaLinkedin } from '@react-icons/all-files/fa/FaLinkedin';
import CollapseItem from '../CollapseItem/CollapseItem';
import { faker } from '@faker-js/faker';
import { getICPRuleSet } from '@utils/requests/icpScoring';
import { useQuery } from '@tanstack/react-query';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { getBumpFrameworks } from '@utils/requests/getBumpFrameworks';
import getPersonas, { getPersonasOverview } from '@utils/requests/getPersonas';
import { Archetype, BumpFramework, PersonaOverview } from 'src';
import { API_URL } from '@constants/data';
import { showNotification } from '@mantine/notifications';

type Props = { notifId: number; archetypeId: number } & ModalProps;

const CampaignReviewModal: FC<Props> = (props) => {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching } = useQuery({
    queryKey: [`query-campaign-review-details`, { archetypeId: props.archetypeId }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { archetypeId }] = queryKey;

      const filterRes = await getICPRuleSet(userToken, archetypeId);
      const filters = filterRes.status === 'success' ? filterRes.data : null;

      console.log(archetypeId, { filters });

      const frameworksRes = await getBumpFrameworks(userToken, [], [], [archetypeId]);
      const allFrameworks =
        frameworksRes.status === 'success'
          ? (frameworksRes.data.bump_frameworks as BumpFramework[])
          : [];
      const frameworks = allFrameworks.filter((f) => f.client_archetype_id === archetypeId);

      console.log({ filters, frameworks });

      const personasRes = await getPersonasOverview(userToken);
      const personas =
        personasRes.status === 'success' ? (personasRes.data as PersonaOverview[]) : [];
      const persona = personas.find((p) => p.id === archetypeId);

      console.log({ filters, frameworks, persona });

      return {
        filters,
        frameworks,
        persona,
      };
    },
    refetchOnWindowFocus: false,
    enabled: props.archetypeId !== -1,
  });

  console.log(data);

  const renderContactFilter = () => {
    return (
      <Grid gutter={'sm'}>
        <Grid.Col xs={12} lg={6}>
          <Text fw={700} fz={'sm'} color='gray.6'>
            JOB TITLE
          </Text>

          <Flex wrap={'wrap'} gap={'xs'} mt={'sm'}>
            {(data?.filters?.included_individual_title_keywords ?? []).map(
              (t: string, i: number) => (
                <Badge color='green' variant='light' key={i}>
                  <Text color='gray.8'>{t}</Text>
                </Badge>
              )
            )}
          </Flex>
        </Grid.Col>
        <Grid.Col xs={12} lg={6}>
          <Stack spacing={'sm'}>
            <Box>
              <Text fw={700} fz={'sm'} color='gray.6'>
                INDUSTRY
              </Text>
              <Flex wrap={'wrap'} gap={'xs'} mt={'sm'}>
                {(data?.filters?.included_individual_industry_keywords ?? []).map(
                  (t: string, i: number) => (
                    <Badge color='violet' variant='light' key={i}>
                      <Text color='gray.8'>{t}</Text>
                    </Badge>
                  )
                )}
              </Flex>
            </Box>

            <Box>
              <Text fw={700} fz={'sm'} color='gray.6'>
                EXPERIENCE
              </Text>
              <Flex wrap={'wrap'} gap={'xs'} mt={'sm'}>
                {new Array(2).fill(faker.word.noun(10)).map((j, idx) => (
                  <Badge color='orange' variant='light' key={j + idx}>
                    <Text color='gray.8'>{faker.word.noun(10)}</Text>
                  </Badge>
                ))}
                {(data?.filters?.included_individual_education_keywords ?? []).map(
                  (t: string, i: number) => (
                    <Badge color='orange' variant='light' key={i}>
                      <Text color='gray.8'>{t}</Text>
                    </Badge>
                  )
                )}
              </Flex>
            </Box>

            <Box>
              <Text fw={700} fz={'sm'} color='gray.6'>
                BIO AND JOB DESCRIPTION
              </Text>
              <Flex wrap={'wrap'} gap={'xs'} mt={'sm'}>
                {(data?.filters?.included_individual_generalized_keywords ?? []).map(
                  (t: string, i: number) => (
                    <Badge color='blue' variant='light' key={i}>
                      <Text color='gray.8'>{t}</Text>
                    </Badge>
                  )
                )}
              </Flex>
            </Box>
          </Stack>
        </Grid.Col>
      </Grid>
    );
  };
  return (
    <Modal
      {...props}
      styles={{
        title: {
          fontWeight: 700,
          fontSize: rem(24),
        },
      }}
      title=''
      size={'xl'}
      withCloseButton={false}
    >
      <Box>
        <Flex justify={'space-between'}>
          <Title order={3}>Campaign Review</Title>

          <ActionIcon onClick={props.onClose} size={'lg'}>
            <IconX />
          </ActionIcon>
        </Flex>
        <Flex align='center' gap={'sm'} mt={'md'}>
          <Avatar size={'sm'} mb='auto' />

          <Box>
            <Text fw={700} size={'md'}>
              {data?.persona?.name ?? 'Loading...'}
            </Text>

            <Flex align={'center'} gap={'sm'} wrap={'wrap'}>
              <Flex align={'center'}>
                <IconUsers size={'0.8rem'} />
                <Text size={'sm'} fw={600} color='gray.6'>
                  &nbsp; {data?.persona?.num_prospects ?? '...'} Contacts &nbsp;
                  <Anchor href='/'>
                    <IconExternalLink size={'0.8rem'} />
                  </Anchor>
                </Text>
              </Flex>

              <Divider orientation='vertical' />

              <Flex align={'center'}>
                <FaLinkedin fill={theme.colors.blue[6]} />
                <Text size={'sm'} fw={600} color='gray.6'>
                  &nbsp; {data?.frameworks.length} Steps
                </Text>
              </Flex>

              <Divider orientation='vertical' />

              <Flex align={'center'} gap={'xs'}>
                <Text
                  size={'sm'}
                  fw={600}
                  color='gray.6'
                  display='flex'
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <IconClock size={'0.8rem'} /> &nbsp; TIME TO COMPLETE:
                </Text>

                <Badge>
                  {Math.round(
                    (((data?.persona?.num_prospects ?? 0) / 100) * (data?.frameworks.length ?? 0)) /
                      7
                  )}{' '}
                  WEEKS
                </Badge>
              </Flex>
            </Flex>
          </Box>
        </Flex>
        <Stack mt={'md'}>
          <CollapseItem
            defaultOpen
            icon={<IconUsers size={'1rem'} />}
            title={
              <Text fw={700} color='gray.6' transform='uppercase' fz={'sm'}>
                Contact Filter
              </Text>
            }
            content={<>{renderContactFilter()}</>}
          />
          {(data?.frameworks ?? []).map((s, idx) => (
            <CollapseItem
              key={s.title}
              defaultOpen={false}
              icon={<IconMessages />}
              title={
                <Text fw={700} color='gray.6' transform='uppercase' fz={'sm'}>
                  SEQUENCE STEP {idx + 1}:{' '}
                  <Text color='gray.8' component='span'>
                    {s.title}
                  </Text>
                </Text>
              }
              content={
                <Box
                  bg={'blue.0'}
                  p={'sm'}
                  sx={(theme) => ({
                    border: `1px solid ${theme.colors.gray[4]}`,
                    borderRadius: theme.radius.sm,
                  })}
                >
                  <Text fz={'sm'} fw={500}>
                    {s.description}
                  </Text>
                </Box>
              }
            />
          ))}
        </Stack>
        <Grid gutter={'md'} mt={'md'}>
          <Grid.Col md={6}>
            <Button
              w={'100%'}
              rightIcon={<IconExternalLink size={'1rem'} />}
              variant='outline'
              component='a'
              target='_blank'
              rel='noopener noreferrer'
              href={`/campaigns/${props.archetypeId}`}
            >
              Open Campaign
            </Button>
          </Grid.Col>
          <Grid.Col md={6}>
            <Button
              w={'100%'}
              rightIcon={<IconCheck size={'1rem'} />}
              onClick={() => {
                fetch(`${API_URL}/notification/mark_complete/${props.notifId}`, {
                  method: 'POST',
                  headers: {
                    Authorization: 'Bearer ' + userToken,
                    'Content-Type': 'application/json',
                  },
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    showNotification({
                      title: '',
                      message: `Marked as complete - redirecting now...`,
                      color: 'blue',
                    });

                    window.location.href = `campaigns/${props.archetypeId}`;
                  })
                  .catch((error) => {
                    console.error('Error marking notification as complete', error);
                  });
              }}
            >
              Mark as Reviewed
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
    </Modal>
  );
};

export default CampaignReviewModal;
