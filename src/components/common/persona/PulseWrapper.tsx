import { currentProjectState } from "@atoms/personaAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import Pulse from "./Pulse";
import { Box, Stack, Tabs } from "@mantine/core";
import { IconMessageCircle, IconSettings } from "@tabler/icons";
import PulseBarChart from "@common/charts/PulseBarChart";

export const PulseWrapper = () => {
  const currentProject = useRecoilValue(currentProjectState);

  if (!currentProject) return null;

  return (
    <Box m='md'>
      <Stack>
        <Pulse personaOverview={currentProject} />
        <PulseBarChart />
      </Stack>
      {/* <Tabs variant="pills" defaultValue="breakdown">
        <Tabs.List>
          <Tabs.Tab
            value="breakdown"
            icon={<IconMessageCircle size="0.8rem" />}
          >
            ICP Breakdown
          </Tabs.Tab>
          <Tabs.Tab value="ai-filter" icon={<IconSettings size="0.8rem" />}>
            AI Filter
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="breakdown" pt="xs">
          <PulseBarChart />
        </Tabs.Panel>

        <Tabs.Panel value="ai-filter" pt="xs">
          <Pulse personaOverview={currentProject} />
        </Tabs.Panel>
      </Tabs> */}
    </Box>
  );
};
