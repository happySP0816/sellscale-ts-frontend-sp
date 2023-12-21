import {
  mainTabState,
  nurturingModeState,
  openedProspectIdState,
} from "@atoms/inboxAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { prospectShowPurgatoryState } from "@atoms/prospectAtoms";
import { userTokenState, userDataState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import InboxProspectConvo from "@common/inbox/InboxProspectConvo";
import InboxProspectDetails from "@common/inbox/InboxProspectDetails";
import InboxProspectList from "@common/inbox/InboxProspectList";
import { populateInboxNotifs } from "@common/inbox/utils";
import { API_URL } from "@constants/data";
import {
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Group,
  Loader,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { setPageTitle } from "@utils/documentChange";
import { getProspects } from "@utils/requests/getProspects";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Prospect, ProspectShallow } from "src";
import RobotEmailImage from "./robot_emails.png";
import {
  Icon360,
  IconBrandSuperhuman,
  IconList,
  IconPencilMinus,
  IconWorld,
} from "@tabler/icons";
import DemoFeedbackDrawer from "@drawers/DemoFeedbackDrawer";
import LinkedinQueuedMessages from "@common/messages/LinkedinQueuedMessages";
import InboxSmartleadPage from "./InboxPageSmartleadPage";

export const INBOX_PAGE_HEIGHT = `calc(100vh)`;

export default function InboxPage(props: { all?: boolean }) {
  setPageTitle("Inbox");

  const [numberLeads, setNumberLeads] = useState<number>(0);
  const userToken = useRecoilValue(userTokenState);
  const nurturingMode = useRecoilValue(nurturingModeState);
  const currentProject = useRecoilValue(currentProjectState);
  const [queryComplete, setQueryComplete] = useState(false);
  const mainTab = useRecoilValue(mainTabState);
  const [openedProspectId, setOpenedProspectId] = useRecoilState(
    openedProspectIdState
  );

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-dash-get-prospects`, { nurturingMode }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { nurturingMode }] = queryKey;

      const response = await getProspects(
        userToken,
        undefined,
        "SELLSCALE",
        10000, // TODO: Maybe use pagination method instead
        nurturingMode ? ["ACCEPTED", "BUMPED"] : ["ACTIVE_CONVO", "DEMO"],
        "ALL",
        props.all ? undefined : currentProject?.id,
        true
      );
      setQueryComplete(true);
      return response.status === "success"
        ? (response.data as ProspectShallow[])
        : [];
    },
    refetchOnWindowFocus: false,
  });
  const prospects = data ?? [];

  useEffect(() => {
    if (
      prospects.length > 0 &&
      (!openedProspectId || openedProspectId === -1)
    ) {
      setOpenedProspectId(prospects[0].id);
    }
  }, [prospects]);

  if (!queryComplete)
    return (
      <Card w="250px" h="250px" m="10% auto" withBorder>
        <Loader m="88px 88px" />
      </Card>
    );

  return (
    <Tabs defaultValue="sellscale">
      <Tabs.List>
        <Tabs.Tab value="sellscale">Inbox</Tabs.Tab>
        <Tabs.Tab value="smartlead">
          Email Beta {numberLeads > 0 && " - " + numberLeads}
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="sellscale">
        <Grid
          columns={100}
          gutter={0}
          h={INBOX_PAGE_HEIGHT}
          sx={{ overflow: "hidden" }}
        >
          <Grid.Col span={27}>
            <InboxProspectList
              prospects={prospects}
              isFetching={isFetching}
              all={props.all}
            />
          </Grid.Col>

          {mainTab !== "queued" ? (
            <>
              {prospects.length < 0 ? (
                <>
                  <Grid.Col span={46}>
                    <InboxProspectConvo prospects={prospects} />
                  </Grid.Col>
                  <Grid.Col span={27}>
                    <InboxProspectDetails prospects={prospects} />
                  </Grid.Col>
                </>
              ) : (
                <Grid.Col span={73}>
                  <Container
                    w="100%"
                    mt="300px"
                    sx={{ justifyContent: "center", textAlign: "center" }}
                  >
                    <Title
                      fw="800"
                      sx={{
                        fontSize: "120px",
                        color: "#e3e3e3",
                        margin: "0% auto",
                        textAlign: "center",
                      }}
                    >
                      {/* <span style={{ marginRight: '100px' }}>Inbox</span>
                      <span style={{ marginLeft: '80px' }}>Zero</span> */}
                    </Title>
                    <img
                      src={RobotEmailImage}
                      width="300px"
                      style={{ marginTop: "-180px", marginLeft: "50px" }}
                    />
                    <Text size={28} fw={600}>
                      Automate Your Replies
                    </Text>
                    <Text mt="md" color="gray">
                      Your inbox is empty. Meanwhile, you can automate <br />{" "}
                      your replies using reply frameworks.
                    </Text>
                    <Flex justify={"center"} mt="xs">
                      <Button
                        size="lg"
                        radius={"xl"}
                        leftIcon={<IconPencilMinus />}
                        mt={"md"}
                        className="glow"
                        onClick={() => {
                          window.location.href = `/setup/email?${prospects[0]?.archetype_id}`;
                        }}
                      >
                        Edit Reply Frameworks
                      </Button>
                    </Flex>
                  </Container>
                </Grid.Col>
              )}
            </>
          ) : (
            <Grid.Col span={73}>
              <Group position="center" noWrap>
                <LinkedinQueuedMessages all />
              </Group>
            </Grid.Col>
          )}
        </Grid>
      </Tabs.Panel>
      <Tabs.Panel value="smartlead">
        <InboxSmartleadPage
          setNumberLeads={(number: number) => {
            // I KNOW THIS IS SHIT CODE HAHA
            setNumberLeads(number);
          }}
        />
      </Tabs.Panel>
    </Tabs>
  );
}
