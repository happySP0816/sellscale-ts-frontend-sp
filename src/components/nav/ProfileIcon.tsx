import {
  Avatar,
  Text,
  Center,
  Popover,
  Container,
} from "@mantine/core";
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
    <Popover width={200} position="right" withArrow shadow="md" opened={hovered}>
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
      <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
        <Container className='truncate p-0'>
          <Text size="sm" fw={700}>{name}</Text>
          <Text size="sm" c="dimmed">{email}</Text>
        </Container>
      </Popover.Dropdown>
    </Popover>
  );
}
