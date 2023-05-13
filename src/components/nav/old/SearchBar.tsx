import { Group, Text, UnstyledButton } from '@mantine/core';
import { openSpotlight } from '@mantine/spotlight';
import { useOs } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons';
import useStyles from './SearchBars.styles';

export function SearchBar({ isSmall }: { isSmall?: boolean }) {

  const { classes } = useStyles();
  const os = useOs();

  return (
    <UnstyledButton
      onClick={() => openSpotlight()}
      className={classes.root}
      sx={{ width: (isSmall) ? '100%' : 250 }}
    >
      <Group spacing="xs" sx={{ flexWrap: 'nowrap' }}>
        <IconSearch size={14} stroke={1.5} />
        <Text size="sm" color="dimmed" pr={(isSmall) ? 0 : 100}>
          Search
        </Text>
        {!isSmall && (
          <Text weight={700} className={classes.shortcut}>
            {os === 'undetermined' || os === 'macos' ? '⌘' : 'Ctrl'} + K
        </Text>
        )}
      </Group>
    </UnstyledButton>
  );

}