import CustomSelect from '@common/persona/ICPFilter/CustomSelect';
import { Badge, Button, Flex, NumberInput, Text, TextInput } from '@mantine/core';
import { closeAllModals } from '@mantine/modals';
import { useState } from 'react';

export default function WebsiteIntentSplitModal() {
  const industries = ['Computer', 'Internet', 'Climate Tech', 'IT', 'Defense', 'Health', 'Wellness', 'Software Education'];
  const [location, setLocation] = useState(['California']);
  const [visit, setVisit] = useState(['Pricing']);
  return (
    <Flex direction={'column'} gap={'md'}>
      <Text color='gray' fw={500}>
        Set filters to automatically segment your web traffic into smaller, more targeted groups.
      </Text>
      <TextInput label='Split Name' placeholder='Enter name of website intent split' />
      <Flex direction={'column'} gap={1}>
        <Text size={'sm'} fw={500}>
          Company Size:
        </Text>
        <Flex gap={'xl'} align={'center'}>
          <Flex gap={'sm'} align={'center'}>
            <Text size={'sm'} color='gray' fw={400}>
              Minimum:
            </Text>
            <NumberInput maw={150} placeholder='Min.Size' />
          </Flex>
          <Flex gap={'sm'} align={'center'}>
            <Text size={'sm'} color='gray' fw={400}>
              Maximum:
            </Text>
            <NumberInput maw={150} placeholder='Max.Size' />
          </Flex>
        </Flex>
      </Flex>
      <Flex direction={'column'} gap={1}>
        <Text size={'sm'} fw={500}>
          Industry:
        </Text>
        <Flex gap={'xs'} wrap={'wrap'}>
          {industries.map((item, index) => {
            return (
              <Flex key={index}>
                <Badge variant='outline' size='lg'>
                  {item}
                </Badge>
              </Flex>
            );
          })}
        </Flex>
      </Flex>
      <CustomSelect
        maxWidth='100%'
        value={location}
        label='Location:'
        placeholder='Enter location'
        setValue={setLocation}
        data={location}
        setData={setLocation}
      />
      <CustomSelect maxWidth='100%' value={visit} label='Page Visited:' placeholder='Enter Page' setValue={setVisit} data={visit} setData={setVisit} />
      <Flex gap={'lg'} mt={20}>
        <Button fullWidth variant='outline' color='gray' size='md' radius='md' onClick={() => closeAllModals()}>
          Go Back
        </Button>
        <Button fullWidth size='md' radius='md'>
          Create Split
        </Button>
      </Flex>
    </Flex>
  );
}
