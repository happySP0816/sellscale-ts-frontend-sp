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
import { CRMStage, ClientSyncCRM } from "src";

export default function CRMEventHandler(props: { crmSync: ClientSyncCRM }) {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  //////////////// Stages
  let sellscaleStages = [
    { value: "ACTIVE_CONVO", label: "Active Convo (All)" },
    { value: "ACTIVE_CONVO_POSITIVE_REPLY", label: "Active Convo (Positive Reply)" },
    { value: "DEMO", label: "Demo Set" },
  ];
  const [crmStages, setCRMStages] = useState<CRMStage[]>([]);
  const [existingEvents, setExistingEvents] = useState<{
    [key: string]: string | null;
  }>({});
  const [sellscaleStage, setSellscaleStage] = useState<string | null>();
  const [crmStage, setCrmStage] = useState<string | null>();

  const getCRMStages = async () => {
    const response = await fetch(`${API_URL}/merge_crm/stages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await response.json();

    if (data.status === "success") {
      setCRMStages(data.data.stages);
      setExistingEvents(data.data.triggers);
      setSellscaleStage((Object.keys(data.data.triggers)[0] as string) || null);
      setCrmStage((Object.values(data.data.triggers)[0] as string) || null);
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const patchEventHandler = async (eventMapping: { [key: string]: string }) => {
    setLoading(true);
    const response = await fetch(`${API_URL}/merge_crm/sync/event`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event_mapping: eventMapping }),
    });
    const data = await response.json();

    if (data.status === "success") {
      showNotification({
        title: "Success",
        message: "Automatic sync condition has been saved",
        color: "green",
      });
      syncLocalStorage(userToken, setUserData);
      setExistingEvents(eventMapping);
      getCRMStages();
    } else {
      showNotification({
        title: "Error",
        message: "Failed to update",
        color: "red",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    getCRMStages();
  }, []);
  //////////////// End Stages

  //////////////// Average Opportunity Value
  const [contractSize, setContractSize] = useState(
    userData.client.contract_size || 0
  );
  const [debouncedContractSize] = useDebouncedValue(contractSize, 500);

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
        setContractSize(userData.client.contract_size || 0);
        return;
      }

      showNotification({
        title: "Success",
        message: "Opportunity value updated. Future syncs will use this value.",
        color: "green",
      });
      syncLocalStorage(userToken, setUserData);
    });
  }, [debouncedContractSize]);
  //////////////// End Average Opportunity Value

  return (
    <Paper withBorder mt="md" p="lg" radius="md">
      <Flex mb={"md"} align="center">
        <Box w="80%">
          <Text fw={600} size={20}>
            Automated Syncing
          </Text>
          <Text color="gray" size={"sm"} mt="2px">
            Automatically sync SellScale prospects into the respective Models in
            your CRM, based off of SellScale events.
          </Text>
        </Box>
        <Box w="20%" sx={{ textAlign: "right" }}>
          <Button
            variant="outline"
            disabled={
              !!(
                JSON.stringify(existingEvents) ===
                  JSON.stringify({ [sellscaleStage as string]: crmStage }) ||
                (sellscaleStage && props.crmSync.opportunity_sync && !crmStage)
              )
            }
            onClick={() => {
              if (!sellscaleStage) {
                setSellscaleStage(null);
                setCrmStage(null);
                patchEventHandler({});
                return;
              }
              setSellscaleStage(sellscaleStage);
              setCrmStage(crmStage);
              if (!crmStage) {
                setCrmStage("LEAD_ONLY");
                patchEventHandler({
                  [sellscaleStage as string]: "LEAD_ONLY",
                });
                return;
              }

              patchEventHandler({
                [sellscaleStage as string]: crmStage as string,
              });
            }}
            loading={loading}
          >
            Save
          </Button>
        </Box>
      </Flex>
      <Divider />

      <Flex mt={"md"} align={"center"} gap={"sm"}>
        <Text fw={500} size={"sm"}>
          When SellScale prospect moves to:
        </Text>
        <Select
          data={sellscaleStages}
          onChange={(value) => {
            setSellscaleStage(value);
          }}
          value={sellscaleStage}
          allowDeselect={!crmStage || crmStage === "LEAD_ONLY"}
        />
      </Flex>
      <Flex direction={"column"} gap={"sm"} mt={"md"}>
        {sellscaleStage &&
          (props.crmSync.opportunity_sync ? (
            <Flex align={"center"} gap={"sm"} ml={"32px"}>
              <Text fw={500} size={"sm"} color="grey">
                Create opportunity in status:
              </Text>
              <Select
                data={
                  crmStages.map((stage) => ({
                    value: stage.id,
                    label: stage.name,
                  })) || []
                }
                onChange={(value) => {
                  setCrmStage(value);
                }}
                value={crmStage}
                allowDeselect
              />
            </Flex>
          ) : (
            props.crmSync.lead_sync && (
              <Flex align={"center"} gap={"sm"} ml={"32px"}>
                <Text fw={500} size={"sm"} color="grey" mb="sm">
                  Create Lead
                </Text>
              </Flex>
            )
          ))}
      </Flex>
      {props.crmSync.opportunity_sync && (
        <>
          <Divider mt="sm" mb="md" />
          <Flex direction="row" justify="space-between" align="center">
            <Flex w="48%" direction="column">
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
        </>
      )}
    </Paper>
  );
}
