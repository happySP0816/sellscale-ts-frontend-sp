import { Card, Group, Text, Button, Flex, ActionIcon, CopyButton, TextInput, Tooltip, Input, createStyles, rem } from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons';
import { IconCalendarShare } from '@tabler/icons-react';


const useStyles = createStyles((theme) => ({
  root: {
    position: 'relative',
  },

  input: {
    height: rem(54),
    paddingTop: rem(18),
  },

  label: {
    position: 'absolute',
    pointerEvents: 'none',
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: `calc(${theme.spacing.sm} / 2)`,
    zIndex: 1,
  },
}));

export default function ProspectDetailsCalendarLink(props: { calendarLink: string, width?: string }) {

  const { classes } = useStyles();

  return (
    <Group noWrap>
      <TextInput
        placeholder='Your calendar link'
        value={props.calendarLink}
        label='Your Calendar Link'
        size='xs'
        w={props.width || '100%'}
        readOnly
        classNames={classes}
        rightSection={
          <CopyButton value={props.calendarLink} timeout={2000}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position='right'>
                <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
                  {copied ? <IconCheck size='1rem' /> : <IconCopy size='1rem' />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        }
        styles={{
          input: {
            filter: 'opacity(60%)',
            height: rem(42)+'!important',
          }
        }}
      />
    </Group>
  );
}
