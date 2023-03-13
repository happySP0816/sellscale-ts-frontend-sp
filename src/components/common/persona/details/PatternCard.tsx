import FlexSeparate from "@common/library/FlexSeparate";
import {
  Badge,
  Group,
  Stack,
  Switch,
  Title,
  Text,
  useMantineTheme,
  Divider,
} from "@mantine/core";
import { formatToLabel, valueToColor } from "@utils/general";

type PatternCardProps = {
  id: number;
  name: string;
  priority: number;
  type: "DEFAULT" | "STRICT";
  channel: "LINKEDIN" | "EMAIL";
  dataPoints: string[];
};

export default function PatternCard(props: PatternCardProps) {
  const theme = useMantineTheme();

  return (
    <>
      <Stack spacing={5}>
        <FlexSeparate>
          <Group noWrap={true}>
            <Title order={4} fw={500}>
              {props.name}
            </Title>
            <Badge
              color={valueToColor(theme, formatToLabel(props.channel))}
              variant="light"
            >
              {formatToLabel(props.channel)}
            </Badge>
          </Group>
          <Switch
            color="teal"
            checked={true}
            onClick={(e) => {}}
            styles={(theme) => ({
              track: {
                cursor: "pointer",
              },
            })}
          />
        </FlexSeparate>
        <Group spacing={10} pl="xs">
          <Title order={6} fw={450}>
            • Configuration Type
          </Title>
          <Text c="dimmed" fz="sm">
            {props.type === "STRICT"
              ? "Needs and uses all data points listed below."
              : "Randomly selects 2-3 points from the data points below."}
          </Text>
        </Group>
        <Stack spacing={0} pl="xs">
          <Title order={6} fw={450}>
            • Data Points
          </Title>
          <Group spacing={5}>
            {props.dataPoints.map((dataPoint) => (
              <Badge
                key={dataPoint}
                color={valueToColor(theme, formatToLabel(dataPoint))}
                variant="light"
                size="xs"
              >
                {formatToLabel(dataPoint)}
              </Badge>
            ))}
          </Group>
        </Stack>
      </Stack>
      <Divider my={0} />
    </>
  );
}
