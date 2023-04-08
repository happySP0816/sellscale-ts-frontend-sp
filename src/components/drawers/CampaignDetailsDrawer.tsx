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
import { useState } from "react";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import { Campaign } from "src";
import { logout } from "@auth/core";
import { useQuery } from "@tanstack/react-query";
import CampaignProspects from "@common/campaigns/CampaignProspects";
import CampaignCTAs from "@common/campaigns/CampaignCTAs";
import { API_URL } from "@constants/data";

export default function CampaignDetailsDrawer() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useRecoilState(campaignDrawerOpenState);
  const campaignId = useRecoilValue(campaignDrawerIdState);
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-campaign-details-${campaignId}`],
    queryFn: async () => {
      if (campaignId === -1) {
        return null;
      }

      const response = await fetch(
        `${API_URL}/campaigns/${campaignId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();

      return res;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      title={
        <Title order={3}>{data?.campaign_details ? data.campaign_details.campaign_raw.name : ""}</Title>
      }
      padding="xl"
      size="xl"
      position="right"
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      {data?.campaign_details && !isFetching && (
        <ScrollArea
          style={{ height: window.innerHeight - 100, overflowY: "hidden" }}
        >
          <Group pb='xs'>
            <Badge color={valueToColor(theme, data.campaign_details.campaign_raw.status)}>
              {data.campaign_details.campaign_raw.status.replaceAll("_", " ")}
            </Badge>
            <Badge color={valueToColor(theme, data.campaign_details.campaign_raw.campaign_type)}>
              {data.campaign_details.campaign_raw.campaign_type.replaceAll("_", " ")}
            </Badge>
          </Group>
          <Tabs defaultValue="ctas" px='xs'>
            <Tabs.List grow position="center">
              <Tabs.Tab value="ctas">Call-to-Actions</Tabs.Tab>
              <Tabs.Tab value="prospects">Prospects</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="ctas" pt="xs">
              <CampaignCTAs ctas={data.campaign_details.ctas} />
            </Tabs.Panel>
            <Tabs.Panel value="prospects" pt="xs">
              <CampaignProspects prospects={data.campaign_details.prospects} />
            </Tabs.Panel>
          </Tabs>
        </ScrollArea>
      )}
    </Drawer>
  );
}
