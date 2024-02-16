import { forwardRef, useEffect, useState } from 'react';
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
} from '@mantine/core';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconChevronLeft,
  IconInfoCircle,
  IconQuestionCircle,
} from '@tabler/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { currentProjectState } from '@atoms/personaAtoms';
import { filterProspectsState, filterRuleSetState } from '@atoms/icpFilterAtoms';
import { getICPRuleSet, runScoringICP, updateICPRuleSet } from '@utils/requests/icpScoring';
import { userTokenState } from '@atoms/userAtoms';
import { showNotification } from '@mantine/notifications';
import { getICPScoringJobs } from '@utils/requests/getICPScoringJobs';
import { navConfettiState } from '@atoms/navAtoms';
import { getProspectsForICP } from '@utils/requests/getProspects';
import { ProspectICP } from '../Pulse';
import { set } from 'lodash';

type Props = {
  sideBarVisible: boolean;
  toggleSideBar: () => void;
  isTesting: boolean;
  setIsTesting: (val: boolean) => void;
};

const SwitchWrapper = forwardRef<HTMLDivElement, { children: React.ReactNode }>((props, ref) => (
  <div ref={ref} {...props}>
    {props.children}
  </div>
));
export function SidebarHeader({ toggleSideBar, sideBarVisible, isTesting, setIsTesting }: Props) {
  const [value, setValue] = useState('');
  const queryClient = useQueryClient();
  const userToken = useRecoilValue(userTokenState);
  const [_confetti, dropConfetti] = useRecoilState(navConfettiState);

  const currentProject = useRecoilValue(currentProjectState);
  const globalRuleSetData = useRecoilValue(filterRuleSetState);
  const icpProspects = useRecoilValue(filterProspectsState);

  const TRIGGER_REFRESH_INTERVAL = 1000; // = 1 seconds
  const TIME_PER_PROSPECT = 0.1; // 0.1 seconds
  const [icpScoringJobs, setIcpScoringJobs] = useState<any[]>([]);
  const [currentScoringJob, setCurrentScoringJob] = useState<any>(null);
  const [scoringTimeRemaining, setScoringTimeRemaining] = useState<number>(0);
  const [scoringProgress, setScoringProgress] = useState<number>(0);

  const [scoring, setScoring] = useState(false);

  // const triggerGetScoringJobs = async () => {
  //   if (!userToken || !currentProject?.id) return;

  //   const result = await getICPScoringJobs(userToken, currentProject?.id);
  //   console.log('result', result);

  //   const jobs = result?.data?.icp_runs;
  //   setIcpScoringJobs(jobs);

  //   if (
  //     jobs.length > 0 &&
  //     (jobs[0].run_status === 'IN_PROGRESS' || jobs[0].run_status === 'PENDING')
  //   ) {
  //     setCurrentScoringJob(jobs[0]);
  //     return jobs[0];
  //   }

  //   setCurrentScoringJob(null);
  //   queryClient.refetchQueries({
  //     queryKey: [`query-get-icp-prospects`],
  //   });

  //   setTimeout(() => {
  //     dropConfetti(300);
  //   }, 1000);
  // };

  // useEffect(() => {
  //   triggerGetScoringJobs();
  // }, []);

  const { data } = useQuery({
    queryKey: [`query-check-scoring-job-status`],
    queryFn: async () => {
      // const job = await triggerGetScoringJobs();
      // if (job) {
      //   const numProspects = job.prospect_ids?.length;
      //   const estimatedSeconds = TIME_PER_PROSPECT * numProspects;

      //   const now = new Date().getTime();
      //   const startedAt = new Date(job.created_at).getTime();
      //   let timeElapsedSeconds = (now - startedAt) / 1000;

      //   const timeRemaining = Math.ceil((estimatedSeconds - timeElapsedSeconds) / 60);
      //   setScoringTimeRemaining(timeRemaining);

      //   let progress = 100 - ((estimatedSeconds - timeElapsedSeconds) / estimatedSeconds) * 100;
      //   setScoringProgress(Math.floor(Math.min(progress, 99)));
      // }
      // return job ?? null;

      const result = await getProspectsForICP(userToken, currentProject!.id, isTesting, false);
      const prospects =
        result.status === 'success' ? (result.data.prospects as ProspectICP[]) : null;
      if (!prospects) return null;

      const resRules = await getICPRuleSet(userToken, currentProject!.id);
      const rules = resRules.status === 'success' ? resRules.data : null;

      const scoredProspects = prospects.filter((prospect) => {
        return rules.hash === prospect.icp_fit_last_hash;
      });

      setScoringProgress((scoredProspects.length / prospects.length) * 100);

      if (scoredProspects.length / prospects.length === 1) {
        queryClient.refetchQueries({
          queryKey: [`query-get-icp-prospects`],
        });
        dropConfetti(300);
        setScoring(false);
      }
    },
    enabled: scoring,
    refetchInterval: TRIGGER_REFRESH_INTERVAL,
  });

  return (
    <>
      <Flex
        direction={'column'}
        gap={'0.5rem'}
        sx={{
          borderBottom: 'solid 1px #CCC',
          paddingBottom: '16px',
          display: sideBarVisible ? 'flex' : 'none',
        }}
        w={'360px'}
      >
        <Flex px={'md'} align={'center'} gap={'0.5rem'}>
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
        <Flex align={'start'} gap={'0.5rem'} direction={'row'}>
          <Button
            rightIcon={isTesting ? null : <IconArrowNarrowRight size={24} />}
            size='sm'
            radius={'md'}
            mt={'-0.4rem'}
            fullWidth
            loading={scoring}
            color={isTesting ? 'blue' : 'red'}
            onClick={async () => {
              if (!currentProject) return;
              console.log('updating rule set');

              showNotification({
                title: 'Filtering prospects...',
                message: 'Applying filters to prospects',
                color: 'blue',
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
                globalRuleSetData.excluded_company_generalized_keywords,
                globalRuleSetData.included_individual_education_keywords,
                globalRuleSetData.excluded_individual_education_keywords,
                globalRuleSetData.included_individual_seniority_keywords,
                globalRuleSetData.excluded_individual_seniority_keywords
              );
              console.log('response', response);
              console.log('running scoring');

              runScoringICP(
                userToken,
                currentProject.id,
                isTesting ? icpProspects.map((prospect) => prospect.id) : undefined
              );

              setScoring(true);

              // console.log('refetching queries');

              // if (isTesting) {
              //   showNotification({
              //     title: 'Test sample has been scored!',
              //     message: 'The test sample has been filtered',
              //     color: 'green',
              //   });
              // } else {
              //   showNotification({
              //     title: 'Prospects are being scored...',
              //     message: 'This may take a few minutes. Please check back and refresh page..',
              //     color: 'blue',
              //   });
              // }

              // triggerGetScoringJobs().then(() => {
              //   if (isTesting) {
              //     queryClient.refetchQueries({
              //       queryKey: [`query-get-icp-prospects`],
              //     });
              //     dropConfetti(300);
              //   }
              // });
            }}
          >
            {isTesting ? 'Filter test sample' : 'Start Filtering'}
          </Button>
        </Flex>
        <Flex
          align={'center'}
          justify={'space-between'}
          pb={'sm'}
          style={{
            borderBottom: '1px solid gray',
            borderBottomStyle: 'dashed',
          }}
          px={10}
        >
          <Tooltip label='(Test Mode) View sample of 50 prospects'>
            <SwitchWrapper>
              <Box sx={{ textAlign: 'center', justifyContent: 'center' }}>
                <Flex align={'center'} gap={4}>
                  <Text color='gray'>Test Sample</Text>
                  <Switch
                    size='xs'
                    onChange={(event) => {
                      setIsTesting(event.currentTarget.checked);
                    }}
                  />
                  <IconQuestionCircle color='orange' size={20} />
                </Flex>
              </Box>
            </SwitchWrapper>
          </Tooltip>
          <Text style={{ textDecoration: 'underline', textDecorationStyle: 'dashed' }} color='gray'>
            Clear Filters
          </Text>
        </Flex>

        <Flex align={'center'} gap={14} mt={'sm'} px={10}>
          <Text w={'fit-content'} style={{ display: 'flex', gap: '6px' }} color='gray'>
            {currentScoringJob ? 'Complete:' : 'Scored:'}{' '}
            <span style={{ fontWeight: '600', color: 'black' }}>
              {Math.round(scoringProgress)}%
            </span>
          </Text>
          <Progress w={'100%'} value={scoringProgress} />
        </Flex>
      </Flex>
    </>
  );
}
