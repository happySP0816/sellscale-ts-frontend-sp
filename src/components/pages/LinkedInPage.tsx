import { currentPersonaIdState } from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import CampaignTable from "@common/campaigns/CampaignTable";
import AllContactsSection from "@common/home/AllContactsSection";
import RecActionsSection from "@pages/DashboardPage";
import RecentActivitySection from "@common/home/RecentActivitySection";
import FlexSeparate from "@common/library/FlexSeparate";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import PersonaDetailsTransformers from "@common/persona/details/PersonaDetailsTransformers";
import { Select, Tabs } from "@mantine/core";
import PageTitle from "@nav/PageTitle";
import {
  IconAffiliate,
  IconClipboardData,
  IconHistory,
  IconMailFast,
  IconReport,
  IconSignature,
  IconSpeakerphone,
  IconTopologyStar,
  IconUser,
  IconVocabulary,
} from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import getPersonas from "@utils/requests/getPersonas";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype } from "src";
import LinkedinQueuedMessages from "@common/messages/LinkedinQueuedMessages";
import { useLoaderData } from "react-router-dom";
import VoicesSection from "@common/voice_builder/VoicesSection";
import BumpFrameworksPage from "./BumpFrameworksPage";

export default function LinkedInPage() {
  setPageTitle("LinkedIn");

  const { tabId } = useLoaderData() as { tabId: string };
  const userToken = useRecoilValue(userTokenState);
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(
    currentPersonaIdState
  );

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-linkedin-personas-data`],
    queryFn: async () => {
      const response = await getPersonas(userToken);
      const result =
        response.status === "success" ? (response.data as Archetype[]) : [];

      console.log(result);

      const personas = result.sort((a, b) => {
        if (a.active === b.active) {
          return (
            b.performance?.total_prospects - a.performance?.total_prospects
          );
        } else {
          return a.active ? -1 : 1;
        }
      });

      console.log(personas);

      if (currentPersonaId === -1) {
        setCurrentPersonaId(personas[0].id);
      }
      return personas;
    },
    refetchOnWindowFocus: false,
  });

  console.log(data);

  return (
    <PageFrame>
      <Tabs value={tabId} px="xs" color="teal">
        <Tabs.List sx={{ display: "none" }}>
          <Tabs.Tab value="messages" icon={<IconMailFast size="1.1rem" />}>
            Scheduled Messages
          </Tabs.Tab>
          <Tabs.Tab value="ctas" icon={<IconSpeakerphone size="1.1rem" />}>
            CTAs
          </Tabs.Tab>
          <Tabs.Tab
            value="personalizations"
            icon={<IconAffiliate size="1.1rem" />}
          >
            Personalizations
          </Tabs.Tab>
          <Tabs.Tab
            value="campaign-analytics"
            icon={<IconReport size="1.1rem" />}
          >
            Campaign Analytics
          </Tabs.Tab>
          <Tabs.Tab
            value="voices"
            icon={<IconVocabulary size="1.1rem" />}
          >
            Voices
          </Tabs.Tab>
          <Tabs.Tab
            value="bump-frameworks"
            icon={<IconClipboardData size="1.1rem" />}
          >
            Bump Frameworks
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="messages" pt="xs">
          <LinkedinQueuedMessages />
        </Tabs.Panel>
        <Tabs.Panel value="ctas" pt="xs">
          <PersonaDetailsCTAs personas={data} />
        </Tabs.Panel>
        <Tabs.Panel value="personalizations" pt="xs">
          <FlexSeparate alignItems="flex-end">
            <div></div>
            <Select
              pr="sm"
              pb="xs"
              placeholder="Select a persona"
              color="teal"
              // @ts-ignore
              data={
                data
                  ? data.map((persona: Archetype) => ({
                      value: persona.id + "",
                      label: persona.archetype,
                    }))
                  : []
              }
              icon={<IconUser size="1rem" />}
              value={currentPersonaId + ""}
              onChange={(value) => setCurrentPersonaId(value ? +value : -1)}
            />
          </FlexSeparate>
          <PersonaDetailsTransformers channel="LINKEDIN" />
        </Tabs.Panel>
        <Tabs.Panel value="campaign-analytics" pt="xs">
          <CampaignTable type="LINKEDIN" />
        </Tabs.Panel>
        <Tabs.Panel value="voices" pt="xs">
          <VoicesSection personas={data} />
        </Tabs.Panel>
        <Tabs.Panel value="bump-frameworks" pt="xs">
          <BumpFrameworksPage />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
}
