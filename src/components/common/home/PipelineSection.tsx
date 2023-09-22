import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Box,
  Stack,
  Title,
  Text,
  Indicator,
  Paper,
  SimpleGrid,
  Center,
  LoadingOverlay,
} from "@mantine/core";
import { prospectDrawerOpenState } from "@atoms/prospectAtoms";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import DndColumns from "@common/library/DndColumns";
import { getProspectsForIncomePipeline } from "@utils/requests/getProspectsForIncomePipeline";
import { updateChannelStatus } from "@common/prospectDetails/ProspectDetailsChangeStatus";
import _ from "lodash";
import { pipelineProspectsState } from "@atoms/pipelineAtoms";
import ProspectDetailsDrawer from "@drawers/ProspectDetailsDrawer";
import { PipelineColumnHeader } from "./PipelineColumnHeader";
import { PipelineProspect } from "./PipelineProspect";

export type ProspectPipeline = {
  id: string;
  company_name: string;
  full_name: string;
  title: string;
  img_url: string;
  company_img_url: string;
  contract_size: string;
  li_url: string;
  company_url: string;
  last_updated: string;
  email_status: string;
  li_status: string;
  category: string;
};

export const getProspectList = (
  prospects: ProspectPipeline[],
  category: string
) => {
  return prospects
    .filter((d) => d.category === category)
    .sort((a, b) => {
      return (
        new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
      );
    });
};

