import { Box, Button, Flex, Text, useMantineTheme } from "@mantine/core";
import {
  getICPScoreColor,
  getStatusMessageBadgeColor,
} from "../../../../utils/icp";
import { useMemo } from "react";

interface IGridTabsProps {
  selectedTab: {
    label: string;
    value: string;
    count: number;
  };
  setSelectedTab: (value: {
    label: string;
    value: string;
    count: number;
  }) => void;
  icpDashboard: {
    label: string;
    color: string;
    bgColor: string;
    percent: number;
    value: string;
    widthModifier: number;
  }[];
}

const GridTabs = ({
  selectedTab,
  setSelectedTab,
  icpDashboard,
}: IGridTabsProps) => {
  const theme = useMantineTheme();
  const tabFilters = useMemo(() => {
    return [
      {
        label: "All",
        value: "all",
        count: icpDashboard.reduce((prev, current) => {
          return prev + Number(current.value);
        }, 0),
      },
      {
        label: "Very High",
        value: "4",
        count: icpDashboard.find((c) => c.label === "Very High")?.value || "0",
      },
      {
        label: "High",
        value: "3",
        count: icpDashboard.find((c) => c.label === "High")?.value || "0",
      },
      {
        label: "Medium",
        value: "2",
        count: icpDashboard.find((c) => c.label === "Medium")?.value || "0",
      },
      {
        label: "Low",
        value: "1",
        count: icpDashboard.find((c) => c.label === "Low")?.value || "0",
      },
      {
        label: "Very Low",
        value: "0",
        count: icpDashboard.find((c) => c.label === "Very Low")?.value || "0",
      },
      {
        label: "Unscored",
        value: "-1",
        count: icpDashboard.find((c) => c.label === "Unscored")?.value || "0",
      },
    ];
  }, []);

  const generateBackgroundBudge = (value: string) => {
    const COLORS: { [key: string]: string } = {
      all: theme.colors.gray[4],
      "very high": theme.colors.green[1],
      high: theme.colors.blue[1],
      medium: theme.colors.yellow[1],
      low: theme.colors.red[1],
      "very low": theme.colors.red[1],
      unscored: theme.colors.gray[1],
    };

    return COLORS[value?.toLowerCase()];
  };
  return (
    <Flex justify={"space-between"} align={"center"} w={"100%"}>
      <Flex
        gap={"0.5rem"}
        justify={"start"}
        align={"center"}
        w={"100%"}
        style={{ flexWrap: "wrap" }}
      >
        {tabFilters.map((tab) => (
          <Button
            key={tab.value}
            variant="subtle"
            onClick={() => setSelectedTab(tab)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor:
                selectedTab.value === tab.value
                  ? getStatusMessageBadgeColor(tab.label).filled
                  : getStatusMessageBadgeColor(tab.label).light,
              borderRight: "1px solid #E0E0E0",
              color:
                selectedTab.value === tab.value
                  ? "#fff"
                  : getICPScoreColor(tab.label),
              fontWeight: 600,
              border: `1px solid ${generateBackgroundBudge(tab.label)}`,
            }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {tab.label}

              <Box
                bg={
                  selectedTab.value === tab.value
                    ? tab.value === "all"
                      ? "#84818A"
                      : getStatusMessageBadgeColor(tab.label).filled
                    : generateBackgroundBudge(tab.label)
                }
                px={"0.5rem"}
                style={{ borderRadius: 99 }}
              >
                <Text
                  size={"0.75rem"}
                  color={
                    selectedTab.value === tab.value || tab.value === "all"
                      ? "#fff"
                      : getStatusMessageBadgeColor(tab.label).filled
                  }
                >
                  {tab.count}
                </Text>
              </Box>
            </Box>
          </Button>
        ))}
      </Flex>
    </Flex>
  );
};

export default GridTabs;
