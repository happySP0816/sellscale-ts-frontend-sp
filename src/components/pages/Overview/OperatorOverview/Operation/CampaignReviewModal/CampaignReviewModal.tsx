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
  IconMail,
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
import { Archetype, BumpFramework, EmailSequenceStep, PersonaOverview } from 'src';
import { API_URL } from '@constants/data';
import DOMPurify from 'dompurify';
import { showNotification } from '@mantine/notifications';
import { getEmailSequenceSteps } from '@utils/requests/emailSequencing';
import { valueToColor } from '@utils/general';

type Props = { notifId: number; archetypeId: number; data: any } & ModalProps;

const CampaignReviewModal: FC<Props> = (props) => {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const isEmail = !!props.data?.email_active;

  const { data, isFetching } = useQuery({
    queryKey: [`query-campaign-review-details`, { archetypeId: props.archetypeId }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { archetypeId }] = queryKey;

      const filterRes = await getICPRuleSet(userToken, archetypeId);
      const filters = filterRes.status === 'success' ? filterRes.data : null;

      let email_templates: EmailSequenceStep[] = [];
      let li_templates: BumpFramework[] = [];
      if (isEmail) {
        const stepsRes = await getEmailSequenceSteps(userToken, [], [], [archetypeId]);
        const allFrameworks =
          stepsRes.status === 'success'
            ? (stepsRes.data.sequence_steps as EmailSequenceStep[])
            : [];
        email_templates = allFrameworks
          .filter((f) => f.default)
          .sort((a, b) => (a.bumped_count ?? 0) - (b.bumped_count ?? 0));
      } else {
        const frameworksRes = await getBumpFrameworks(userToken, [], [], [archetypeId]);
        const allFrameworks =
          frameworksRes.status === 'success'
            ? (frameworksRes.data.bump_frameworks as BumpFramework[])
            : [];
        li_templates = allFrameworks
          .filter((f) => f.client_archetype_id === archetypeId && f.default)
          .sort((a, b) => (a.bumped_count ?? 0) - (b.bumped_count ?? 0));
      }

      const personasRes = await getPersonasOverview(userToken);
      const personas =
        personasRes.status === 'success' ? (personasRes.data as PersonaOverview[]) : [];
      const persona = personas.find((p) => p.id === archetypeId);

      return {
        filters,
        email_templates,
        li_templates,
        persona,
      };
    },
    refetchOnWindowFocus: false,
    enabled: props.archetypeId !== -1,
  });

  const templates: {
    title: string;
    description: string;
  }[] = isEmail
    ? (data?.email_templates ?? []).map((t) => ({
        title: t.title,
        description: t.template,
      }))
    : (data?.li_templates ?? []).map((t) => ({
        title: t.title,
        description: t.description,
      }));

  const renderContactFilter = () => {
    return (
      <Grid gutter={'sm'}>
        {[
          { title: 'title', key: 'included_individual_title_keywords' },
          { title: 'keywords', key: 'included_individual_generalized_keywords' },
          { title: 'skills', key: 'included_individual_skills_keywords' },
          { title: 'location', key: 'included_individual_locations_keywords' },
          { title: 'eduction', key: 'included_individual_education_keywords' },
          { title: 'company name', key: 'included_company_name_keywords' },
          { title: 'company location', key: 'included_company_locations_keywords' },
          { title: 'company keywords', key: 'included_company_generalized_keywords' },
        ].map((template, i) => (
          <Grid.Col xs={12} lg={6} key={i} span={6}>
            {((data?.filters && data?.filters[template.key]) ?? []).length > 0 && (
              <>
                <Text fw={700} fz={'sm'} color='gray.6' tt='uppercase'>
                  {template.title}
                </Text>

                <Flex wrap={'wrap'} gap={'xs'} mt={'sm'}>
                  {((data?.filters && data?.filters[template.key]) ?? []).map(
                    (t: string, i: number) => (
                      <Badge color={valueToColor(theme, template.title)} variant='light' key={i}>
                        <Text color='gray.8'>{t}</Text>
                      </Badge>
                    )
                  )}
                </Flex>
              </>
            )}
          </Grid.Col>
        ))}
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
                {isEmail ? (
                  <IconMail fill={theme.colors.yellow[6]} />
                ) : (
                  <FaLinkedin fill={theme.colors.blue[6]} />
                )}
                <Text size={'sm'} fw={600} color='gray.6'>
                  &nbsp; {templates.length} Steps
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
                    (((data?.persona?.num_prospects ?? 0) / 100) * (templates.length ?? 0)) / 7
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
          {templates.map((s, idx) => (
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
                    <Text fz='sm'>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(s.description),
                        }}
                      />
                    </Text>
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
