import { Badge, Box, Button } from "@mantine/core";
import { getICPScoreBadgeColor, getICPScoreColor } from "../../../../utils/icp";

const tabFilters = [
  {
    label: "All",
    value: "all",
    count: 150,
  },
  {
    label: "Very High",
    value: "very_high",
    count: 150,
  },
  {
    label: "High",
    value: "high",
    count: 150,
  },
  {
    label: "Medium",
    value: "medium",
    count: 150,
  },
  {
    label: "Low",
    value: "low",
    count: 150,
  },
  {
    label: "Very Low",
    value: "very_low",
    count: 150,
  },
];

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
}

const GridTabs = ({ selectedTab, setSelectedTab }: IGridTabsProps) => {
  return (
    <Box>
      {tabFilters.map((tab) => (
        <Button
          key={tab.value}
          variant="subtle"
          onClick={() => setSelectedTab(tab)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor:
              selectedTab.value === tab.value
                ? getICPScoreColor(tab.label)
                : "transparent",
            borderRight: "1px solid #E0E0E0",
            color:
              selectedTab.value === tab.value
                ? "#fff"
                : getICPScoreColor(tab.label),
            fontWeight: 600,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderTopLeftRadius: selectedTab.value === tab.value ? "8px" : 0,
            borderTopRightRadius: selectedTab.value === tab.value ? "8px" : 0,
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
            <Badge
              size="sm"
              color={
                tab.value === "all" ? "dark" : getICPScoreBadgeColor(tab.label)
              }
              variant={tab.value === "all" ? "filled" : "light"}
            >
              {tab.count}
            </Badge>
          </Box>
        </Button>
      ))}
    </Box>
  );
};

export default GridTabs;
