import CustomSelect from '@common/persona/ICPFilter/CustomSelect';
import { Button, Flex, Text, Accordion, ActionIcon } from '@mantine/core';
import { closeAllModals } from '@mantine/modals';
import { IconCircleX, IconFilter } from '@tabler/icons';
import { useState } from 'react';

export default function SegmentEditPrefilterModal() {
  const [revenueData, setRevenueData] = useState(['Option One', 'Option two', 'Option three', 'Option Four', 'Option Five']);
  const [headcountData, setHeadCountData] = useState(['Option One', 'Option two', 'Option three', 'Option Four', 'Option Five']);
  return (
    <>
      <Text size={'sm'} color='gray' fw={500}>
        Configure the pre-filters below to fine-tune the segment contacts.
      </Text>
      <Accordion
        defaultValue='sorting'
        styles={{
          control: {
            padding: '0px',
          },
          content: {
            paddingInline: '0px',
          },
        }}
      >
        <Accordion.Item key={'job_title'} value={'job_title'}>
          <Accordion.Control>Job Title</Accordion.Control>
          <Accordion.Panel>{'Job Title'}</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item key={'headcount'} value={'headcount'}>
          <Accordion.Control>HeadCount</Accordion.Control>
          <Accordion.Panel>{'HeadCount'}</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item key={'sorting'} value={'sorting'}>
          <Accordion.Control>Advanced Sorting</Accordion.Control>
          <Accordion.Panel>
            <Flex gap={'sm'} direction={'column'}>
              <CustomSelect
                maxWidth='100%'
                value={revenueData}
                label='REVENUE RATE:'
                placeholder='Select options'
                setValue={setRevenueData}
                data={revenueData}
                setData={setRevenueData}
              />

              <CustomSelect
                maxWidth='100%'
                value={headcountData}
                label='HEADCOUNTS BY DEPARTMENT:'
                placeholder='Select options'
                setValue={setHeadCountData}
                data={headcountData}
                setData={setHeadCountData}
              />
            </Flex>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Flex gap={'md'} mt={50}>
        <Button fullWidth size='md' radius={'md'} variant='outline' color='gray' onClick={() => closeAllModals()}>
          Cancel
        </Button>
        <Button
          fullWidth
          size='md'
          radius={'md'}
          onClick={() => {
            alert('Clicked Update Pre-filters button');
            closeAllModals();
          }}
        >
          Update Pre-filters
        </Button>
      </Flex>
    </>
  );
}
