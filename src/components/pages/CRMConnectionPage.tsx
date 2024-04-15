import { Box, Button, Card, Divider, Flex, Image, Paper, Select, Switch, Text, Title } from '@mantine/core';
import { IconCircleCheck, IconNetwork, IconPlugConnected } from '@tabler/icons';
import React, { useCallback, useEffect, useState } from 'react';

import { useMergeLink } from '@mergeapi/react-merge-link';
import { API_URL } from '@constants/data';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { showNotification } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { getOperationAvailableCRM, getSyncCRM, updateSyncCRM } from '@utils/requests/mergeCRM';
import { SyncData } from 'src';
import _ from 'lodash';
import CRMUserMapping from '../CRMConnection/CRMMapping';
import StageMapping from '../CRMConnection/StageMapping';
import AccountCreation from '../CRMConnection/AccountCreation';

type MergeIntegrationType = {
  id: string;
  integration: string;
  integration_slug: string;
  category: string;
  end_user_origin_id: string;
  end_user_organization_name: string;
  end_user_email_address: string;
  status: string;
  webhook_listener_url: string;
  is_duplicate: boolean;
};

const CRMConnectionPage: React.FC = () => {
  const userToken = useRecoilValue(userTokenState);
  const [linkToken, setLinkToken] = useState<string>('');
  const [integration, setIntegrations] = useState<MergeIntegrationType>();
  const [creatingTestContact, setCreatingTestContact] = useState<boolean>(false);

  const getLinkToken = async () => {
    const response = await fetch(`${API_URL}/merge_crm/link`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + userToken,
      },
    });
    const data = await response.json();
    setLinkToken(data.link_token);

    return data.link_token;
  };

  const connectLink = async (public_token: string) => {
    const response = await fetch(`${API_URL}/merge_crm/connect_link`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + userToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_token: public_token,
      }),
    });

    const data = await response.json();
    return data;
  };

  const deleteLink = async () => {
    const response = await fetch(`${API_URL}/merge_crm/link`, {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer ' + userToken,
      },
    });
    const data = await response.json();

    return data;
  };

  const getIntegrations = async () => {
    const response = await fetch(`${API_URL}/merge_crm/integrations`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + userToken,
      },
    });
    const data = await response.json();
    setIntegrations(data.integrations);
  };

  const createTestAccount = async () => {
    setCreatingTestContact(true);
    const response = await fetch(`${API_URL}/merge_crm/test_account`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + userToken,
      },
    });
    setCreatingTestContact(false);

    showNotification({
      title: 'Test Account Created in CRM!',
      message: 'Open up your CRM and find the Account named "SellScale Test"',
      color: 'blue',
      icon: <IconCircleCheck />,
      autoClose: 5000,
    });
  };

  useEffect(() => {
    getLinkToken();
    getIntegrations();
  }, [userToken]);

  const onSuccess = useCallback((public_token: string) => {
    connectLink(public_token).then((data) => {
      // fetch integrations
      getIntegrations();
    });
  }, []);

  const { open, isReady } = useMergeLink({
    linkToken: linkToken,
    onSuccess,
    // tenantConfig: {
    // apiBaseURL: "https://api-eu.merge.dev" /* OR your specified single tenant API base URL */
    // },
  });

  const { data: syncData, refetch } = useQuery({
    queryKey: [`query-get-csm-sync`],
    queryFn: async () => {
      const response = await getSyncCRM(userToken);
      return response.status === 'success' ? (response.data as SyncData) : null;
    },
  });

  const { data: availableOperations } = useQuery({
    queryKey: [`query-get-csm-operation-available`],
    queryFn: async () => {
      const operations = ['CRMContact_CREATE', 'CRMContact_FETCH'];
      const results: Record<string, boolean> = {};

      for (const op of operations) {
        const contactRes = await getOperationAvailableCRM(userToken, op);
        results[op] = contactRes.status === 'success' ? (contactRes.data.available as boolean) : false;
      }

      return results;
    },
  });

  const [crmSetup, setCRMSetup] = useState([
    {
      title: 'Leads vs Account + Contacts',
      content: "Depending on how your Sales Org structures your CRM, you can choose to sync SellScale prospects as 'leads' or 'account+contact' combination.",
      activate: true,
    },
  ]);

  const [leadStatusUpdates, setLeadStatusUpdates] = useState([
    {
      title: 'Prospected',
      content: 'SellScale recently added the prospect',
      activate: true,
      defaultValue: 'Prospected',
    },
    {
      title: 'Sent Outreach',
      content: 'SellScale recently sent an outreach to the prospect',
      activate: true,
      defaultValue: 'Open',
    },
    {
      title: 'Followed Up',
      content: 'SellScale is nurturing the prospect',
      activate: true,
      defaultValue: 'Working',
    },
    {
      title: 'Active Convo',
      content: 'SellScale is in an active conversation with the prospect',
      activate: true,
      defaultValue: 'In Contact',
    },
    {
      title: 'Scheduling',
      content: 'SellScale has scheduled a demo with the prospect',
      activate: true,
      defaultValue: 'Scheduling',
    },
    {
      title: 'Demo Set',
      content: 'SellScale has set a demo with the prospect',
      activate: true,
      defaultValue: 'Qualifying',
    },
    {
      title: 'Closed Won',
      content: 'SellScale has closed the deal with the prospect',
      activate: true,
      defaultValue: 'Closed Won',
    },
    {
      title: 'Closed Lost',
      content: 'SellScale has lost the deal with the prospect',
      activate: true,
      defaultValue: 'Closed Lost',
    },
  ]);

  const [eventHandlers, setEventHandlers] = useState([
    {
      title: 'On Demo Set',
      content: 'Whenever a prospect moves to "Demo Set" status, choose an automated action to take place in your CRM.',
      required_operations: ['CRMContact_CREATE', 'CRMContact_FETCH'],
      key: 'on_demo_set',
      options: [
        {
          label: 'Do Nothing',
          value: 'do_nothing',
        },
        {
          label: 'Create Lead',
          value: 'create_lead',
        },
      ],
    },
  ]);

  const hasAvailability = (required_operations: string[]) => {
    if (!availableOperations) return false;
    const enabledOperations = Object.keys(availableOperations).filter((op) => availableOperations[op]);
    return required_operations.every((op) => enabledOperations.includes(op));
  };

  return (
    <Card ml='md'>
      <Flex direction={'column'} px={'sm'} mb={'md'}>
        <Text fw={600} size={28}>
          CRM Connection
        </Text>
        <Text>Automatically add and update leads, contacts, and accounts in your CRM.</Text>
      </Flex>
      <Paper withBorder m='xs' p='lg' radius='md' bg={'#fcfcfd'}>
        <Flex align={'center'} justify={'space-between'}>
          <Flex align={'center'} gap={'sm'}>
            <IconNetwork />
            <Box>
              <Text fw={600}>
                {integration ? (
                  <span>
                    {integration.integration} CRM <span style={{ fontWeight: 400 }}>connected to</span> {integration?.end_user_organization_name}
                  </span>
                ) : (
                  'Connect to your CRM to SellScale'
                )}
              </Text>
              <Text color='gray' size='sm'>
                Connected by: {integration?.end_user_email_address}
              </Text>
            </Box>
            <Button
              ml='lg'
              className={integration ? '' : 'bg-black'}
              variant={integration ? 'outline' : 'filled'}
              color={integration ? 'red' : 'black'}
              disabled={!isReady}
              component='a'
              target='_blank'
              rel='noopener noreferrer'
              loading={false}
              onClick={() => {
                if (integration) {
                  deleteLink().then((data) => {
                    getIntegrations();
                    getLinkToken();
                  });
                } else {
                  open();
                }
              }}
            >
              {integration ? 'Disconnect' : 'Connect'}
            </Button>
          </Flex>
        </Flex>
        <Divider my='md' />
        <Text color='gray' size={'xs'} mt={'md'}>
          Add SellScale to your CRM via integration to automatically transfer contact, lead, and account information between SellScale and your CRM. This is the
          recommended option as it allows you to get real time alerts and visibility into company and people activities.
        </Text>
      </Paper>

      {integration && (
        <Paper withBorder m='xs' p='lg' radius='md' bg={'#fcfcfd'}>
          <Text size='22px' fw='500'>
            CRM Connection Settings
          </Text>
          <Divider mt='md' />

          <Divider
            labelPosition='left'
            label={
              <Text fw={500} size={'lg'}>
                {' '}
                CRM Setup
              </Text>
            }
            mb={'sm'}
            mt={'lg'}
          />
          <Flex direction={'column'} gap={'sm'}>
            {crmSetup.map((item, index) => {
              return (
                <Flex direction={'column'} key={index}>
                  <label
                    htmlFor={item?.title}
                    style={{
                      borderRadius: '8px',
                      width: '100%',
                    }}
                  >
                    <Flex
                      align={'center'}
                      justify={'space-between'}
                      style={{
                        borderRadius: '6px',
                        background: item?.activate ? '' : '#f6f6f7',
                        border: item?.activate ? '1px solid #dee2e6' : '',
                      }}
                      p={'xs'}
                    >
                      <Flex direction={'column'} maw={'60%'}>
                        <Text fw={600} mt={2} size={'sm'} color='gray'>
                          {item?.title}
                        </Text>
                        <Text color='gray' size={'xs'}>
                          {item?.content}
                        </Text>
                      </Flex>
                      <Flex>
                        <Text mt='6px' mr='sm' fz='sm' color='gray'>
                          Sync type:
                        </Text>
                        <Select data={['Sync Leads', 'Sync Account+Leads']} value={'Sync Leads'} defaultValue={'Sync Leads'} />
                      </Flex>
                    </Flex>
                  </label>
                </Flex>
              );
            })}
          </Flex>

          {/* <Divider
                            labelPosition="left"
                            label={
                            <Text fw={500} size={"lg"}>
                                {" "}
                                Map Lead Statuses
                            </Text>
                            }
                            mb={"sm"}
                            mt={"lg"}
                        />
                        <Flex direction={"column"} gap={"sm"}>
                            {leadStatusUpdates.map((item, index) => {
                            return (
                                <Flex direction={"column"} key={index}>
                                <label
                                    htmlFor={item?.title}
                                    style={{
                                    borderRadius: "8px",
                                    width: "100%",
                                    }}
                                >
                                    <Flex
                                    align={"center"}
                                    justify={"space-between"}
                                    style={{
                                        borderRadius: "6px",
                                        background: item?.activate ? "" : "#f6f6f7",
                                        border: item?.activate ? "1px solid #dee2e6" : "",
                                    }}
                                    p={"xs"}
                                    >
                                    <Flex direction={"column"}>
                                        <Text fw={600} mt={2} size={"sm"} color="gray">
                                        {item?.title}
                                        </Text>
                                        <Text color="gray" size={"xs"}>
                                        {item?.content}
                                        </Text>
                                    </Flex>
                                    <Flex>
                                        <Text mt='6px' mr='sm' fz='sm' color='gray'>
                                            {integration.integration} CRM Status:
                                        </Text>
                                        <Select 
                                            data={['Prospected', 'Open', 'Working', 'Warm', 'In Contact', 'Scheduling', 'Qualifying', 'Negotiations', 'Closed Won', 'Closed Lost']} 
                                            value={item.defaultValue}
                                        />
                                    </Flex>
                                    </Flex>
                                </label>
                                </Flex>
                            );
                            })}
                        </Flex> */}

          <>
            <Divider
              labelPosition='left'
              label={
                <Text fw={500} size={'lg'}>
                  Event Handlers
                </Text>
              }
              mb={'sm'}
              mt={'lg'}
            />
            <Flex direction={'column'} gap={'sm'}>
              {eventHandlers
                .filter((item) => hasAvailability(item.required_operations))
                .map((item, index) => {
                  return (
                    <Flex direction={'column'} key={index}>
                      <label
                        htmlFor={item?.title}
                        style={{
                          borderRadius: '8px',
                          width: '100%',
                        }}
                      >
                        <Flex
                          align={'center'}
                          justify={'space-between'}
                          style={{
                            borderRadius: '6px',
                            background: '',
                            border: '1px solid #dee2e6',
                          }}
                          p={'xs'}
                        >
                          <Flex direction={'column'}>
                            <Text fw={600} mt={2} size={'sm'} color='gray'>
                              {item?.title}
                            </Text>
                            <Text color='gray' size={'xs'}>
                              {item?.content}
                            </Text>
                          </Flex>
                          <Flex>
                            <Text mt='6px' mr='sm' fz='sm' color='gray'>
                              Action:
                            </Text>
                            <Select
                              data={item.options}
                              value={syncData?.event_handlers?.on_demo_set ?? 'do_nothing'}
                              onChange={async (val) => {
                                await updateSyncCRM(userToken, undefined, undefined, {
                                  ...(syncData?.event_handlers ?? {}),
                                  [item.key]: val,
                                });
                                refetch();
                              }}
                            />
                          </Flex>
                        </Flex>
                      </label>
                    </Flex>
                  );
                })}
              {eventHandlers.filter((item) => hasAvailability(item.required_operations)).length === 0 && (
                <Text color='gray' fs='italic' size='sm'>
                  No available event handlers
                </Text>
              )}
            </Flex>
          </>

          <Divider
            labelPosition='left'
            label={
              <Text fw={500} size={'lg'}>
                {' '}
                Test Connection
              </Text>
            }
            mb={'sm'}
            mt={'lg'}
          />
          <Card withBorder>
            <Flex>
              <Text mt='4px'>Add a test `Account` named "SellScale Test" to your CRM to verify the connection.</Text>
              <Button ml='auto' variant='outline' color='blue' loading={creatingTestContact} onClick={() => createTestAccount()}>
                Add Test Account
              </Button>
            </Flex>
          </Card>
        </Paper>
      )}
      <CRMUserMapping />
      <StageMapping />
      <AccountCreation />
    </Card>
  );
};

export default CRMConnectionPage;
