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
  userEmailState,
  userNameState,
  userTokenState,
} from "@atoms/userAtoms";
import { IconCalendar } from "@tabler/icons";
import { useState } from "react";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import { Campaign } from "src/main";
import { logout } from "@auth/core";
import { useQuery } from "react-query";

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
        `${process.env.REACT_APP_API_URI}/campaign/${campaignId}`,
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

  console.log(data);

  const activeCampaign: Campaign = {
    uuid: "dwwdd",
    id: -1,
    name: "Campaign 1",
    prospect_ids: [],
    campaign_type: "EMAIL",
    ctas: [],
    client_archetype_id: 0,
    client_sdr_id: 0,
    campaign_start_date: new Date(),
    campaign_end_date: new Date(),
    status: "PENDING",
  };

  const userName = useRecoilValue(userNameState);
  const userEmail = useRecoilValue(userEmailState);

  const [campaignDate, setCampaignDate] = useState<DateRangePickerValue>([
    activeCampaign ? activeCampaign.campaign_start_date : null,
    activeCampaign ? activeCampaign.campaign_end_date : null,
  ]);

  if (!activeCampaign) return <></>;
  return (
    <Drawer
      opened={opened}
      onClose={() => setOpened(false)}
      padding="xl"
      size="xl"
      position="right"
    >
      <LoadingOverlay visible={isFetching} overlayBlur={2} />
      {data?.details && !isFetching && (
        <ScrollArea
          style={{ height: window.innerHeight - 100, overflowY: "hidden" }}
        >
          <Badge color={valueToColor(theme, activeCampaign.campaign_type)}>
            {activeCampaign.campaign_type.replaceAll("_", " ")}
          </Badge>
          <Title order={3}>{activeCampaign.name}</Title>
          <Divider my="xs" />

          <Group className="inline-flex flex-nowrap truncate">
            <Avatar
              src={null}
              alt={`${splitName(userName).first}'s Profile Picture`}
              color="teal"
              radius="xl"
            />
            <div className="inline-flex flex-col">
              <Text fz="xs" fw={700}>
                {userName}
              </Text>
              <Text fz="xs" c="dimmed">
                {userEmail}
              </Text>
            </div>
          </Group>
          <DateRangePicker
            label="Filter by Date"
            placeholder="Pick date range"
            icon={<IconCalendar size={16} />}
            value={campaignDate}
            onChange={setCampaignDate}
            inputFormat="MMM D, YYYY"
            amountOfMonths={2}
            py={"xs"}
          />
          <Center>
            <Button variant="outline" color="teal" radius="xl" size="md" m="xs">
              View Details →
            </Button>
          </Center>
        </ScrollArea>
      )}
    </Drawer>
  );
}
