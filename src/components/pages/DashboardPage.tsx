import NotificationCard from "@common/dashboard/NotificationCard";
import {
  List,
  ThemeIcon,
  Text,
  Container,
  Stack,
  Flex,
  Title,
  useMantineTheme,
  Paper,
  Group,
  Button,
  Divider,
  Progress,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import {
  IconActivity,
  IconAnalyze,
  IconBellRinging,
  IconCalendarEvent,
  IconChartBar,
  IconInfoSquareRounded,
  IconMessageCircle,
  IconPhoto,
} from "@tabler/icons";
import { setPageTitle } from "@utils/documentChange";
import { SCREEN_SIZES } from "../../constants/data";
import PageFrame from "../common/PageFrame";

export default function DashboardPage() {
  setPageTitle("Dashboard");
  
  return (
    <PageFrame>
      <Flex wrap="wrap">
        <div style={{ flex: "2 0 0" }}>
          <Title order={3} pl={20} pb={5}>
            Daily Updates
          </Title>
          <Flex wrap="wrap">
            <NotificationCard
              icon={<IconBellRinging size={45} />}
              name={"Suggested Follow-Ups"}
              description={"Conversations that might need a bump"}
            />
            <NotificationCard
              icon={<IconMessageCircle size={45} />}
              name={"Unread Messages"}
              description={"From prospects you've been contacting"}
            />
            <NotificationCard
              icon={<IconAnalyze size={45} />}
              name={"Recently Viewed"}
              description={"Check back on your recently viewed prospects"}
            />
            <NotificationCard
              icon={<IconChartBar size={45} />}
              name={"Demo Sets"}
              description={"View your leads"}
            />
          </Flex>
        </div>
        <div style={{ flex: "1 0 0" }}>
          <Title order={3} pl={20} pb={5}>
            Quick Actions
          </Title>
          <Paper withBorder m="xs" p="md" radius="md" w={"100%"}>
            <Stack spacing='xs'>
              <Button
                variant="outline"
                color="teal"
                fullWidth
                onClick={() => {
                  openContextModal({
                    modal: 'uploadProspects',
                    title: (<Title order={3}>Upload Prospects</Title>),
                    innerProps: {},
                  });
                }}
              >
                Upload Prospects
              </Button>
              {/* <Progress value={50} /> */}
              {/* 
                <Button
                  variant="outline"
                  color="teal"
                  fullWidth
                  onClick={() => {}}
                  disabled
                >
                  Future Action
                </Button>
                <Button
                  variant="outline"
                  color="teal"
                  fullWidth
                  onClick={() => {}}
                  disabled
                >
                  Future Action
                </Button>
              */}
            </Stack>
          </Paper>
        </div>
      </Flex>
    </PageFrame>
  );
}
