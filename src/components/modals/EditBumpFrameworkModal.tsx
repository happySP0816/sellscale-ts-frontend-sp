import { userTokenState } from '@atoms/userAtoms';
import { prospectStatuses } from '@common/inbox/utils';
import TextWithNewline from '@common/library/TextWithNewlines';
import { PersonalizationSection } from '@common/sequence/LinkedInSequenceSection';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  HoverCard,
  LoadingOverlay,
  NumberInput,
  Paper,
  Select,
  Slider,
  Switch,
  Text,
  TextInput,
  Textarea,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { patchBumpFramework } from '@utils/requests/patchBumpFramework';
import { postBumpDeactivate } from '@utils/requests/postBumpDeactivate';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

const bumpFrameworkLengthMarks = [
  { value: 0, label: 'Short', api_label: 'SHORT' },
  { value: 50, label: 'Medium', api_label: 'MEDIUM' },
  { value: 100, label: 'Long', api_label: 'LONG' },
];

interface EditBumpFramework extends Record<string, unknown> {
  bumpFrameworkID: number;
  overallStatus: string; // Note that this is used as an identifier
  title: string;
  description: string;
  bumpLength: string;
  default: boolean;
  onSave: () => void;
  bumpedCount?: number;
  useAccountResearch: boolean;
  bumpDelayDays: number;
  transformerBlocklist?: string[];
}

