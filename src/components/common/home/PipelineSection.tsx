import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import { useEffect, useState } from "react";
import { getProspectEvents } from "@utils/requests/prospectEvents";
import { useRecoilState, useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import {
  Box,
  Stack,
  Title,
  Text,
  useMantineTheme,
  Indicator,
  Paper,
  Grid,
  SimpleGrid,
  Divider,
  Center,
  createStyles,
  rem,
  Flex,
  Group,
  Avatar,
  ActionIcon,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import {
  convertDateToCasualTime,
  getFavIconFromURL,
  nameToInitials,
  proxyURL,
  valueToColor,
} from "@utils/general";
import { navigateToPage } from "@utils/documentChange";
import { useNavigate } from "react-router-dom";
import {
  prospectDrawerIdState,
  prospectDrawerOpenState,
} from "@atoms/prospectAtoms";
import moment from "moment";
import { useListState } from "@mantine/hooks";
import { Prospect } from "src";
import { useQuery } from "@tanstack/react-query";
import { getProspectsForICP } from "@utils/requests/getProspectsForICP";
import { currentProjectState } from "@atoms/personaAtoms";
import DndColumns from "@common/library/DndColumns";
import { getProspectsForIncomePipeline } from "@utils/requests/getProspectsForIncomePipeline";
import { companyImageCacheState } from "@atoms/cacheAtoms";
import { updateChannelStatus } from "@common/prospectDetails/ProspectDetailsChangeStatus";
import _ from "lodash";
import { pipelineProspectsState } from "@atoms/pipelineAtoms";
import { IconArrowRight, IconBrandLinkedin, IconWorld } from "@tabler/icons";
import ProspectDetailsDrawer from "@drawers/ProspectDetailsDrawer";

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

const getProspectList = (prospects: ProspectPipeline[], category: string) => {
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

  return (
    <>
      <LoadingOverlay visible={isFetching} />
      <Stack>
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
        <Box>
          <Text fz="xs" fw={700} c="dimmed">
            AI Generated Pipeline
          </Text>
          <Box>
            <SimpleGrid cols={5}>
              <PipelineArrow
                label={`💬 $${Math.floor(activeConvo_size).toLocaleString()}`}
              />
              <PipelineArrow
                label={`📆 $${Math.floor(scheduling_size).toLocaleString()}`}
              />
              <PipelineArrow
                label={`🎯 $${Math.floor(demoSet_size).toLocaleString()}`}
              />
              <PipelineArrow
                label={`🎉 $${Math.floor(demoWon_size).toLocaleString()}`}
                ending
              />
              <Box></Box>
            </SimpleGrid>
          </Box>
        </Box>
        {data && (
          <DndColumns
            wrapInPaper
            initialColumns={{
              active_convo: {
                id: "active_convo",
                header: (
                  <PipelineColumnHeader
                    title="Active Conversation"
                    category={"active_convo"}
                    conversion={activeConvoPercentage}
                  />
                ),
                data: getProspectList(data, "active_convo").map((prospect) => ({
                  id: prospect.id,
                  content: (
                    <PipelineProspect key={prospect.id} prospect={prospect} />
                  ),
                })),
              },
              scheduling: {
                id: "scheduling",
                header: (
                  <PipelineColumnHeader
                    title="Scheduling"
                    category={"scheduling"}
                    conversion={schedulingPercentage}
                  />
                ),
                data: getProspectList(data, "scheduling").map((prospect) => ({
                  id: prospect.id,
                  content: (
                    <PipelineProspect key={prospect.id} prospect={prospect} />
                  ),
                })),
              },
              demo_set: {
                id: "demo_set",
                header: (
                  <PipelineColumnHeader
                    title="Demo Set"
                    category={"demo_set"}
                    conversion={demoSetPercentage}
                  />
                ),
                data: getProspectList(data, "demo_set").map((prospect) => ({
                  id: prospect.id,
                  content: (
                    <PipelineProspect key={prospect.id} prospect={prospect} />
                  ),
                })),
              },
              demo_won: {
                id: "demo_won",
                header: (
                  <PipelineColumnHeader
                    title="Closed Won"
                    category={"demo_won"}
                    conversion={closedDemoPercentage}
                  />
                ),
                data: getProspectList(data, "demo_won").map((prospect) => ({
                  id: prospect.id,
                  content: (
                    <PipelineProspect key={prospect.id} prospect={prospect} />
                  ),
                })),
              },
              not_interested: {
                id: "not_interested",
                header: (
                  <PipelineColumnHeader
                    title="Not Interested now"
                    category={"not_interested"}
                    conversion={notInterestedPercentage}
                  />
                ),
                data: getProspectList(data, "not_interested").map(
                  (prospect) => ({
                    id: prospect.id,
                    content: (
                      <PipelineProspect key={prospect.id} prospect={prospect} />
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
      </Stack>
      {prospectDrawerOpened && <ProspectDetailsDrawer />}
    </>
  );
}

function PipelineArrow(props: {
  label: string;
  ending?: boolean;
  height?: number;
}) {
  let height = props.height || 40;
  let arrowHeight = Math.sqrt((height * height) / 2);
  let extensionWidth = 10;

  return (
    <Box sx={{ position: "relative" }}>
      <Paper radius={0} h={height} withBorder>
        <Center h={height}>
          <Title order={5}>{props.label}</Title>
        </Center>
      </Paper>

      {!props.ending && (
        <>
          <Paper
            radius={0}
            h={height}
            w={extensionWidth}
            withBorder
            sx={{
              borderWidth: "1px 0px 1px 0!important",
              position: "absolute",
              right: -(extensionWidth - 1),
              top: 0,
              zIndex: 10,
            }}
          ></Paper>

          <Paper
            h={arrowHeight}
            w={arrowHeight}
            radius={0}
            withBorder
            sx={{
              borderWidth: "1px 1px 0 0!important",
              position: "absolute",
              right: -(arrowHeight / 2 + extensionWidth - 1),
              top: (height - arrowHeight) / 2,
              transform: "rotate(45deg)",
              zIndex: 10,
            }}
          ></Paper>
        </>
      )}
    </Box>
  );
}

function PipelineColumnHeader(props: {
  title: string;
  category: string;
  conversion: number;
}) {
  const prospects = useRecoilValue(pipelineProspectsState);

  const rawContractSize = getProspectList(
    prospects || [],
    props.category
  ).reduce((acc, prospect) => acc + parseInt(prospect.contract_size), 0);

  return (
    <Box>
      <Title order={6}>{props.title}</Title>
      <Text fz="xs" c="dimmed">
        Raw: ${rawContractSize.toLocaleString()} | Conversion:{" "}
        {props.conversion*100}%
      </Text>
      <Text fz="xs" fw={700} c="pink.7">
        Predicted Total: $
        {Math.floor(rawContractSize * props.conversion).toLocaleString()}
      </Text>
      <Divider my={5} />
    </Box>
  );
}

function PipelineProspect(props: { prospect: ProspectPipeline }) {
  const theme = useMantineTheme();

  const [_opened, setOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  const [companyImageCache, setCompanyImageCache] = useRecoilState(
    companyImageCacheState
  );
  const getCompanyImage = async () => {
    const url = companyImageCache.get(props.prospect.company_name);
    if (url) {
      return url;
    }

    const foundUrl = await getFavIconFromURL(props.prospect.company_url);
    if (foundUrl) {
      setCompanyImageCache(
        companyImageCache.set(props.prospect.company_name, foundUrl)
      );
    }
    return foundUrl;
  };
  const [companyIcon, setCompanyIcon] = useState<string | null>(null);
  useEffect(() => {
    getCompanyImage().then((data) => {
      setCompanyIcon(data);
    });
  }, []);

  return (
    <Group
      spacing={0}
      w="100%"
      px={5}
      position="apart"
      align="flex-start"
      noWrap
      sx={{ position: "relative" }}
    >
      <Box sx={{ flexBasis: "66%" }}>
        <Group
          position="apart"
          align="flex-start"
          sx={{ flexDirection: "column" }}
        >
          <Group spacing={10} align="flex-start" noWrap>
            <Indicator
              inline
              size={16}
              offset={8}
              position="bottom-end"
              label={
                <Avatar
                  src={proxyURL(props.prospect.img_url)}
                  alt={props.prospect.full_name}
                  color={valueToColor(theme, props.prospect.full_name)}
                  radius="xl"
                  size={20}
                >
                  {nameToInitials(props.prospect.full_name)}
                </Avatar>
              }
              styles={{
                indicator: {
                  backgroundColor: "#00000000", // transparent
                  zIndex: 1,
                },
              }}
            >
              <Avatar
                src={companyIcon}
                alt={props.prospect.company_name}
                color={valueToColor(theme, props.prospect.company_name)}
                radius="xl"
              >
                {nameToInitials(props.prospect.company_name)}
              </Avatar>
            </Indicator>
            <Stack spacing={0}>
              <Text fz="sm" fw={700} h={16} truncate>
                {_.truncate(props.prospect.company_name, { length: 16 })}
              </Text>
              <Text fz={10} h={13} truncate>
                {_.truncate(props.prospect.full_name, { length: 22 })}
              </Text>
              <Text fz={8} fw={400} fs="italic">
                {_.truncate(props.prospect.title, { length: 50 })}
              </Text>
            </Stack>
          </Group>
          <Box sx={{ position: "absolute", left: 5, bottom: 0 }}>
            <Button
              variant="subtle"
              color="pink"
              size="xs"
              onClick={() => {
                setProspectId(+props.prospect.id);
                setOpened(true);
              }}
              rightIcon={<IconArrowRight size="1rem" />}
            >
              Open Prospect
            </Button>
          </Box>
        </Group>
      </Box>
      <Box sx={{ flexBasis: "34%" }}>
        <Stack spacing={8}>
          <Box>
            <Text fz={8} fw={700} c="dimmed" tt="uppercase" ta="right">
              Last Updated:
            </Text>
            <Text fz={10} h={13} ta="right" truncate>
              {convertDateToCasualTime(
                new Date(props.prospect.last_updated + " UTC")
              )}
            </Text>
          </Box>
          <Box>
            <Text fz={8} fw={700} c="dimmed" tt="uppercase" ta="right">
              Est Deal Value:
            </Text>
            <Text fz={10} h={13} ta="right">
              ${parseInt(props.prospect.contract_size).toLocaleString()}
            </Text>
          </Box>
          <Group spacing={5} position="right" noWrap>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => {
                const company_url = !props.prospect.company_url.startsWith(
                  "http"
                )
                  ? "https://" + props.prospect.company_url
                  : props.prospect.company_url;
                window.open(company_url, "_blank");
              }}
            >
              <IconWorld size="1rem" />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => {
                const li_url = !props.prospect.li_url.startsWith("http")
                  ? "https://" + props.prospect.li_url
                  : props.prospect.li_url;
                window.open(li_url, "_blank");
              }}
            >
              <IconBrandLinkedin size="1rem" />
            </ActionIcon>
          </Group>
        </Stack>
      </Box>
    </Group>
  );
}
