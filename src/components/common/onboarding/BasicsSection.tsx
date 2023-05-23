import { Tooltip, Text, Center, TextInput, Stack } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons';

export default function BasicsSection(props: { fullName: string, setFullName: (fullName: string) => void, publicTitle: string, setPublicTitle: (publicTitle: string) => void }) {
  const rightSection = (label: string) => (
    <Tooltip
      label={label}
      position='top-end'
      withArrow
      transitionProps={{ transition: 'pop-bottom-right' }}
    >
      <Text color='dimmed' sx={{ cursor: 'help' }}>
        <Center>
          <IconInfoCircle size='1.1rem' stroke={1.5} />
        </Center>
      </Text>
    </Tooltip>
  );

  return (
    <Center>
      <Stack style={{ width: 350 }}>
        <TextInput
          rightSection={rightSection('Full name that is used in message generation')}
          label='Your Full Name'
          placeholder='John Doe'
          value={props.fullName}
          onChange={(event) => props.setFullName(event.currentTarget.value)}
          styles={(theme) => ({
            input: { borderColor: theme.colors.blue[theme.fn.primaryShade()] },
          })}
        />
        <TextInput
          rightSection={rightSection('Your public-facing professional title')}
          label='Your Public Title'
          placeholder='Enterprise Account Executive'
          value={props.publicTitle}
          onChange={(event) => props.setPublicTitle(event.currentTarget.value)}
          styles={(theme) => ({
            input: { borderColor: theme.colors.blue[theme.fn.primaryShade()] },
          })}
        />
      </Stack>
    </Center>
  );
}
