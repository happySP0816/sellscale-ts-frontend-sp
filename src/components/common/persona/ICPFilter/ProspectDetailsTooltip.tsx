import { Avatar, Badge, Button, Divider, Flex, Popover, Select, Text, useMantineTheme } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconArrowRight, IconBrandLinkedin, IconBriefcase, IconBuildingCommunity, IconBuildingEstate, IconMail, IconUser } from '@tabler/icons';
import { IconBuildingArch, IconUserSquare } from '@tabler/icons-react';
import { formatToLabel, valueToColor } from '@utils/general';

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
  return (
    <Popover width={300} position='bottom' withArrow arrowOffset={5} arrowSize={12} styles={popoverStyles}>
      <Popover.Target>
        <IconUserSquare size={'0.8rem'} color='#228be6' />
      </Popover.Target>
      <Popover.Dropdown style={{ padding: '0px' }}>
        <Flex direction={'column'} p={'sm'} gap={'3px'}>
          <Flex gap={'sm'} align={'center'}>
            <Avatar size={'lg'} radius={'xl'} />
            <Flex direction={'column'}>
              <Text fw={600} size={'sm'}>
                Donald Bryant
              </Text>
              <Text color='gray'>
                ICP SCORE: {''}
                <Badge color='blue'>very high</Badge>
              </Text>
            </Flex>
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
                  {'SCHEDULING' || 'ACTIVE_CONVERSATION'}
                </Text>
              </Flex>
            }
            labelPosition='left'
            w={'100%'}
            my={'sm'}
            ml={'1px'}
          />
          <Text color='gray' display={'flex'} style={{ alignItems: 'center', gap: '5px' }} ml={'3px'}>
            <IconBriefcase size={'1rem'} />
            Field Chief Technology Officer
          </Text>
          <Text color='gray' display={'flex'} style={{ alignItems: 'center', gap: '5px' }} ml={'3px'}>
            <IconBuildingCommunity size={'1rem'} />
            CloudBees
          </Text>
          <Text color='gray' display={'flex'} style={{ alignItems: 'center', gap: '5px' }} ml={'3px'}>
            <IconUser size={'1rem'} />
            Senior Engineering Hiring
          </Text>
          <Text color='gray' display={'flex'} mt={'xs'} style={{ alignItems: 'center', gap: '3px' }}>
            <IconMail fill='gray' color='white' size={'1.3rem'} />
            donald@cloudbees.com
          </Text>
          <Text color='gray' display={'flex'} style={{ alignItems: 'center', gap: '3px' }}>
            <IconBrandLinkedin fill='gray' color='white' size={'1.3rem'} />
            linkedin.com/in/donaldb
          </Text>
        </Flex>

        <Button w={'100%'} rightIcon={<IconArrowRight size={'1rem'} />} style={{ borderTopLeftRadius: '0px', borderTopRightRadius: '0px' }}>
          View Details
        </Button>
      </Popover.Dropdown>
    </Popover>
  );
}
