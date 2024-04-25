import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Flex,
  Progress,
  RingProgress,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowUp,
  IconDotsVertical,
  IconGlobe,
  IconMap,
  IconMessage,
  IconUsers,
} from "@tabler/icons";
import { IconBriefcase2 } from "@tabler/icons-react";

export default function SegmentV2Overview(props: any) {
  const { data, totalProspected, totalContacted, totalInFilters } = props;
  const theme = useMantineTheme();

  const totalSegments =
    data.length +
    data
      .map((x: any) => x.sub_segments.length)
      .reduce((acc: number, item: any) => acc + item, 0);

  return (
    <Flex align={"center"} gap={"lg"} mb={"lg"}>
      {/* TAM Value */}
      <Card pl="sm" pr="sm" pt="8px" pb="8px" radius="md" withBorder w={"40%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex direction={"column"}>
            <Flex align={"center"}>
              <Text fw={600} color="gray.8" fz="xs">
                <Box
                  sx={(theme) => ({
                    borderRadius: 9999,
                    display: "inline-block",
                    marginRight: 4,
                    width: 12,
                    height: 12,
                    backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
                  })}
                />
                Estimated TAM Value
              </Text>
            </Flex>

            <Flex align={"center"} gap={"xs"}>
              <Text fw={500} fz={"25px"}>
                {/* # people x 10000 */}$
                {(totalInFilters * 10000).toLocaleString()}
              </Text>
            </Flex>
          </Flex>
          <Box
            sx={{
              textAlign: "center",
              flexDirection: "row",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RingProgress
              size={90}
              sections={[
                {
                  value: Math.round(
                    (totalContacted / (totalProspected || 1)) * 100
                  ),
                  color: theme.colors.blue[6],
                },
              ]}
              label={
                <Text c="blue" fw={700} ta="center" size="sm" color="gray">
                  {Math.round(
                    (totalContacted / (totalProspected || 1)) * 1000
                  ) / 10}
                  %
                </Text>
              }
            />
            <Text size="10px" color="gray">
              # Contacted / <br /># Imported
            </Text>
          </Box>
        </Flex>
      </Card>
      {/* Number segments */}
      <Card padding="lg" radius="md" withBorder w={"15%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} gap={"sm"}>
            <IconBriefcase2
              color="#d444f1"
              size={"1.1rem"}
              style={{ marginTop: "-1px" }}
            />
            <Text fw={500} color="gray" fz="xs">
              # Segments
            </Text>
          </Flex>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            {totalSegments}
          </Text>
        </Flex>
      </Card>

      {/* Number in filters */}
      <Card padding="lg" radius="md" withBorder w={"15%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} gap={"sm"}>
            <IconMap
              color={theme.colors.orange[3]}
              size={"1.1rem"}
              style={{ marginTop: "-1px" }}
            />
            <Text fw={500} color="gray" fz="xs">
              # People
            </Text>
          </Flex>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            {totalInFilters.toLocaleString()}
          </Text>
        </Flex>
      </Card>
      {/* Number imported */}
      <Card padding="lg" radius="md" withBorder w={"15%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} gap={"sm"}>
            <IconMessage
              color="#40c057"
              size={"1.1rem"}
              style={{ marginTop: "-1px" }}
            />
            <Text fw={500} color="gray" fz="xs">
              # Imported
            </Text>
          </Flex>
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

      {/* Number contacted */}
      <Card padding="lg" radius="md" withBorder w={"15%"}>
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"} gap={"sm"}>
            <IconUsers
              color="#228be6"
              size={"1.1rem"}
              style={{ marginTop: "-1px" }}
            />
            <Text fw={500} color="gray" fz="xs">
              # Contacted
            </Text>
          </Flex>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Text size={30} fw={500}>
            {totalContacted}
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
