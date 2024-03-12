import React, { useEffect, useState } from "react";
import BumpFrameworksPage from "./BumpFrameworksPage";
import {
  Box,
  Flex,
  Tabs,
  rem,
  Text,
  Switch,
  Divider,
  LoadingOverlay,
  Tooltip,
  Title,
} from "@mantine/core";
import ChannelsSetupSelector from "./channels";
import EmailSequencingPage from "./EmailSequencingPage";
import { currentProjectState } from "@atoms/personaAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { useLoaderData } from "react-router-dom";
import { userTokenState } from "@atoms/userAtoms";
import ICPFilters from "@common/persona/ICPFilter/ICPFilters";
import { IconBooks, IconBrandLinkedin, IconMailOpened, IconUser } from "@tabler/icons";
import postTogglePersonaActive from "@utils/requests/postTogglePersonaActive";
import { showNotification } from "@mantine/notifications";
import { openConfirmModal } from "@mantine/modals";
import ComingSoonCard from '@common/library/ComingSoonCard';
import AssetLibrary from './AssetLibrary';
import AssetLibraryRetool from './AssetLibraryRetool';
import { filterProspectsState } from "@atoms/icpFilterAtoms";
import { getSDRAssets } from "@utils/requests/getAssets";

export default function ChannelSetupPage() {
  const { channelType, tabId } = useLoaderData() as {
    channelType: string;
    tabId: string;
  };
  const [activeTab, setActiveTab] = useState<string | null>(channelType);
  const userToken = useRecoilValue(userTokenState);

  const [icpProspects] = useRecoilState(filterProspectsState);
  const [assets, setAssets] = useState([] as any[]);

  const [selectedChannel, setSelectedChannel] = React.useState(channelType);
  const currentProject = useRecoilValue(currentProjectState);
  const [isEnabledEmail, setEnabledEmail] = useState(
    currentProject?.email_active
  );
  const [isEnabledLinkedin, setEnabledLinkedin] = useState(
    currentProject?.linkedin_active
  );

  const [togglingLinkedin, setTogglingLinkedin] = useState(false);
  const [togglingEmail, setTogglingEmail] = useState(false);

  useEffect(() => {
    setEnabledEmail(currentProject?.email_active);
    setEnabledLinkedin(currentProject?.linkedin_active);
  }, [currentProject?.linkedin_active, currentProject?.email_active]);

  const onToggleEmail = async () => {
    openConfirmModal({
      title: (
        <Title order={3}>
          {isEnabledEmail ? "Disable Email Outbound" : "Enable Email Outbound"}
        </Title>
      ),
      children: (
        <>
          {isEnabledEmail ? (
            <>
              <Text fw="bold" fz="lg">
                Once deactivated:
              </Text>
              <Text mt="xs" fz="md">
                🔴 No new emails will be fetched for your contacts.
              </Text>
              <Text mt="2px" fz="md">
                🔴 No new messages will be sent.
              </Text>
            </>
          ) : (
            <>
              <Text fw="bold" fz="lg">
                Once activated:
              </Text>
              <Text mt="xs" fz="md">
                ✅ SellScale finds and verifies emails for your contacts.
              </Text>
              <Text mt="2px" fz="md">
                ✅ Emails will generate and send daily.
              </Text>
              <Text mt="2px" fz="md">
                🔴 You be unable to add or remove steps to the sequencing for this campaign.
              </Text>
            </>
          )}
        </>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      confirmProps: {color: isEnabledEmail ? "red" : "green"},
      onCancel: () => {},
      onConfirm: () => {
        toggleEmail();
      },
    });
  };

  const toggleEmail = async () => {
    setTogglingEmail(true);
    const result = await postTogglePersonaActive(
      userToken,
      Number(currentProject?.id),
      "email",
      !isEnabledEmail
    );

    setTogglingEmail(false);

    if (result.status == "success") {
      setEnabledEmail(!isEnabledEmail);
      if (!isEnabledEmail) {
        showNotification({
          title: "✅ Enabled",
          message:
            "Email outbound has been toggled on, new messages will be sent.",
        });

        showNotification({
          title: "📧 Fetching emails...",
          message:
            "We are fetching emails for your contacts. This may take a few minutes.",
          color: "blue",
          autoClose: 15000,
        });
      } else {
        showNotification({
          title: "🔴 Disabled",
          message:
            "Email outbound has been toggled, no new messages will be sent.",
        });
      }
    }
  };

  const onToggleLinkedin = async () => {
    openConfirmModal({
      title: "Are you sure?",
      children:
        "Are you sure you want to " +
        (isEnabledLinkedin ? "🔴 disable" : "✅ enable") +
        " LinkedIn outbound for this campaign?",
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => {},
      onConfirm: () => {
        toggleLinkedin();
      },
    });
  };

  const toggleLinkedin = async () => {
    setTogglingLinkedin(true);
    const result = await postTogglePersonaActive(
      userToken,
      Number(currentProject?.id),
      "linkedin",
      !isEnabledLinkedin
    );

    setTogglingLinkedin(false);

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

  const triggerGetAssets = async () => {
    const result = await getSDRAssets(userToken, currentProject!.id);
    if (result.status === "success") {
      setAssets(result.data);
    }
  }

  useEffect(() => {
    triggerGetAssets();
  }, [currentProject?.id])

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
                {`Filter ${icpProspects.length} Contacts`}
              </Tabs.Tab>
              <Tabs.Tab
                value="linkedin"
                icon={<IconBrandLinkedin size={"0.8rem"} />}
                // disabled={!isEnabledLinkedin}
                ml="xs"
              >
                <Flex align={"center"} gap={"md"}>
                  <Text>Linkedin</Text>

                  <LoadingOverlay visible={togglingLinkedin} />

                  <Tooltip
                    label={
                      isEnabledLinkedin ? "Disable Linkedin" : "Enable Linkedin"
                    }
                    position="bottom"
                    withArrow
                    withinPortal
                  >
                    <Box>
                      <Switch
                        size="xs"
                        sx={{ zIndex: 200, cursor: "pointer" }}
                        color={activeTab === "linkedin" ? "green" : "blue"}
                        checked={isEnabledLinkedin}
                        onChange={onToggleLinkedin}
                      />
                    </Box>
                  </Tooltip>
                </Flex>
              </Tabs.Tab>
              <Tabs.Tab
                value="email"
                icon={<IconMailOpened size={"0.8rem"} />}
                // disabled={!isEnabledEmail}
                ml="xs"
              >
                <Flex align={"center"} gap={"md"}>
                  <Text>Email</Text>

                  <LoadingOverlay visible={togglingEmail} />

                  <Tooltip
                    label={isEnabledEmail ? "Disable Email" : "Enable Email"}
                    position="bottom"
                    withArrow
                    withinPortal
                  >
                    <Box>
                      <Switch
                        size="xs"
                        sx={{ zIndex: 200 }}
                        color={activeTab === "email" ? "green" : "blue"}
                        checked={isEnabledEmail}
                        onChange={onToggleEmail}
                      />
                    </Box>
                  </Tooltip>
                </Flex>
              </Tabs.Tab>

              <Tabs.Tab
                value="assets"
                icon={<IconBooks size={"0.8rem"} />}
                // disabled={!isEnabledEmail}
                ml="auto"
              >
                <Flex align={"center"} gap={"md"}>
                  <Text>{`${assets.length} Used Assets`}</Text>
                </Flex>
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="filter_contact">
              <ICPFilters hideTitleBar />
            </Tabs.Panel>
            <Tabs.Panel value="assets">
              <AssetLibraryRetool />
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
