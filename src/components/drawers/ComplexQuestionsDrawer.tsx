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
import { formatToLabel, valueToColor } from "@utils/general";
import { logout } from "@auth/core";
import getChannels, { getChannelOptions } from "@utils/requests/getChannels";
import { useEffect, useRef, useState } from "react";
import { Channel, Prospect } from "src";
import FlexSeparate from "@common/library/FlexSeparate";
import ProspectDetailsViewEmails from "@common/prospectDetails/ProspectDetailsViewEmails";
import { API_URL } from "@constants/data";
import ProspectDetailsRemove from "@common/prospectDetails/ProspectDetailsRemove";
import ProspectDetailsResearch from "@common/prospectDetails/ProspectDetailsResearch";
import { IconDots } from "@tabler/icons";
import ProspectDetailsOptionsMenu from "@common/prospectDetails/ProspectDetailsOptionsMenu";
import {
  questionsDrawerOpenState,
  schedulingDrawerOpenState,
} from "@atoms/dashboardAtoms";
import SchedulingCardContents from "@common/home/dashboard/SchedulingCardContents";
import Assistant from "@assets/images/assistant.svg";
import TextAreaWithAI from "@common/library/TextAreaWithAI";

export default function ComplexQuestionsDrawer(props: {
  prospects: Prospect[];
}) {
  const theme = useMantineTheme();

  // This component is only rendered if drawerOpened=true - which isn't helpful for the first render
  // So we use actuallyOpened to control when the drawer opens and delay it by 100ms (for the animation to play)
  const [drawerOpened, setDrawerOpened] = useRecoilState(
    questionsDrawerOpenState
  );
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
      title={<Title order={3}>Complex Question</Title>}
      padding="xl"
      size="lg"
      position="right"
      sx={{ position: 'relative' }}
    >
      <Avatar src={Assistant} alt="AI Assistant" size={30} />
      <Text fz="sm">
        I was unable to answer these myself. Please write a reponse to teach me
        for next time.
      </Text>

      <div style={{ marginTop: 20 }}>
        <Text fz={12} c="dimmed" my={6}>
          Question 1 of {props.prospects.length}
        </Text>
        <Paper withBorder p="xs" radius="md">
          <Stack spacing={5}>
            <Flex justify="space-between">
              <div>
                <Avatar size="md" radius="xl" src={activeProspect.img_url} />
              </div>
              <div style={{ flexGrow: 1, marginLeft: 10 }}>
                <Text fw={700} fz="sm">
                  {activeProspect.full_name}
                </Text>
                <Text fz={12} c="dimmed">
                  {activeProspect.title} at {activeProspect.company}
                </Text>
              </div>
              <div>
                <Badge
                  color={valueToColor(
                    theme,
                    formatToLabel(activeProspect.overall_status)
                  )}
                  variant="light"
                  styles={{ root: { textTransform: "initial" } }}
                >
                  {formatToLabel(activeProspect.overall_status)}
                </Badge>
              </div>
            </Flex>
            <Text fz="sm">
              “
              {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus faucibus elementum interdum. Pellentesque molestie libero ut sodales convallis. Morbi sed facilisis urna.`}
              ”
            </Text>
          </Stack>
        </Paper>
      </div>

      <div style={{ marginTop: 20 }}>
        <TextAreaWithAI
          label="Write your response"
          placeholder=""
          value={response}
          onChange={(event) => setResponse(event.currentTarget.value)}
        />
        <Button color="green" radius="xl" size="xs" mt={15}>
          Send response
        </Button>
      </div>
      
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translate(-50%, -50%)' }}>
          <Group>
            <Button variant="default" radius="xl">
              Finish
            </Button>
            <Button variant="default" radius="xl">
              Next question
            </Button>
          </Group>
      </div>

    </Drawer>
  );
}
