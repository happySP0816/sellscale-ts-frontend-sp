import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import React, { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  Box,
  Card,
  Grid,
  Group,
  Text,
  Title,
  List,
  Loader,
  Button,
  Flex,
  TextInput,
  Textarea,
  Badge,
  Divider,
} from "@mantine/core";
import { IconMicrophone, IconNews, IconWriting } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { deterministicMantineColor } from "@utils/requests/utils";

export async function campaignCurator(
  userToken: string,
  additional_instructions: string
): Promise<any> {
  const response = await fetch(`${API_URL}/ml/campaigns/campaign_curator`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      additional_instructions: additional_instructions,
    }),
  });
  return await response.json();
}

export default function CampaignCurator() {
  const userToken = useRecoilValue(userTokenState);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [secondsSinceLaunch, setSecondsSinceLaunch] = useState(0);
  const [loading, setLoading] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const runCampaignCurator = async () => {
    setLoading(true);
    const data = await campaignCurator(userToken, additionalInstructions);
    setCampaignData(data);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceLaunch((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <Card
        withBorder
        p="xl"
        ml="auto"
        mr="auto"
        mt="xl"
        mb="xl"
        w="500px"
        sx={{ textAlign: "center" }}
      >
        <Text size="xl">Loading...</Text>
        <Loader variant="dots" />
      </Card>
    );
  }

  if (campaignData === null) {
    return (
      <Card
        withBorder
        p="xl"
        ml="auto"
        mr="auto"
        mt="xl"
        mb="xl"
        w="500px"
        sx={{ textAlign: "center" }}
      >
        <Title order={4}>Campaign Curator</Title>
        <Text size="xs">Run the campaign curator to get campaign ideas</Text>

        <Textarea
          mt="md"
          placeholder="Additional Instructions"
          minRows={3}
          onChange={(e) => setAdditionalInstructions(e.currentTarget.value)}
        />
        <Button
          mt="md"
          onClick={() => runCampaignCurator()}
          loading={loading}
          leftIcon={<IconSparkles size="0.9rem" />}
        >
          Run Campaign Curator
        </Button>

        <Divider label="OR" mt="sm" mb="sm" labelPosition="center" />

        <Button leftIcon={<IconMicrophone size="0.9rem" />} color="grape">
          Intake Strategy with Selina AI
        </Button>
      </Card>
    );
  }

  const { data, response } = campaignData;

  return (
    <Box p="xl">
      <Grid>
        <Grid.Col span={5}>
          <Card withBorder padding="lg">
            {secondsSinceLaunch >= 30 && (
              <Card withBorder mb="md">
                <Title order={4}>
                  Company Information{" "}
                  <Badge color="teal" ml="xs" size="sm">
                    3 points
                  </Badge>
                </Title>
                <Text size="xs">
                  <strong>Name:</strong> {data.company_name}
                </Text>
                <Text size="xs">
                  <strong>Description:</strong> {data.description}
                </Text>
                <Text size="xs">
                  <strong>Tagline:</strong> {data.tagline}
                </Text>
              </Card>
            )}

            {secondsSinceLaunch >= 35 && (
              <Card withBorder mb="md">
                <Title order={4}>
                  User Information{" "}
                  <Badge color="grape" ml="xs" size="sm">
                    2 points
                  </Badge>
                </Title>
                <Text size="xs">
                  <strong>Name:</strong> {data.user_name}
                </Text>
                <Text size="xs">
                  <strong>Title:</strong> {data.user_role}
                </Text>
              </Card>
            )}
            {secondsSinceLaunch >= 37 && (
              <Card withBorder mb="md">
                <Title order={4}>
                  Recent News{" "}
                  <Badge color="red" ml="xs" size="sm">
                    {data.recent_news.split("\n-").length} points
                  </Badge>
                </Title>
                <Text size="xs" sx={{ maxHeight: "300px", overflowY: "auto" }}>
                  {data.recent_news.split("\n-").map((x: any, idx: number) => (
                    <Flex>
                      <IconNews size={"4rem"} color="red" />
                      <Card withBorder mb="xs" key={idx}>
                        {x.replace("-")}
                        <br />
                      </Card>
                    </Flex>
                  ))}
                </Text>
              </Card>
            )}
            {secondsSinceLaunch >= 40 && (
              <Card withBorder mb="md">
                <Title order={4}>
                  Colleague Campaigns{" "}
                  <Badge color="blue" ml="xs" size="sm">
                    {data.top_colleague_campaigns.split("\n").length} points
                  </Badge>
                </Title>
                <Text size="xs" sx={{ maxHeight: "300px", overflowY: "auto" }}>
                  {data.top_colleague_campaigns
                    .split("\n")
                    .map((x: any, idx: number) => (
                      <Flex>
                        <IconWriting size={"4rem"} color="blue" />
                        <Card withBorder mb="xs" key={idx}>
                          {x}
                          <br />
                        </Card>
                      </Flex>
                    ))}
                </Text>
              </Card>
            )}
            {secondsSinceLaunch < 50 && <Loader />}
          </Card>
        </Grid.Col>
        <Grid.Col span={7}>
          {secondsSinceLaunch >= 50 && (
            <Card withBorder padding="lg" mb="xs">
              <Title order={4}>Campaign Ideas</Title>
              <List spacing="xs">
                {response.map((campaign: any, index: number) => (
                  <Card withBorder padding="lg" mb="sm" key={index}>
                    <Flex>
                      <Box w="85%">
                        <Group position="apart">
                          <Text size="md" mb="xs">
                            {campaign.emoji}{" "}
                            <strong>{campaign.campaign_title}</strong>
                          </Text>
                        </Group>
                        <Text size="xs" mb="xs">
                          <strong>ICP Target:</strong> {campaign.icp_target}
                        </Text>
                        <Text size="xs" mb="xs">
                          <strong>Strategy:</strong> {campaign.strategy}
                        </Text>
                        <Text size="xs" mb="xs">
                          <strong>Assets:</strong>{" "}
                          {campaign.assets.map((x: any) => (
                            <Badge
                              color={deterministicMantineColor(x)}
                              size="sm"
                              ml="xs"
                            >
                              {x}
                            </Badge>
                          ))}
                        </Text>
                        <Text size="xs" mb="xs">
                          <strong>Reason:</strong> {campaign.reason}
                        </Text>
                      </Box>
                      <Button size="xs" variant="light" ml="auto">
                        Use Strategy
                      </Button>
                    </Flex>
                  </Card>
                ))}
              </List>
            </Card>
          )}
        </Grid.Col>
      </Grid>
    </Box>
  );
}
