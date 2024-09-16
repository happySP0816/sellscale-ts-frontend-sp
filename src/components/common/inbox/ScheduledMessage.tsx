import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Button, Collapse, Divider, Flex, Indicator, Modal, Popover, Text, TextInput } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { getHiddenUntil, getScheduledMessages } from "@utils/requests/getConversation";
import { IconCalendar, IconCalendarTime, IconEdit, IconPencil, IconTrash } from '@tabler/icons';
import { DatePicker, DatePickerProps } from '@mantine/dates';
import moment from 'moment';
import { useRecoilValue } from 'recoil';
import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';

export const ScheduledMessage = forwardRef(({ openedProspectId }: { openedProspectId: number }, ref) => {
  const [opened, { toggle }] = useDisclosure(false);
  const [modalOpend, { open, close }] = useDisclosure(false);
  const [scheduledMessages, setScheduledMessages] = useState<{
    created_at: string;
    executed_at: string | null;
    execution_date: string;
    fail_reason: string | null;
    id: number;
    meta_data: {
      args: {
        account_research_points: string | null;
        ai_generated: boolean;
        bf_description: string;
        bf_id: number;
        bf_length: string;
        bf_title: string;
        client_sdr_id: number;
        message: string;
        prospect_id: number;
        purgatory_date: string;
        send_sellscale_notification: boolean;
        to_purgatory: boolean;
      };
    };
    status: string;
    type: string;
  }[]>([]);
  const [hiddenUntil, setHiddenUntil] = useState<Date | null>(null);

  const userToken = useRecoilValue(userTokenState);

  const specialDays = [16, 20, 30];

  const renderIndicator = (date: Date) => {
    if (specialDays.includes(date.getDate())) {
      return (
        <Indicator inline size={10} offset={-5} position='bottom-center' color='red' withBorder>
          <div>{date.getDate()}</div>
        </Indicator>
      );
    }

    return null;
  };

  const fetchScheduledMessages = () => {
    getScheduledMessages(userToken, openedProspectId).then((res) => {
      console.log('setting to ', res.data.data);
      setScheduledMessages(res.data.data);
    });
  };

  const fetchHiddenUntil = () => {
    getHiddenUntil(userToken, openedProspectId).then((res) => {
      if (!res.data?.hidden_until) return;
      if (new Date(res.data.hidden_until) < new Date()) {
        return;
      }
      setHiddenUntil(new Date(res.data.hidden_until));
    });
  }

  useEffect(() => {
    fetchScheduledMessages();
    fetchHiddenUntil();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshScheduledMessages: fetchScheduledMessages
  }));

  const [value, setValue] = useState<Date | null>(null);
  return (
    <>
    {scheduledMessages.length || hiddenUntil ? (
      <>
        <Flex
          bg={'blue'}
          style={{ borderRadius: '6px', borderBottomRightRadius: `${opened ? '0' : '6px'}`, borderBottomLeftRadius: `${opened ? '0' : '6px'}` }}
          align={'center'}
          justify={'space-between'}
          p={'sm'}
          px={'lg'}
        >
          <Flex align={'center'} gap={'sm'}>
            <IconCalendarTime size={'1rem'} color='white' style={{ marginTop: '-1px' }} />
            <Text color='white'>
              {hiddenUntil 
                ? `Outbound scheduled to resume ${moment(hiddenUntil).utc().format('MMMM DD')}` 
                : `${scheduledMessages.length} Scheduled ${scheduledMessages.length > 1 ? 'Messages' : 'Message'}`}
            </Text>
          </Flex>
          {!hiddenUntil && <Button onClick={toggle} style={{ backgroundColor: 'rgba(231, 245, 255, .1)' }} color='white'>
            {opened ? 'Hide' : 'View'}
          </Button>}
        </Flex>
        <Collapse in={opened} style={{ backgroundColor: 'white' }}>
          <Flex direction={'column'} style={{ border: '1px solid #dee2e6', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }} p={'md'} gap={'sm'}>
            {scheduledMessages.map((message, index) => (
              <Flex key={message.id} direction={'column'} style={{ border: '1px solid #dee2e6', borderStyle: 'dashed', borderRadius: '6px', marginBottom: '10px' }} p={'lg'} bg={'#f7f8fa'}>
                <Flex align={'center'} justify={'space-between'}>
                  <Text color='gray' fw={600} size={'lg'}>
                    Message {index + 1}:
                  </Text>
                  <Flex gap={'sm'}>
                    {/* <Button radius={'xl'} leftIcon={<IconPencil size={'1rem'} />}>
                      Edit
                    </Button> */}
                    <Button 
                      color='red' 
                      radius={'xl'} 
                      variant='light' 
                      leftIcon={<IconTrash size={'1rem'} />} 
                      onClick={async () => {
                        setScheduledMessages(scheduledMessages.filter((msg) => msg.id !== message.id));
                        try {
                          const response = await fetch(`${API_URL}/voyager/delete_scheduled_message/${message.id}`, {
                            method: 'DELETE',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${userToken}`
                            }, 
                          });
                        } catch (error) {
                          console.error('Error:', error);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Flex>
                </Flex>
                <Text color='#464646' fw={500} size={'sm'} mt={'sm'}>
                  {message.meta_data.args.message}
                </Text>
                <Flex align={'center'} justify={'space-between'} mt={'sm'}>
                  <Text color='gray' size={'sm'} style={{ display: 'flex' }}>
                    Created:{' '}
                    <Text fw={600} ml={6}>
                      {moment(message.created_at).format('MMM DD, YYYY')}
                    </Text>
                  </Text>
                  <Flex align={'center'} gap={'sm'}>
                    <Text color='gray' size={'sm'} fw={500}>
                      Scheduled to Send:
                    </Text>
                    <Flex>
                      <Text size={'sm'} mr={'sm'} fw={600} color='gray'>
                        {moment(message.execution_date).subtract(1, 'days').format('MMM DD, YYYY')}
                      </Text>
                      <IconCalendar color='gray' size={'1.1rem'} onClick={open} style={{ cursor: 'pointer' }} />
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ))}
          </Flex>
          <Modal opened={modalOpend} onClose={close} withCloseButton={false} size={'380px'}>
            <DatePicker
              defaultDate={new Date(2021, 7)}
              firstDayOfWeek={0}
              value={value}
              onChange={(newValue) => setValue(newValue)}
              size='lg'
              renderDay={renderIndicator}
            />
            <Flex align={'center'} gap={'sm'} mt={'md'}>
              <TextInput readOnly size='md' value={value ? moment(value).format('MMM DD, YYYY') : ''} />
              <Button
                size='md'
                variant='default'
              >
                Today
              </Button>
            </Flex>
            <Divider mt={'md'} />
            <Flex gap={'sm'} align={'center'} justify={'space-between'} w={'100%'} mt={'md'}>
              <Button variant='default' fullWidth size='md' onClick={close}>
                Cancel
              </Button>
              <Button fullWidth size='md'>
                Schedule
              </Button>
            </Flex>
          </Modal>
        </Collapse>
      </>
    ) : (
      <></>
    )}
    </>
  );
}
);