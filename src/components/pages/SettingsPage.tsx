import PageFrame from "@common/PageFrame";
import { Box, Container, Divider, Flex, Group, LoadingOverlay, Tabs, rem, Title } from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useEffect, useState } from "react";
import {
  IconAffiliate,
  IconBrandLinkedin,
  IconBrandSlack,
  IconCalendar,
  IconCloud,
  IconFishHook,
  IconInbox,
  IconRefresh,
  IconSausage,
  IconTrophy,
  IconWebhook,
} from "@tabler/icons";
import PageTitle from "@nav/PageTitle";
import { useQuery } from "@tanstack/react-query";
import LinkedInConnectedCard from "@common/settings/LinkedInIntegrationCard";
import { syncLocalStorage } from "@auth/core";
import NylasConnectedCard from "@common/settings/NylasConnectedCard";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import exchangeNylasClientID from "@utils/requests/exchangeNylasAuthCode";
import CalendarAndScheduling from "@common/settings/CalendarAndScheduling";
import { IconAdjustmentsFilled, IconBrain, IconHexagonalPrism, IconMessage2Bolt, IconTrashFilled } from "@tabler/icons-react";
import DoNotContactList from "@common/settings/DoNotContactList";
import SellScaleBrain from "@common/settings/SellScaleBrain";
import SettingPreferences from "@common/settings/SettingPreferences";
import MessageAutomation from "@common/settings/MessageAutomation";
import DoNotContactFiltersPage from "@common/settings/DoNotContactFiltersPage";
import { setPageTitle } from "@utils/documentChange";
import SettingsConversion from "@common/settings/SettingsConversion";
import SlackSettings from "@common/slack/SlackSettings";
import SettingUsage from "@common/settings/SettingUsage";
import exchangeSlackAuthCode from "@utils/requests/exchangeSlackAuthCode";
import ComingSoonCard from "@common/library/ComingSoonCard";
import CRMConnectionPage from "./CRMConnectionPage";
import ContactRecycling from "@common/settings/ContactRecycling";
import WebhookConnectionPage from "./WebhookConnectionPage";
import AccountSettings from "./AccountSettings";
import Organization from "@common/settings/Organization";

