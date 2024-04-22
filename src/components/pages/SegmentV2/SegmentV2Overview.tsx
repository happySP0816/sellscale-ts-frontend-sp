import { ActionIcon, Badge, Card, Flex, Text } from "@mantine/core";
import {
  IconArrowUp,
  IconDotsVertical,
  IconMessage,
  IconUsers,
} from "@tabler/icons";
import { IconBriefcase2 } from "@tabler/icons-react";

export default function SegmentV2Overview(props: any) {
  const { data, totalProspected, totalContacted } = props;

  const totalSegments =
    data.length +
    data
      .map((x: any) => x.sub_segments.length)
      .reduce((acc: number, item: any) => acc + item, 0);

  return (
    <Flex align={"center"} gap={"lg"} mb={"lg"}>
      <Card padding="lg" radius="md" withBorder w={"100%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} gap={"sm"}>
            <IconBriefcase2
              color="#d444f1"
              size={"1.1rem"}
              style={{ marginTop: "-1px" }}
            />
            <Text fw={500} color="gray">
              Total Segments
            </Text>
          </Flex>
          <ActionIcon>
            <IconDotsVertical size={"0.9rem"} />
          </ActionIcon>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            {totalSegments}
          </Text>
          {/* <Badge
            color="green"
            leftSection={
              <IconArrowUp size={"0.9rem"} style={{ marginTop: "4px" }} />
            }
          >
            8.5%
          </Badge> */}
        </Flex>
      </Card>
      <Card padding="lg" radius="md" withBorder w={"100%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} gap={"sm"}>
            <IconUsers
              color="#228be6"
              size={"1.1rem"}
              style={{ marginTop: "-1px" }}
            />
            <Text fw={500} color="gray">
              Total Contacts
            </Text>
          </Flex>
          <ActionIcon>
            <IconDotsVertical size={"0.9rem"} />
          </ActionIcon>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            {totalContacted}
          </Text>
          {/* <Badge
            color="green"
            leftSection={
              <IconArrowUp size={"0.9rem"} style={{ marginTop: "4px" }} />
            }
          >
            8.5%
          </Badge> */}
        </Flex>
      </Card>
      <Card padding="lg" radius="md" withBorder w={"100%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} gap={"sm"}>
            <IconMessage
              color="#40c057"
              size={"1.1rem"}
              style={{ marginTop: "-1px" }}
            />
            <Text fw={500} color="gray">
              Total Contacted
            </Text>
          </Flex>
          <ActionIcon>
            <IconDotsVertical size={"0.9rem"} />
          </ActionIcon>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            {totalProspected}
          </Text>
          {/* <Badge
            color="green"
            leftSection={
              <IconArrowUp size={"0.9rem"} style={{ marginTop: "4px" }} />
            }
          >
            8.5%
          </Badge> */}
        </Flex>
      </Card>
    </Flex>
  );
}
