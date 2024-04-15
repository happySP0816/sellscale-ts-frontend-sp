import { Button, Card, Divider, Flex, Paper, Select, Text } from '@mantine/core';
import { IconArrowsExchange } from '@tabler/icons';
import { useState } from 'react';

export default function StageMapping() {
  const [stage, setStage] = useState(['Prospected', 'Sent Outreach', 'Active Convo', 'Demo Set']);
  return (
    <Paper withBorder m='xs' p='lg' radius='md' bg={'#fcfcfd'}>
      <Flex align={'center'} justify={'space-between'}>
        <Flex direction={'column'} mb={'md'}>
          <Text fw={600} size={20}>
            Stage Mapping
          </Text>
          <Text color='gray' size={'sm'}>
            Last updated: 04/11/2024 14:52 PM
          </Text>
        </Flex>
        <Button variant='outline'>Save</Button>
      </Flex>
      <Divider />
      <Flex direction={'column'} gap={'sm'} mt={'md'}>
        {stage.map((item, index) => {
          return (
            <Flex gap={'sm'} align={'center'}>
              <Select w={'100%'} label={index === 0 && <Text color='gray'>SellScale Stage</Text>} placeholder='Pick value' data={stage} />
              <Flex>
                <IconArrowsExchange color='gray' style={{ marginTop: `${index === 0 ? '26px' : '0px'}` }} />
              </Flex>
              <Select w={'100%'} label={index === 0 && <Text color='gray'>CRM Stage</Text>} placeholder='Pick value' data={stage} />
            </Flex>
          );
        })}
      </Flex>
    </Paper>
  );
}
