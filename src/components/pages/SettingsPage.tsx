import PageFrame from "@common/PageFrame";
import {
  Flex,
  Group,
  LoadingOverlay,
  Tabs,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useEffect, useState } from "react";
import {
  IconBrandLinkedin,
  IconBrandSlack,
  IconCalendar,
  IconInbox,
  IconTrophy,
} from "@tabler/icons";
import PageTitle from "@nav/PageTitle";
import { useQuery } from "@tanstack/react-query";
import LinkedInConnectedCard from "@common/settings/LinkedInIntegrationCard";
import { syncLocalStorage } from "@auth/core";
import NylasConnectedCard from "@common/settings/NylasConnectedCard";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import exchangeNylasClientID from "@utils/requests/exchangeNylasAuthCode";
import CalendarAndScheduling from "@common/settings/CalendarAndScheduling";
import {
  IconAdjustmentsFilled,
  IconBrain,
  IconMessage2Bolt,
  IconTrashFilled,
} from "@tabler/icons-react";
import DoNotContactList from "@common/settings/DoNotContactList";
import SellScaleBrain from "@common/settings/SellScaleBrain";
import SettingPreferences from "@common/settings/SettingPreferences";
import SlackbotSection from "@common/slack/SlackbotSection";
import MessageAutomation from "@common/settings/MessageAutomation";
import SlackWebhookSection from "@common/slack/SlackWebhookSection";
import DoNotContactFiltersPage from '@common/settings/DoNotContactFiltersPage';
import { setPageTitle } from "@utils/documentChange";
import SettingsConversion from "@common/settings/SettingsConversion";


export default function SettingsPage() {
  setPageTitle("Settings");

  const { tabId } = useLoaderData() as { tabId: string };

  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = tabId || "sellScaleBrain"
  const [currentTab, setCurrentTab] = useState(defaultTab);

  useEffect(() => {
    const nylasCode = searchParams.get("code");
    if (nylasCode) {
      exchangeNylasClientID(userToken, nylasCode).then((response) => {
        window.location.href = "/settings";
      });
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
    <PageFrame>
      <PageTitle title="Settings" />
      <Tabs value={currentTab} orientation="vertical" onTabChange={(i: any) => setCurrentTab(i)}>
        <Tabs.List>
          <Tabs.Tab value="sellScaleBrain" icon={<IconBrain size="0.8rem" />}>
            SellScale Brain
          </Tabs.Tab>
          <Tabs.Tab
            value="pipeline"
            icon={<IconAdjustmentsFilled size="0.8rem" />}
          >
            Pipeline
          </Tabs.Tab>
          <Tabs.Tab
            value="message-automation"
            icon={<IconMessage2Bolt size="0.8rem" />}
          >
            Message Automation
          </Tabs.Tab>
          <Tabs.Tab
            value="linkedinConnection"
            icon={<IconBrandLinkedin size="0.8rem" />}
          >
            LinkedIn Connection
          </Tabs.Tab>
          <Tabs.Tab value="emailConnection" icon={<IconInbox size="0.8rem" />}>
            Email Connection
          </Tabs.Tab>
          <Tabs.Tab
            value="calendarAndScheduling"
            icon={<IconCalendar size="0.8rem" />}
          >
            Calendar and Scheduling
          </Tabs.Tab>
          <Tabs.Tab
            value="doNotContact"
            icon={<IconTrashFilled size="0.8rem" />}
          >
            Do Not Contact Filters
          </Tabs.Tab>
          <Tabs.Tab value="slackbot" icon={<IconBrandSlack size="0.8rem" />}>
            Slack Connection
          </Tabs.Tab>
          <Tabs.Tab value="conversion" icon={<IconTrophy size="0.8rem" />}>
            Conversion
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="linkedinConnection" pl="xs" w='60%'>
          <LinkedInConnectedCard
            connected={userData ? userData.li_voyager_connected : false}
          />
        </Tabs.Panel>

        <Tabs.Panel value="emailConnection" pl="xs">
          <NylasConnectedCard
            connected={userData ? userData.nylas_connected : false}
          />
        </Tabs.Panel>

        <Tabs.Panel value="calendarAndScheduling" pl="xs">
          <CalendarAndScheduling />
        </Tabs.Panel>

        <Tabs.Panel value="doNotContact" pl="xs">
          <Group noWrap>
            {currentTab === 'doNotContact' && <DoNotContactFiltersPage />}
          </Group>
        </Tabs.Panel>

        <Tabs.Panel value="sellScaleBrain" pl="xs">
          <SellScaleBrain />
        </Tabs.Panel>

        <Tabs.Panel value="pipeline" pl="xs">
          <SettingPreferences />
        </Tabs.Panel>

        <Tabs.Panel value='conversion' pl="xs">
          <SettingsConversion />
        </Tabs.Panel>

        <Tabs.Panel value="slackbot" pl="xs">
          <SlackbotSection />
          <SlackWebhookSection />
        </Tabs.Panel>

        <Tabs.Panel value="message-automation" pl="xs">
          <MessageAutomation />
        </Tabs.Panel>

        <Tabs.Panel value="logout" pl="xs">
          <LoadingOverlay visible />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
}
