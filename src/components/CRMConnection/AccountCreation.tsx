import {
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  Paper,
  Select,
  Text,
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
      <Flex direction={"column"} mb={"md"}>
        <Text fw={600} size={20}>
          Account, Contact, Opportunity Creation (Coming Soon ⚠️)
        </Text>
        <Text color="gray" size={"sm"}>
          Automatically trigger creation of accont/ contact/ opportunity based
          on SellScale events.
        </Text>
      </Flex>
      <Divider />

      <Flex mt={"md"} align={"center"} gap={"sm"}>
        <Text color="gray" fw={500} size={"sm"}>
          When SellScale prospect moves to:
        </Text>
        <Select data={stage} />
      </Flex>
      <Flex direction={"column"} gap={"sm"} mt={"md"}>
        <Text color="gray" fw={500} size={"sm"}>
          Create a:
        </Text>
        <Checkbox
          label={
            <Text sx={{ display: "flex", gap: "4px" }} fw={500}>
              Account<span style={{ color: "gray" }}>(Recommended)</span>
            </Text>
          }
        />
        <Checkbox
          label={
            <Text sx={{ display: "flex", gap: "4px" }} fw={500}>
              Contact<span style={{ color: "gray" }}>(Recommended)</span>
            </Text>
          }
        />
        <Checkbox
          label={
            <Text sx={{ display: "flex", gap: "4px" }} fw={500}>
              Opportunity<span style={{ color: "gray" }}>(Recommended)</span>
            </Text>
          }
        />
        <Flex align={"center"} gap={"sm"} ml={"32px"}>
          <Text fw={500} size={"sm"}>
            Create opportunity in status:
          </Text>
          <Select data={["Moved to Demo"]} />
        </Flex>
      </Flex>
    </Paper>
  );
}
