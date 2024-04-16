import {
  Button,
  Box,
  Checkbox,
  Divider,
  Flex,
  Paper,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useState } from "react";

export default function AccountCreation() {
  const [stage, setStage] = useState([
    "Prospected",
    "Sent Outreach",
    "Active Convo",
    "Demo Set",
  ]);

  return (
    <Paper withBorder mt="md" p="lg" radius="md" bg={"#fcfcfd"}>
      <Flex mb={"md"}>
        <Box w="80%">
          <Text fw={600} size={20}>
            Event Handler (Coming Soon ⚠️)
          </Text>
          <Text color="gray" size={"sm"}>
            Automatically trigger creation of accont/ contact/ opportunity based
            on SellScale events.
          </Text>
        </Box>
        <Box w="20%" sx={{ textAlign: "right" }}>
          <Button variant="outline">Save</Button>
        </Box>
      </Flex>
      <Divider />

      <Flex mt={"md"} align={"center"} gap={"sm"}>
        <Text color="gray" fw={500} size={"sm"}>
          When SellScale prospect moves to:
        </Text>
        <Select data={stage} value="Active Convo" />
      </Flex>
      <Flex direction={"column"} gap={"sm"} mt={"md"}>
        <Text color="gray" fw={500} size={"sm"}>
          Create a:
        </Text>
        <Checkbox
          checked
          disabled
          label={
            <Text sx={{ display: "flex", gap: "4px" }} fw={500}>
              Opportunity / Account / Contact
              <span style={{ color: "gray" }}>(Recommended)</span>
            </Text>
          }
        />
        <Checkbox
          disabled
          label={
            <Text sx={{ display: "flex", gap: "4px" }} fw={500}>
              Lead<span style={{ color: "gray" }}></span> (⚠️ Coming soon)
            </Text>
          }
        />
        <Flex align={"center"} gap={"sm"} ml={"32px"}>
          <Text fw={500} size={"sm"}>
            Create opportunity in status:
          </Text>
          <Select
            data={["Warm Convo", "Discovery Call", "Demo Scheduled"]}
            value={"Warm Convo"}
          />
        </Flex>
        <Flex align={"center"} gap={"sm"} ml={"32px"}>
          <Text fw={500} size={"sm"}>
            Set Lead Source field called
          </Text>
          <Select
            data={["custom_1", "location", "lead_source", "hubs_101"]}
            value={"lead_source"}
          />
          to the value of
          <TextInput placeholder="Lead Source" defaultValue={"SellScale"} />
        </Flex>
      </Flex>
    </Paper>
  );
}
