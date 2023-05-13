import { useMantineColorScheme, Text, SegmentedControl, Group, Center, Box } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';

export default function SettingPreferences() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group position="center" my="xl">
      <Text>Toggle site theme</Text>
      <SegmentedControl
        value={colorScheme}
        onChange={(value: 'light' | 'dark') => toggleColorScheme(value)}
        data={[
          {
            value: 'light',
            label: (
              <Center>
                <IconSun size="1rem" stroke={1.5} />
                <Box ml={10}>Light</Box>
              </Center>
            ),
          },
          {
            value: 'dark',
            label: (
              <Center>
                <IconMoon size="1rem" stroke={1.5} />
                <Box ml={10}>Dark</Box>
              </Center>
            ),
          },
        ]}
      />
    </Group>
  );

}