export default function PipelineSection() {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const prospectDrawerOpened = useRecoilValue(prospectDrawerOpenState);
  const [data, setData] = useRecoilState(pipelineProspectsState);

  const { isFetching, refetch } = useQuery({
    queryKey: [`query-income-pipeline-prospects`],
    queryFn: async () => {
      const response = await getProspectsForIncomePipeline(userToken);
      if (response.status === "error") {
        return null;
      }

      const all_prospects: ProspectPipeline[] = [];
      all_prospects.push(
        ...response.data.active_convo.map((data: any) => ({
          ...data,
          category: "active_convo",
        }))
      );
      all_prospects.push(
        ...response.data.scheduling.map((data: any) => ({
          ...data,
          category: "scheduling",
        }))
      );
      all_prospects.push(
        ...response.data.demo_set.map((data: any) => ({
          ...data,
          category: "demo_set",
        }))
      );
      all_prospects.push(
        ...response.data.demo_won.map((data: any) => ({
          ...data,
          category: "demo_won",
        }))
      );
      all_prospects.push(
        ...response.data.not_interested.map((data: any) => ({
          ...data,
          category: "not_interested",
        }))
      );
      setData(_.uniqBy(all_prospects, "id"));
      return null;
    },
    refetchOnWindowFocus: false,
  });

  const activeConvoPercentage =
    userData.conversion_percentages?.active_convo || 0.02;
  const schedulingPercentage =
    userData.conversion_percentages?.scheduling || 0.1;
  const demoSetPercentage = userData.conversion_percentages?.demo_set || 0.2;
  const closedDemoPercentage = userData.conversion_percentages?.demo_won || 0.5;
  const notInterestedPercentage =
    userData.conversion_percentages?.not_interested || 0;
  const activeConvo_size =
    getProspectList(data || [], "active_convo").reduce(
      (acc, prospect) => acc + parseInt(prospect.contract_size),
      0
    ) * activeConvoPercentage;
  const scheduling_size =
    getProspectList(data || [], "scheduling").reduce(
      (acc, prospect) => acc + parseInt(prospect.contract_size),
      0
    ) * schedulingPercentage;
  const demoSet_size =
    getProspectList(data || [], "demo_set").reduce(
      (acc, prospect) => acc + parseInt(prospect.contract_size),
      0
    ) * demoSetPercentage;
  const demoWon_size =
    getProspectList(data || [], "demo_won").reduce(
      (acc, prospect) => acc + parseInt(prospect.contract_size),
      0
    ) * closedDemoPercentage;
  const notInterested_size =
    getProspectList(data || [], "not_interested").reduce(
      (acc, prospect) => acc + parseInt(prospect.contract_size),
      0
    ) * closedDemoPercentage;
  return (
    <>
      <LoadingOverlay visible={isFetching} />
      <Stack sx={{ overflowX: "auto" }}>
        <Box>
          <Title>Pipeline</Title>
          <Text pl={15}>
            <Indicator color="pink" inline processing size={15} offset={12}>
              <Box sx={{ visibility: "hidden" }}>.</Box>
            </Indicator>{" "}
            - {data?.filter((d) => d.category !== "not_interested").length}{" "}
            active opportunities • Sorted by last contacted • Last updated{" "}
            {moment(new Date()).format("MMMM D, YYYY")}
          </Text>
        </Box>
        <Box miw={"1000px"}>
          <Text fz="xs" fw={700} c="dimmed">
            AI Generated Pipeline
          </Text>
          <Box mt={"0.5rem"}>
            <SimpleGrid cols={5}>
              <PipelineArrow
                label={`💬 $${Math.floor(activeConvo_size).toLocaleString()}`}
                bg="grape"
              />
              <PipelineArrow
                label={`📆 $${Math.floor(scheduling_size).toLocaleString()}`}
                bg="indigo"
              />
              <PipelineArrow
                label={`🎯 $${Math.floor(demoSet_size).toLocaleString()}`}
                bg="blue"
              />
              <PipelineArrow
                label={`🎉 $${Math.floor(demoWon_size).toLocaleString()}`}
                bg="green"
              />{" "}
              <PipelineArrow
                label={`❌ $${Math.floor(notInterested_size).toLocaleString()}`}
                bg="orange"
                ending
              />
              <Box></Box>
            </SimpleGrid>
          </Box>
        </Box>
        <Box miw={"1000px"}>
          {data && (
            <DndColumns
              initialColumns={{
                active_convo: {
                  id: "active_convo",
                  header: (
                    <PipelineColumnHeader
                      bg="grape"
                      title="Active Conversation"
                      category={"active_convo"}
                      total={getProspectList(data, "active_convo").length}
                      conversion={activeConvoPercentage}
                    />
                  ),
                  data: getProspectList(data, "active_convo").map(
                    (prospect) => ({
                      id: prospect.id,
                      content: (
                        <PipelineProspect
                          key={prospect.id}
                          prospect={prospect}
                          bg="grape"
                        />
                      ),
                    })
                  ),
                },
                scheduling: {
                  id: "scheduling",
                  header: (
                    <PipelineColumnHeader
                      total={getProspectList(data, "scheduling").length}
                      bg="indigo"
                      title="Scheduling"
                      category={"scheduling"}
                      conversion={schedulingPercentage}
                    />
                  ),
                  data: getProspectList(data, "scheduling").map((prospect) => ({
                    id: prospect.id,
                    content: (
                      <PipelineProspect
                        key={prospect.id}
                        prospect={prospect}
                        bg="indigo"
                      />
                    ),
                  })),
                },
                demo_set: {
                  id: "demo_set",
                  header: (
                    <PipelineColumnHeader
                      title="Demo Set"
                      category={"demo_set"}
                      total={getProspectList(data, "demo_set").length}
                      conversion={demoSetPercentage}
                      bg="blue"
                    />
                  ),
                  data: getProspectList(data, "demo_set").map((prospect) => ({
                    id: prospect.id,
                    content: (
                      <PipelineProspect
                        key={prospect.id}
                        prospect={prospect}
                        bg="blue"
                      />
                    ),
                  })),
                },
                demo_won: {
                  id: "demo_won",
                  header: (
                    <PipelineColumnHeader
                      total={getProspectList(data, "demo_won").length}
                      title="Closed Won"
                      category={"demo_won"}
                      conversion={closedDemoPercentage}
                      bg="green"
                    />
                  ),
                  data: getProspectList(data, "demo_won").map((prospect) => ({
                    id: prospect.id,
                    content: (
                      <PipelineProspect
                        key={prospect.id}
                        prospect={prospect}
                        bg="green"
                      />
                    ),
                  })),
                },
                not_interested: {
                  id: "not_interested",
                  header: (
                    <PipelineColumnHeader
                      total={getProspectList(data, "not_interested").length}
                      title="Not Interested now"
                      category={"not_interested"}
                      conversion={notInterestedPercentage}
                      bg="orange"
                    />
                  ),
                  data: getProspectList(data, "not_interested").map(
                    (prospect) => ({
                      id: prospect.id,
                      content: (
                        <PipelineProspect
                          key={prospect.id}
                          prospect={prospect}
                          bg="orange"
                        />
                      ),
                    })
                  ),
                },
              }}
              onColumnChange={async (start, end, prospectId) => {
                // Update prospect category
                setData((prev) => {
                  if (!prev) return prev;
                  const newData = prev.map((prospect) => {
                    if (prospect.id == prospectId) {
                      return {
                        ...prospect,
                        category: end,
                      };
                    }
                    return prospect;
                  });
                  return newData;
                });

                if (end === "active_convo") {
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "LINKEDIN",
                    "ACTIVE_CONVO",
                    true,
                    true
                  );
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "EMAIL",
                    "ACTIVE_CONVO",
                    true,
                    true
                  );
                } else if (end === "scheduling") {
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "LINKEDIN",
                    "ACTIVE_CONVO_SCHEDULING",
                    true,
                    true
                  );
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "EMAIL",
                    "SCHEDULING",
                    true,
                    true
                  );
                } else if (end === "demo_set") {
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "LINKEDIN",
                    "DEMO_SET",
                    true,
                    true
                  );
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "EMAIL",
                    "DEMO_SET",
                    true,
                    true
                  );
                } else if (end === "demo_won") {
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "LINKEDIN",
                    "DEMO_WON",
                    true,
                    true
                  );
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "EMAIL",
                    "DEMO_WON",
                    true,
                    true
                  );
                } else if (end === "not_interested") {
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "LINKEDIN",
                    "NOT_INTERESTED",
                    true,
                    true
                  );
                  await updateChannelStatus(
                    +prospectId,
                    userToken,
                    "EMAIL",
                    "NOT_INTERESTED",
                    true,
                    true
                  );
                }

                //refetch();
              }}
            />
          )}
        </Box>
      </Stack>
      {prospectDrawerOpened && <ProspectDetailsDrawer />}
    </>
  );
}

function PipelineArrow(props: {
  label: string;
  ending?: boolean;
  height?: number;
  bg?: string;
}) {
  const height = props.height || 40;
  const arrowHeight = Math.sqrt((height * height) / 2);
  const extensionWidth = 10;

  return (
    <Box sx={{ position: "relative" }}>
      <Paper radius={0} h={height} bg={props.bg}>
        <Center h={height}>
          <Title order={5} color="white">
            {props.label}
          </Title>
        </Center>
      </Paper>

      {!props.ending && (
        <>
          <Box
            h={height}
            w={extensionWidth}
            bg={props.bg}
            sx={{
              position: "absolute",
              right: -(extensionWidth - 3),
              top: 0,
              bottom: 0,
              zIndex: 10,
            }}
          />

          <Box
            h={arrowHeight}
            w={arrowHeight}
            bg={props.bg}
            sx={{
              borderTop: "5px solid #fff",
              borderRight: "5px solid #fff",
              position: "absolute",
              right: -(arrowHeight / 2 + extensionWidth),
              top: (height - arrowHeight) / 2,
              transform: "rotate(45deg)",
              zIndex: 10,
            }}
          />
        </>
      )}
    </Box>
  );
}
