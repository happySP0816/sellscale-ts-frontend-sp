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
import React, { FC, useState } from "react";
import { ReactNode } from "react";
import { IconMessage } from "@tabler/icons-react";
import StatDisplay from "./CampaignDetail/StatDisplay";
import { FaLinkedin } from "@react-icons/all-files/fa/FaLinkedin";
import Contacts from "./CampaignDetail/Contacts";
import Linkedin from "./CampaignDetail/Linkedin";
import Email from './CampaignDetail/Email';

export const CampaignDetail = () => {
  const theme = useMantineTheme();
  const [activeTab, setActiveTab] = useState<string | null>("contacts");
  return (
    <Box bg={"white"} mih={"100vh"}>
      <Container pt='xl'>
        <Box pb='xl'>
          <Anchor
            href="/campaigns"
            style={{ display: "inline-flex", gap: "0.25rem" }}
          >
            <IconArrowLeft />

            <Text c={"black"} fw={500} fz='sm' mt='2px'>
              Campaigns
            </Text>
          </Anchor>
        </Box>

        <Flex>
          {/* circle button */}
          <Button size='lg' variant='subtle' radius='xl' color='blue'>
            🐍
          </Button>
          <Title order={3} mt='10px' ml='4px'>
            H1 Leaders in HR in the EMEA Region
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
                Adam Meehan
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
              total={52}
              percentageColor="#eaf3ff"
              percentage="50%"
            />

            <Divider orientation="vertical"></Divider>

            <StatDisplay
              color="#fd4efe"
              icon={<IconChecks color={"#fd4efe"} size="20" />}
              label="Open"
              total={52}
              percentage="50%"
              percentageColor="#ffeeff"
            />

            <Divider orientation="vertical"></Divider>

            <StatDisplay
              color="#fd7e14"
              icon={<IconMessage color={theme.colors.orange[6]} size="20" />}
              label="Reply"
              total={52}
              percentage="50%"
              percentageColor="#f9e7dc"
            />

            <Divider orientation="vertical"></Divider>

            <StatDisplay
              color="#40c057"
              icon={<IconCalendar color={theme.colors.green[6]} size="20" />}
              label="Demo"
              total={52}
              percentageColor="#e2f6e7"
              percentage="50%"
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
                  cursor: 'pointer'
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
              >
                Email
              </Tabs.Tab>
            </Box>
          </Tabs.List>

          <Tabs.Panel value="contacts">
            <Contacts />
          </Tabs.Panel>
          <Tabs.Panel value="linkedin">
            <Linkedin />
          </Tabs.Panel>
          <Tabs.Panel value="email">
            <Email />
          </Tabs.Panel>
        </Tabs>
      </Container>
    </Box>
  );
};
