import { ActionIcon, Box, Button, Code, CopyButton, Flex, List, Paper, rem, Text, TextInput, Tooltip } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { IconCheck, IconCopy } from "@tabler/icons";

export default function ConnectSegmentModal({ context, id, innerProps }: ContextModalProps<{ id: any; setSelected: (id: any) => void; selected: any }>) {
  return (
    <Paper>
      <Text size={"sm"} color="gray" fw={500}>
        {"Whenever you hit the webhook below with a valid of prospects (in the format provided), we will automatically add those contacts into this segment."}
      </Text>
      <Box mt={"md"}>
        <Text size={"sm"} color="gray" fw={500}>
          This is how you connect to:
        </Text>
        <List
          size="sm"
          styles={{
            item: {
              color: "gray",
              fontWeight: 500,
            },
          }}
        >
          <List.Item>API</List.Item>
          <List.Item>Zapier</List.Item>
        </List>
      </Box>
      <Flex direction={"column"} align={"end"} w={"100%"} mt={"md"}>
        <Paper withBorder radius={"sm"} px="sm" py={6} w={"100%"} style={{ borderColor: "#228be6" }} bg={"#f9fbfe"}>
          <Text size={"sm"} color="gray" fw={500}>
            api.sellscale.com/segment/hook/SJO1930s
          </Text>
        </Paper>
        <CopyButton value="api.sellscale.com/segment/hook/SJO1930s" timeout={2000}>
          {({ copied, copy }) => (
            <Button
              color={copied ? "teal" : "blue"}
              variant="white"
              onClick={copy}
              leftIcon={copied ? <IconCheck style={{ width: rem(16) }} /> : <IconCopy style={{ width: rem(16) }} />}
              styles={{
                label: {
                  textDecoration: "underline",
                },
              }}
            >
              {copied ? "Copied" : "Copy"} Webhook URL
            </Button>
          )}
        </CopyButton>
      </Flex>
      <Box>
        <Text size={"sm"} fw={600}>
          Payload needed
        </Text>
        <Text size={"sm"} fw={600} color="gray">
          We need a list of prospects with first_name, last_name, and company
        </Text>
        <Code block h={200} mt={"sm"}>
          {`[
    {
        "first_name": "Aakash",
        "last_name": 'Adesara',
        "company": "SellScale"
    }
    ...
]`}
        </Code>
      </Box>
      <Flex gap={"md"} mt={"sm"}>
        <Button fullWidth>Test</Button>
        <Button
          color="green"
          fullWidth
          onClick={() => {
            const updatedSelected = innerProps.selected ? [...innerProps.selected, innerProps.id] : [innerProps.id];
            innerProps.setSelected(updatedSelected);
            context.closeModal(id);
          }}
        >
          Publish
        </Button>
      </Flex>
    </Paper>
  );
}
