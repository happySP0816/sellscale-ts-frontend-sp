import {
  Anchor,
  Avatar,
  Box,
  Container,
  Divider,
  Flex,
  Text,
  rem,
  MantineColor,
  Badge,
  useMantineTheme,
  Tabs,
  Button,
  Title,
  Loader,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconExternalLink,
  IconSend,
  IconChecks,
  IconCalendar,
  IconUsers,
  IconRecordMail,
  IconMail,
  IconSettings,
  IconTargetArrow,
} from "@tabler/icons";
import React, { FC, useEffect, useState } from "react";
import { ReactNode } from "react";
import { IconMessage } from "@tabler/icons-react";
import StatDisplay from "./CampaignDetail/StatDisplay";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import Contacts from "./CampaignDetail/Contacts";
import Linkedin from "./CampaignDetail/Linkedin";
import Email from "./CampaignDetail/Email";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";

interface EmailSequence {
  bumped_count: number;
  description: string;
  overall_status: string;
  title: string;
  assets: {
    asset_key: string;
    asset_raw_value: null;
    asset_tags: string[];
    asset_type: string;
    asset_value: string;
    client_archetype_ids: number[];
    client_id: number;
    id: number;
    num_opens: number;
    num_replies: number;
    num_sends: number;
  }[];
}

interface LinkedInSequence {
  // bump_framework_id?: number;
  bumped_count: number;
  description: string;
  title: string;
  assets: {
    asset_key: string;
    asset_raw_value: null;
    asset_tags: string[];
    asset_type: string;
    asset_value: string;
    client_archetype_ids: number[];
    client_id: number;
    id: number;
    num_opens: number;
    num_replies: number;
    num_sends: number;
  }[];
}

interface TopCompanies {
  company: string;
  count: number;
}

interface TopIndustries {
  count: number;
  industry: string;
}

interface TopTitles {
  count: number;
  title: string;
}

export interface CampaignEntityData {
  contacts: {
    included_company_generalized_keywords: string[];
    included_company_industries_keywords: string[];
    included_company_locations_keywords: string[];
    included_company_name_keywords: string[];
    included_individual_generalized_keywords: string[];
    included_individual_industry_keywords: string[]; //
    included_individual_locations_keywords: string[]; //
    included_individual_skills_keywords: string[]; //
    included_individual_title_keywords: string[]; //
    sample_contacts: string[];
  };
  email: {
    sequence: EmailSequence[];
  };
  linkedin: {
    sequence: LinkedInSequence[];
  };
  overview: {
    archetype_name: string;
    emoji: string;
    num_demos: number;
    num_opens: number;
    num_replies: number;
    num_sent: number;
    sdr_name: string;
  };
  assets_used: {
    title: string;
    value: string;
    reason: string;
  }[];
  top_attributes: {
    top_companies: TopCompanies[];
    top_industries: TopIndustries[];
    top_titles: TopTitles[];
  };
}

