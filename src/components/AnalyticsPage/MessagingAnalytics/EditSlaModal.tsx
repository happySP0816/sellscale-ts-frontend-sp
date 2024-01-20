import { Badge, Box, Button, Flex, Group, Input, Modal, ModalProps, RangeSlider, Text, TextInput, rem, useMantineTheme } from '@mantine/core';
import { IconInfoCircle, IconNotification } from '@tabler/icons';
import React, { FC, useState } from 'react';

const marks = [
  { value: 25, label: '25%' },
  { value: 75, label: '75%' },
];

interface EditSlaModalProps extends ModalProps {
  startValue: number;
  endValue: number;
  setStartValue: (value: number) => void;
  setEndValue: (value: number) => void;
  significance: number;
  setSignificance: (value: number) => void;
  lowHealth: number;
}

const EditSlaModal: FC<EditSlaModalProps> = (props) => {
  const theme = useMantineTheme();

  console.log(props.startValue, props.endValue);

  return (
    <Modal
      {...props}
      title='Edit SLAs'
      size={'lg'}
      styles={{
        title: {
          fontWeight: 700,
          fontSize: rem(32),
        },
      }}
    >
      <Box py={'md'}>
        <Text c={'gray.8'} size={'xl'} fw={600}>
          Set reply reate ranges
        </Text>

        <Text size={'sm'} color='gray.6' fw={600}>
          Adjust sliders to define what's low, medium and high
        </Text>

        <Box pos={'relative'}>
          <Box
            sx={{
              position: 'absolute',
              width: `${marks[0].value}%`,
              backgroundColor: theme.colors.red[theme.fn.primaryShade()],
              height: 8,
              top: 4,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: `${marks[1].value - marks[0].value}%`,
              backgroundColor: theme.colors.orange[theme.fn.primaryShade()],
              height: 8,
              top: 4,
              left: `${marks[0].value}%`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: `${100 - marks[1].value}%`,
              backgroundColor: theme.colors.green[theme.fn.primaryShade()],
              height: 8,
              top: 4,
              left: `${marks[1].value}%`,
            }}
          />
          <RangeSlider
            defaultValue={[props.startValue, props.endValue]}
            onChange={(value) => {
              props.setStartValue(value[0]);
              props.setEndValue(value[1]);
            }}
            marks={marks}
            my={'md'}
            thumbSize={20}
            styles={{
              bar: {
                backgroundColor: 'transparent',
              },
              track: {
                backgroundColor: 'transparent',
                '&:before': {
                  backgroundColor: 'transparent',
                },
              },
              mark: {
                backgroundColor: 'transparent',
              },

              markFilled: {
                border: 'none',
              },
              markLabel: {
                fontWeight: 700,
                marginTop: 12,
              },
            }}
          />
          <Flex mt={-3} justify={'space-between'} px={50}>
            <Text c={'gray.8'} tt='uppercase' size={'sm'} fw={600}>
              low
            </Text>
            <Text c={'gray.8'} tt='uppercase' size={'sm'}>
              medium
            </Text>
            <Text c={'gray.8'} tt='uppercase' size={'sm'}>
              high
            </Text>
          </Flex>
        </Box>
      </Box>

      <Flex bg={'#faf9fa'} style={{ border: '1px solid #efedf0', borderRadius: '10px' }} p={'sm'}>
        <Text display={'flex'} style={{ alignItems: 'center', gap: '4px' }} color='gray'>
          <IconInfoCircle size={'1.2rem'} />
          With current thresholds, you have <span className='text-[#ff2424] font-semibold'>{props.lowHealth} low health</span> reply rates.
        </Text>
      </Flex>
      <Box mt={'md'}>
        <Text c={'gray.8'} size={'xl'} fw={600}>
          Significance
        </Text>

        <Flex align={'center'} justify={'space-between'}>
          <Text size={'sm'} color='gray.6' fw={600} w={'100%'}>
            Values will show up as <Badge color='gray'>N/A</Badge> if sample size is less than:
          </Text>
          <Input
            defaultValue={props.significance}
            onChange={(e) => {
              props.setSignificance(parseInt(e.currentTarget.value));
            }}
            w={100}
            type='number'
          />
        </Flex>
      </Box>

      <Flex gap='md' mt='xl'>
        <Button variant='outline' w={'100%'} onClick={() => props.onClose()}>
          Go Back
        </Button>
        <Button w={'100%'} onClick={() => props.onClose()}>
          Save Changes
        </Button>
      </Flex>
    </Modal>
  );
};

export default EditSlaModal;
