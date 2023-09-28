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
        // boxShadow: "0px 0px 10px 0px rgba(0, 0, 0, 0.15)",
        display: "flex",
        marginTop: "auto",
        flexDirection: "column",
      }}
    >
      {/* Something can go here! */}
    </Box>
  );
}
