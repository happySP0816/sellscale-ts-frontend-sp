import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Flex,
  Paper,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { IconEdit, IconPlus, IconSearch } from "@tabler/icons";

export default function SellScaleSonar() {
  const data = [
    {
      title: "Hiring Clinical Scribe",
      content:
        "Look for CTOs, COOs, CIOs, and Clinical Directors at companies that are hiring Clinical Scribes",
      accounts: 32,
      prospects: 183,
      connected: true,
      segment: "Healthcare Leaders Hiring",
    },
    {
      title: "Posted about healthcare problems",
      content:
        "Look doctors and Clinical leaders who recently posted about healthcare issues in their clinic.",
      accounts: 22,
      prospects: 104,
      connected: false,
      segment: null,
    },
  ];
  return (
    <Box>
      <Flex align={"center"} justify={"space-between"} mt={"sm"}>
        <Text size={"xl"} fw={500}>
          Sonar (Coming soon ⚠️)
        </Text>
        <Flex gap={"md"}>
          <TextInput
            w={300}
            placeholder="Search"
            rightSection={<IconSearch size={"0.9rem"} />}
          />
          <Button leftIcon={<IconPlus size={"0.9rem"} />}>New Sonar</Button>
        </Flex>
      </Flex>
      <SimpleGrid cols={3} mt={"md"}>
        {data.map((item, index) => {
          return (
            <Paper withBorder radius={"sm"} key={index} p={"sm"}>
              <Flex align={"center"} justify={"space-between"}>
                <Text fw={700} size={"md"}>
                  {item.title}
                </Text>
                <ActionIcon>
                  <IconEdit size={"0.9rem"} />
                </ActionIcon>
              </Flex>
              <Text size={"sm"} color="gray" fw={400} mt={"xs"}>
                {item.content}
              </Text>
              <Flex gap={5} align={"center"} mt={"xs"}>
                <Text size={"sm"} fw={500}>
                  {item.accounts}
                </Text>
                <Text size={"sm"} fw={400} color="gray">
                  Accounts
                </Text>
                <Divider orientation="vertical" />
                <Text size={"sm"} fw={500}>
                  {item.accounts}
                </Text>
                <Text size={"sm"} fw={400} color="gray">
                  Prospects
                </Text>
              </Flex>
              <Divider my={"sm"} />
              <Text color="gray" fw={400}>
                {item.connected ? "Connected segment:" : "Not connected"}
              </Text>
              <Flex align={"center"} gap={4}>
                <Text color="#228BE6" fw={600} underline>
                  {item.connected ? item.segment : "Connect Segment"}
                </Text>
                {item?.connected && (
                  <ActionIcon>
                    <IconEdit color="#228BE6" />
                  </ActionIcon>
                )}
              </Flex>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}
