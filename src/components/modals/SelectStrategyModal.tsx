import { Box, Button, Flex, List, Paper, Select, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";

export default function SelectStrategyModal({ context, id, innerProps }: ContextModalProps<{ title: string }>) {
  return (
    <Paper>
      <Text fw={600} size={"lg"}>
        {innerProps.title}
      </Text>
      <Flex gap={"md"} mt={"sm"}>
        <Stack spacing={"sm"} w={"100%"}>
          <Select data={["Find Company"]} label="Source Company:" />
          <TextInput label="Role(s):" />
          <Textarea label="Angle:" minRows={3} />
        </Stack>
        <Box w={"100%"}>
          <Paper withBorder p={"sm"} radius={"sm"}>
            <Title order={3}>NewTon X</Title>
            <Text fw={500} size={"xs"}>
              New York, United States
            </Text>
            <List
              size={"xs"}
              fw={500}
              ml={"xs"}
              mt={"xs"}
              styles={{
                itemWrapper: {
                  color: "gray",
                },
              }}
            >
              <List.Item>Consulting</List.Item>
              <List.Item>100 - 500 employees</List.Item>
              <List.Item>Series B</List.Item>
              <List.Item>startup, firm, mid sized</List.Item>
            </List>
          </Paper>
          <Text size={"xs"} fw={500} mt={"md"}>
            Found 80+ lookalike companies.
          </Text>
          <Text size={"xs"} fw={500}>
            Found 300+ profiles that match.
          </Text>
        </Box>
      </Flex>
      <Flex gap={"md"} mt={"lg"}>
        <Button variant="outline" color="gray" fullWidth onClick={() => context.closeContextModal(id)}>
          Cancel
        </Button>
        <Button fullWidth>Create Campaign</Button>
      </Flex>
    </Paper>
  );
}
