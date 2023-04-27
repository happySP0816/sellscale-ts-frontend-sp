import PageFrame from "@common/PageFrame";
import { Flex, Paper, Select, SimpleGrid, Text } from "@mantine/core";
import { useVesselLink } from "@vesselapi/react-vessel-link";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { Button, Card, Title, Notification } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconCheck, IconX } from "@tabler/icons";
import PageTitle from "@nav/PageTitle";
import { useQuery } from "@tanstack/react-query";
import LinkedInConnectedCard from "@common/settings/LinkedInConnectedCard";
import { getUserInfo } from "@auth/core";
import NylasConnectedCard from "@common/settings/NylasConnectedCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { navigateToPage } from "@utils/documentChange";
import exchangeNylasClientID from "@utils/requests/exchangeNylasAuthCode";
import { disconnectVesselMailbox } from "@utils/requests/disconnectVesselMailbox";
import { connectVesselMailbox } from "@utils/requests/connectVesselMailbox";
import { showNotification } from "@mantine/notifications";

function VesselIntegrations() {
  const userToken = useRecoilValue(userTokenState);
  const [isConnected, setConnected] = useState(false);
  const [mailboxes, setMailboxes] = useState([]);
  const [connectedMailbox, setConnectedMailbox] = useState("");
  const [hasMailbox, setHasMailbox] = useState(false);

  const { open } = useVesselLink({
    onSuccess: (publicToken: any) => {
      var myHeaders = new Headers();
      myHeaders.append("Authorization", "Bearer " + userToken);
      myHeaders.append("Content-Type", "application/json");

      var raw = JSON.stringify({
        publicToken: publicToken,
      });

      var requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
      };

      fetch(
        "https://sellscale-api-prod.onrender.com/integration/vessel/exchange-link-token",
        requestOptions
      )
        .then((response) => response.text())
        .then((result) => {
          getSalesEngagementConnection();
        })
        .catch((error) => console.log("error", error));
    },
  });

  const getLinkToken = () => {
    return fetch(
      "https://sellscale-api-prod.onrender.com/integration/vessel/link-token",
      {
        method: "POST",
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((j) => {
        return j.linkToken;
      });
  };

  const getAvailableMailboxes = () => {
    fetch(
      "https://sellscale-api-prod.onrender.com/integration/vessel/mailboxes",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((j) => {
        console.log(j.mailboxes);
        setMailboxes(j.mailboxes);
        return;
      });

    return;
  };

  const getCurrentMailbox = () => {
    fetch(
      "https://sellscale-api-prod.onrender.com/integration/vessel/current_mailbox",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + userToken,
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((j) => {
        setConnectedMailbox(j.mailbox.id);
        setHasMailbox(true);
        return;
      });
  };

  useEffect(() => {
    getSalesEngagementConnection();
    getAvailableMailboxes();
    getCurrentMailbox();
  }, []);

  const getSalesEngagementConnection = () => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + userToken);
    myHeaders.append("Content-Type", "application/json");

    var requestOptions: any = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch(
      "https://sellscale-api-prod.onrender.com/integration/vessel/sales-engagement-connection",
      requestOptions
    )
      .then((res) => {
        let data = res.json();
        return data;
      })
      .then((j) => {
        if ("connected" in j && j["connected"]) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      })
      .catch((e) => console.log(e));
  };

  return (
    <Paper withBorder m="xs" p="md" radius="md">
      <Title order={3}>Connect to your Sales Engagement Tool</Title>
      <Text fz="sm" pt="xs" pb="lg">
        By connecting to a sales engagement tool (like Outreach or Salesloft),
        we can automatically personalize contacts, enroll in sequences, and
        collect analytics.
      </Text>
      {isConnected ? (
        <>
          <Notification
            closeButtonProps={{ opacity: 0 }}
            icon={<IconCheck size="1.1rem" />}
            title="Sales engagement tool already connected"
            bg={"blue"}
            color="white"
          >
            <Text color="white">
              If you would like to connect a different tool, please disconnect
              your current tool first. Contact a SellScale administrator if you
              need help.
            </Text>
          </Notification>

          <Card mt="md">
            {hasMailbox ? (
              <Notification
                closeButtonProps={{ opacity: 0 }}
                icon={<IconCheck size="1.1rem" />}
                title="Outbound email address selected"
                bg={"gray"}
                color="green"
                mb="sm"
              />
            ) : (
              <Notification
                closeButtonProps={{ opacity: 0 }}
                icon={<IconX size="1.1rem" />}
                title="Outbound email address not selected"
                bg={"gray"}
                color="red"
                mb="sm"
              />
            )}
            <Text fz="lg" color="white">
              Select outbounding email
            </Text>
            <Text mt="xs" fz="sm" color="white">
              To ensure that we send emails from the correct email address,
              please select the email address you use in your sales engagement
              tool.
            </Text>
            <Select
              mt="sm"
              label="Email Address"
              placeholder="Select email address"
              data={mailboxes.map((mailbox: any) => {
                return { value: mailbox?.id, label: mailbox.email };
              })}
              disabled={hasMailbox}
              value={connectedMailbox}
              onChange={(value: any) => {
                setConnectedMailbox(value);
              }}
              searchable
              nothingFound="No email addresses found"
              dropdownPosition="bottom"
              withinPortal
            />
            {hasMailbox ? (
              <Flex justify="flex-end" hidden={false}>
                <Button
                  mt="md"
                  color="red"
                  onClick={async () => {
                    const result = await disconnectVesselMailbox(userToken);
                    if (result.status === "success") {
                      showNotification({
                        id: "mailbox-disconnect-success",
                        title: "Mailbox disconnected",
                        message:
                          "Your outbounding mailbox has been disconnected, please connect another to use Email outbound.",
                        color: "blue",
                        autoClose: 5000,
                      });
                    } else {
                      showNotification({
                        id: "mailbox-disconnect-failure",
                        title: "Failed to disconnect",
                        message:
                          "Your outbounding mailbox could not be disconnected, please try again or contact SellScale for support.",
                        color: "red",
                        autoClose: 5000,
                      });
                    }
                    setHasMailbox(false);
                    setConnectedMailbox("");
                  }}
                >
                  Disconnect
                </Button>
              </Flex>
            ) : (
              <Flex justify="flex-end" hidden={connectedMailbox === ""}>
                <Button
                  mt="md"
                  color="green"
                  onClick={async () => {
                    const result = await connectVesselMailbox(
                      userToken,
                      parseInt(connectedMailbox)
                    );
                    if (result.status === "success") {
                      showNotification({
                        id: "mailbox-connect-success",
                        title: "Mailbox connected",
                        message:
                          "Your outbounding mailbox has been connected, you can now use Email outbound.",
                        color: "blue",
                        autoClose: 5000,
                      });
                    } else {
                      showNotification({
                        id: "mailbox-connect-failure",
                        title: "Failed to connect",
                        message:
                          "Your outbounding mailbox could not be connected, please try again or contact SellScale for support.",
                        color: "red",
                        autoClose: 5000,
                      });
                    }
                    setHasMailbox(true);
                  }}
                >
                  Save
                </Button>
              </Flex>
            )}
          </Card>
        </>
      ) : (
        <>
          <Button
            color={"green"}
            m="sm"
            mr="md"
            onClick={async () =>
              open({
                integrationId: "salesloft",
                linkToken: await getLinkToken(),
              })
            }
          >
            Connect to Salesloft
          </Button>
          <Button
            color={"orange"}
            m="sm"
            mr="md"
            onClick={async () =>
              open({
                integrationId: "apollo",
                linkToken: await getLinkToken(),
              })
            }
          >
            Connect to Apollo
          </Button>
          <Button
            color={"blue"}
            m="sm"
            mr="md"
            onClick={async () =>
              open({
                integrationId: "outreach",
                linkToken: await getLinkToken(),
              })
            }
          >
            Connect to Outreach
          </Button>
        </>
      )}
    </Paper>
  );
}

export default function SettingsPage() {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    setTimeout(() => {
      const nylasCode = searchParams.get("code");
      if (nylasCode) {
        (async () => {
          await exchangeNylasClientID(userToken, nylasCode);
          navigateToPage(navigate, "/settings");
          window.location.reload();
        })();
      }
    });
  }, []);

  useQuery({
    queryKey: [`query-get-accounts-connected`],
    queryFn: async () => {
      const info = await getUserInfo(userToken);
      setUserData(info);
      localStorage.setItem("user-data", JSON.stringify(info));
      return info;
    },
  });

  return (
    <PageFrame>
      <PageTitle title="Settings" />

      <SimpleGrid cols={2} spacing={0}>
        <VesselIntegrations />
        <LinkedInConnectedCard
          connected={userData ? userData.li_voyager_connected : false}
        />
        <NylasConnectedCard
          connected={userData ? userData.nylas_connected : false}
        />
      </SimpleGrid>
    </PageFrame>
  );
}
