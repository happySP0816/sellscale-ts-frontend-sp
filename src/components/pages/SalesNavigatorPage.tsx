import { currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import PersonaSelect from '@common/persona/PersonaSplitSelect';
import YourNetworkSection from '@common/your_network/YourNetworkSection';
import {
  Card,
  Flex,
  Title,
  Text,
  TextInput,
  Anchor,
  NumberInput,
  Tooltip,
  Button,
  ActionIcon,
  Badge,
  useMantineTheme,
  Loader,
  Group,
  Stack,
  Box,
  Progress,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import {
  IconAffiliate,
  IconBrandLinkedin,
  IconDownload,
  IconRefresh,
  IconZoomReset,
  IconX,
} from '@tabler/icons';
import { setPageTitle } from '@utils/documentChange';
import { valueToColor } from '@utils/general';
import getSalesNavigatorLaunches, {
  getSalesNavigatorLaunch,
  resetSalesNavigatorLaunch,
} from '@utils/requests/getSalesNavigatorLaunches';
import postLaunchSalesNavigator from '@utils/requests/postLaunchSalesNavigator';
import moment, { now } from 'moment';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { SalesNavigatorLaunch } from 'src';
import { patchSalesNavigatorLaunchAccountFiltersUrl } from '@utils/requests/patchAccountFiltersURL';

export default function SalesNavigatorComponent(props: { showPersonaSelect?: boolean }) {
  setPageTitle('Find Contacts');
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();

  const [loading, setLoading] = useState(false);
  const [launches, setLaunches] = useState<SalesNavigatorLaunch[]>([]);
  const launchName = useRef<HTMLInputElement>(null);
  const currentProject = useRecoilValue(currentProjectState);

  const [uploadPersonaId, setUploadPersonaId]: any = useState<number>(currentProject?.id || -1);

  const clickAccountFilterURL = (launchId: number, launchAccountFiltersURL: string) => {
    if (launchAccountFiltersURL) {
      window.open(launchAccountFiltersURL, '_blank');
    } else {
      let tempInputValue = '';

      openConfirmModal({
        title: 'Set Account Filter URL',
        children: (
          <TextInput
            description='Copy-paste the Account Filter URL below'
            placeholder='Account Filter URL'
            onChange={(event) => {
              tempInputValue = event.currentTarget.value;
            }}
          />
        ),
        labels: { confirm: 'Save', cancel: 'Cancel' },
        onCancel: () => {},
        onConfirm: () => {
          if (!isValidUrl(tempInputValue)) {
            showNotification({
              title: 'Error',
              message: 'Invalid URL provided',
              color: 'red',
            });
            return; // Stop execution if URL is invalid
          }
          updateAccountFiltersURL(launchId, tempInputValue);
        },
      });
    }
  };
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateAccountFiltersURL = (launchId: number, newURL: string) => {
    const updatedLaunches = launches.map((launch) => {
      if (launch.id === launchId) {
        // Creates a new launch object with the updated URL
        return { ...launch, account_filters_url: newURL };
      }
      return launch;
    });

    setLaunches(updatedLaunches);

    patchSalesNavigatorLaunchAccountFiltersUrl(userToken, launchId, newURL)
      .then((response) => {
        if (response) {
          // Assuming response is true if the update is successful
          //  show a success notification
          showNotification({
            title: 'Success',
            message: 'Account filters URL updated successfully',
            color: 'green',
          });
        } else {
          // Handle error case
          showNotification({
            title: 'Error',
            message: 'Failed to update account filters URL',
            color: 'red',
          });
        }
      })
      .catch((error) => {
        // console.error('Error updating account filters URL:', error);
        // Handle error case
        showNotification({
          title: 'Error',
          message: 'Failed to update account filters URL',
          color: 'red',
        });
      });
  };

  const triggerGetSalesNavigatorLaunches = async () => {
    setLoading(true);

    let currentProjectId: number | undefined = uploadPersonaId;
    if (!props.showPersonaSelect) {
      currentProjectId = currentProject?.id;
    }

    const result = await getSalesNavigatorLaunches(userToken, currentProjectId);
    if (result.status != 'success') {
      showNotification({
        title: 'Could not retrieve Sales Navigator launches',
        message: result.message,
      });
    }
    setLaunches(result.data.launches);

    setLoading(false);
  };

  const triggerResetSalesNavigatorLaunch = async (launch_id: number) => {
    await resetSalesNavigatorLaunch(userToken, launch_id);

    triggerGetSalesNavigatorLaunches();

    showNotification({
      title: 'Sales Navigator Reset',
      message: 'Your Sales Navigator search has been reset. This may take a few minutes.',
    });
  };

  const triggerGetSalesNavigatorLaunch = async (launch_id: number) => {
    setLoading(true);

    const result = await getSalesNavigatorLaunch(userToken, launch_id);

    setLoading(false);
  };

  const triggerPostLaunchSalesNavigator = async () => {
    setLoading(true);

    let personaId: number | undefined = uploadPersonaId;
    if (!props.showPersonaSelect) {
      personaId = currentProject?.id;
    }

    const result = await postLaunchSalesNavigator(
      userToken,
      salesNavigatorForm.values.url,
      salesNavigatorForm.values.numberOfContacts,
      launchName.current!.value,
      personaId
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Could not launch Scraper',
        message: result.message,
      });
    } else {
      showNotification({
        title: 'Sales Navigator Launched',
        message: 'Your Sales Navigator search has been launched. This may take a few minutes.',
      });
      salesNavigatorForm.reset();
      triggerGetSalesNavigatorLaunches();
    }

    setLoading(false);
  };

  useEffect(() => {
    triggerGetSalesNavigatorLaunches();

    // Call myFunction every 20 seconds
    const intervalId = setInterval(triggerGetSalesNavigatorLaunches, 20000); // 20,000 milliseconds = 20 seconds

    // Clean up the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  const salesNavigatorForm = useForm({
    initialValues: {
      url: '',
      numberOfContacts: 0,
    },
  });

  return (
    <Box w='100%'>
      <Card shadow='sm' p='lg' mt='sm'>
        <Title order={4}>LinkedIn Sales Navigator</Title>
        <Text>
          Use a{' '}
          <Anchor href='https://www.linkedin.com/sales/search/people' target='_blank'>
            LinkedIn sales navigator
          </Anchor>{' '}
          search to find contacts.
        </Text>
        <Flex mt='lg' align='center'>
          <TextInput
            w='60%'
            label='LinkedIn Sales Navigator URL'
            placeholder='https://www.linkedin.com/sales/search/people...'
            icon={<IconBrandLinkedin size='0.8rem' />}
            value={salesNavigatorForm.values.url}
            onChange={(event) => salesNavigatorForm.setFieldValue('url', event.currentTarget.value)}
            required
            withAsterisk
            error={
              salesNavigatorForm.values.url &&
              !salesNavigatorForm.values.url.startsWith(
                'https://www.linkedin.com/sales/search/people'
              ) &&
              true
            }
          />
          <Tooltip
            label='The number of contacts to find; capped at 2,500 contacts per search.'
            withinPortal
            withArrow
            w='40%'
          >
            <NumberInput
              ml='lg'
              label='Number of contacts'
              placeholder='100'
              withAsterisk
              min={0}
              max={2500}
              value={salesNavigatorForm.values.numberOfContacts}
              onChange={(event) =>
                salesNavigatorForm.setFieldValue('numberOfContacts', event as number)
              }
              required
            />
          </Tooltip>
        </Flex>
        <Flex mt='md' align='center'>
          {props.showPersonaSelect && (
            <PersonaSelect
              disabled={true}
              onChange={(archetypes: any) =>
                archetypes.length > 0
                  ? setUploadPersonaId(archetypes[0].id)
                  : setUploadPersonaId(null)
              }
              selectMultiple={false}
              label='Uploading to persona:'
              description=''
              defaultValues={!props.showPersonaSelect ? [] : [uploadPersonaId]}
            />
          )}
          <Button
            mt={props.showPersonaSelect ? 'xl' : ''}
            ml={props.showPersonaSelect ? 'xs' : ''}
            disabled={
              salesNavigatorForm.values.numberOfContacts === 0 ||
              salesNavigatorForm.values.url === '' ||
              !salesNavigatorForm.values.url.startsWith(
                'https://www.linkedin.com/sales/search/people'
              )
            }
            loading={loading}
            onClick={() => {
              openConfirmModal({
                title: 'Launch Sales Navigator',
                children: (
                  <TextInput
                    withAsterisk
                    label='Name your Sales Navigator search'
                    description='This name will be used to help you to identify your search in the future.'
                    placeholder='My Sales Navigator Search'
                    defaultValue={`${currentProject?.name} - ${salesNavigatorForm.values.numberOfContacts} contacts`}
                    ref={launchName}
                    onChange={(event) => {
                      launchName.current!.value = event.currentTarget.value;
                    }}
                  />
                ),
                labels: { confirm: 'Launch Scraper', cancel: 'Cancel' },
                confirmProps: { disabled: launchName.current?.value === '' },
                onCancel: () => {},
                onConfirm: () => {
                  triggerPostLaunchSalesNavigator();
                },
              });
            }}
          >
            Find Contacts
          </Button>
          <Button
            ml='auto'
            variant='outline'
            onClick={triggerGetSalesNavigatorLaunches}
            loading={loading}
          >
            Refresh
          </Button>
        </Flex>

        {launches &&
          launches.length > 0 &&
          launches.map((launch, index) => {
            const dateObject = launch.launch_date ? new Date(launch.launch_date) : new Date();
            const date = dateObject.toLocaleDateString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            let badgeColor;
            if (launch.status === 'SUCCESS') {
              badgeColor = theme.colors.green[6];
            } else if (launch.status === 'RUNNING') {
              badgeColor = theme.colors.orange[6];
            } else if (launch.status === 'QUEUED') {
              badgeColor = theme.colors.gray[6];
            } else {
              badgeColor = theme.colors.red[6];
            }

            return (
              <Card mt='lg' p='lg' shadow='sm' withBorder>
                {launch.client_archetype_id && (
                  <Badge size='xs' mb='sm'>
                    {launch.archetype}
                  </Badge>
                )}
                <Flex align='center' justify='space-between'>
                  <Flex align='center'>
                    <Title order={5}>{launch.name || `Scrape #${launches.length - index}`}</Title>
                    <Text ml='sm' fz='xs' mr='xs'>
                      {date}
                    </Text>
                  </Flex>

                  <Flex>
                    <Tooltip label='Reset Job' withinPortal withArrow>
                      <ActionIcon
                        onClick={() => {
                          triggerResetSalesNavigatorLaunch(launch.id);
                        }}
                        sx={{
                          opacity:
                            moment.duration(moment().diff(moment(launch.launch_date))).asMinutes() >
                            10
                              ? 'block'
                              : 'none',
                        }}
                        disabled={
                          moment.duration(moment().diff(moment(launch.launch_date))).asMinutes() <
                          10
                        }
                      >
                        <IconRefresh size='1.2rem'></IconRefresh>
                      </ActionIcon>
                    </Tooltip>
                    {launch.status === 'SUCCESS' ? (
                      <Tooltip label='Download CSV' withinPortal withArrow>
                        <ActionIcon onClick={() => triggerGetSalesNavigatorLaunch(launch.id)}>
                          <IconDownload size='1.2rem' />
                        </ActionIcon>
                      </Tooltip>
                    ) : (
                      <Tooltip label='This scrape has not finished yet. Please check back later.'>
                        <Loader mr='xs' size='xs' variant='dots' />
                      </Tooltip>
                    )}
                  </Flex>
                </Flex>
                <Flex>
                  <Text>{launch.scrape_count} contacts</Text>

                  <Flex>
                    <Badge color={badgeColor} size='sm' ml='md' variant='outline' mt='4px'>
                      {launch.status}
                    </Badge>
                  </Flex>
                </Flex>
                <Stack spacing={0}>
                  <Anchor size='sm' href={launch.sales_navigator_url} target='_blank'>
                    View Original Filters
                  </Anchor>
                  <Group spacing={0}>
                    <Anchor
                      size='sm'
                      onClick={() => clickAccountFilterURL(launch.id, launch.account_filters_url)}
                    >
                      {launch.account_filters_url ? 'View Account Filters' : 'Set Account Filters'}
                    </Anchor>
                    {launch.account_filters_url && (
                      <ActionIcon
                        size='sm'
                        color='red'
                        onClick={() => {
                          openConfirmModal({
                            title: 'Are you sure you want to delete the Account Filters URL?',
                            labels: { confirm: 'Confirm', cancel: 'Cancel' },
                            onCancel: () => {},
                            onConfirm: () => {
                              updateAccountFiltersURL(launch.id, '');
                            },
                          });
                        }}
                      >
                        <IconX />
                      </ActionIcon>
                    )}
                  </Group>
                </Stack>
                <Text mt='xs' color='gray' transform='uppercase' fz='xs' fw='bold' align='right'>
                  {launch.status == 'SUCCESS'
                    ? 100
                    : Math.min(
                        launch.launch_date
                          ? Math.round(
                              (moment
                                .duration(moment().diff(moment(launch.launch_date)))
                                .asMinutes() /
                                15) *
                                100
                            )
                          : 0,
                        95
                      )}
                  % Complete
                </Text>
                <Progress
                  value={
                    launch.status == 'SUCCESS'
                      ? 100
                      : Math.min(
                          Math.round(
                            (moment
                              .duration(moment().diff(moment(launch.launch_date)))
                              .asMinutes() /
                              15) *
                              100
                          ),
                          95
                        )
                  }
                  animate={launch.status != 'SUCCESS'}
                  color={launch.status == 'SUCCESS' ? 'green' : 'blue'}
                />
              </Card>
            );
          })}
      </Card>
    </Box>
  );
}
