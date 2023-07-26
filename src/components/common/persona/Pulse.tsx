import {
  Paper,
  Title,
  Text,
  Textarea,
  Button,
  LoadingOverlay,
  Flex,
  Card,
  Tabs,
  Select,
  Group,
  Badge,
  useMantineTheme,
  createStyles,
  Stack,
  Box,
  List,
  Collapse,
} from '@mantine/core';
import { openConfirmModal, openContextModal } from '@mantine/modals';
import { IconBrain, IconBrandLinkedin, IconPencil, IconTestPipe } from '@tabler/icons';
import { forwardRef, useEffect, useState } from 'react';

import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { Archetype, PersonaOverview, ProspectShallow } from 'src';

import getICPClassificationPrompt from '@utils/requests/getICPClassificationPrompt';
import { getArchetypeProspects } from '@utils/requests/getArchetypeProspects';
import postRunICPClassification from '@utils/requests/postRunICPClassification';
import { valueToColor } from '@utils/general';
import { getICPOneProspect } from '@utils/requests/getICPOneProspect';
import { showNotification } from '@mantine/notifications';

interface ProspectItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  icpFit: number;
  title: string;
  company: string;
}

let icpFitScoreMap = new Map<string, string>([
  ['-3', 'QUEUED'],
  ['-2', 'CALCULATING'],
  ['-1', 'ERROR'],
  ['0', 'VERY LOW'],
  ['1', 'LOW'],
  ['2', 'MEDIUM'],
  ['3', 'HIGH'],
  ['4', 'VERY HIGH'],
]);

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },
}));

