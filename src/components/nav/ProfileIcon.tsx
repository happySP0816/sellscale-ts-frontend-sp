import { userDataState } from '@atoms/userAtoms';
import CreditsCard from '@common/credits/CreditsCard';
import {
  Avatar,
  Text,
  Flex,
  Center,
  Popover,
  Container,
  useMantineTheme,
  UnstyledButton,
  Group,
  createStyles,
  Badge,
  rem,
  Stack,
  ActionIcon,
} from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconCheck, IconX } from '@tabler/icons';
import { nameToInitials, valueToColor } from '@utils/general';
import { useRecoilValue } from 'recoil';

const useStyles = createStyles((theme) => ({
  user: {
    display: 'block',
    width: '100%',
    padding: theme.spacing.md,
    color: theme.colors.dark[0],
    borderRadius: theme.radius.sm,

    '&:hover': {
      backgroundColor: theme.fn.lighten(theme.fn.variant({ variant: 'filled', color: 'dark' }).background!, 0.1),
    },
  },
}));

export default function ProfileIcon({ name, email, imgUrl }: { name: string; email: string; imgUrl: string }) {
  const { hovered, ref } = useHover();
  const theme = useMantineTheme();

  return (
    <Popover width={200} position='right' withArrow shadow='md' opened={hovered}>
      <Popover.Target>
        <Center ref={ref} py='md' className='cursor-pointer'>
          <Avatar src={imgUrl} alt={`${name}'s Profile Picture`} color={valueToColor(theme, name)} radius='xl'>
            {nameToInitials(name)}
          </Avatar>
        </Center>
      </Popover.Target>
      <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
        <Container className='truncate p-0'>
          <Text size='sm' fw={700}>
            {name}
          </Text>
          <Text size='sm' c='dimmed'>
            {email}
          </Text>
        </Container>
      </Popover.Dropdown>
    </Popover>
  );
}


function ChannelBadge(props: { channel: string, isConnected: boolean }) {
  return (
    <Badge
      size='xs'
      variant='outline'
      color={props.isConnected ? 'blue' : 'red'}
      leftSection={
        <ActionIcon size="xs" color={props.isConnected ? 'blue' : 'red'} radius="xl" variant="transparent">
          {props.isConnected ? <IconCheck size={rem(10)} /> : <IconX size={rem(10)} />}
        </ActionIcon>
      }
    >
      {props.channel}
    </Badge>
  );
}

export function ProfileCard() {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const userData = useRecoilValue(userDataState);

  return (
    <Popover width={300} position='top' withArrow shadow='md'>
      <Popover.Target>
        <UnstyledButton className={classes.user}>
          <Group>
            <Avatar src={userData?.img_url} alt={`${name}'s Profile Picture`} color={valueToColor(theme, userData?.sdr_name)} radius='xl'>
              {nameToInitials(userData?.sdr_name)}
            </Avatar>

            <Stack spacing={5}>
              <div style={{ flex: 1 }}>
                <Text size='sm' weight={500} className='truncate'>
                  {userData?.sdr_name}
                </Text>

                <Text color='dimmed' size='xs' className='truncate'>
                  {userData?.sdr_email}
                </Text>
              </div>
              <Group>
                {userData?.weekly_li_outbound_target && <ChannelBadge channel='LinkedIn' isConnected={userData?.li_voyager_connected} />}
                {userData?.weekly_email_outbound_target && <ChannelBadge channel='Email' isConnected={userData?.nylas_connected} />}
              </Group>
            </Stack>
          </Group>
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown ml='md'>
        <CreditsCard />
      </Popover.Dropdown>
    </Popover>
  );
}
