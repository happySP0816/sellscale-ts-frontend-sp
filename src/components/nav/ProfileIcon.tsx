import CreditsCard from '@common/credits/CreditsCard';
import { Avatar, Text, Flex, Center, Popover, Container, useMantineTheme, UnstyledButton, Group, createStyles } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { nameToInitials, valueToColor } from '@utils/general';

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

export function ProfileCard({ name, email, imgUrl }: { name: string; email: string; imgUrl: string }) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  return (
    <Popover width={300} position='top' withArrow shadow='md'>
      <Popover.Target>
        <UnstyledButton className={classes.user}>
          <Group>
            <Avatar src={imgUrl} alt={`${name}'s Profile Picture`} color={valueToColor(theme, name)} radius='xl'>
              {nameToInitials(name)}
            </Avatar>

            <div style={{ flex: 1 }}>
              <Text size='sm' weight={500} className='truncate'>
                {name}
              </Text>

              <Text color='dimmed' size='xs' className='truncate'>
                {email}
              </Text>
            </div>
          </Group>
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown ml='md'>
        <CreditsCard />
      </Popover.Dropdown>
    </Popover>
  );
}
