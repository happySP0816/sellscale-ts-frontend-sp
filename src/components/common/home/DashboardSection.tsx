import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Stack,
  Title,
  Text,
  Group,
  Container,
  Button,
  Flex,
  Indicator,
  Avatar,
  ScrollArea,
  LoadingOverlay,
} from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { convertDateToLocalTime, splitName } from "@utils/general";
import { useRecoilState, useRecoilValue } from "recoil";
import NotificationCard from "./dashboard/NotificationCard";
import {
  dashCardSeeAllDrawerOpenState,
  demoFeedbackSeeAllDrawerOpenState,
  demosDrawerOpenState,
  demosDrawerProspectIdState,
  questionsDrawerOpenState,
  schedulingDrawerOpenState,
} from "@atoms/dashboardAtoms";
import SchedulingDrawer from "@drawers/SchedulingDrawer";
import { useEffect, useRef, useState } from "react";
import { Prospect } from "src";
import { logout } from "@auth/core";
import { API_URL } from "@constants/data";
import DemoFeedbackDrawer from "@drawers/DemoFeedbackDrawer";
import DashCardContents from "./dashboard/DashCardContents";
import DashCardSeeAllDrawer from "@drawers/DashCardSeeAllDrawer";
import { useQuery } from "@tanstack/react-query";
import DemoFeedbackSeeAllDrawer from "@drawers/DemoFeedbackSeeAllDrawer";

