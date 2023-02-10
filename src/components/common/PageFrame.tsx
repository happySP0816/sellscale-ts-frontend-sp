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
        backgroundColor: (theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0]),
      })}
      spacing="xs"
      mx={'8vw'}
      my={'1em'}
      p={'10px'}
    >
      {children}
    </Stack>
  );
}