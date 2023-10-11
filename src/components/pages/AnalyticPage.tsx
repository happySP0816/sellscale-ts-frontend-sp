import Cards from "@common/analytics/CumulativeGrowth/Cards";
import CumulativeGrowthChart from "@common/analytics/CumulativeGrowth/CumulativeGrowthChart";
import FeedbackTable from "@common/analytics/FeedbackTable/FeedbackTable";
import { OverallPerformanceChart } from "@common/analytics/OverallPerformanceChart";
import OverallPerformanceProgress from "@common/analytics/OverallPerformanceProgress/OverallPerformanceProgress";
import PipelineSection from "@common/home/PipelineSection";
import {
  Box,
  Divider,
  Flex,
  Paper,
  Tabs,
  Title,
  Text,
  Button,
  rem,
} from "@mantine/core";
import { IconCalendar } from "@tabler/icons";
import { useState } from "react";

export const borderGray = "#E9ECEF";

const AnalyticPage = () => {
  const [period] = useState("Nov 01 - Nov 12");
  return (
    <div>
      <Title>Analytics</Title>

      <Tabs
        defaultValue="overall_pipeline"
        px={20}
        py={10}
        styles={(theme) => ({
          tab: {
            ...theme.fn.focusStyles(),

            "&[data-active]": {
              borderColor: theme.colors.blue[theme.fn.primaryShade()],
              color: theme.colors.blue[theme.fn.primaryShade()],
            },
          },
        })}
      >
        <Tabs.List>
          <Tabs.Tab value="overall_pipeline">Overall Pipeline</Tabs.Tab>
          <Tabs.Tab value="prospect_fit">Prospect Fit</Tabs.Tab>
          <Tabs.Tab value="volume">volume</Tabs.Tab>
          <Tabs.Tab value="sdr_action_items">SDR Action Items</Tabs.Tab>

          <Flex
            gap={"0.5rem"}
            align={"center"}
            mb={"xs"}
            sx={{ flex: "auto" }}
            justify={{ md: "flex-end" }}
          >
            <Text fz={"0.75rem"} color="gray.6">
              Date Period:
            </Text>
            <Button
              variant={"outline"}
              size="xs"
              px={"1.5rem"}
              sx={{
                borderRadius: 999,
              }}
              leftIcon={<IconCalendar size={"1rem"} />}
            >
              Last 12 Days:{" "}
              <Text ml={"0.5rem"} color="gray.6">
                {period}
              </Text>
            </Button>
          </Flex>
        </Tabs.List>

        <Tabs.Panel value="overall_pipeline">
          <Paper radius={"lg"} mt="md">
            <Flex>
              <Box
                w={"50%"}
                style={{
                  borderRightWidth: "1px",
                  borderRightStyle: "dashed",
                  borderRightColor: borderGray,
                }}
              >
                <Box p={"lg"}>
                  <Title order={2}>Overall Performance</Title>
                  <Text color="gray.6" size={"sm"} fw={700} mt={"xs"}>
                    Random text
                  </Text>
                </Box>
                <OverallPerformanceChart
                  data={{
                    sentOutreach: 12,
                    accepted: 11,
                    activeConvos: 35,
                    demos: 15,
                  }}
                />
              </Box>
              <Flex w={"50%"} p={"1rem"} align={"center"}>
                <OverallPerformanceProgress />
              </Flex>
            </Flex>
          </Paper>

          <Paper radius={"lg"} mt="md" p={"lg"}>
            <FeedbackTable />
          </Paper>
          <Divider
            variant="solid"
            my="lg"
            label={
              <Text fw={700} size={"lg"}>
                Cumulatative Growth
              </Text>
            }
            labelPosition="center"
          />
          <Paper p={"lg"}>
            <Flex gap={"1rem"}>
              <Cards />
              <CumulativeGrowthChart />
            </Flex>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="prospect_fit">Prospect Fit</Tabs.Panel>

        <Tabs.Panel value="sdr_action_items">sdr_action_items</Tabs.Panel>
      </Tabs>
      <Paper mt={"lg"} p={"lg"} radius={"lg"}>
        <PipelineSection />
      </Paper>
    </div>
  );
};

export default AnalyticPage;
