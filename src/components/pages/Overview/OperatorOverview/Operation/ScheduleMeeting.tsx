import { useState } from 'react';
import { Box, Text, Flex, Badge, Button, Avatar, useMantineTheme, rem, Popover, createStyles, Radio, TextInput } from '@mantine/core';
import { IconBriefcase, IconBuildingSkyscraper, IconExternalLink, IconInfoCircle, IconTrash, IconUser, IconX } from '@tabler/icons';
import { useDisclosure } from '@mantine/hooks';

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colors.gray[6],
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRadius: theme.radius.md,
    height: 40,
    gap: rem(4),
    backgroundColor: theme.white,
    border: `solid 1px ${theme.colors.gray[4]}`,
    transition: 'box-shadow 150ms ease, transform 100ms ease',

    '&:hover': {
      boxShadow: `${theme.shadows.md} !important`,
      transform: 'scale(1.05)',
    },
  },
}));

const ScheduleMeeting = () => {
  const [opened, { open, close, toggle }] = useDisclosure(false);
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [notInterestedDisqualificationReason, setNotInterestedDisqualificationReason] = useState('');
  const [notQualifiedDisqualificationReason, setNotQualifiedDisqualificationReason] = useState('');

  return (
    <>
      <Box>
        <Flex
          w={'100%'}
          style={{
            borderRadius: '10px',
            border: '2px solid #e9ecef',
          }}
        >
          <Box
            px={15}
            py={12}
            style={{
              borderRight: '2px solid #e9ecef',
            }}
            w={'28rem'}
          >
            <Flex align={'center'} gap={10} mb={8}>
              <Avatar src={''} radius='xl' size={50} />
              <Box>
                <Flex align={'center'} gap={10}>
                  <Text fw={600} style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                    {'Donald Bryant'}
                    <IconExternalLink size={14} color='#228be6' />
                  </Text>
                </Flex>
                <Flex align={'center'} gap={10} w={'100%'} mt={3}>
                  <Badge
                    // color={
                    //   item.prospect_icp_fit_score == 'VERY HIGH'
                    //     ? 'green'
                    //     : item.prospect_icp_fit_score == 'HIGH'
                    //     ? 'blue'
                    //     : item.prospect_icp_fit_score == 'MEDIUM'
                    //     ? 'yellow'
                    //     : item.prospect_icp_fit_score == 'LOW'
                    //     ? 'orange'
                    //     : item.prospect_icp_fit_score == 'VERY LOW'
                    //     ? 'red'
                    //     : 'gray'
                    // }
                    color='blue'
                    fw={600}
                  >
                    {/* {item.prospect_icp_fit_score} */}
                    {'Very high'}
                  </Badge>
                </Flex>
              </Box>
            </Flex>
            <Flex gap={6}>
              <div className='mt-1'>
                <IconUser size={16} color='#817e7e' />
              </div>
              <Text color='#817e7e' mt={3} fw={'600'} size={14}>
                {'Senior Engineering Hiring'}
              </Text>
            </Flex>
            <Flex gap={6}>
              <div className='mt-1'>
                <IconBriefcase size={16} color='#817e7e' />
              </div>
              <Text color='#817e7e' mt={3} fw={'600'} size={14}>
                {'Field Chief Technology Officer'}
              </Text>
            </Flex>
            <Flex gap={6}>
              <div className='mt-1'>
                <IconBuildingSkyscraper size={16} color='#817e7e' />
              </div>
              <Text color='#817e7e' mt={3} fw={'600'} size={14}>
                {'CloudBees'}
              </Text>
            </Flex>
            <Flex gap={6} mt={'sm'}>
              <IconInfoCircle size={16} color='#817e7e' style={{ marginTop: '3px' }} />
              <Flex direction={'column'}>
                <Text size={14} fw={500}>
                  In scheduling for +3 days
                </Text>
                <Text color='#817e7e' size={12} fw={500}>
                  {'Since Jan 1, 2023'}
                </Text>
              </Flex>
            </Flex>
          </Box>
          <Flex p={20} w={'100%'} direction={'column'}>
            <Flex justify={'space-between'} align={'end'}>
              <Text color='#817e7e' fw={600} tt='uppercase'>
                Last Message:
              </Text>
              <Text color='#817e7e' size={'sm'} fw={500}>
                {'Today 01:05'}
              </Text>
            </Flex>
            <Box
              bg={'#edeaee'}
              p={20}
              px={26}
              mt={12}
              style={{
                borderRadius: '10px',
              }}
              h={'100%'}
            >
              <Text
                fw={600}
                style={{ fontStyle: 'italic' }}
                size={14}
                color='#747375'
              >{`Hi, I've been thinking about to using Cuboid software for a while. I just have a couple of question to see if it's the right fit for us. I could chat in a hour or so - would that work?`}</Text>
            </Box>
          </Flex>
        </Flex>
        <Flex mt={'md'} justify={'end'} gap={'md'} align={'center'}>
          <Text fw={600} color='gray' size={'sm'}>
            Mark As:
          </Text>
          <Popover width={430} position='bottom' arrowSize={12} withArrow shadow='md'>
            <Popover.Target>
              <Button variant='outlined' className={classes.item} leftIcon={<IconX color={theme.colors.red[6]} size={16} />}>
                Not Interested
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Flex direction={'column'} gap={'md'}>
                <Text size='sm' fw={600}>
                  Select reason for disinterest:
                </Text>
                <Radio.Group
                  withAsterisk
                  onChange={(value) => {
                    setNotInterestedDisqualificationReason(value);
                  }}
                  value={notInterestedDisqualificationReason}
                >
                  <Flex direction={'column'} gap={'sm'}>
                    <Radio value='No Need' label='No Need' size='xs' checked={notInterestedDisqualificationReason === 'No Need'} />
                    <Radio value='Unconvinced' label='Unconvinced' size='xs' checked={notInterestedDisqualificationReason === 'Unconvinced'} />
                    <Radio value='Timing not right' label='Timing not right' size='xs' checked={notInterestedDisqualificationReason === 'Timing not right'} />
                    <Radio value='Unresponsive' label='Unresponsive' size='xs' checked={notInterestedDisqualificationReason === 'Unresponsive'} />
                    <Radio value='Using a competitor' label='Using a competitor' size='xs' checked={notInterestedDisqualificationReason === 'Competitor'} />
                    <Radio value='Unsubscribe' label='Unsubscribe' size='xs' checked={notInterestedDisqualificationReason === 'Unsubscribe'} />
                    <Radio value='OTHER -' label='Other' size='xs' checked={notInterestedDisqualificationReason.includes('OTHER -')} />
                  </Flex>
                </Radio.Group>
                {notInterestedDisqualificationReason?.includes('OTHER') && (
                  <TextInput
                    placeholder='Enter reason here'
                    radius={'md'}
                    onChange={(event) => {
                      setNotInterestedDisqualificationReason('OTHER - ' + event.currentTarget.value);
                    }}
                  />
                )}

                <Button
                  color={notInterestedDisqualificationReason ? 'red' : 'gray'}
                  leftIcon={<IconTrash size={24} />}
                  radius={'md'}
                  //   onClick={async () => {
                  //     await changeStatus('NOT_INTERESTED', true, notInterestedDisqualificationReason);
                  //   }}
                >
                  Mark Not Interested
                </Button>
              </Flex>
            </Popover.Dropdown>
          </Popover>
          <Popover width={430} position='bottom' arrowSize={12} withArrow shadow='md'>
            <Popover.Target>
              <Button variant='outlined' className={classes.item} leftIcon={<IconTrash color={theme.colors.red[6]} size={16} />}>
                Not Qualified
              </Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Flex direction={'column'} gap={'md'}>
                <Text size='sm' fw={600}>
                  Select reason for disqualification:
                </Text>
                <Radio.Group
                  withAsterisk
                  onChange={(value) => {
                    setNotQualifiedDisqualificationReason(value);
                  }}
                  value={notQualifiedDisqualificationReason}
                >
                  <Flex direction={'column'} gap={'sm'}>
                    <Radio value='Not a decision maker.' label='Not a decision maker' size='xs' />
                    <Radio value='Poor account fit' label='Poor account fit' size='xs' />
                    <Radio value='Contact is "open to work"' label='Contact is "open to work"' size='xs' />
                    <Radio value='Competitor' label='Competitor' size='xs' />
                    <Radio value='OTHER -' label='Other' size='xs' checked />
                  </Flex>
                </Radio.Group>

                {notQualifiedDisqualificationReason?.includes('OTHER') && (
                  <TextInput
                    placeholder='Enter reason here'
                    radius={'md'}
                    onChange={(event) => {
                      setNotQualifiedDisqualificationReason('OTHER - ' + event.currentTarget.value);
                    }}
                  />
                )}

                <Button
                  color={notQualifiedDisqualificationReason ? 'red' : 'gray'}
                  leftIcon={<IconTrash size={24} />}
                  radius={'md'}
                  // onClick={async () => {
                  //   await changeStatus('NOT_QUALIFIED', true, notQualifiedDisqualificationReason);
                  // }}
                >
                  Disqualify
                </Button>
              </Flex>
            </Popover.Dropdown>
          </Popover>
          <Button onClick={toggle} rightIcon={<IconExternalLink size={'0.8rem'} />} size='sm' radius={'md'}>
            Open convo
          </Button>
        </Flex>
      </Box>
    </>
  );
};

export default ScheduleMeeting;
