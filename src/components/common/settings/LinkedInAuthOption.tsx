import FlexSeparate from "@common/library/FlexSeparate";
import { Badge, Group, Stack, Title, Text, Button } from "@mantine/core";

export default function LinkedInAuthOption(props: { num: number, time: string, text: string, button: React.ReactNode }) {
  return (
    <Stack spacing={0}>
      <Group>
        <Title order={5}>• Option {props.num}</Title>
        <Badge
          variant="outline"
          size="sm"
          styles={{ root: { textTransform: "initial" } }}
        >
          {props.time}
        </Badge>
      </Group>
      <FlexSeparate>
        <Text fz="sm" pl="sm">
          {props.text}
        </Text>
        {props.button}
      </FlexSeparate>
    </Stack>
  );
}