export default function DashboardSection() {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [seeAllDrawerOpened, setSeeAllDrawerOpened] = useRecoilState(
    dashCardSeeAllDrawerOpenState
  );
  const seeAllType = useRef<
    | "CONTINUE_CONVO"
    | "HANDLE_OBJECTION"
    | "COMPLEX_QUESTION"
    | "QUAL_NEEDED"
    | "SCHEDULING"
    | null
  >(null);

  const [demosDrawerOpened, setDemosDrawerOpened] =
    useRecoilState(demosDrawerOpenState);
  const [drawerProspectId, setDrawerProspectId] = useRecoilState(demosDrawerProspectIdState);
  const [demoFeedbackDrawerOpened, setDemoFeedbackDrawerOpened] =
    useRecoilState(demoFeedbackSeeAllDrawerOpenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-dash-get-prospects`],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/prospect/get_prospects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel: "SELLSCALE",
          limit: 10000, // TODO: Maybe use pagination method instead
          status: ["DEMO", "ACTIVE_CONVO"],
          show_purgatory: "ALL",
        }),
      });
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.prospects) {
        return [];
      }
      return res.prospects as Prospect[];
    },
    refetchOnWindowFocus: false,
  });
  const prospects = data ?? [];

  const getProspectsWithActiveMsg = (li_status: string) => {
    return prospects
      .filter((p) => {
        const latest_msgs =
          p.recent_messages.li_convo?.sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          ) ?? [];
        const last_msg_from_prospect =
          latest_msgs.length > 0 && latest_msgs[0].connection_degree !== "You";
        return (
          p.linkedin_status === li_status && last_msg_from_prospect
        );
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }

  const prospectsNextSteps = getProspectsWithActiveMsg("ACTIVE_CONVO_NEXT_STEPS");
  const prospectsObjection = getProspectsWithActiveMsg("ACTIVE_CONVO_OBJECTION");
  const prospectsScheduled = getProspectsWithActiveMsg("ACTIVE_CONVO_SCHEDULING");
  const prospectsQualNeeded = getProspectsWithActiveMsg("ACTIVE_CONVO_QUAL_NEEDED");
  const prospectsQuestion = getProspectsWithActiveMsg("ACTIVE_CONVO_QUESTION");

  const all_prospectsNextSteps = prospects
    .filter((p) => p.linkedin_status === "ACTIVE_CONVO_NEXT_STEPS")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
  const all_prospectsObjection = prospects
    .filter((p) => p.linkedin_status === "ACTIVE_CONVO_OBJECTION")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
  const all_prospectsScheduled = prospects
    .filter((p) => p.linkedin_status === "ACTIVE_CONVO_SCHEDULING")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
  const all_prospectsQualNeeded = prospects
    .filter((p) => p.linkedin_status === "ACTIVE_CONVO_QUAL_NEEDED")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
  const all_prospectsQuestion = prospects
    .filter((p) => p.linkedin_status === "ACTIVE_CONVO_QUESTION")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
  const all_prospectsDemo = prospects
    .filter((p) => p.linkedin_status === "DEMO_SET")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const totalProspectTasks =
    prospectsNextSteps.length +
    prospectsObjection.length +
    prospectsScheduled.length +
    prospectsQualNeeded.length +
    prospectsQuestion.length +
    all_prospectsDemo.length;

  console.log(all_prospectsDemo);

  return (
    <>
      <Flex justify="center" pb={10}>
        <div style={{ maxWidth: 500, width: "100%" }}>
          <Stack spacing={40}>
            <div>
              <Text ta="center" fz={24} fw={500}>
                Welcome back, {userData && splitName(userData.sdr_name).first}!
              </Text>
              <Text ta="center" fz="md">
                {isFetching ? (
                  <Text c="dimmed" fz="sm" fs="italic" span>
                    Fetching tasks...
                  </Text>
                ) : (
                  <>
                    {totalProspectTasks === 0 ? (
                      <Text c="dimmed" span>
                        You’re good to go for the day - no action needed.
                        <br />
                        <i>Check back in tomorrow!</i>
                      </Text>
                    ) : (
                      <>
                        <Text c="dimmed" span>
                          You have
                        </Text>{" "}
                        <Text c="gray.5" span>
                          {totalProspectTasks} new tasks
                        </Text>
                      </>
                    )}
                  </>
                )}
              </Text>
            </div>
            <ScrollArea
              style={{ height: window.innerHeight - 200, overflowY: "hidden" }}
              pr={15}
            >
              {isFetching ? (
                <LoadingOverlay zIndex={0} visible={true} />
              ) : (
                <Stack spacing={40}>
                  {true && (
                    <NotificationCard
                      title="Scheduling"
                      amount={prospectsScheduled.length}
                      totalAmount={all_prospectsScheduled.length}
                      onClickSeeAll={() => {
                        seeAllType.current = "SCHEDULING";
                        setSeeAllDrawerOpened(true);
                      }}
                      noneMsg="Nothing new to schedule"
                    >
                      <DashCardContents
                        prospect={prospectsScheduled[0]}
                        includeSchedule
                      />
                    </NotificationCard>
                  )}

                  {true && (
                    <NotificationCard
                      title="Complex Question"
                      amount={prospectsQuestion.length}
                      totalAmount={all_prospectsQuestion.length}
                      onClickSeeAll={() => {
                        seeAllType.current = "COMPLEX_QUESTION";
                        setSeeAllDrawerOpened(true);
                      }}
                      noneMsg="No complex questions"
                    >
                      <DashCardContents prospect={prospectsQuestion[0]} />
                    </NotificationCard>
                  )}

                  {true && (
                    <NotificationCard
                      title="Handle Objection"
                      amount={prospectsObjection.length}
                      totalAmount={all_prospectsObjection.length}
                      onClickSeeAll={() => {
                        seeAllType.current = "HANDLE_OBJECTION";
                        setSeeAllDrawerOpened(true);
                      }}
                      noneMsg="No objections to handle"
                    >
                      <DashCardContents prospect={prospectsObjection[0]} />
                    </NotificationCard>
                  )}

                  {true && (
                    <NotificationCard
                      title="Continue the convo"
                      amount={prospectsNextSteps.length}
                      totalAmount={all_prospectsNextSteps.length}
                      onClickSeeAll={() => {
                        seeAllType.current = "CONTINUE_CONVO";
                        setSeeAllDrawerOpened(true);
                      }}
                      noneMsg="No conversations to continue"
                    >
                      <DashCardContents
                        prospect={prospectsNextSteps[0]}
                        includeNote
                      />
                    </NotificationCard>
                  )}

                  {/*
                <NotificationCard
                  title="Complex Question"
                  amount={prospectsQuestion.length}
                  assistantMsg="I'm not sure how to answer these. Can you teach me?"
                  onClickSeeAll={() => setQuestionsDrawerOpened(true)}
                  noneMsg="No complex questions"
                >
                  {prospectsQuestion.length > 0 && (
                    <Flex justify="space-between">
                      <div>
                        <Indicator
                          dot
                          inline
                          size={12}
                          offset={5}
                          position="top-end"
                          color="violet"
                          withBorder
                        >
                          <Avatar
                            size="md"
                            radius="xl"
                            src={prospectsQuestion[0].img_url}
                          />
                        </Indicator>
                      </div>
                      <div style={{ flexGrow: 1, marginLeft: 10 }}>
                        <Text fw={700} fz="sm">
                          {prospectsQuestion[0].full_name}
                        </Text>
                        <Text fz="sm">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Phasellus faucibus elementum interdum.
                        </Text>
                      </div>
                      <div>
                        <Button
                          color="green"
                          radius="xl"
                          size="xs"
                          ml={8}
                          onClick={() => setQuestionsDrawerOpened(true)}
                        >
                          Review
                        </Button>
                      </div>
                    </Flex>
                  )}
                </NotificationCard>
                */}
                  {all_prospectsDemo.length > 0 && (
                    <NotificationCard
                      title="Demo Feedback"
                      amount={all_prospectsDemo.length}
                      totalAmount={all_prospectsDemo.length}
                      assistantMsg="You scheduled a demo - how did it go?"
                      onClickSeeAll={() => setDemoFeedbackDrawerOpened(true)}
                      noneMsg="No demos scheduled"
                    >
                      <Flex justify="space-between">
                        <div>
                          <Indicator
                            dot
                            inline
                            size={12}
                            offset={5}
                            position="top-end"
                            color="violet"
                            withBorder
                          >
                            <Avatar
                              size="md"
                              radius="xl"
                              src={all_prospectsDemo[0].img_url}
                            />
                          </Indicator>
                        </div>
                        <div style={{ flexGrow: 1, marginLeft: 10 }}>
                          <Text fw={700} fz="sm">
                            Demo with {all_prospectsDemo[0].full_name}
                          </Text>
                          <Text fz="sm" c="dimmed">
                            {convertDateToLocalTime(new Date(all_prospectsDemo[0].demo_date))}
                          </Text>
                        </div>
                        <div>
                          <Button
                            color="green"
                            radius="xl"
                            size="xs"
                            ml={8}
                            onClick={() => {
                              setDrawerProspectId(all_prospectsDemo[0].id);
                              setDemosDrawerOpened(true);
                            }}
                          >
                            Give Feedback
                          </Button>
                        </div>
                      </Flex>
                    </NotificationCard>
                  )}

                  {true && (
                    <NotificationCard
                      title="Qualifications Needed"
                      amount={prospectsQualNeeded.length}
                      totalAmount={all_prospectsQualNeeded.length}
                      onClickSeeAll={() => {
                        seeAllType.current = "QUAL_NEEDED";
                        setSeeAllDrawerOpened(true);
                      }}
                      noneMsg="No qualifications to check"
                    >
                      <DashCardContents
                        prospect={prospectsQualNeeded[0]}
                        includeQualified
                      />
                    </NotificationCard>
                  )}
                </Stack>
              )}
            </ScrollArea>
          </Stack>
        </div>
      </Flex>
      {!isFetching && seeAllDrawerOpened && (
        <>
          {seeAllType.current === "CONTINUE_CONVO" && (
            <DashCardSeeAllDrawer
              prospects={all_prospectsNextSteps}
              title={"Continue the Conversation"}
              includeNote
            />
          )}
          {seeAllType.current === "HANDLE_OBJECTION" && (
            <DashCardSeeAllDrawer
              prospects={all_prospectsObjection}
              title={"Handle Objection"}
            />
          )}
          {seeAllType.current === "COMPLEX_QUESTION" && (
            <DashCardSeeAllDrawer
              prospects={all_prospectsQuestion}
              title={"Complex Question"}
            />
          )}
          {seeAllType.current === "QUAL_NEEDED" && (
            <DashCardSeeAllDrawer
              prospects={all_prospectsQualNeeded}
              title={"Qualifications Needed"}
              includeQualified
            />
          )}
          {seeAllType.current === "SCHEDULING" && (
            <DashCardSeeAllDrawer
              prospects={all_prospectsScheduled}
              title={"Scheduling"}
              includeSchedule
            />
          )}
        </>
      )}
      {!isFetching && demosDrawerOpened && (
        <>
          <DemoFeedbackDrawer prospects={all_prospectsDemo} refetch={refetch} />
        </>
      )}
      {!isFetching && demoFeedbackDrawerOpened && (
        <>
          <DemoFeedbackSeeAllDrawer prospects={all_prospectsDemo} />
        </>
      )}
    </>
  );
}
