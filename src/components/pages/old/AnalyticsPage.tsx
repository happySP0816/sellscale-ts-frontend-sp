import EmailAnalyticsTable from "@common/analytics/EmailAnalyticsTable";
import PageFrame from "@common/PageFrame";
import PageTitle from "@nav/old/PageTitle";
import { Center, Tabs, Text, Select, SelectItem } from "@mantine/core";
import { setPageTitle } from "@utils/documentChange";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import PersonaDetailsTransformers from "@common/persona/details/PersonaDetailsTransformers";
import PersonaDetailsPatterns from "@common/persona/details/PersonaDetailsPatterns";
import FlexSeparate from "@common/library/FlexSeparate";
import { IconUser } from "@tabler/icons";
import getPersonas from "@utils/requests/getPersonas";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { useQuery } from "@tanstack/react-query";
import { Archetype } from "src";
import { useEffect, useState } from "react";

/* 
export default function AnalyticsPage() {
  setPageTitle("Analytics");

  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-analytics-personas-data`],
    queryFn: async () => {
      const response = await getPersonas(userToken);
      const result =
        response.status === "success" ? (response.data as Archetype[]) : [];

      const personas = result.sort((a, b) => {
        if (a.active === b.active) {
          return b.performance.total_prospects - a.performance.total_prospects;
        } else {
          return a.active ? -1 : 1;
        }
      });

      return personas;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <PageFrame>
      <FlexSeparate alignItems="flex-end">
        <PageTitle title="Analytics" mb={false} />
          <Select
            pr="sm"
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
          />
      </FlexSeparate>
      <Tabs defaultValue="transformers" px="xs" color="teal">
        <Tabs.List>
          <Tabs.Tab value="transformers">Transformers</Tabs.Tab>
          <Tabs.Tab value="patterns">Patterns</Tabs.Tab>
          <Tabs.Tab value="ctas">CTAs</Tabs.Tab>
          <Tabs.Tab value="email-details">Email Details</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="ctas" pt="xs" h={600}>
          <PersonaDetailsCTAs />
        </Tabs.Panel>
        <Tabs.Panel value="transformers" pt="xs" h={600}>
          <PersonaDetailsTransformers />
        </Tabs.Panel>
        <Tabs.Panel value="patterns" pt="xs" h={600}>
          <PersonaDetailsPatterns />
        </Tabs.Panel>
        <Tabs.Panel value="email-details" pt="xs">
          <EmailAnalyticsTable />
        </Tabs.Panel>
      </Tabs>
    </PageFrame>
  );
}
 */