export default function EditBumpFrameworkModal({ context, id, innerProps }: ContextModalProps<EditBumpFramework>) {
  const theme = useMantineTheme();

  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);
  const [bumpLengthValue, setBumpLengthValue] = useState(50);

  const form = useForm({
    initialValues: {
      title: innerProps.title,
      description: innerProps.description,
      bumpedCount: innerProps.bumpedCount ?? null,
      bumpDelayDays: innerProps.bumpDelayDays,
      default: innerProps.default,
      useAccountResearch: innerProps.useAccountResearch,
      transformerBlocklist: innerProps.transformerBlocklist,
    },
  });

  const triggerPostBumpDeactivate = async () => {
    setLoading(true);

    const result = await postBumpDeactivate(userToken, innerProps.bumpFrameworkID);
    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Bump Framework deactivated successfully',
        color: theme.colors.green[7],
      });
      setLoading(false);
      context.closeModal(id);
      alert('Bump Framework deactivated successfully');
      innerProps.onSave();
    } else {
      showNotification({
        title: 'Error',
        message: result.message,
        color: theme.colors.red[7],
      });
    }

    setLoading(false);
  };

  const triggerEditBumpFramework = async () => {
    setLoading(true);

    const result = await patchBumpFramework(
      userToken,
      innerProps.bumpFrameworkID,
      innerProps.overallStatus,
      form.values.title,
      form.values.description,
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label as string,
      form.values.bumpedCount,
      form.values.bumpDelayDays,
      form.values.default,
      form.values.useAccountResearch
    );

    if (result.status === 'success') {
      showNotification({
        title: 'Success',
        message: 'Bump Framework updated successfully',
        color: theme.colors.green[7],
      });
      setLoading(false);
      innerProps.onSave();
      context.closeModal(id);
    } else {
      showNotification({
        title: 'Error',
        message: result.message,
        color: theme.colors.red[7],
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    let length = bumpFrameworkLengthMarks.find((marks) => marks.api_label === innerProps.bumpLength)?.value;
    if (length == null) {
      length = 50;
    }

    setBumpLengthValue(length);
  }, []);
  return (
    <Paper
      p={0}
      style={{
        position: 'relative',
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        minHeight: 400,
      }}
    >
      <LoadingOverlay visible={loading} />
      <Flex w='100%' justify={'space-between'} gap={'xl'}>
        <Flex w={'100%'} direction='column' gap={'xl'}>
          <Flex w='100%' justify={'space-between'} gap={'xl'}>
            <Flex direction='column' w='100%'>
              <Text color='gray' fw={600}>
                REPLY FRAMEWORK TITLE:
              </Text>
              <TextInput description=' ' placeholder='reply framework' {...form.getInputProps('title')} w={'100%'} size='md' />
            </Flex>
            <Flex direction='column' w='100%'>
              <Text color='gray' fw={600}>
                SUB-STATUS
              </Text>
              <Select 
                description=' ' 
                placeholder='Pick value' 
                data={prospectStatuses} 
                w={'100%'} 
                size='md'
                {...form.getInputProps('subStatus')}
              />
            </Flex>

            <Checkbox 
              label='Default Framework' 
              checked={form.values.default}
              {...form.getInputProps('default')}
            />
          </Flex>
          <Flex direction='column'>
            <Text color='gray' fw={600}>
              PROMPT INSTRUCTION
            </Text>
            <Textarea
              size='md'
              description=' '
              placeholder='These are instructions the AI will read to craft a personalized message.'
              minRows={6}
              {...form.getInputProps('description')}
            />
          </Flex>
          <Flex direction={'column'} style={{ border: '1px solid #ced4da', borderRadius: '8px' }}>
            <label>
              <Flex align={'center'} px='md' py={'8px'} justify={'space-between'}>
                <Text color='gray' fw={600}>
                  USE ACCOUNT RESEARCH:
                </Text>
                <Switch
                  checked={form.values.useAccountResearch}
                  onChange={(e) => {
                    form.setFieldValue('useAccountResearch', e.currentTarget.checked);
                  }}
                />
              </Flex>
            </label>
            <Divider />
            {form.values.useAccountResearch && (
              <PersonalizationSection
                blocklist={form.values.transformerBlocklist ?? []}
                onItemsChange={async (items) => {
                  // Update transformer blocklist
                  const result = await patchBumpFramework(
                    userToken,
                    innerProps.bumpFrameworkID,
                    innerProps.overallStatus,
                    form.values.title,
                    form.values.description,
                    bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label as string,
                    form.values.bumpedCount,
                    form.values.bumpDelayDays,
                    form.values.default,
                    form.values.useAccountResearch,
                    items.filter((x) => !x.checked).map((x) => x.id)
                  );
                }}
              />
            )}
          </Flex>
        </Flex>
      </Flex>

      {/* <Textarea
        mt='md'
        label='Prompt Instructions'
        placeholder={'These are instructions the AI will read to craft a personalized message'}
        {...form.getInputProps('description')}
        minRows={3}
        autosize
      />
      <Text fz='sm' mt='md'>
        Bump Length
      </Text>
      <HoverCard width={280} shadow='md'>
        <HoverCard.Target>
          <Flex w='100%' align='center' justify='center'>
            <Slider
              label={null}
              step={50}
              marks={bumpFrameworkLengthMarks}
              mb='xl'
              p='md'
              w='90%'
              value={bumpLengthValue}
              onChange={(value) => {
                setBumpLengthValue(value);
              }}
            />
          </Flex>
        </HoverCard.Target>
        <HoverCard.Dropdown style={{ backgroundColor: 'rgb(34, 37, 41)', padding: 0 }}>
          <Paper style={{ backgroundColor: 'rgb(34, 37, 41)', color: 'white', padding: 10 }}>
            <TextWithNewline breakheight='10px'>
              {'Control how long you want the generated bump to be:\n\nShort: 1-2 sentences\nMedium: 3-4 sentences\nLong: 2 paragraphs'}
            </TextWithNewline>
          </Paper>
        </HoverCard.Dropdown>
      </HoverCard>
      {form.values.bumpedCount != null && form.values.bumpedCount > 0 ? (
        <NumberInput
          label='Bump Number'
          description='The position in the bump sequence.'
          placeholder='1'
          value={(form.values.bumpedCount + 1) as number}
          onChange={(e) => {
            form.setFieldValue('bumpedCount', (e as number) - 1);
          }}
          min={2}
          max={4}
        />
      ) : (
        <></>
      )}
      {(innerProps.overallStatus == 'ACCEPTED' || innerProps.overallStatus == 'BUMPED') && (
        <NumberInput
          label='Bump Delay Days'
          description='The number of days to wait before bumping.'
          placeholder='1'
          value={form.values.bumpDelayDays as number}
          onChange={(e) => {
            form.setFieldValue('bumpDelayDays', e as number);
          }}
          min={2}
        />
      )} */}

      <Flex>
        <Flex justify='space-between' w='100%' gap={'lg'}>
          <Flex w={'50%'}>
            <Button
              mt='md'
              color='red'
              onClick={() => {
                triggerPostBumpDeactivate();
              }}
              w={'100%'}
              size='lg'
            >
              Deactivate
            </Button>
          </Flex>
          <Flex w={'50%'}>
            {innerProps.title == form.values.title.trim() &&
            innerProps.description == form.values.description.trim() &&
            innerProps.default == form.values.default &&
            innerProps.bumpLength == bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)?.api_label &&
            innerProps.bumpedCount == form.values.bumpedCount &&
            innerProps.bumpDelayDays == form.values.bumpDelayDays &&
            innerProps.useAccountResearch == form.values.useAccountResearch ? (
              <></>
            ) : (
              <Button
                mt='md'
                onClick={() => {
                  triggerEditBumpFramework();
                }}
                w={'100%'}
                size='lg'
              >
                Save
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Paper>
  );
}