export default function SettingsPage() {
  setPageTitle("Settings");

  const { tabId } = useLoaderData() as { tabId: string };

  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = tabId || "usage";
  const [currentTab, setCurrentTab] = useState(defaultTab);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      if (tabId === "email") {
        exchangeNylasClientID(userToken, code).then((response) => {
          window.location.href = "/settings/email";
        });
      } else if (tabId === "slack") {
        exchangeSlackAuthCode(userToken, code).then((response) => {
          if (response.status === "success") {
            window.location.href = "/settings/slack";
          }
        });
      }
    }
  }, []);

  useQuery({
    queryKey: [`query-get-accounts-connected`],
    queryFn: async () => {
      await syncLocalStorage(userToken, setUserData);
      return true;
    },
  });

  return (
    <Box p={20}>
      <PageTitle title="Settings" />
      <Tabs
        value={currentTab}
        orientation="vertical"
        onTabChange={(i: any) => {
          setCurrentTab(i);
          navigate(`/settings/${i}`);
        }}
        styles={(theme) => ({
          root: {
            width: "100%",
          },
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
              border: `1px solid ${theme.colors.blue[6]}`,
              color: theme.colors.blue[6],
              backgroundColor: theme.colors.blue[0],
              borderRadius: 4,
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
            backgroundColor: "white",
            gap: rem(8),
            padding: rem(16),
            // width: 200,
            // paddingRight: 20,
          },
          panel: {
            maxWidth: "960px",
          },
        })}
      >
        <Tabs.List h={"fit-content"}>
          <Title color={["brain", "messages", "filters"].includes(currentTab) ? "blue" : "gray"} order={5} mt="lg" mb="xs">
            SETUP
          </Title>
          <Tabs.Tab value="brain" icon={<IconBrain size="0.8rem" />}>
            SellScale Brain
          </Tabs.Tab>

          <Tabs.Tab value="messages" icon={<IconMessage2Bolt size="0.8rem" />}>
            Message Automation
          </Tabs.Tab>
          <Tabs.Tab value="filters" icon={<IconTrashFilled size="0.8rem" />}>
            Do Not Contact Filters
          </Tabs.Tab>
          <Tabs.Tab value="contactRecycling" icon={<IconRefresh size="0.8rem" />}>
            Contact Recycling
          </Tabs.Tab>

          {/* <Divider /> */}
          {/* <Title
            color={
              ["pipeline", "conversion"].includes(currentTab) ? "blue" : "gray"
            }
            order={5}
            mt="lg"
            mb="xs"
          >
            ANALYTICS
          </Title> */}
          {/* <Tabs.Tab
              value="pipeline"
              icon={<IconAdjustmentsFilled size="0.8rem" />}
            >
              Pipeline
            </Tabs.Tab> */}
          {/* <Tabs.Tab value="conversion" icon={<IconTrophy size="0.8rem" />}>
            Conversion
          </Tabs.Tab> */}

          <Divider />
          <Title color={["linkedin", "email", "slack", "scheduling"].includes(currentTab) ? "blue" : "gray"} order={5} mt="lg" mb="xs">
            INTEGRATIONS
          </Title>
          <Tabs.Tab value="linkedin" icon={<IconBrandLinkedin size="0.8rem" />}>
            LinkedIn Connection
          </Tabs.Tab>
          <Tabs.Tab value="email" icon={<IconInbox size="0.8rem" />}>
            Email Connection
          </Tabs.Tab>
          <Tabs.Tab value="slack" icon={<IconBrandSlack size="0.8rem" />}>
            Slack Connection
          </Tabs.Tab>
          <Tabs.Tab value="scheduling" icon={<IconCalendar size="0.8rem" />}>
            Calendar Connection
          </Tabs.Tab>
          <Tabs.Tab value="crm" icon={<IconCloud size="0.8rem" />}>
            CRM Connection
          </Tabs.Tab>
          <Tabs.Tab value="webhooks" icon={<IconWebhook size="0.8rem" />}>
            Webhook Connection
          </Tabs.Tab>

          <Divider />

          <Title color={["account"].includes(currentTab) ? "blue" : "gray"} order={5} mt="lg" mb="xs">
            ACCOUNT
          </Title>

          <Tabs.Tab value="usage" icon={<IconSausage size="0.8rem" />}>
            Usage
          </Tabs.Tab>
          <Tabs.Tab value="account" icon={<IconHexagonalPrism size="0.8rem" />}>
            Account Settings
          </Tabs.Tab>
          {userData.role === "ADMIN" && (
            <Tabs.Tab value="organization" icon={<IconAffiliate size="0.8rem" />}>
              Organization
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="account" pl="xs">
          <AccountSettings />
        </Tabs.Panel>

        <Tabs.Panel value="organization" pl="xs">
          <Organization />
        </Tabs.Panel>

        <Tabs.Panel value="linkedin" pl="xs" w="60%">
          <LinkedInConnectedCard connected={userData ? userData.li_voyager_connected : false} />
        </Tabs.Panel>

        <Tabs.Panel value="email" pl="xs">
          <NylasConnectedCard connected={userData ? userData.nylas_connected : false} />
        </Tabs.Panel>

        <Tabs.Panel value="scheduling" pl="xs">
          <CalendarAndScheduling />
        </Tabs.Panel>

        <Tabs.Panel value="filters" pl="xs" w={"200px"}>
          {currentTab === "filters" && <DoNotContactFiltersPage />}
        </Tabs.Panel>

        <Tabs.Panel value="doNotContact" pl="xs">
          <Group noWrap>{currentTab === "doNotContact" && <DoNotContactFiltersPage />}</Group>
        </Tabs.Panel>
        <Tabs.Panel value="contactRecycling" pl="xs">
          <Group noWrap>{currentTab === "contactRecycling" && <ContactRecycling />}</Group>
        </Tabs.Panel>

        <Tabs.Panel value="webhooks" pl="xs">
          <WebhookConnectionPage />
        </Tabs.Panel>

        <Tabs.Panel value="crm" pl="x">
          <CRMConnectionPage />
        </Tabs.Panel>

        <Tabs.Panel value="brain" pl="xs">
          <SellScaleBrain />
        </Tabs.Panel>

        <Tabs.Panel value="pipeline" pl="xs">
          <SettingPreferences />
        </Tabs.Panel>

        <Tabs.Panel value="conversion" pl="xs">
          <SettingsConversion />
        </Tabs.Panel>

        <Tabs.Panel value="slack" pl="xs">
          <SlackSettings />
        </Tabs.Panel>

        <Tabs.Panel value="messages" pl="xs">
          <MessageAutomation />
        </Tabs.Panel>

        <Tabs.Panel value="logout" pl="xs">
          <LoadingOverlay visible />
        </Tabs.Panel>

        <Tabs.Panel value="usage" pl="xs">
          <SettingUsage />
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
