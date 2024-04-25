import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Image,
  Paper,
  Select,
  Switch,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAffiliate,
  IconCircleCheck,
  IconCloud,
  IconNetwork,
} from "@tabler/icons";
import React, { useCallback, useEffect, useState } from "react";

import { useMergeLink } from "@mergeapi/react-merge-link";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import _ from "lodash";
import CRMUserMapping from "../CRMConnection/CRMMapping";
import StageMapping from "../CRMConnection/StageMapping";
import CRMEventHandler from "../CRMConnection/CRMEventHandler";
import { ClientSyncCRM, MergeIntegrationType } from "src";
import CRMSyncableModels from "../CRMConnection/CRMSyncableModels";

import { API_URL } from "@constants/data";
// const API_URL = "http://127.0.0.1:5000";


let IntegrationToIconMap = new Map([
  ["Hubspot", <IconAffiliate color="orange" />],
  ["Salesforce", <IconCloud color="rgb(71, 155, 213)" />],
]);

const CRMConnectionPage: React.FC = () => {
  const userToken = useRecoilValue(userTokenState);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [linkToken, setLinkToken] = useState<string>("");
  const [integration, setIntegration] = useState<MergeIntegrationType>();
  const [supportedModels, setSupportedModels] = useState<string[]>([]);
  const [crmSync, setCRMSync] = useState<ClientSyncCRM>();
  const [creatingTestContact, setCreatingTestContact] =
    useState<boolean>(false);

  // (Integration 1/3) Get the link token
  const getLinkToken = async () => {
    const response = await fetch(`${API_URL}/merge_crm/link_token`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + userToken,
      },
    });
    const data = await response.json();
    setLinkToken(data.data.link_token);

    return data.link_token;
  };

  // (Integration 3/3) Get the account token
  const postAccountToken = async (public_token: string) => {
    const response = await fetch(`${API_URL}/merge_crm/account_token`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + userToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_token: public_token,
      }),
    });

    const data = await response.json();
    return data;
  };

  const deleteIntegration = async () => {
    const response = await fetch(`${API_URL}/merge_crm/integration`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + userToken,
      },
    });
    const data = await response.json();

    return data;
  };

  const getIntegrations = async () => {
    const response = await fetch(`${API_URL}/merge_crm/integration`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + userToken,
      },
    });
    const data = await response.json();
    setIntegration(data.data.integration);
    setSupportedModels(data.data.supported_models);
    setCRMSync(data.data.crm_sync)
  };

  const createTestAccount = async () => {
    setCreatingTestContact(true);
    const response = await fetch(`${API_URL}/merge_crm/test_account`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + userToken,
      },
    });
    setCreatingTestContact(false);

    showNotification({
      title: "Test Account Created in CRM!",
      message: 'Open up your CRM and find the Account named "SellScale Test"',
      color: "blue",
      icon: <IconCircleCheck />,
      autoClose: 5000,
    });
  };

  useEffect(() => {
    getIntegrations();
  }, [userToken]);

  const onSuccess = useCallback((public_token: string) => {
    setConnecting(false);
    postAccountToken(public_token).then((data) => {
      // fetch integrations
      getIntegrations();
    });
  }, []);

  // (Integration 2/3) Open the Merge Modal to connect to CRM
  const { open, isReady } = useMergeLink({
    linkToken: linkToken,
    onSuccess,
    // tenantConfig: {
    // apiBaseURL: "https://api-eu.merge.dev" /* OR your specified single tenant API base URL */
    // },
  });

  return (
    <Card ml="md">
      <Flex direction={"column"} px={"sm"} mb={"md"}>
        <Text fw={600} size={28}>
          CRM Connection
        </Text>
        <Text>
          Automatically add and update leads, contacts, and accounts in your
          CRM.
        </Text>
      </Flex>
      <Paper withBorder m="xs" p="lg" radius="md" bg={"#fcfcfd"}>
        <Flex align={"center"} justify={"space-between"} w="100%">
          <Flex align={"center"} gap={"sm"}>
            {integration &&
            IntegrationToIconMap.get(integration.integration) ? (
              IntegrationToIconMap.get(integration.integration)
            ) : (
              <IconNetwork />
            )}
            <Box>
              <Text fw={600}>
                {integration ? (
                  <span>
                    {integration?.end_user_organization_name}'s{" "}
                    {integration.integration} CRM{" "}
                  </span>
                ) : (
                  "Connect your CRM to SellScale"
                )}
              </Text>
              {/* <Text color="gray" size="sm">
                Integration POC: {integration?.end_user_email_address}
              </Text> */}
            </Box>
          </Flex>
          <Button
            ml="lg"
            className={integration ? "" : "bg-black"}
            variant={integration ? "outline" : "filled"}
            color={integration ? "red" : "black"}
            disabled={!isReady}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            loading={connecting}
            onClick={() => {
              if (integration) {
                deleteIntegration().then((data) => {
                  getIntegrations();
                });
              } else {
                setConnecting(true);
                getLinkToken().then(() => {
                  open();
                });
              }
            }}
          >
            {integration ? "Disconnect" : "Connect"}
          </Button>
        </Flex>
        <Divider my="md" />
        <Text color="gray" size={"xs"} mt={"md"}>
          Add SellScale to your CRM via integration to automatically transfer
          lead, contact, opportunity, and account information between SellScale
          and your CRM. This is the recommended option as it allows you to get
          real time alerts and visibility into company and people activities.
        </Text>
      </Paper>

      {integration && crmSync && (
        <Paper withBorder m="xs" p="lg" radius="md" bg={"#fcfcfd"}>
          <Text size="22px" fw="500">
            CRM Connection Settings
          </Text>
          <Divider mt="md" />

          <Flex my="md">
            <CRMSyncableModels
              integration={integration}
              supportedModels={supportedModels}
              crmSync={crmSync}
            />
          </Flex>

          <CRMUserMapping />
          <StageMapping />
          <CRMEventHandler />
        </Paper>
      )}
    </Card>
  );
};

export default CRMConnectionPage;
