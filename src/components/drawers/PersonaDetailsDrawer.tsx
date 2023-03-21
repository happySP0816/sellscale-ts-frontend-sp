import {
  Drawer,
  ScrollArea,
  Badge,
  Text,
  useMantineTheme,
  Title,
  Divider,
  Group,
  Avatar,
  Button,
  Center,
  LoadingOverlay,
  Tabs,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  percentageToColor,
  splitName,
  temp_delay,
  valueToColor,
} from "../../utils/general";
import {
  campaignDrawerIdState,
  campaignDrawerOpenState,
} from "@atoms/campaignAtoms";
import {
  userTokenState,
} from "@atoms/userAtoms";
import { IconCalendar } from "@tabler/icons";
import { useRef, useState } from "react";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import { Archetype, Campaign } from "src/main";
import { logout } from "@auth/core";
import { useQuery } from "@tanstack/react-query";
import CampaignProspects from "@common/campaigns/CampaignProspects";
import CampaignCTAs from "@common/campaigns/CampaignCTAs";
import { currentPersonaIdState, detailsDrawerOpenState } from "@atoms/personaAtoms";
import PersonaDetailsCTAs from "@common/persona/details/PersonaDetailsCTAs";
import PersonaDetailsTransformers from "@common/persona/details/PersonaDetailsTransformers";
import { DataTableSortStatus } from "mantine-datatable";
import _ from "lodash";

export default function PersonaDetailsDrawer(props: { personas: Archetype[] | undefined }) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useRecoilState(detailsDrawerOpenState);
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(currentPersonaIdState);
  const userToken = useRecoilValue(userTokenState);

  const persona = props.personas?.find((persona) => persona.id === currentPersonaId);
  if(!persona) {
    return (<></>)
  }

  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      title={
        <Title order={3}>Details - {persona.archetype}</Title>
      }
      padding="xl"
      size="xl"
      position="right"
    >
          <Tabs defaultValue="ctas" px='xs'>
            <Tabs.List grow position="center">
              <Tabs.Tab value="ctas">Call-to-Actions</Tabs.Tab>
              <Tabs.Tab value="transformers">Transformers</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="ctas" pt="xs">
              <PersonaDetailsCTAs />
            </Tabs.Panel>
            <Tabs.Panel value="transformers" pt="xs">
              <PersonaDetailsTransformers />
            </Tabs.Panel>
          </Tabs>
    </Drawer>
  );
}