export default function Pulse(props: { personaOverview: PersonaOverview }) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const userToken = useRecoilValue(userTokenState);
  const [currentICPPrompt, setCurrentICPPrompt] = useState('');
  const [prospects, setProspects] = useState<ProspectShallow[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectShallow>();
  const [testingPrompt, setTestingPrompt] = useState(false);
  const [detailsOpened, setDetailsOpened] = useState(false);

  const ProspectSelectItem = forwardRef<HTMLDivElement, ProspectItemProps>(
    ({ label, icpFit, title, company, ...others }: ProspectItemProps, ref) => (
      <div ref={ref} {...others}>
        <Flex justify={'space-between'}>
          <Text>{label}</Text>
          {icpFit ? (
            <Badge color={valueToColor(theme, icpFitScoreMap.get(icpFit.toString()) || 'NONE')}>
              {icpFitScoreMap.get(icpFit.toString())}
            </Badge>
          ) : (
            <Badge color={valueToColor(theme, 'NONE')}>NONE</Badge>
          )}
        </Flex>
        <Text fz='xs'>
          {title} @ {company}
        </Text>
      </div>
    )
  );

  const triggerGetICPClassificationPrompt = async () => {
    const result = await getICPClassificationPrompt(userToken, props.personaOverview.id);

    if (result.status === 'success') {
      setCurrentICPPrompt(result.data);
    } else {
      setCurrentICPPrompt('');
    }
  };

  const triggerGetArchetypeProspects = async () => {
    const result = await getArchetypeProspects(userToken, props.personaOverview.id);

    if (result.status === 'success') {
      setProspects(result.data);
    }
  };

  const triggerGetICPOneProspect = async () => {
    if (!selectedProspect) {
      return;
    }

    setTestingPrompt(true);

    const result = await getICPOneProspect(userToken, props.personaOverview.id, selectedProspect.id);

    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Successfully tested pulse prompt on prospect. Check the updated fit and reason.',
        color: 'teal',
        autoClose: 3000,
      });
      triggerGetArchetypeProspects();
      selectedProspect.icp_fit_reason = result.data.reason;
      selectedProspect.icp_fit_score = result.data.fit;
    } else {
      showNotification({
        title: 'Error',
        message: 'Failed to test pulse prompt on prospect. Please try again.',
        color: 'red',
        autoClose: 3000,
      });
    }

    setTestingPrompt(false);
  };

  const openRunAllModal = () =>
    openConfirmModal({
      title: 'Run Pulse Prompt on All Prospects',
      children: (
        <Text size='sm'>
          Are you sure you want to run the pulse prompt on all prospects? This may take a while and will cost you
          credits.
        </Text>
      ),
      labels: { confirm: 'Confirm', cancel: 'Cancel' },
      onCancel: () => {},
      onConfirm: () => triggerPostRunICPClassification(),
    });

  const triggerPostRunICPClassification = async () => {
    const result = await postRunICPClassification(userToken, props.personaOverview.id);

    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Successfully ran pulse prompt on all prospects. Check the updated fit and reason in a few minutes.',
        color: 'teal',
        autoClose: 3000,
      });
      triggerGetArchetypeProspects();
    } else {
      showNotification({
        title: 'Error',
        message: 'Failed to run pulse prompt on prospects. Please try again or contact support.',
        color: 'red',
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    triggerGetICPClassificationPrompt();
    triggerGetArchetypeProspects();
  }, []);

  return (
    <Paper withBorder p='xs' my={20} radius='md'>
      <Flex>
        <Flex w='60%' direction='column' mr='xs'>
          <Textarea
            defaultValue={currentICPPrompt}
            placeholder='No prompt? Send SellScale a prompt request through here.'
            label='Ideal Customer Profile (ICP) Description'
            description={
              <Box>
                <Text>Filters our AI searches for:
                  <Text
                    pl='xs'
                    c="blue.4"
                    fw='bold'
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setDetailsOpened((prev) => !prev)}
                    span
                  >{detailsOpened ? 'Hide' : 'Show'}</Text>
                </Text>

                <Collapse in={detailsOpened}>
                  <List size="xs">
                    <List.Item><Text fz='xs' c='dimmed'>Prospect Name</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Prospect Title</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Prospect LinkedIn Bio</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Prospect Location</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Prospect Education</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Company Name</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Company Size</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Company Industry</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Company Location</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Company Tagline</Text></List.Item>
                    <List.Item><Text fz='xs' c='dimmed'>Company Description</Text></List.Item>
                  </List>
                </Collapse>
              </Box>
            }
            minRows={4}
            autosize
            disabled
          />
          <Button
            mt='xs'
            rightIcon={<IconPencil size='1rem' />}
            variant='outline'
            radius='lg'
            color='teal'
            onClick={() => {
              currentICPPrompt
                ? openContextModal({
                    modal: 'managePulsePrompt',
                    title: <Title order={3}>Edit Pulse Prompt</Title>,
                    innerProps: {
                      mode: 'EDIT',
                      personaOverview: props.personaOverview,
                      backfillICPPrompt: triggerGetICPClassificationPrompt,
                      icpPrompt: currentICPPrompt,
                    },
                  })
                : openContextModal({
                    modal: 'managePulsePrompt',
                    title: <Title order={3}>Create Pulse Prompt</Title>,
                    innerProps: {
                      mode: 'CREATE',
                      personaOverview: props.personaOverview,
                      backfillICPPrompt: triggerGetICPClassificationPrompt,
                      icpPrompt: currentICPPrompt,
                    },
                  });
            }}
          >
            {currentICPPrompt ? 'Edit Pulse Prompt' : 'Create New Pulse Prompt'}
          </Button>
        </Flex>
        <Flex w='40%'>
          <Paper withBorder p='xs' w='100%'>
            <Tabs defaultValue='test' color='teal'>
              <Tabs.List>
                <Tabs.Tab value='test' icon={<IconTestPipe size='0.8rem' />}>
                  Test
                </Tabs.Tab>
                <Tabs.Tab value='run' icon={<IconBrain size='0.8rem' />}>
                  Run
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value='test' pt='xs'>
                <Text fz='lg' fw='bold' mt='xs'>
                  Test Pulse Prompt
                </Text>
                <Text fz='sm'>Test your pulse prompt on a prospect of your choosing.</Text>

                <Select
                  mt='md'
                  label='Select a prospect'
                  placeholder='Pick one'
                  itemComponent={ProspectSelectItem}
                  searchable
                  clearable
                  nothingFound='No prospects found'
                  value={selectedProspect ? selectedProspect.id + '' : '-1'}
                  data={prospects.map((prospect) => {
                    return {
                      value: prospect.id + '',
                      label: prospect.full_name,
                      icpFit: prospect.icp_fit_score,
                      title: prospect.title,
                      company: prospect.company,
                    };
                  })}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedProspect(undefined);
                      return;
                    }
                    const foundProspect = prospects.find((prospect) => prospect.id === (parseInt(value) || -1));
                    setSelectedProspect(foundProspect);
                  }}
                />

                {selectedProspect && (
                  <>
                    <Card mt='md'>
                      <Text fz='lg' fw='bold'>
                        {selectedProspect.full_name}
                      </Text>
                      <Text fz='sm'>
                        {selectedProspect.title} @ {selectedProspect.company}
                      </Text>

                      {selectedProspect.li_public_id && (
                        <Group noWrap spacing={10} mt={5}>
                          <IconBrandLinkedin stroke={1.5} size={16} className={classes.icon} />
                          <Text
                            size='xs'
                            color='dimmed'
                            component='a'
                            target='_blank'
                            rel='noopener noreferrer'
                            href={`https://www.linkedin.com/in/${selectedProspect.li_public_id}`}
                          >
                            linkedin.com/in/{selectedProspect.li_public_id}
                          </Text>
                        </Group>
                      )}

                      <Flex mt='md'>
                        <Text fz='sm' fw='bold' mr='xs'>
                          Fit:
                        </Text>
                        {selectedProspect.icp_fit_score ? (
                          <Badge
                            color={valueToColor(
                              theme,
                              icpFitScoreMap.get(selectedProspect.icp_fit_score.toString()) || 'NONE'
                            )}
                          >
                            {icpFitScoreMap.get(selectedProspect.icp_fit_score.toString())}
                          </Badge>
                        ) : (
                          <Badge color={valueToColor(theme, 'NONE')}>None</Badge>
                        )}
                        {/* <Badge
                          color={valueToColor(theme, icpFitScoreMap.get(selectedProspect.icp_fit_score.toString()) || 'NONE')}
                        >
                          {icpFitScoreMap.get(selectedProspect.icp_fit_score.toString())}
                        </Badge> */}
                      </Flex>

                      <Flex mt='md'>
                        <Text fz='sm' fw='bold' mr='xs'>
                          Reason:
                        </Text>
                        <Text fz='sm'>{selectedProspect.icp_fit_reason || 'None'}</Text>
                      </Flex>
                    </Card>
                    <Flex justify='flex-end'>
                      <Button
                        variant='light'
                        color='teal'
                        radius='md'
                        mt='md'
                        loading={testingPrompt}
                        disabled={currentICPPrompt === ''}
                        onClick={() => {
                          triggerGetICPOneProspect();
                        }}
                      >
                        Test Pulse
                      </Button>
                    </Flex>
                  </>
                )}
              </Tabs.Panel>

              <Tabs.Panel value='run' pt='xs'>
                <Text fz='lg' fw='bold' mt='xs'>
                  Run Pulse
                </Text>
                <Text fz='sm'>Run your pulse prompt on all prospects.</Text>
                <Card mt='md'>
                  <Text fz='md'>This is a costly operation and will take a while to complete!</Text>
                  <Flex mt='md'>
                    <Text fw='bold'>Number of Prospects:</Text>
                    <Text ml='xs'>{prospects.length}</Text>
                  </Flex>
                  <Flex>
                    <Text fw='bold'>Estimated Time:</Text>
                    <Text ml='xs'>{((prospects.length * 0.3) / 60).toPrecision(1)} minutes</Text>
                  </Flex>
                  <Flex>
                    <Text fw='bold'>Estimated Cost:</Text>
                    <Text ml='xs'>{prospects.length} credits</Text>
                  </Flex>
                </Card>
                <Flex justify={'flex-end'}>
                  <Button
                    variant='light'
                    color='teal'
                    radius='md'
                    mt='md'
                    loading={testingPrompt}
                    disabled={currentICPPrompt === ''}
                    onClick={openRunAllModal}
                  >
                    Run Pulse
                  </Button>
                </Flex>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Flex>
      </Flex>
    </Paper>
  );
}
