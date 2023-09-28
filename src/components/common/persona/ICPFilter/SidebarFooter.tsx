import { IconArrowNarrowRight, IconBookmark } from "@tabler/icons-react";
import { Box, useMantineTheme, Button, Title, Text } from "@mantine/core";
import { useRecoilValue } from "recoil";
import { filterProspectsState, filterRuleSetState } from "@atoms/icpFilterAtoms";
import { useState } from "react";
import { runScoringICP, updateICPRuleSet } from "@utils/requests/icpScoring";
import { userTokenState } from "@atoms/userAtoms";
import { currentProjectState } from "@atoms/personaAtoms";
import { ProspectICP } from "src";
import { useQueryClient } from "@tanstack/react-query";

export function SidebarFooter(props: { isTesting: boolean }) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const [loading, setLoading] = useState(false);
  const globalRuleSetData = useRecoilValue(filterRuleSetState);
  const icpProspects = useRecoilValue(filterProspectsState);

  return (
    <Box
      sx={{
        padding: theme.spacing.sm,
        boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.15)",
        display: "flex",
        marginTop: "auto",
        flexDirection: "column",
      }}
    >
      <Box>
        {props.isTesting ? (
          <Text color="red" fz={"0.75rem"} fw={700}>
            Test Mode: Note that you are currently in test mode and only running
            scoring on 50 prospects.
          </Text>
        ) : (
          <Text color="red" fz={"0.75rem"} fw={700}>
            Warning: You are about to run on all prospects and this may take a
            while. Run on a sample of 50 prospects to see results faster.
          </Text>
        )}
      </Box>
      <Button
        rightIcon={props.isTesting ? null : <IconArrowNarrowRight size={24} />}
        mt={"0.5rem"}
        fullWidth
        loading={loading}
        color={props.isTesting ? "blue" : "red"}
        onClick={async () => {
          if(!currentProject) return;
          setLoading(true);
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

          await runScoringICP(userToken, currentProject.id, props.isTesting ? icpProspects.map((prospect) => prospect.id) : undefined);

          queryClient.refetchQueries({
            queryKey: [`query-get-icp-prospects`],
          });

          setLoading(false);
        }}
      >
        {props.isTesting ? "Filter test sample" : "Start Filtering"}
      </Button>

      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "0.5rem",
        }}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            color: theme.colors.gray[6],
          }}
        >
          <IconBookmark size={16} />
          <Title size={"12px"}>Saved filters</Title>
        </Box>
        <Button variant="light" size="xs">
          Save search
        </Button>
      </Box>
    </Box>
  );
}
