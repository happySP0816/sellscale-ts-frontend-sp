import { Avatar, Text, Flex, Center, Popover, Container } from "@mantine/core";
import { useHover } from "@mantine/hooks";

export default function ProfileIcon({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const { hovered, ref } = useHover();

  return (
    <Popover
      width={200}
      position="right"
      withArrow
      shadow="md"
      opened={hovered}
    >
      <Popover.Target>
        <Center ref={ref} py="md" className="cursor-pointer">
          <Avatar
            radius="xl"
            src={`https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
              name
            )}`}
            alt={`${name}'s Profile Picture`}
          />
        </Center>
      </Popover.Target>
      <Popover.Dropdown sx={{ pointerEvents: "none" }}>
        <Container className="truncate p-0">
          <Text size="sm" fw={700}>
            {name}
          </Text>
          <Text size="sm" c="dimmed">
            {email}
          </Text>
        </Container>
      </Popover.Dropdown>
    </Popover>
  );
}

export function ProfileCard({ name, email }: { name: string; email: string }) {
  return (
    <Flex
      gap={0}
      justify="center"
      align="center"
      direction="row"
      wrap="nowrap"
    >
      <Center mx={5}>
        <Avatar
          size="sm"
          radius="xl"
          src={`https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
            name
          )}`}
          alt={`${name}'s Profile Picture`}
        />
      </Center>
      <Container className="truncate p-0">
        <Text size="xs" fw={700} className="truncate">
          {name}
        </Text>
        <Text size="xs" c="dimmed" className="truncate">
          {email}
        </Text>
      </Container>
    </Flex>
  );
}
