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
  Text,
  Avatar,
  Stack,
  Button,
  Indicator,
  Radio,
  TextInput,
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
import ProspectDetailsSummary from "../common/prospectDetails/ProspectDetailsSummary";
import ProspectDetailsChangeStatus, {
  channelToIcon,
} from "../common/prospectDetails/ProspectDetailsChangeStatus";
import ProspectDetailsCompany from "../common/prospectDetails/ProspectDetailsCompany";
import ProspectDetailsNotes from "../common/prospectDetails/ProspectDetailsNotes";
import ProspectDetailsViewConversation from "../common/prospectDetails/ProspectDetailsViewConversation";
import { userTokenState } from "@atoms/userAtoms";
import {
  convertDateToLocalTime,
  formatToLabel,
  valueToColor,
} from "@utils/general";
import { logout } from "@auth/core";
import getChannels, { getChannelOptions } from "@utils/requests/getChannels";
import { useEffect, useRef, useState } from "react";
import { Channel, Prospect } from "src";
import FlexSeparate from "@common/library/FlexSeparate";
import ProspectDetailsViewEmails from "@common/prospectDetails/ProspectDetailsViewEmails";
import { API_URL } from "@constants/data";
import ProspectDetailsRemove from "@common/prospectDetails/ProspectDetailsRemove";
import ProspectDetailsAccountResearch from "@common/prospectDetails/ProspectDetailsAccountResearch";
import { IconDots } from "@tabler/icons";
import ProspectDetailsOptionsMenu from "@common/prospectDetails/ProspectDetailsOptionsMenu";
import {
  demosDrawerOpenState,
  questionsDrawerOpenState,
  schedulingDrawerOpenState,
} from "@atoms/dashboardAtoms";
import SchedulingCardContents from "@common/home/dashboard/SchedulingCardContents";
import Assistant from "@assets/images/assistant.svg";
import TextAreaWithAI from "@common/library/TextAreaWithAI";
import ProspectDemoDateSelector from "@common/prospectDetails/ProspectDemoDateSelector";

export default function DemoFeedbackDrawer(props: { prospects: Prospect[] }) {
  const theme = useMantineTheme();

  // This component is only rendered if drawerOpened=true - which isn't helpful for the first render
  // So we use actuallyOpened to control when the drawer opens and delay it by 100ms (for the animation to play)
  const [drawerOpened, setDrawerOpened] = useRecoilState(demosDrawerOpenState);
  const [actuallyOpened, setActuallyOpened] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setActuallyOpened(drawerOpened);
    }, 100);
  }, []);

  const userToken = useRecoilValue(userTokenState);

  const activeProspect = props.prospects[0];
  const [response, setResponse] = useState("");

  if (!activeProspect) return <></>;
  return (
    <Drawer
      opened={actuallyOpened}
      onClose={() => setDrawerOpened(false)}
      title={<Title order={3}>Demo Feedback</Title>}
      padding="xl"
      size="xl"
      position="right"
      sx={{ position: "relative" }}
    >
      <Avatar src={Assistant} alt="AI Assistant" size={30} />
      <Text fz="sm">
        You scheduled a demo - how did it go? Your feedback will be used to
        improve our AI.
      </Text>

      <div style={{ marginTop: 20 }}>
        <Paper withBorder p="xs" radius="md">
          <Flex justify="space-between">
            <div>
              <Avatar size="md" radius="xl" src={activeProspect.img_url} />
            </div>
            <div style={{ flexGrow: 1, marginLeft: 10 }}>
              <Text fw={700} fz="sm">
                Demo with {activeProspect.full_name}
              </Text>
              <Text fz="sm" c="dimmed">
                {convertDateToLocalTime(new Date())}
              </Text>
            </div>
          </Flex>
        </Paper>
      </div>

      <ProspectDemoDateSelector prospectId={activeProspect.id} />

      <Stack style={{ marginTop: 20 }}>
        <Radio.Group name="demoSuccess" label="How was the demo?">
          <Radio color="green" value="won" label="Demo Won" />
          <Radio color="green" value="loss" label="Demo Loss" />
        </Radio.Group>

        <Radio.Group
          name="demoHappiness"
          label="Are you glad you had this meeting?"
        >
          <Radio color="green" value="yes" label="Yes" />
          <Radio color="green" value="no" label="No" />
        </Radio.Group>

        <TextInput label="What do you want changed next time to qualify?" />

        <TextInput label="What makes them the right fit?" />
      </Stack>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Group>
          <Button color="green" radius="xl">
            Submit feedback
          </Button>
        </Group>
      </div>
    </Drawer>
  );
}
