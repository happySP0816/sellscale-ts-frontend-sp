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
} from "@mantine/core";
import { IconCircleCheck, IconNetwork, IconPlugConnected } from "@tabler/icons";
import React, { useCallback, useEffect, useState } from "react";

import { useMergeLink } from "@mergeapi/react-merge-link";
import { API_URL } from "@constants/data";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import _ from "lodash";
import CRMUserMapping from "../CRMConnection/CRMMapping";
import StageMapping from "../CRMConnection/StageMapping";
import CRMEventHandler from "../CRMConnection/CRMEventHandler";


type MergeIntegrationType = {
  id: string;
  integration: string;
  integration_slug: string;
  category: string;
  end_user_origin_id: string;
  end_user_organization_name: string;
  end_user_email_address: string;
  status: string;
  webhook_listener_url: string;
  is_duplicate: boolean;
};

const CRMConnectionPage: React.FC = () => {
  const userToken = useRecoilValue(userTokenState);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [linkToken, setLinkToken] = useState<string>("");
  const [integration, setIntegration] = useState<MergeIntegrationType>();
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
    setIntegration(data.integration);
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

  const [crmSetup, setCRMSetup] = useState([
    {
      title: "Leads vs Account + Contacts",
      content:
        "Depending on how your Sales Org structures your CRM, you can choose to sync SellScale prospects as 'leads' or 'account+contact' combination.",
      activate: true,
    },
  ]);

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
        <Flex align={"center"} justify={"space-between"} w='100%'>
          <Flex align={"center"} gap={"sm"}>
            <IconNetwork />
            <Box>
              <Text fw={600}>
                {integration ? (
                  <span>
                    {integration.integration} CRM{" "}
                    <span style={{ fontWeight: 400 }}>connected to</span>{" "}
                    {integration?.end_user_organization_name}
                  </span>
                ) : (
                  "Connect to your CRM to SellScale"
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
                  open()
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
          contact, lead, and account information between SellScale and your CRM.
          This is the recommended option as it allows you to get real time
          alerts and visibility into company and people activities.
        </Text>
      </Paper>

      {integration && (
        <Paper withBorder m="xs" p="lg" radius="md" bg={"#fcfcfd"}>
          <Text size="22px" fw="500">
            CRM Connection Settings
          </Text>
          <Divider mt="md" />

          <Divider
            labelPosition="left"
            label={
              <Text fw={500} size={"lg"}>
                {" "}
                CRM Setup
              </Text>
            }
            mb={"sm"}
            mt={"lg"}
          />
          <Flex direction={"column"} gap={"sm"}>
            {crmSetup.map((item, index) => {
              return (
                <Flex direction={"column"} key={index}>
                  <label
                    htmlFor={item?.title}
                    style={{
                      borderRadius: "8px",
                      width: "100%",
                    }}
                  >
                    <Flex
                      align={"center"}
                      justify={"space-between"}
                      style={{
                        borderRadius: "6px",
                        background: item?.activate ? "" : "#f6f6f7",
                        border: item?.activate ? "1px solid #dee2e6" : "",
                      }}
                      p={"xs"}
                    >
                      <Flex direction={"column"} maw={"60%"}>
                        <Text fw={600} mt={2} size={"sm"} color="gray">
                          {item?.title}
                        </Text>
                        <Text color="gray" size={"xs"}>
                          {item?.content}
                        </Text>
                      </Flex>
                      <Flex>
                        <Text mt="6px" mr="sm" fz="sm" color="gray">
                          Sync type:
                        </Text>
                        <Select
                          data={["Sync Leads", "Sync Account+Leads"]}
                          value={"Sync Leads"}
                          defaultValue={"Sync Leads"}
                        />
                      </Flex>
                    </Flex>
                  </label>
                </Flex>
              );
            })}
          </Flex>

          <Divider
            labelPosition="left"
            label={
              <Text fw={500} size={"lg"}>
                {" "}
                Test Connection
              </Text>
            }
            mb={"sm"}
            mt={"lg"}
          />
          <Card withBorder>
            <Flex>
              <Text mt="4px">
                Add a test `Account` named "SellScale Test" to your CRM to
                verify the connection.
              </Text>
              <Button
                ml="auto"
                variant="outline"
                color="blue"
                loading={creatingTestContact}
                onClick={() => createTestAccount()}
              >
                Add Test Account
              </Button>
            </Flex>
          </Card>
          <CRMUserMapping />
          <StageMapping />
          <CRMEventHandler />
          
        </Paper>
      )}
    </Card>
  );
};

export default CRMConnectionPage;
