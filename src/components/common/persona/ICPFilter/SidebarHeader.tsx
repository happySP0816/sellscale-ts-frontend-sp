import { forwardRef, useState } from "react";
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
} from "@mantine/core";
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconChevronLeft, IconInfoCircle } from "@tabler/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from 'recoil';
import { currentProjectState } from '@atoms/personaAtoms';
import { filterProspectsState, filterRuleSetState } from '@atoms/icpFilterAtoms';
import { runScoringICP, updateICPRuleSet } from '@utils/requests/icpScoring';
import { userTokenState } from '@atoms/userAtoms';

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

  const [loading, setLoading] = useState(false);
  const currentProject = useRecoilValue(currentProjectState);
  const globalRuleSetData = useRecoilValue(filterRuleSetState);
  const icpProspects = useRecoilValue(filterProspectsState);

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
      <Flex direction={"column"} gap={"0.5rem"} mt={"0.5rem"} sx={{
        borderBottom: 'solid 1px #CCC', paddingBottom: '16px'
      }}>
        <Flex px={"md"} align={"center"} gap={"0.5rem"}>
          <Input
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search"
          />

          <Tooltip label="OK">
            <ActionIcon size={"sm"}>
              <IconInfoCircle />
            </ActionIcon>
          </Tooltip>
        </Flex>

        <Flex px={"md"} align={"center"} gap={"0.5rem"}>
          <Button
            rightIcon={isTesting ? null : <IconArrowNarrowRight size={24} />}
            size='xs'
            mt={"0.5rem"}
            fullWidth
            loading={loading}
            color={isTesting ? "blue" : "red"}
            onClick={async () => {
              if (!currentProject) return;
              setLoading(true);
              console.log("updating rule set");
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

              queryClient.refetchQueries({
                queryKey: [`query-get-icp-prospects`],
              });
              console.log("done");

              setLoading(false);
            }}
          >
            {isTesting ? "Filter test sample" : "Start Filtering"}
          </Button>
          <Tooltip label="(Test Mode) View sample of 50 prospects">
            <SwitchWrapper>
              <Box sx={{textAlign: 'center', justifyContent: 'center'}}>
                <Text fz='9px'>Test Sample ℹ️</Text>
                <Flex>
                  <Switch
                    ml='lg'
                    mt='xs'
                    size='xs'
                    onChange={(event) => {
                      setIsTesting(event.currentTarget.checked);
                    }}
                  />
                </Flex>
              </Box>
            </SwitchWrapper>
          </Tooltip>
        </Flex>
      </Flex>
    </>
  );
}
