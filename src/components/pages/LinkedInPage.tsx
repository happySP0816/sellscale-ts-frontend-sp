import { currentPersonaIdState } from "@atoms/personaAtoms";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import CampaignTable from "@common/campaigns/CampaignTable";
import AllContactsSection from "@common/home/AllContactsSection";
import RecActionsSection from "@common/home/RecActionsSection";
import RecentActivitySection from "@common/home/RecentActivitySection";
import FlexSeparate from "@common/library/FlexSeparate";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import PersonaDetailsTransformers from "@common/persona/details/PersonaDetailsTransformers";
import { Select, Tabs } from "@mantine/core";
import PageTitle from "@nav/PageTitle";
import { IconAffiliate, IconHistory, IconSignature, IconSpeakerphone, IconTopologyStar, IconUser } from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import getPersonas from "@utils/requests/getPersonas";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype } from "src";

export default function LinkedInPage() {
  setPageTitle("LinkedIn");

  const userToken = useRecoilValue(userTokenState);
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(currentPersonaIdState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-linkedin-personas-data`],
    queryFn: async () => {
      const response = await getPersonas(userToken);
      const result =
        response.status === "success" ? (response.extra as Archetype[]) : [];

      const personas = result.sort((a, b) => {
        if (a.active === b.active) {
          return b.performance.total_prospects - a.performance.total_prospects;
        } else {
          return a.active ? -1 : 1;
        }
      });

      if(currentPersonaId === -1){
        setCurrentPersonaId(personas[0].id);
      }
      return personas;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <PageFrame>
      <Tabs defaultValue="ctas" px="xs" color="teal">
        <Tabs.List>
          <Tabs.Tab value="ctas" icon={<IconSpeakerphone size="1.1rem" />}>CTAs</Tabs.Tab>
          <Tabs.Tab value="personalizations" icon={<IconAffiliate size="1.1rem" />}>Personalizations</Tabs.Tab>
          <Tabs.Tab value="campaign-history" icon={<IconHistory size="1.1rem" />}>Campaign History</Tabs.Tab>
        </Tabs.List>
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
                        value: persona.id+'',
                        label: persona.archetype,
                      }))
                    : []
                }
                icon={<IconUser size="1rem" />}
                value={currentPersonaId+''}
                onChange={(value) => setCurrentPersonaId(value ? +value : -1)}
              />
          </FlexSeparate>
          <PersonaDetailsTransformers channel="LINKEDIN" />
        </Tabs.Panel>
        <Tabs.Panel value="campaign-history" pt="xs">
          <CampaignTable type="LINKEDIN" />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );

}
