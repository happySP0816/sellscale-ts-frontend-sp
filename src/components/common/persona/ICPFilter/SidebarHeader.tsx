import { forwardRef, useEffect, useState } from "react";
import {
  Group,
  Box,
  rem,
  Title,
  Input,
  ActionIcon,
  Flex,
  useMantineTheme,
  Tooltip,
  Button,
  Switch,
  Text,
  Progress,
} from "@mantine/core";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconChevronLeft,
  IconInfoCircle,
} from "@tabler/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentProjectState } from "@atoms/personaAtoms";
import {
  filterProspectsState,
  filterRuleSetState,
} from "@atoms/icpFilterAtoms";
import { runScoringICP, updateICPRuleSet } from "@utils/requests/icpScoring";
import { userTokenState } from "@atoms/userAtoms";
import { showNotification } from "@mantine/notifications";
import { getICPScoringJobs } from "@utils/requests/getICPScoringJobs";
import { navConfettiState } from "@atoms/navAtoms";

type Props = {
  sideBarVisible: boolean;
  toggleSideBar: () => void;
  isTesting: boolean;
  setIsTesting: (val: boolean) => void;
};

const SwitchWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
  (props, ref) => (
    <div ref={ref} {...props}>
      {props.children}
    </div>
  )
);
export function SidebarHeader({
  toggleSideBar,
  sideBarVisible,
  isTesting,
  setIsTesting,
}: Props) {
  const [value, setValue] = useState("");
  const queryClient = useQueryClient();
  const userToken = useRecoilValue(userTokenState);
  const [_confetti, dropConfetti] = useRecoilState(navConfettiState);

  const [loading, setLoading] = useState(false);
  const currentProject = useRecoilValue(currentProjectState);
  const globalRuleSetData = useRecoilValue(filterRuleSetState);
  const icpProspects = useRecoilValue(filterProspectsState);

  const TRIGGER_REFRESH_INTERVAL = 10000; // 10000 ms = 10 seconds
  const TIME_PER_PROSPECT = 0.5; // 0.5 seconds
  const [icpScoringJobs, setIcpScoringJobs] = useState<any[]>([]);
  const [currentScoringJob, setCurrentScoringJob] = useState<any>(null);
  const [scoringTimeRemaining, setScoringTimeRemaining] = useState<number>(0);
  const [scoringProgress, setScoringProgress] = useState<number>(0);

  const triggerGetScoringJobs = async () => {
    if (!userToken || !currentProject?.id) return;

    const result = await getICPScoringJobs(userToken, currentProject?.id);
    console.log("result", result);

    const jobs = result?.data?.icp_runs;
    setIcpScoringJobs(jobs);

    if (
      jobs.length > 0 &&
      (jobs[0].run_status === "IN_PROGRESS" || jobs[0].run_status === "PENDING")
    ) {
      setCurrentScoringJob(jobs[0]);
      return;
    }

    setCurrentScoringJob(null);
    
    setTimeout(() => {
      queryClient.refetchQueries({
        queryKey: [`query-get-icp-prospects`],
      });
      dropConfetti(300);
    }, 1);
  };

  useEffect(() => {
    triggerGetScoringJobs();
  }, []);

  useEffect(() => {
    if (currentScoringJob) {
      // Get the job every 10 seconds
      const interval = setInterval(() => {
        triggerGetScoringJobs();
      }, TRIGGER_REFRESH_INTERVAL);
      // Calculate the progress using heuristic every 5 seconds
      const progressInterval = setInterval(() => {
        const numProspects = currentScoringJob.prospect_ids?.length;
        const estimatedSeconds = TIME_PER_PROSPECT * numProspects;
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

        const now = new Date().getUTCMilliseconds();
        const startedAt = new Date(
          currentScoringJob.updated_at
        ).getUTCMilliseconds();
        let timeElapsedMinutes = Math.ceil((now - startedAt) / 1000 / 60);
        if (timeElapsedMinutes > estimatedMinutes) {
          timeElapsedMinutes = estimatedMinutes - 1;
        }
        const timeRemaining = estimatedMinutes - timeElapsedMinutes;
        let progress = (1 - timeRemaining / estimatedMinutes) * 100;
        progress = Math.floor(Math.min(progress, 99));
        setScoringTimeRemaining(timeRemaining);
        setScoringProgress(progress);
      }, 2000);

      return () => {
        clearInterval(interval);
        clearInterval(progressInterval);
      };
    }
  }, [currentScoringJob]);

  return (
    <>
      <Box
        sx={(theme) => ({
          padding: theme.spacing.sm,
          borderBottom: `${rem(1)} solid ${
            theme.colorScheme === "dark"
              ? theme.colors.dark[4]
              : theme.colors.gray[2]
          }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          backgroundColor: theme.fn.variant({
            variant: "filled",
            color: theme.primaryColor,
          }).background,
        })}
      >
        <Group position="apart" style={{ width: "100%" }} display={"flex"}>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#fff",
              justifyContent: "space-between",
            }}
            w="100%"
          >
            {sideBarVisible && <Title size={"14px"}>Filter Contacts</Title>}
            <ActionIcon
              onClick={() => toggleSideBar()}
              className="ml-auto"
              variant="filled"
              color="blue"
            >
              <IconChevronLeft
                size={24}
                // color="#fff"
                style={{
                  transform: sideBarVisible ? "" : "rotate(180deg)",
                  transition: "all",
                  transitionDuration: "150ms",
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </ActionIcon>
          </Box>
        </Group>
      </Box>
      <Flex
        direction={"column"}
        gap={"0.5rem"}
        mt={"0.5rem"}
        sx={{
          borderBottom: "solid 1px #CCC",
          paddingBottom: "16px",
          display: sideBarVisible ? "flex" : "none",
        }}
      >
        <Flex px={"md"} align={"center"} gap={"0.5rem"}>
          {/* <Input
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search"
          /> */}

          {/* <Tooltip label="OK">
            <ActionIcon size={"sm"}>
              <IconInfoCircle />
            </ActionIcon>
          </Tooltip> */}
        </Flex>

        <Flex px={"md"} align={"center"} gap={"0.5rem"}>
          <Button
            rightIcon={isTesting ? null : <IconArrowNarrowRight size={24} />}
            size="xs"
            mt={"0.5rem"}
            fullWidth
            loading={loading}
            color={isTesting ? "blue" : "red"}
            onClick={async () => {
              if (!currentProject) return;
              setLoading(true);
              console.log("updating rule set");

              showNotification({
                title: "Filtering prospects...",
                message: "Applying filters to prospects",
                color: "blue",
              });

              const response = await updateICPRuleSet(
                userToken,
                currentProject.id,
                globalRuleSetData.included_individual_title_keywords,
                globalRuleSetData.excluded_individual_title_keywords,
                globalRuleSetData.included_individual_industry_keywords,
                globalRuleSetData.individual_years_of_experience_start,
                globalRuleSetData.individual_years_of_experience_end,
                globalRuleSetData.included_individual_skills_keywords,
                globalRuleSetData.excluded_individual_skills_keywords,
                globalRuleSetData.included_individual_locations_keywords,
                globalRuleSetData.excluded_individual_locations_keywords,
                globalRuleSetData.included_individual_generalized_keywords,
                globalRuleSetData.excluded_individual_generalized_keywords,
                globalRuleSetData.included_company_name_keywords,
                globalRuleSetData.excluded_company_name_keywords,
                globalRuleSetData.included_company_locations_keywords,
                globalRuleSetData.excluded_company_locations_keywords,
                globalRuleSetData.company_size_start,
                globalRuleSetData.company_size_end,
                globalRuleSetData.included_company_industries_keywords,
                globalRuleSetData.excluded_company_industries_keywords,
                globalRuleSetData.included_company_generalized_keywords,
                globalRuleSetData.excluded_company_generalized_keywords
              );
              console.log("response", response);
              console.log("running scoring");

              await runScoringICP(
                userToken,
                currentProject.id,
                isTesting
                  ? icpProspects.map((prospect) => prospect.id)
                  : undefined
              );
              console.log("refetching queries");

              setLoading(false);

              if (isTesting) {
                showNotification({
                  title: "Test sample has been scored!",
                  message: "The test sample has been filtered",
                  color: "green",
                });
              } else {
                showNotification({
                  title: "Prospects are being scored...",
                  message:
                    "This may take a few minutes. Please check back and refresh page..",
                  color: "blue",
                });
              }

              triggerGetScoringJobs().then(() => {
                if (isTesting) {
                  queryClient.refetchQueries({
                    queryKey: [`query-get-icp-prospects`],
                  });
                  dropConfetti(300);
                }
              });
            }}
          >
            {isTesting ? "Filter test sample" : "Start Filtering"}
          </Button>
          <Tooltip label="(Test Mode) View sample of 50 prospects">
            <SwitchWrapper>
              <Box sx={{ textAlign: "center", justifyContent: "center" }}>
                <Text fz="9px">Test Sample</Text>
                <Flex>
                  <Switch
                    ml="md"
                    mt="xs"
                    size="xs"
                    onChange={(event) => {
                      setIsTesting(event.currentTarget.checked);
                    }}
                  />
                  <Text size="xs" ml="6px" mt="10px">
                    {" "}
                    ℹ️
                  </Text>
                </Flex>
              </Box>
            </SwitchWrapper>
          </Tooltip>
        </Flex>

        {currentScoringJob ? (
          <>
            <Flex mt="md" justify="space-evenly">
              <Text fz="10px" w="25%" ml="md" fw="bold">
                Scoring...
              </Text>
              <Text fz="10px" w="50%" align="center">
                {scoringTimeRemaining} mins remaining
              </Text>
              <Text fz="10px" w="25%" align="right" mr="md" fw="bold">
                {scoringProgress}%
              </Text>
            </Flex>
            <Progress ml="md" mr="md" value={scoringProgress} />
          </>
        ) : (
          <>
            <Flex mt="md" justify="space-between">
              <Text fz="10px" w="25%" ml="md" fw="bold">
                Complete
              </Text>
              <Text fz="10px" w="25%" align="right" mr="md" fw="bold">
                100%
              </Text>
            </Flex>
            <Progress ml="md" mr="md" value={100} />
          </>
        )}
      </Flex>
    </>
  );
}
