import CreditsCard from "@common/credits/CreditsCard";
import {
  Avatar,
  Text,
  Flex,
  Center,
  Popover,
  Container,
  useMantineTheme,
} from "@mantine/core";
import { useHover } from "@mantine/hooks";
import { nameToInitials, valueToColor } from "@utils/general";

export default function ProfileIcon({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const { hovered, ref } = useHover();
  const theme = useMantineTheme();

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
            src={null}
            alt={`${name}'s Profile Picture`}
            color={valueToColor(theme, name)}
            radius="xl"
          >
            {nameToInitials(name)}
          </Avatar>
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
  const theme = useMantineTheme();
  return (
    <Popover width={300} position="top" withArrow shadow="md">
      <Popover.Target>
        <Flex
          gap={0}
          justify="left"
          align="center"
          direction="row"
          wrap="nowrap"
          style={{ cursor: "pointer" }}
        >
          <Center mx={5}>
            <Avatar
              src={null}
              alt={`${name}'s Profile Picture`}
              color={valueToColor(theme, name)}
              radius="xl"
              size="sm"
            >
              {nameToInitials(name)}
            </Avatar>
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
      </Popover.Target>
      <Popover.Dropdown ml="md">
        <CreditsCard />
      </Popover.Dropdown>
    </Popover>
  );
}
