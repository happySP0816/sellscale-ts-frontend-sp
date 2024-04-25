import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Paper,
  Switch,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { ClientSyncCRM, MergeIntegrationType } from "src";

import { API_URL } from "@constants/data";
import CRMEventHandler from "./CRMEventHandler";
// const API_URL = "http://127.0.0.1:5000";

type CRMModel = {
  entity: string;
  type: string;
  description: string;
  toggleColor: string;
};

export default function CRMSyncableModels(props: {
  integration: MergeIntegrationType;
  supportedModels: string[];
  crmSync: ClientSyncCRM;
}) {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const [crmSync, setCRMSync] = useState<ClientSyncCRM>(props.crmSync);

  if (!props.integration) {
    return <></>;
  }

  const [loading, setLoading] = useState<boolean>(false);
  const postPatchCRMSyncSettings = async () => {
    setLoading(true);

    const response = await fetch(`${API_URL}/merge_crm/crm_sync`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lead_sync: leadToggled,
        contact_sync: caoToggled,
        account_sync: caoToggled,
        opportunity_sync: caoToggled,
      }),
    });
    const data = await response.json();
    if (data.status === "success") {
      showNotification({
        title: "Success",
        message: "Your model sync preferences have been updated",
        color: "green",
      });
      setCRMSync({
        ...crmSync,
        lead_sync: leadToggled,
        contact_sync: caoToggled,
        account_sync: caoToggled,
        opportunity_sync: caoToggled,
      });
    } else {
      showNotification({
        title: "Error",
        message: "Failed to update",
        color: "red",
      });
    }
    setLoading(false);
  };

  const [crmAvailableModels, setCRMAvailableModels] = useState<CRMModel[]>([]);
  const [leadToggled, setLeadToggled] = useState<boolean>(crmSync.lead_sync);
  const [caoToggled, setCAOToggled] = useState<boolean>(
    crmSync.contact_sync || crmSync.account_sync || crmSync.opportunity_sync
  );
  const calculateAvailableModels = () => {
    // Reset the available models
    setCRMAvailableModels([]);

    // Lead supported
    if (props.supportedModels.indexOf("Lead") > -1) {
      setCRMAvailableModels((crmAvailableModels) => {
        return [
          ...crmAvailableModels,
          {
            entity: "Lead",
            type: "lead",
            description: "A potential customer that you want to track.",
            toggleColor: "blue",
          },
        ];
      });
    }

    // Contact supported
    if (props.supportedModels.indexOf("CRMContact") > -1) {
      setCRMAvailableModels((crmAvailableModels) => {
        return [
          ...crmAvailableModels,
          {
            entity: "Contact",
            type: "contact",
            description: "A person who you do business with.",
            toggleColor: "orange",
          },
        ];
      });
    }

    // Account supported
    if (props.supportedModels.indexOf("CRMAccount") > -1) {
      setCRMAvailableModels((crmAvailableModels) => {
        return [
          ...crmAvailableModels,
          {
            entity: "Account",
            type: "account",
            description:
              "An organization or company that you do business with.",
            toggleColor: "orange",
          },
        ];
      });
    }

    // Opportunity supported
    if (props.supportedModels.indexOf("Opportunity") > -1) {
      setCRMAvailableModels((crmAvailableModels) => {
        return [
          ...crmAvailableModels,
          {
            entity: "Opportunity",
            type: "opportunity",
            description: "A potential deal that you want to track.",
            toggleColor: "orange",
          },
        ];
      });
    }
  };

  useEffect(() => {
    calculateAvailableModels();
  }, []);

  return (
    <Paper withBorder p="lg" radius="md" bg={"#fcfcfd"} w="100%">
      <Flex mb={"md"} align="center">
        <Box w="80%">
          <Text fw={600} size={20}>
            Model Settings
          </Text>
          <Text color="gray" size={"sm"} mt="2px">
            Select which models you want SellScale to sync to your CRM.
          </Text>
        </Box>
        <Box w="20%" sx={{ textAlign: "right" }}>
          <Button
            variant="outline"
            onClick={() => {
              postPatchCRMSyncSettings();
            }}
            disabled={
              crmSync.lead_sync === leadToggled &&
              crmSync.contact_sync === caoToggled
            }
            loading={loading}
          >
            Save
          </Button>
        </Box>
      </Flex>
      <Divider />
      <Flex my="md" direction="column" w="100%">
        {
          // Display the available models
          crmAvailableModels &&
            crmAvailableModels.map((model: CRMModel, index: number) => {
              return (
                <Card withBorder mt={index === 0 ? "0px" : "sm"} w="100%">
                  <Flex align={"center"} gap={"sm"} justify={"space-between"}>
                    <Flex direction="column" w="100%">
                      <Text fw={500} size={"sm"} mr="sm">
                        {model.entity}
                      </Text>
                      <Text color="gray" size={"sm"}>
                        {model.description}
                      </Text>
                    </Flex>
                    <Flex>
                      <Switch
                        color={model.toggleColor}
                        checked={
                          model.type === "lead" ? leadToggled : caoToggled
                        }
                        onChange={(event) => {
                          model.type === "lead"
                            ? setLeadToggled(event.currentTarget.checked)
                            : setCAOToggled(event.currentTarget.checked);
                        }}
                      />
                    </Flex>
                  </Flex>
                </Card>
              );
            })
        }
      </Flex>
      <Flex direction="column">
        <Text color="gray" size={"xs"} mb={"sm"}>
          Note: Contacts + Accounts + Opportunities are created together when
          syncing.
        </Text>
      </Flex>
      <Divider />

      {/* Only show CRMEventHandler AFTER they have selected Model(s) to sync */}
      {(leadToggled || caoToggled) && <CRMEventHandler crmSync={crmSync}/>}
    </Paper>
  );
}
