import PageFrame from "@common/PageFrame";
import { Text } from "@mantine/core";
import { useVesselLink } from "@vesselapi/react-vessel-link";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Button, Card, Title, Notification } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconCheck } from "@tabler/icons";

function VesselIntegrations() {
  const userToken = useRecoilValue(userTokenState);
  const [isConnected, setConnected] = useState(false);
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
          console.log(result);
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
        console.log(j.linkToken);
        return j.linkToken;
      });
  };

  useEffect(() => {
    getSalesEngagementConnection();
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

    console.log("Getting sales engagement connection.");
    fetch(
      "https://sellscale-api-prod.onrender.com/integration/vessel/sales-engagement-connection",
      requestOptions
    )
      .then((res) => {
        var data = res.json();
        return data;
      })
      .then((j) => {
        console.log("here");
        console.log(j);
        if ("connected" in j && j["connected"]) {
          setConnected(true);
        } else {
          setConnected(false);
        }
      })
      .catch((e) => console.log(e));
  };

  return (
    <Card maw={800}>
      <Title order={3}>
        Connect SellScale to your Sales Engagement tool of choice.
      </Title>
      <Text mb="lg">
        By connecting SellScale to a sales engagement tool (like Outreach or
        Salesloft), we can automatically personalize contacts, enroll in
        sequences, and collect analytics.
      </Text>
      {isConnected ? (
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
      ) : (
        <>
          <Button
            color={"green"}
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
            color={"blue"}
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
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <PageFrame>
      <Title order={1} mb="md">
        Settings
      </Title>

      <VesselIntegrations />
    </PageFrame>
  );
}
