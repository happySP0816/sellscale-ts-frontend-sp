import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import { Card, Group, Text, Button, Flex, ActionIcon, CopyButton, TextInput, Tooltip, Input } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons';
import { IconCalendarShare } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import displayNotification from '@utils/notificationFlow';
import { useRecoilValue } from 'recoil';
import { MsgResponse } from 'src';

export default function ProspectDetailsCalendarLink(props: { calendarLink: string }) {
  return (
    <Group noWrap my='md'>
      <TextInput
        icon={<IconCalendarShare size='1rem' style={{ filter: 'opacity(75%)' }} />}
        placeholder='Your calendar link'
        value={props.calendarLink}
        label='Your Calendar Link'
        w='100%'
        readOnly
        rightSection={
          <CopyButton value={props.calendarLink} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position='right'>
                <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                  {copied ? <IconCheck size='1rem' /> : <IconCopy size='1rem' />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        }
        styles={{
          input: {
            filter: 'opacity(60%)'
          }
        }}
      />
    </Group>
  );
}
