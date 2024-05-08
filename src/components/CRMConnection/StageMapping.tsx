import { userTokenState } from "@atoms/userAtoms";
import {
  Button,
  Card,
  Divider,
  Flex,
  Paper,
  Select,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconArrowsExchange } from "@tabler/icons";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

import { API_URL } from "@constants/data";
import { CRMStage } from "src";


export default function StageMapping() {
  const userToken = useRecoilValue(userTokenState);

  let sellscaleStages = [
    { value: "SENT_OUTREACH", label: "Sent Outreach" },
    { value: "ACTIVE_CONVO", label: "Active Convo (All)" },
    { value: "DEMO", label: "Demo Set" },
  ];
  const [crmStages, setCRMStages] = useState<CRMStage[]>([]);
  const [existingStageMapping, setExistingStageMapping] = useState<{ [key: string]: string | null }>({});

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
      setExistingStageMapping(data.data.mapping);
    }
  };

  useEffect(() => {
    getCRMStages();
  }, []);

  const postCRMStagesToSellScale = async (stageMapping: { [key: string]: string} | {}) => {
    const response = await fetch(`${API_URL}/merge_crm/stages/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stage_mapping: stageMapping }),
    });
    const data = await response.json();

    if (data.status === "success") {
      showNotification({
        title: "Success",
        message: "Stage mappings have been saved",
        color: "green"
      });
      setExistingStageMapping(stageMapping);
    } else {
      showNotification({
        title: "Error",
        message: data.message,
        color: "red"
      });
    }

    getCRMStages();
  }

  return (
    <Paper withBorder mt="md" p="lg" radius="md" bg={"#fcfcfd"}>
      <Flex align={"center"} justify={"space-between"}>
        <Flex direction={"column"} mb={"md"}>
          <Text fw={600} size={20}>
            Manual Syncing - Pipeline Stage Mapping
          </Text>
          <Text color="gray" size={"sm"} mt="2px">
            When manually syncing contacts into your CRM from SellScale, these will be the default stages Prospects are placed in.
          </Text>
        </Flex>
      </Flex>
      <Divider />
      <Flex direction={"column"} gap={"sm"} mt={"md"}>
        {sellscaleStages.map((sellscaleStage, index) => {
          return (
            <Flex gap={"sm"} align={"center"} direction="column">
              {index === 0 && (
                <Flex w={"100%"}>
                  <Text color="gray" size="sm" w="100%">
                    SellScale Stage
                  </Text>
                  <Text color="gray" size="sm" w="100%">
                    CRM Stage
                  </Text>
                </Flex>
              )}

              <Flex w={"100%"}>
                <Flex w={"100%"} align="center">
                  <Flex
                    w={"100%"}
                    style={{
                      border: "1px solid #e1e1e1",
                      padding: "0px 10px 0px 10px",
                      minHeight: "36px",
                      borderRadius: "5px",
                      backgroundColor: "#f7f7f7",
                      color: "#000",
                      alignItems: "center",
                    }}
                  >
                    {sellscaleStage.label}
                  </Flex>
                  <Flex mx="20px">
                    <IconArrowsExchange
                      color="gray"
                    />
                  </Flex>
                </Flex>
                <Flex h={"100%"} w={"100%"} direction="column" align="center">
                  <Select
                    w={"100%"}
                    h={"24px"}
                    placeholder="Pick value"
                    data={
                      (crmStages &&
                        crmStages.map((crmStage) => {
                          return { value: crmStage.id, label: crmStage.name || crmStage.remote_id || "ERROR" };
                        })) || []
                    }
                    value={
                      existingStageMapping && existingStageMapping[sellscaleStage.value] || ""
                    }
                    onChange={(value) => {
                      if (value === null) { // Remove from newStageMapping if value is null
                        const newStageMapping = { ...existingStageMapping };
                        delete newStageMapping[sellscaleStage.value];
                        postCRMStagesToSellScale(newStageMapping);
                        return;
                      }

                      // Update newStageMapping with new value
                      const newStageMapping = { ...existingStageMapping };
                      newStageMapping[sellscaleStage.value] = value;
                      postCRMStagesToSellScale(newStageMapping);
                    }}
                    searchable
                    allowDeselect
                  />
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Paper>
  );
}
