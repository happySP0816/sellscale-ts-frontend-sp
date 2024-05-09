import { currentProjectState } from '@atoms/personaAtoms';
import { userTokenState } from '@atoms/userAtoms';
import {
  Card,
  Stack,
  Group,
  ActionIcon,
  Badge,
  Divider,
  Box,
  Text,
  Tooltip,
  NumberInput,
  Flex,
  LoadingOverlay,
} from '@mantine/core';
import { useHover, useTimeout } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconMessages, IconTrash } from '@tabler/icons';
import { patchSequenceStep, postDeactivateAllSequenceSteps } from '@utils/requests/emailSequencing';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { EmailSequenceStep, MsgResponse } from 'src';

export default function EmailSequenceStepCard(props: {
  active: boolean;
  sequenceBucket?: {
    total: number;
    templates: EmailSequenceStep[];
  };
  title: string;
  templateTitle: string;
  content?: string;
  onClick?: () => void;
  includeFooter?: boolean;
  dataChannels?: MsgResponse | undefined;
  bumpedCount?: number;
  refetch?: () => void;
  deletable?: boolean;
  afterDelete?: () => void;
}) {
  const userToken = useRecoilValue(userTokenState);
  const { hovered, ref } = useHover();

  // const [defaultSequenceStep, setDefaultSequenceStep] = useState<EmailSequenceStep>();
  const [loading, setLoading] = useState<boolean>(false);
  const delayDaysRef = useRef(3);

  const currentProject = useRecoilValue(currentProjectState);

  const triggerPatchEmailDelayDays = async (step: EmailSequenceStep, delayDays: number) => {
    if (delayDays < 1 || !step) return;

    setLoading(true);

    const result = await patchSequenceStep(
      userToken,
      step.step.id,
      step.step.overall_status,
      step.step.title,
      step.step.template,
      step.step.bumped_count,
      true,
      delayDays
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      });
    } else {
      showNotification({
        title: 'Success',
        message: 'Email delay days updated',
        color: 'green',
      });
      if (props.afterDelete) {
        props.afterDelete();
      }
      if (props.refetch) {
        props.refetch();
      }
    }

    setLoading(false);
  };

  const triggerPostDeactivateAllSequenceSteps = async () => {
    setLoading(true);

    if (!props.sequenceBucket?.templates) return;

    // Get a random sequence step id to pass to the request
    const randomSequenceStepId = props.sequenceBucket?.templates[0].step.id;

    const result = await postDeactivateAllSequenceSteps(userToken, randomSequenceStepId);
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      });
    } else {
      showNotification({
        title: 'Success',
        message: 'All email steps deactivated',
        color: 'green',
      });
      if (props.refetch) {
        props.refetch();
      }
    }

    setLoading(false);
  };

  // useEffect(() => {
  //   // Get the default sequence step
  //   if (props.sequenceBucket?.templates) {
  //     const defaultSequenceStep = props.sequenceBucket?.templates.find((s) => s.step.active);
  //     setDefaultSequenceStep(defaultSequenceStep);
  //     delayDaysRef.current = defaultSequenceStep?.step.sequence_delay_days || 3;
  //   }
  // }, [props.sequenceBucket, props.active]);

  return (
    <Card
      ref={ref}
      p={0}
      radius='md'
      w={'100%'}
      withBorder
      onClick={() => {
        if (props.onClick) {
          props?.onClick();
        }
      }}
      sx={(theme) => ({
        cursor: 'pointer',
        backgroundColor: props.active
          ? theme.fn.lighten(
              theme.fn.variant({ variant: 'filled', color: 'blue' }).background!,
              0.95
            )
          : hovered
          ? theme.fn.lighten(
              theme.fn.variant({ variant: 'filled', color: 'blue' }).background!,
              0.99
            )
          : undefined,
        borderColor: props.active || hovered ? theme.colors.blue[5] + '!important' : undefined,
        borderWidth: '4px',
      })}
    >
      <LoadingOverlay visible={loading} />
      <Stack spacing={0}>
        <Group position='apart' px={15} py={10} noWrap>
          <Group spacing={0} noWrap w={'100%'} display='flex'>
            <ActionIcon
              variant='transparent'
              color='blue'
              sx={{
                cursor: 'default',
              }}
            >
              <IconMessages size='1.1rem' />
            </ActionIcon>
            <Text ml='xs' fw={800} sx={{ whiteSpace: 'nowrap' }} color='gray.6'>
              {props.title}
            </Text>
            {props.bumpedCount && (
              <Badge color='gray' size='sm' ml={'0.5rem'}>
                If no reply from prospect
              </Badge>
            )}

            {props.deletable && (
              <Tooltip
                label={
                  currentProject?.smartlead_campaign_id
                    ? 'Synced campaigns cannot remove steps'
                    : 'Remove this step'
                }
                withinPortal
                withArrow
              >
                <div>
                  <ActionIcon
                    disabled={currentProject?.smartlead_campaign_id ? true : false}
                    ml='auto'
                    color='gray.9'
                    size='sm'
                    onClick={triggerPostDeactivateAllSequenceSteps}
                  >
                    <IconTrash />
                  </ActionIcon>
                </div>
              </Tooltip>
            )}
          </Group>
        </Group>
        <Divider />
        <Box px={20} py={10}>
          <Text size={'sm'} fw={500} color='gray.5'>
            Active Variants
          </Text>
          {props.sequenceBucket?.templates
            .filter((t) => t.step.active)
            .map((template, index) => (
              <Text key={index} size='sm' color='gray.7'>
                • {template.step.title}
              </Text>
            ))}
          <Text size={'sm'} fw={500} color='gray.5'>
            {props.content}
          </Text>
        </Box>
        {props.includeFooter && (
          <>
            <Divider />
            <Box px={20} py={10}>
              <Flex align='center' justify={'center'}>
                <Text fz={14} fw={500}>
                  Wait for some days, then:
                </Text>
                {/* {defaultSequenceStep ? (
                  <NumberInput
                    mx='xs'
                    w='32px'
                    variant='filled'
                    hideControls
                    sx={{ border: 'solid 1px #777; border-radius: 4px;' }}
                    size='xs'
                    min={1}
                    defaultValue={delayDaysRef.current}
                    onChange={(e) => {
                      delayDaysRef.current = Number(e);
                      triggerPatchEmailDelayDays(Number(e));
                    }}
                  />
                ) : (
                  <Tooltip
                    label={'Please activate a template to set a wait time'}
                    withinPortal
                    withArrow
                  >
                    <div>
                      <NumberInput
                        mx='xs'
                        w='32px'
                        variant='filled'
                        hideControls
                        sx={{ border: 'solid 1px #777; border-radius: 4px;' }}
                        size='xs'
                        min={2}
                        max={99}
                        value={3}
                        disabled
                      />
                    </div>
                  </Tooltip>
                )} */}
              </Flex>
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
}
