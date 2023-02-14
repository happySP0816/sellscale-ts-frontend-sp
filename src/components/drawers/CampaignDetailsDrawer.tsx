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
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  percentageToColor,
  splitName,
  temp_delay,
  valueToColor,
} from "../../utils/general";
import {
  activeCampaignState,
  campaignDrawerOpenState,
} from "@atoms/campaignAtoms";
import { userEmailState, userNameState } from "@atoms/userAtoms";
import { IconCalendar } from "@tabler/icons";
import { useState } from "react";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";

export default function CampaignDetailsDrawer() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useRecoilState(campaignDrawerOpenState);
  const activeCampaign = useRecoilValue(activeCampaignState);

  const userName = useRecoilValue(userNameState);
  const userEmail = useRecoilValue(userEmailState);

  const [campaignDate, setCampaignDate] = useState<DateRangePickerValue>([
    activeCampaign ? activeCampaign.startDate : null,
    activeCampaign ? activeCampaign.endDate : null,
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
      <Badge color={valueToColor(theme, activeCampaign.type)}>
        {activeCampaign.type.replaceAll("_", " ")}
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
        <Button variant="outline" color="teal" radius="xl" size="md" m='xs'>
          View Details →
        </Button>
      </Center>
    </Drawer>
  );
}
