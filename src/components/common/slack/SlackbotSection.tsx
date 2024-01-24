import { Text, Paper, Flex, Image, Button, Divider, Select } from '@mantine/core';
import { IconX } from '@tabler/icons';
import { useEffect, useState } from 'react';
import SlackAlert from './SlackAlert';
import SlackNotifications from './SlackNotifications';

import SlackLogo from '@assets/images/slack-logo.png'
import { useSearchParams } from 'react-router-dom';
import { userDataState } from '@atoms/userAtoms';
import { useRecoilState } from 'recoil';


const SLACK_REDIRECT_URI = `${window.location.origin}/settings?tab=slack`;


type ChannelListType = {
  channelName: string;
  link: string;
  invitedUser: string;
};

export default function SlackbotSection() {
  const [userData, setUserData] = useRecoilState(userDataState);
  const [searchParams] = useSearchParams();

  const [connecting, setConnecting] = useState(false);
  const [connectState, setConnectState] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelListType | undefined>();
  const [channelList, setChannelList] = useState<ChannelListType[] | undefined>([
    {
      channelName: '#finance-ramp1',
      link: 'https://#finance-ramp1',
      invitedUser: 'Ishan Sharma',
    },
    {
      channelName: '#finance-ramp2',
      link: 'https://#finance-ramp2',
      invitedUser: 'David Wei',
    },
    {
      channelName: '#finance-ramp3',
      link: 'https://#finance-ramp3',
      invitedUser: 'Aakash Adesara',
    },
    {
      channelName: '#finance-ramp4',
      link: 'https://#finance-ramp4',
      invitedUser: 'Anton Sokolov',
    },
    {
      channelName: '#finance-ramp5',
      link: 'https://#finance-ramp5',
      invitedUser: 'Aaron Cessar',
    },
  ]);

  useEffect(() => {
    if (searchParams.get('tab') === 'slack' && searchParams.get('code')) {
      setConnecting(true);
    }
    if (userData.client.slack_bot_connected) {
      setConnectState(true);
      setConnecting(false);
    }
  }, [])

  useEffect(() => {
    if (userData.client.slack_bot_connected) {
      setConnectState(true);
      setConnecting(false);
    }
  }, [userData.client.slack_bot_connected])

  return (
    <>
      <Paper withBorder m='xs' p='lg' radius='md' bg={'#fcfcfd'}>
        <Flex align={'center'} justify={'space-between'}>
          <Flex align={'center'} gap={'sm'}>
            <Image src={SlackLogo} alt='slack' width={25} height={25} />
            {connectState ? (
              <Flex direction={'column'}>
                <Text fw={600}>Connected to SellScale's Slack workspace</Text>
                <Text color='gray' size={'xs'}>
                  Connected by {'Ishan Sharma'}
                </Text>
              </Flex>
            ) : (
              <Text fw={600}>Connect to your Slack workspace</Text>
            )}
          </Flex>
          <Button
            className={`${connectState ? '' : 'bg-black'}`}
            variant={connectState ? 'outline' : 'filled'}
            color={connectState ? 'red' : ''}
            rightIcon={connectState && <IconX size={'1rem'} />}
            disabled={connectState}
            component='a'
            target='_blank'
            rel='noopener noreferrer'
            href={`https://slack.com/oauth/v2/authorize?client_id=3939139709313.4226296432962&scope=app_mentions:read,incoming-webhook,channels:join,chat:write,commands,files:read,files:write,im:write,im:history,im:read,channels:history,links:write,links:read,mpim:history,mpim:read,mpim:write,mpim:write.invites,mpim:write.topic&redirect_uri=${SLACK_REDIRECT_URI}`}
            loading={connecting}
            onClick={() => {
              setConnecting(true);
            }}
          >
            {connectState ? 'Connected' : 'Connect'}
          </Button>
        </Flex>
        {!connectState && (
          <>
            <Divider my='md'/>
            <Text color='gray' size={'xs'} mt={'md'}>
              Install SellScale's Slack bot to get real time alerts and visibility into company and people activities. Use the advanced section or contact SellScale if installation is not possible.
            </Text>
          </>
        )}
      </Paper>
      {connectState && (
        <Paper withBorder m='xs' p='lg' radius='md' bg={'#fcfcfd'}>
          <Flex align={'center'} gap={'sm'}>
            <Image src={''} alt='slack' width={50} height={50} />
            <Flex direction={'column'}>
              <Text fw={600}>Enable Slack Alert</Text>
              <Text size={'xs'} color='gray'>
                Subscribed to Slack alerts for the business activities listed below.
              </Text>
            </Flex>
          </Flex>
          <Divider />
          {selectedChannel !== undefined ? (
            <SlackAlert selectedChannel={selectedChannel} />
          ) : (
            <Select
              data={channelList!.map((channel) => ({
                value: channel.channelName,
                label: channel.channelName,
              }))}
              value={selectedChannel!?.channelName}
              onChange={(value) => {
                if (value) {
                  const selected = channelList!.find((channel) => channel.channelName === value);
                  setSelectedChannel(selected);
                }
              }}
              mt={'md'}
              placeholder='Select a channel to get notified!'
            />
          )}
        </Paper>
      )}
      {connectState && (
        <SlackNotifications/>
      )}
    </>
  );
}
