import { userDataState, userTokenState } from "@atoms/userAtoms";
import { syncLocalStorage } from "@auth/core";
import { API_URL } from "@constants/data";
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
  NumberInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export default function SyncTriggers() {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const [stage, setStage] = useState([
    "Prospected",
    "Sent Outreach",
    "Active Convo",
    "Demo Set",
  ]);

  const [contractSize, setContractSize] = useState(
    userData.client.contract_size || 0
  );
  const [debouncedContractSize] = useDebouncedValue(contractSize, 500)

  useEffect(() => {
    if (debouncedContractSize === userData.client.contract_size) {
      return;
    }
    fetch(`${API_URL}/client/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        contract_size: contractSize,
      }),
    }).then((response) => {
      if (!response.ok) {
        showNotification({
          title: "Error",
          message: "Failed to update average opportunity value",
          color: "red",
        });
        setContractSize(userData.client.contract_size || 0)
        return;
      }

      showNotification({
        title: "Success",
        message: "Opportunity value updated. Future syncs will use this value.",
        color: "green"
      })
      syncLocalStorage(userToken, setUserData);

    });
  }, [debouncedContractSize]);

  return (
    <Paper withBorder mt="md" p="lg" radius="md" bg={"#fcfcfd"}>
      <Flex mb={"md"}>
        <Box w="80%">
          <Text fw={600} size={20}>
            Sync Triggers (Coming Soon ⚠️)
          </Text>
          <Text color="gray" size={"sm"}>
            Automatically trigger the syncing of accounts, contacts, or
            opportunities based on SellScale events.
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
      <Divider mt="sm" mb="md" />
      <Flex direction="row" justify="space-between" align="center">
        <Flex w="50%" direction="column">
          <Text>Average Opportunity Value</Text>
          <Text color="gray" size={"sm"} lh={"1.1rem"}>
            Prospects synced into your CRM will show this opportunity value
          </Text>
        </Flex>

        <NumberInput
          w={"50%"}
          value={contractSize}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          formatter={(value) =>
            !Number.isNaN(parseFloat(value))
              ? `$ ${value}`.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")
              : "$ "
          }
          onChange={(value) => {
            setContractSize(value || 0);
          }}
        />
      </Flex>
    </Paper>
  );
}
