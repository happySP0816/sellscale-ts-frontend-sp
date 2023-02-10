import { Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "../../constants/data";

export default function PageFrame({ children }: { children: React.ReactNode }) {

  const xsScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.XS})`);

  return (
    <Stack
      sx={(theme) => ({
        border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]}`,
        borderRadius: '8px',
        backdropFilter: 'blur(8px)',
        // Add alpha channel to hex color (browser support: https://caniuse.com/css-rrggbbaa)
        backgroundColor: (theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]) + '75',
      })}
      spacing="xs"
      mx={(xsScreenOrLess) ? '0vw' : '8vw'}
      my={(xsScreenOrLess) ? '0em' : '0.5em'}
      p={'10px'}
    >
      {children}
    </Stack>
  );
}