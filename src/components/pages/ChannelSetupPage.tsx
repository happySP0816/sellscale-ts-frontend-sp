import React, { useState } from "react";
import BumpFrameworksPage from "./BumpFrameworksPage";
import { Box, Flex, Tabs, rem, Text, Switch, Divider } from "@mantine/core";
import ChannelsSetupSelector from "./channels";
import EmailSequencingPage from "./EmailSequencingPage";
import { currentProjectState } from "@atoms/personaAtoms";
import { useRecoilValue } from "recoil";
import { useLoaderData } from "react-router-dom";
import { userTokenState } from "@atoms/userAtoms";
import ICPFilters from "@common/persona/ICPFilter/ICPFilters";
import { IconBrandLinkedin, IconMailOpened, IconUser } from "@tabler/icons";
import postTogglePersonaActive from "@utils/requests/postTogglePersonaActive";
import { showNotification } from "@mantine/notifications";

export default function ChannelSetupPage() {
  const { channelType, tabId } = useLoaderData() as {
    channelType: string;
    tabId: string;
  };
  const [activeTab, setActiveTab] = useState<string | null>(channelType);
  const userToken = useRecoilValue(userTokenState);
  const [selectedChannel, setSelectedChannel] = React.useState(channelType);
  const currentProject = useRecoilValue(currentProjectState);
  const [isEnabledEmail, setEnabledEmail] = useState(
    currentProject?.email_active
  );
  const [isEnabledLinkedin, setEnabledLinkedin] = useState(
    currentProject?.linkedin_active
  );

  const onToggleEmail = async () => {
    const result = await postTogglePersonaActive(
      userToken,
      Number(currentProject?.id),
      "email",
      !isEnabledEmail
    );

    if (result.status == "success") {
      setEnabledEmail(!isEnabledEmail);
      if (!isEnabledEmail) {
        showNotification({
          title: "Success",
          message:
            "Email outbound has been toggled on, new messages will be sent.",
        });
      } else {
        showNotification({
          title: "Success",
          message:
            "Email outbound has been toggled, no new messages will be sent.",
        });
      }
    }
  };

  const onToggleLinkedin = async () => {
    const result = await postTogglePersonaActive(
      userToken,
      Number(currentProject?.id),
      "linkedin",
      !isEnabledLinkedin
    );

    if (result.status == "success") {
      setEnabledLinkedin(!isEnabledLinkedin);
      if (!isEnabledLinkedin) {
        showNotification({
          title: "Success",
          message:
            "LinkedIn outbound has been toggled on, new messages will be sent.",
        });
      } else {
        showNotification({
          title: "Success",
          message:
            "LinkedIn outbound has been toggled, no new messages will be sent.",
        });
      }
    }
  };
  return (
    <Box>
      <ChannelsSetupSelector
        setSelectedChannel={setSelectedChannel}
        selectedChannel={selectedChannel}
        hideChannels={true}
      />

      <Box px={"xl"}>
        {currentProject && (
          <Tabs
            value={activeTab}
            onTabChange={setActiveTab}
            defaultValue={channelType}
            styles={(theme) => ({
              tabsList: {
                // backgroundColor: theme.colors.blue[theme.fn.primaryShade()],

                height: "44px",
              },
              panel: {
                backgroundColor: theme.white,
              },
              tab: {
                ...theme.fn.focusStyles(),
                // color: theme.white,
                backgroundColor: theme.white,
                marginBottom: 0,
                paddingLeft: 20,
                paddingRight: 20,
                color: theme.colors.blue[theme.fn.primaryShade()],
                "&:hover": {
                  // color: theme.white,
                },
                "&[data-active]": {
                  backgroundColor: theme.colors.blue[theme.fn.primaryShade()],
                  borderBottomColor: theme.white,
                  color: theme.white,
                },
                "&:disabled": {
                  backgroundColor: theme.colors.gray[theme.fn.primaryShade()],
                  color: theme.colors.gray[4],
                },
              },
              tabLabel: {
                fontWeight: 700,
                fontSize: rem(14),
              },
            })}
          >
            <Tabs.List>
              <Tabs.Tab
                value="filter_contact"
                icon={<IconUser size={"0.8rem"} />}
              >
                Filter Contact
              </Tabs.Tab>
              <Tabs.Tab
                value="linkedin"
                icon={<IconBrandLinkedin size={"0.8rem"} />}
                disabled={!isEnabledLinkedin}
              >
                <Flex align={"center"} gap={"md"}>
                  <Text>Linkedin</Text>

                  <Switch
                    size="xs"
                    sx={{ zIndex: 200 }}
                    color={activeTab === "linkedin" ? "green" : "blue"}
                    checked={isEnabledLinkedin}
                    onChange={onToggleLinkedin}
                  />
                </Flex>
              </Tabs.Tab>
              <Tabs.Tab
                value="email"
                icon={<IconMailOpened size={"0.8rem"} />}
                disabled={!isEnabledEmail}
              >
                <Flex align={"center"} gap={"md"}>
                  Email
                  <Switch
                    size="xs"
                    sx={{ zIndex: 200 }}
                    color={activeTab === "email" ? "green" : "blue"}
                    checked={isEnabledEmail}
                    onChange={onToggleEmail}
                  />
                </Flex>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="filter_contact">
              <ICPFilters />
            </Tabs.Panel>
            <Tabs.Panel value="linkedin">
              <Box
                sx={(theme) => ({
                  padding: theme.spacing.md,
                  width: "100%",
                })}
              >
                <BumpFrameworksPage hideTitle defaultTab={tabId} />
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="email">
              <Box
                sx={(theme) => ({
                  paddingTop: theme.spacing.md,
                  paddingBottom: theme.spacing.md,
                  width: "100%",
                })}
              >
                <EmailSequencingPage hideTitle />
              </Box>
            </Tabs.Panel>
          </Tabs>
        )}
      </Box>
    </Box>
  );
}
