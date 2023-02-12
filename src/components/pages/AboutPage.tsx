import {
  List,
  ThemeIcon,
  Text,
  Container,
  Stack,
  Flex,
  Title,
  useMantineTheme,
  Paper,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconInfoSquareRounded } from "@tabler/icons";
import { SCREEN_SIZES } from "../../constants/data";
import PageFrame from "../common/PageFrame";

export default function AboutPage() {
  const theme = useMantineTheme();
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  return (
    <PageFrame>
      <Paper withBorder p="md" radius="md">
        <Stack p={10}>
          <Flex wrap="nowrap">
            <Text>
              <ThemeIcon color="blue" variant="filled" size="xl" radius="xl">
                <IconInfoSquareRounded />
              </ThemeIcon>
            </Text>
            <Title order={2} pl={10}>{`Welcome`}</Title>
          </Flex>
          <Text>{`Landing page for SellScale Sight.`}</Text>
        </Stack>
      </Paper>
    </PageFrame>
  );
}
