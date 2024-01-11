import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Loader,
  Popover,
  Select,
  Stack,
  Text,
  TypographyStylesProvider,
  useMantineTheme,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconArrowRight, IconBrandLinkedin, IconBriefcase, IconBuildingCommunity, IconBuildingEstate, IconMail, IconUser, IconX } from '@tabler/icons';
import { IconBuildingArch, IconUserSquare } from '@tabler/icons-react';
import { formatToLabel, valueToColor } from '@utils/general';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

type ProspectDetailsTooltipPropsType = {
  prospectId?: number;
};

const popoverStyles = {
  arrow: {
    backgroundColor: '#228be6',
  },
};

export default function ProspectDetailsTooltip(props: ProspectDetailsTooltipPropsType) {
  const theme = useMantineTheme();
  const id = props.prospectId;
  const userToken = useRecoilValue(userTokenState);

  const [isLoading, setIsLoading] = useState(false);
  const [prospectData, setProspectData] = useState({} as any);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const togglePopover = () => {
    if (!isPopoverOpen) {
      console.log(`Popover opened for prospect ID: ${id}`);
      fetchProspectDetails();
    }
    setIsPopoverOpen(!isPopoverOpen);
  };

  const fetchProspectDetails = async () => {
    setIsLoading(true);
    const response = await fetch(`${API_URL}/prospect/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();
    console.log(data?.prospect_info);
    setProspectData(data?.prospect_info);
    setIsLoading(false);
  };
  console.log('11111111111111111', prospectData);
  return (
    <Popover
      width={380}
      position='bottom'
      withArrow
      arrowOffset={5}
      arrowSize={12}
      styles={popoverStyles}
      withinPortal
      opened={isPopoverOpen}
      onOpen={() => setIsPopoverOpen(true)}
      onClose={() => setIsPopoverOpen(false)}
    >
      <Popover.Target>
        <ActionIcon onClick={togglePopover}>
          <IconUserSquare size={'0.8rem'} color='#228be6' />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown style={{ padding: '0px' }}>
        {!isLoading && (
          <>
            <Flex direction={'column'} p={'md'} px={'xl'} gap={'5px'}>
              <Flex justify={'space-between'} align={'center'}>
                <Flex gap={'sm'} align={'center'}>
                  <Avatar size={'lg'} radius={'xl'} src={prospectData?.data?.img_url} />
                  <Flex direction={'column'}>
                    <Text fw={600} size={'sm'}>
                      {prospectData?.details?.full_name}
                    </Text>
                    <Text color='gray'>
                      ICP SCORE: {''}
                      <Badge
                        color={
                          prospectData?.details?.icp_fit_score == 4
                            ? 'green'
                            : prospectData?.details?.icp_fit_score == 3
                            ? 'blue'
                            : prospectData?.details?.icp_fit_score == 2
                            ? 'yellow'
                            : prospectData?.details?.icp_fit_score == 1
                            ? 'orange'
                            : prospectData?.details?.icp_fit_score == 0
                            ? 'red'
                            : 'gray'
                        }
                      >
                        {prospectData?.details?.icp_fit_score == 4
                          ? 'Very High'
                          : prospectData?.details?.icp_fit_score == 3
                          ? 'High'
                          : prospectData?.details?.icp_fit_score == 2
                          ? 'Medium'
                          : prospectData?.details?.icp_fit_score == 1
                          ? 'Low'
                          : prospectData?.details?.icp_fit_score == 0
                          ? 'Very Low'
                          : 'Unknown'}
                      </Badge>
                    </Text>
                  </Flex>
                </Flex>
                <IconX size={'1.3rem'} color='gray' style={{ cursor: 'pointer' }} onClick={() => setIsPopoverOpen(false)} />
              </Flex>
              <Divider
                label={
                  <Flex align={'center'} gap={4}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        background: valueToColor(theme, 'SCHEDULING' || 'ACTIVE_CONVO'),
                        borderRadius: '100%',
                      }}
                    ></div>
                    <Text color='gray' fw={600}>
                      {prospectData?.details?.overall_status.replaceAll('_', ' ')}
                    </Text>
                  </Flex>
                }
                labelPosition='left'
                w={'100%'}
                my={'sm'}
                ml={'1px'}
              />
              <Flex gap={'5px'}>
                <IconBriefcase size={'1.1rem'} color='gray' />
                <Text color='gray' fz='sm'>
                  {prospectData?.details?.title}
                </Text>
              </Flex>
              <Flex gap={'5px'}>
                <IconBuildingCommunity size={'1.1rem'} color='gray' />
                <Text color='gray' fz='sm'>
                  {prospectData?.details?.company}
                </Text>
              </Flex>
              <Flex gap={'5px'}>
                <IconUser size={'1.1rem'} color='gray' style={{ marginTop: '2px' }} />
                <Text color='gray' fz='sm'>
                  {prospectData?.data?.archetype_name}
                  <Flex gap={'5px'}>
                    <Text color='lightgray'>Segment:</Text>
                    <Text>{'Prospect Segement Data'}</Text>
                  </Flex>
                </Text>
              </Flex>
              <Flex gap={'5px'}>
                <IconMail fill='gray' color='white' size={'1.3rem'} />
                <Text color='gray' fz='sm'>
                  {prospectData?.data?.email}
                </Text>
              </Flex>
              <Flex gap={'5px'}>
                <IconBrandLinkedin fill='gray' color='white' size={'1.3rem'} />
                <Text color='gray' fz='sm' onClick={() => window.open('https://' + prospectData?.data?.linkedin_url, '_blank')}>
                  {prospectData?.data?.linkedin_url}
                </Text>
              </Flex>
              <Divider
                label={
                  <Flex align={'center'} gap={4}>
                    <Text color='gray' fw={600} size={'md'} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      LAST MESSAGE <IconBrandLinkedin fill='#228be6' color='white' />
                    </Text>
                  </Flex>
                }
                labelPosition='left'
                w={'100%'}
                my={'sm'}
              />
              <Stack bg={'#f4f9ff'} p={'sm'}>
                <Text lineClamp={4} component='div' fs={'italic'} size={'sm'}>
                  <TypographyStylesProvider>
                    <p style={{ margin: '0px' }}> {'Prospect Linkedin Last Message Data'}</p>
                  </TypographyStylesProvider>
                </Text>
              </Stack>
            </Flex>

            <Button
              w={'100%'}
              rightIcon={<IconArrowRight size={'1rem'} />}
              style={{ borderTopLeftRadius: '0px', borderTopRightRadius: '0px' }}
              onClick={() => {
                window.open(`/prospects/${id}`, '_blank');
              }}
            >
              View Details
            </Button>
          </>
        )}
        {isLoading && (
          <Card sx={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader />
          </Card>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
