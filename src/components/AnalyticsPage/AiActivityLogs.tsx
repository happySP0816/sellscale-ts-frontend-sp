import { userTokenState } from '@atoms/userAtoms';
import {
  Avatar,
  Badge,
  Box,
  Checkbox,
  Divider,
  Flex,
  Text,
  Timeline,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { valueToColor } from '@utils/general';
import { getActivityLogs } from '@utils/requests/activityLogs';
import _ from 'lodash';
import { useRecoilValue } from 'recoil';
import { ActivityLog } from 'src';

const AiActivityLogs = () => {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);

  const {
    data: dataRaw,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [`ai-activity-logs`],
    queryFn: async () => {
      const response = await getActivityLogs(userToken);
      return response.status === 'success' ? (response.data as ActivityLog[]) : null;
    },
    enabled: true,
  });

  // Grouping data by the same date
  const groupedByDay = _.groupBy(dataRaw, (item) => {
    const date = new Date(item.created_at);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  });

  // Mapping to desired structure
  const data = _.map(groupedByDay, (log, noti_date) => ({
    noti_date,
    log: log.map((item) => ({
      emoji: '😎',
      noti_title: item.type,
      noti_sub: item.name,
      noti_subtitle: item.description,
      noti_username: item.sdr_name,
      user_pic: '',
      user_name: item.sdr_name,
      noti_time: new Date(item.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    })),
  }));

  // const data = [
  //   {
  //     noti_date: 'July 23, 2024',
  //     log: [
  //       {
  //         emoji: '😎',
  //         noti_title: 'Pipeline Notification',
  //         noti_sub: 'New Acceptance',
  //         noti_subtitle: `VP of Engg. @ Carta accepted your Linkedin invite`,
  //         noti_username: 'Jordan Smith',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //       {
  //         emoji: '💖',
  //         noti_title: 'Pipeline Notification',
  //         noti_sub: 'New Reply',
  //         noti_subtitle: `VP of Engg. @ Carta accepted your Linkedin invite`,
  //         noti_username: 'Jordan Smith',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //       {
  //         emoji: '✌',
  //         noti_title: 'AI Adjustment',
  //         noti_sub: 'New Framework Enabled',
  //         noti_subtitle: `Enabled 'Casual Sequence' for 'VP of Eng' Campaign`,
  //         noti_username: '',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //       {
  //         emoji: '😎',
  //         noti_title: 'In Anton Data',
  //         noti_sub: 'New Acceptance',
  //         noti_subtitle: `VP of Engg. @ Carta accepted your Linkedin invite`,
  //         noti_username: 'Jordan Smith',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //       {
  //         emoji: '💖',
  //         noti_title: 'Pipeline Notification',
  //         noti_sub: 'New Reply',
  //         noti_subtitle: `VP of Engg. @ Carta accepted your Linkedin invite`,
  //         noti_username: 'Jordan Smith',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //       {
  //         emoji: '✌',
  //         noti_title: 'AI Adjustment',
  //         noti_sub: 'New Framework Enabled',
  //         noti_subtitle: `Enabled 'Casual Sequence' for 'VP of Eng' Campaign`,
  //         noti_username: '',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //     ],
  //   },
  //   {
  //     noti_date: 'July 22, 2024',
  //     log: [
  //       {
  //         emoji: '😉',
  //         noti_title: 'AI Adjustment',
  //         noti_sub: '405+ new prospects uploaded',
  //         noti_subtitle: `New prospects uploaded to the 'EMEA Region Campaign'`,
  //         noti_username: '',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //       {
  //         emoji: '😉',
  //         noti_title: 'AI Adjustment',
  //         noti_sub: '405+ new prospects uploaded',
  //         noti_subtitle: `New prospects uploaded to the 'EMEA Region Campaign'`,
  //         noti_username: '',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //       {
  //         emoji: '😉',
  //         noti_title: 'AI Adjustment',
  //         noti_sub: '405+ new prospects uploaded',
  //         noti_subtitle: `New prospects uploaded to the 'EMEA Region Campaign'`,
  //         noti_username: '',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //       {
  //         emoji: '🤼',
  //         noti_title: 'Pipeline Notification',
  //         noti_sub: 'New Trigger Run',
  //         noti_subtitle: `Fetched 15+ new contacts from 2+ new campaigns`,
  //         noti_username: 'Security Leaks',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //       {
  //         emoji: '✌',
  //         noti_title: 'Pipeline Notification',
  //         noti_sub: 'New Framework Enabled',
  //         noti_subtitle: `Enabled 'Casual Sequence' for 'VP of Eng' Campaign`,
  //         noti_username: '',
  //         user_pic: '',
  //         user_name: 'Adam Meehan',
  //         noti_time: '10:03 PM',
  //       },
  //     ],
  //   },
  // ];
  return (
    <>
      <Box bg={'white'} p={'lg'}>
        <Flex gap={'md'} mb={'sm'} align={'center'}>
          <Flex>
            <Text className='w-max' fw={600} size={24}>
              AI Activity Logs
            </Text>
          </Flex>
          <Divider
            my='xs'
            w={'100%'}
            label={
              <Flex
                gap={'sm'}
                align={'center'}
                style={{ border: '1px solid #ced4da', borderRadius: '24px' }}
                px={40}
                py={'xs'}
              >
                <Text>Show:</Text>
                <Checkbox defaultChecked label='Pipeline Notifications' />
                <Divider orientation='vertical' />
                <Checkbox defaultChecked label='AI Activity' />
                <Divider orientation='vertical' />
                <Checkbox defaultChecked label='View Company Activity' />
              </Flex>
            }
            labelPosition='right'
          />
        </Flex>
        {data.map((item, index) => {
          return (
            <div key={index}>
              <Text fw={600} color='gray'>
                {item.noti_date}
              </Text>
              <Flex direction={'column'} justify={'center'}>
                <Divider orientation='vertical' h={'20px'} w={'1px'} ml={'20px'} variant='dashed' />
                <Timeline ml={'4px'} lineWidth={1} bulletSize={34}>
                  {item?.log.map((subitem, subindex) => {
                    return (
                      <Timeline.Item
                        key={subindex}
                        bullet={subitem?.emoji}
                        lineVariant='dashed'
                        title={
                          <Flex gap={'sm'} align={'center'} pt={5}>
                            <div>
                              <Badge
                                variant='outline'
                                size='lg'
                                color={valueToColor(theme, subitem.noti_title)}
                              >
                                {subitem.noti_title}
                              </Badge>
                            </div>
                            <Flex gap={'3px'} align={'center'}>
                              <Text className='w-max' fw={500}>
                                {subitem?.noti_username
                                  ? subitem?.noti_sub + ':'
                                  : subitem?.noti_sub}
                              </Text>
                              <Text className='w-max' fw={600}>
                                {subitem?.noti_username}
                              </Text>
                            </Flex>
                            <Divider w={'100%'} />
                            <Flex gap={7} align={'center'}>
                              <Avatar src={subitem?.user_pic} size={'sm'} radius={'xl'} />
                              <Text size={'sm'} className='w-max'>
                                {subitem?.user_name}
                              </Text>
                              <Text size={'sm'} className='w-max' color='gray'>
                                {subitem?.noti_time}
                              </Text>
                            </Flex>
                          </Flex>
                        }
                      >
                        <Text color='gray' size={'sm'}>
                          {subitem?.noti_subtitle}
                        </Text>
                      </Timeline.Item>
                    );
                  })}
                </Timeline>
                {data.length !== index + 1 && (
                  <Divider
                    orientation='vertical'
                    h={'40px'}
                    mt={'-md'}
                    w={'1px'}
                    ml={'20px'}
                    variant='dashed'
                  />
                )}
              </Flex>
            </div>
          );
        })}
      </Box>
    </>
  );
};

export default AiActivityLogs;