export const CampaignDetail = () => {
  const theme = useMantineTheme();
  const [activeTab, setActiveTab] = useState<string | null>("contacts");
  const [apiData, setApiData] = useState<CampaignEntityData | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const userToken = useRecoilValue(userTokenState);
  const archetype_id = window.location.pathname.split("/")[2];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${API_URL}/client/campaign_overview?client_archetype_id=${archetype_id}`,
          {
            headers: {
              Authorization: "Bearer " + userToken,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: CampaignEntityData = await response.json();
        setApiData(data);
      } catch (error) {
        console.error("Error fetching API data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "50px",
        }}
      >
        <Loader />
      </Container>
    );
  }

  return (
    <Box bg={"white"} mih={"100vh"} pb="xl">
      <Container pt="xl">
        <Box pb="xl">
          <Anchor
            href="/campaigns"
            style={{ display: "inline-flex", gap: "0.25rem" }}
          >
            <IconArrowLeft />

            <Text c={"black"} fw={500} fz="sm" mt="2px">
              Campaigns
            </Text>
          </Anchor>
        </Box>

        <Flex>
          {/* circle button */}
          <Button size="lg" variant="subtle" radius="xl" color="blue" fz={"xl"}>
            {apiData?.overview.emoji}
          </Button>
          <Title order={3} mt="10px" ml="4px">
            {apiData?.overview.archetype_name}
          </Title>
        </Flex>

        <Flex align={"center"} mt={"sm"} gap={"md"}>
          <Flex gap={"sm"} align={"center"}>
            <Text fw={600}>SDR:</Text>
            <Flex
              sx={(theme) => ({
                border: `1px solid ${
                  theme.colors.blue[theme.fn.primaryShade()]
                }`,
                borderRadius: rem(12),
              })}
              align={"center"}
              gap={"xs"}
              px={"xs"}
            >
              <Avatar size={"sm"} />
              <Text fw={500} fz={"sm"}>
                {apiData?.overview.sdr_name}
              </Text>
              <Anchor
                href="/"
                size="sm"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconExternalLink size={"1rem"} />
              </Anchor>
            </Flex>
          </Flex>

          <Flex
            px={"xs"}
            py={"xs"}
            gap={"sm"}
            align={"center"}
            sx={(theme) => ({
              border: `1px solid ${theme.colors.gray[2]}`,
              borderRadius: rem(12),
              flex: 1,
            })}
            wrap={"wrap"}
          >
            <StatDisplay
              color="#228be6"
              icon={<IconSend color={theme.colors.blue[6]} size="20" />}
              label="Sent"
              total={apiData?.overview.num_sent || 0}
              percentageColor="#eaf3ff"
              percentage="100%"
            />

            <Divider orientation="vertical"></Divider>

            <StatDisplay
              color="#fd4efe"
              icon={<IconChecks color={"#fd4efe"} size="20" />}
              label="Open"
              total={apiData?.overview.num_opens || 0}
              percentage={
                apiData?.overview.num_opens
                  ? `${Math.round(
                      (apiData?.overview.num_opens /
                        (apiData?.overview.num_sent + 0.00001)) *
                        100
                    )}%`
                  : "0%"
              }
              percentageColor="#ffeeff"
            />

            <Divider orientation="vertical"></Divider>

            <StatDisplay
              color="#fd7e14"
              icon={<IconMessage color={theme.colors.orange[6]} size="20" />}
              label="Reply"
              total={apiData?.overview.num_replies || 0}
              percentage={
                apiData?.overview.num_replies
                  ? `${Math.round(
                      (apiData?.overview.num_replies /
                        (apiData?.overview.num_opens + 0.0001)) *
                        100
                    )}%`
                  : "0%"
              }
              percentageColor="#f9e7dc"
            />

            <Divider orientation="vertical"></Divider>

            <StatDisplay
              color="#40c057"
              icon={<IconCalendar color={theme.colors.green[6]} size="20" />}
              label="Demo"
              total={apiData?.overview.num_demos || 0}
              percentageColor="#e2f6e7"
              percentage={
                apiData?.overview.num_demos
                  ? `${Math.round(
                      (apiData?.overview.num_demos /
                        (apiData?.overview.num_replies + 0.0001)) *
                        100
                    )}%`
                  : "0%"
              }
            />
          </Flex>
        </Flex>

        <Divider my={"md"} />

        <Tabs
          value={activeTab}
          onTabChange={setActiveTab}
          orientation="vertical"
          styles={(theme) => ({
            tabRightSection: {
              marginLeft: rem(4),
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            },
            tab: {
              width: "100%",

              margin: 0,
              fontWeight: 600,
              color: theme.colors.gray[6],
              "&[data-active]": {
                backgroundColor: theme.colors.blue[0],
                color: theme.colors.blue[6],
                borderRightWidth: 0,
                border: 0,
                outline: "none",
              },
              "&:disabled": {
                opacity: 0.5,
                cursor: "not-allowed",
                color: theme.colors.gray[4],
              },
              borderRightWidth: 0,
            },
            tabLabel: {
              fontSize: rem(16),
              fontWeight: 600,
              marginLeft: 4,
            },
            tabIcon: {
              display: "flex",
              alignItems: "center",
            },

            tabsList: {
              borderRightWidth: 0,
              width: 200,
              paddingRight: 20,
            },
          })}
        >
          <Tabs.List>
            <Tabs.Tab icon={<IconUsers size={"1rem"} />} value="contacts">
              Contacts
            </Tabs.Tab>
            <Box>
              <Flex
                pr={16}
                pl={10}
                py={10}
                align={"center"}
                sx={(theme) => ({
                  backgroundColor:
                    activeTab === "linkedin" || activeTab === "email"
                      ? theme.colors.blue[0]
                      : "transparent",
                  color:
                    activeTab === "linkedin" || activeTab === "email"
                      ? theme.colors.blue[6]
                      : theme.colors.gray[6],
                  cursor: "pointer",
                })}
                onClick={() => setActiveTab("linkedin")}
              >
                <Flex align={"center"} justify={"center"}>
                  <IconTargetArrow size={"1rem"} />
                </Flex>
                <Text fz={rem(16)} fw={600} lh={rem(16)} ml={8}>
                  Sequence
                </Text>
              </Flex>
              <Tabs.Tab
                icon={<FaLinkedin size={"1rem"} />}
                value="linkedin"
                ml={rem(16)}
                sx={{
                  background: "transparent !important",
                }}
                disabled={apiData?.linkedin.sequence.length === 0}
              >
                Linkedin
              </Tabs.Tab>
              <Tabs.Tab
                icon={<IconMail size={"1rem"} />}
                value="email"
                ml={rem(16)}
                sx={{
                  background: "transparent !important",
                }}
                disabled={apiData?.email.sequence.length === 0}
              >
                Email
              </Tabs.Tab>
            </Box>
          </Tabs.List>

          <Tabs.Panel value="contacts">
            <Contacts data={apiData} />
          </Tabs.Panel>
          <Tabs.Panel value="linkedin">
            <Linkedin data={apiData} />
          </Tabs.Panel>
          <Tabs.Panel value="email">
            <Email data={apiData} />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Box>
  );
};
