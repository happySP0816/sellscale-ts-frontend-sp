import { Paper, Title, Text, Center, Tooltip } from "@mantine/core";
import { useHover } from "@mantine/hooks";

type NotificationCardProps = {
  icon: React.ReactNode;
  name: string;
  description: string;
};

export default function old_NotificationCard(props: NotificationCardProps) {
  const { hovered, ref } = useHover();

  return (
    <Tooltip.Floating label="Coming soon!" color="teal">
      <Paper
        ref={ref}
        sx={{
          filter: hovered ? "brightness(125%)" : "brightness(100%)",
          cursor: "pointer",
        }}
        withBorder
        m="xs"
        p="md"
        radius="md"
        w={250}
      >
        <Center p="xs">{props.icon}</Center>
        <Title order={4} align="center">
          {props.name}
        </Title>
        <Text ta="center" c="dimmed" fz="xs">
          {props.description}
        </Text>
      </Paper>
    </Tooltip.Floating>
  );
}
