import { Button, Divider, Flex, Switch, Text } from '@mantine/core';
import { IconEdit } from '@tabler/icons';
import { useState } from 'react';

export default function SlackAlert(props: any) {
  const [slackLinkedinNotification, setSlackLinkedinNotification] = useState([
    {
      title: 'Acceptea Notification - Coming Soon!',
      content: `"Ariel is requesting a new card."`,
      activate: true,
    },
    {
      title: 'Replied Notification - Coming Soon!',
      content: `"Ariel is requesting a new card."`,
      activate: true,
    },
    {
      title: 'Demo Set Notification - Coming Soon!',
      content: `"Ariel is requesting a new card."`,
      activate: false,
    },
  ]);

  const [slackEmailNotification, setSlackEmailNotification] = useState([
    {
      title: 'Opened Notifications - Coming Soon!',
      content: `"Ariel is requesting a new card."`,
      activate: true,
    },
    {
      title: 'Replied Notifications - Coming Soon!',
      content: `"Ariel is requesting a new card."`,
      activate: false,
    },
    {
      title: 'Demo Set Notifications - Coming Soon!',
      content: `"Ariel is requesting a new card."`,
      activate: true,
    },
  ]);
  return (
    <>
      <Flex style={{ border: '1px solid gray', borderStyle: 'dashed', borderRadius: '6px' }} align={'center'} p={'sm'} justify={'space-between'} mt={'md'}>
        <Flex align={'center'} gap={'sm'}>
          <Text size={'sm'} fw={500}>
            Connected to {props.selectedChannel.channelName}
          </Text>
          <Text size={'xs'} color='gray'>
            - by {props.selectedChannel.invitedUser}
          </Text>
        </Flex>
        <Flex gap={'sm'} align={'center'}>
          <Button variant='outline' color='red' disabled>
            Disconnect
          </Button>
          {/* <IconEdit color='gray' /> */}
        </Flex>
      </Flex>
      <Divider my={'lg'} />
      <Flex direction={'column'} gap={'sm'}>
        <Flex direction={'column'}>
          <label
            htmlFor={'qq'}
            style={{
              borderRadius: '8px',
              width: '100%',
            }}
          >
            <Flex align={'center'} justify={'space-between'} style={{ borderRadius: '6px', border: '1px solid #dee2e6' }} p={'xs'}>
              <Flex direction={'column'}>
                <Text fw={600} mt={2} size={'sm'}>
                  AI Reply to Email
                </Text>
                <Text color='gray' size={'xs'}>
                  {`"Ariel is requesting a new card."`}
                </Text>
              </Flex>
              <Switch
                // value={item?.id}
                id={'qq'}
                size='xs'
                // onClick={() => {
                //   setData(item);
                //   setBlockList(item?.transformer_blocklist);
                // }}
                color='green'
              />
            </Flex>
          </label>
        </Flex>
        <Flex direction={'column'}>
          <label
            htmlFor={'ss'}
            style={{
              borderRadius: '8px',
              width: '100%',
            }}
          >
            <Flex align={'center'} justify={'space-between'} style={{ borderRadius: '6px', border: '1px solid #dee2e6' }} p={'xs'}>
              <Flex direction={'column'}>
                <Text fw={600} mt={2} size={'sm'}>
                  AI Reply to Email
                </Text>
                <Text color='gray' size={'xs'}>
                  {`"Ariel is requesting a new card."`}
                </Text>
              </Flex>
              <Switch
                // value={item?.id}
                id={'ss'}
                size='xs'
                // onClick={() => {
                //   setData(item);
                //   setBlockList(item?.transformer_blocklist);
                // }}
                color='green'
              />
            </Flex>
          </label>
        </Flex>
      </Flex>
      <Divider
        labelPosition='left'
        label={
          <Text fw={500} size={'lg'}>
            {' '}
            Linkedin
          </Text>
        }
        mb={'sm'}
        mt={'lg'}
      />
      <Flex direction={'column'} gap={'sm'}>
        {slackLinkedinNotification.map((item, index) => {
          return (
            <Flex direction={'column'}>
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
                  style={{ borderRadius: '6px', background: item?.activate ? '' : '#f6f6f7', border: item?.activate ? '1px solid #dee2e6' : '' }}
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
                  <Switch
                    checked={item.activate}
                    id={item.title}
                    size='xs'
                    onChange={() => {
                      setSlackLinkedinNotification(
                        slackLinkedinNotification.map((prev) => ({
                          ...prev,
                          activate: prev.title === item.title ? !prev.activate : prev.activate,
                        }))
                      );
                    }}
                    color='green'
                  />
                </Flex>
              </label>
            </Flex>
          );
        })}
      </Flex>
      <Divider
        labelPosition='left'
        label={
          <Text fw={500} size={'lg'}>
            {' '}
            Email
          </Text>
        }
        mb={'sm'}
        mt={'lg'}
      />
      <Flex direction={'column'} gap={'sm'}>
        {slackEmailNotification.map((item, index) => {
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
                  <Flex direction={'column'}>
                    <Text fw={600} mt={2} size={'sm'} color='gray'>
                      {item?.title}
                    </Text>
                    <Text color='gray' size={'xs'}>
                      {item?.content}
                    </Text>
                  </Flex>
                  <Switch
                    checked={item.activate}
                    id={item.title}
                    size='xs'
                    onChange={() => {
                      setSlackEmailNotification(
                        slackEmailNotification.map((prev) => ({
                          ...prev,
                          activate: prev.title === item.title ? !prev.activate : prev.activate,
                        }))
                      );
                    }}
                    color='green'
                  />
                </Flex>
              </label>
            </Flex>
          );
        })}
      </Flex>
    </>
  );
}
