import {
  Drawer,
  LoadingOverlay,
  ScrollArea,
  Title,
  Badge,
  Flex,
  useMantineTheme,
  Tabs,
  Divider,
  ActionIcon,
  Paper,
  Group,
  Avatar,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
  prospectDrawerNotesState,
  prospectChannelState,
  prospectDrawerStatusesState,
} from "@atoms/prospectAtoms";
import { useQuery } from "@tanstack/react-query";
import ProspectDetailsCompany from "../common/prospectDetails/ProspectDetailsCompany";
import ProspectDetailsNotes from "../common/prospectDetails/ProspectDetailsNotes";
import { userTokenState } from "@atoms/userAtoms";
import { formatToLabel, valueToColor } from "@utils/general";
import { logout } from "@auth/core";
import getChannels, { getChannelOptions } from "@utils/requests/getChannels";
import { useEffect, useRef, useState } from "react";
import { Channel, Prospect } from "src";
import FlexSeparate from "@common/library/FlexSeparate";
import { API_URL } from "@constants/data";
import ProspectDetailsRemove from "@common/prospectDetails/ProspectDetailsRemove";
import ProspectDetailsResearch from "@common/prospectDetails/ProspectDetailsResearch";
import { IconDots } from "@tabler/icons";
import ProspectDetailsOptionsMenu from "@common/prospectDetails/ProspectDetailsOptionsMenu";
import { schedulingDrawerOpenState } from "@atoms/dashboardAtoms";
import SchedulingCardContents from "@common/home/dashboard/SchedulingCardContents";

export default function SchedulingDrawer(props: { prospects: Prospect[] }) {
  const theme = useMantineTheme();

  // This component is only rendered if drawerOpened=true - which isn't helpful for the first render
  // So we use actuallyOpened to control when the drawer opens and delay it by 100ms (for the animation to play)
  const [drawerOpened, setDrawerOpened] = useRecoilState(
    schedulingDrawerOpenState
  );
  const [actuallyOpened, setActuallyOpened] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setActuallyOpened(drawerOpened);
    }, 100);
  }, []);

  const userToken = useRecoilValue(userTokenState);

  return (
    <Drawer
      opened={actuallyOpened}
      onClose={() => setDrawerOpened(false)}
      title={
        <Group spacing={10}>
          <Title order={3}>Scheduling</Title>
          {props.prospects.length > 1 && (
            <Avatar
              color="violet"
              radius="xl"
              size={24}
              styles={{
                placeholder: {
                  fontSize: 12,
                },
              }}
            >
              {`${props.prospects.length}`}
            </Avatar>
          )}
        </Group>    
      }
      padding="xl"
      size="lg"
      position="right"
    >
      {props.prospects.length > 0 ? (
        <ScrollArea
          style={{ height: window.innerHeight - 100, overflowY: "hidden" }}
        >
          {props.prospects.map((prospect, i) => (
            <Paper key={i} withBorder p="xs" radius="md" mt={14}>
              <SchedulingCardContents prospect={prospect} />
            </Paper>
          ))}
        </ScrollArea>
      ) : (
        <LoadingOverlay visible={true} />
      )}
    </Drawer>
  );
}
