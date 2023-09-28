import { Badge, Box, Button, Flex, Text } from "@mantine/core";
import { getICPScoreBadgeColor, getICPScoreColor } from "../../../../utils/icp";
import { IconTrash } from "@tabler/icons-react";
import { IconRefresh } from "@tabler/icons";
import { DataGridRowSelectionState } from "mantine-data-grid";
import { openConfirmModal } from "@mantine/modals";
import { moveToUnassigned } from "@utils/requests/moveToUnassigned";
import { userTokenState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";
import { currentProjectState } from "@atoms/personaAtoms";
import { showNotification } from "@mantine/notifications";

const tabFilters = [
  {
    label: "All",
    value: "all",
    count: 150,
  },
  {
    label: "Very High",
    value: "4",
    count: 150,
  },
  {
    label: "High",
    value: "3",
    count: 150,
  },
  {
    label: "Medium",
    value: "2",
    count: 150,
  },
  {
    label: "Low",
    value: "1",
    count: 150,
  },
  {
    label: "Very Low",
    value: "0",
    count: 150,
  },
  {
    label: "Unscored",
    value: "-1",
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
  selectedRows: DataGridRowSelectionState;
  data: {
    "company": string,
    "full_name": string,
    "icp_fit_reason": string,
    "icp_fit_score": number,
    "id": number,
    "industry": string,
    "linkedin_url": string,
    "title": string,
  }[];
  refresh: () => void;
}

const GridTabs = ({
  selectedTab,
  setSelectedTab,
  selectedRows,
  data,
  refresh,
}: IGridTabsProps) => {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const triggerMoveToUnassigned = async () => {

    if (currentProject === null) {return;}

    const prospects = data.filter((_, index) => {
      return selectedRows[index] === true;
    })
    const prospectIDs = prospects.map((prospect) => {
      return prospect.id;
    })

    const response = await moveToUnassigned(
      userToken,
      currentProject.id,
      prospectIDs
    );
    if (response.status === "success") {
      showNotification({
        id: "prospect-removed",
        title: "Prospects removed",
        message: "These prospects has been moved to your Unassigned Contacts list.",
        color: "green",
        autoClose: 3000,
      });
    } else {
      showNotification({
        id: "prospect-removed",
        title: "Prospects removal failed",
        message: "These prospects could not be removed. Please try again, or contact support.",
        color: "red",
        autoClose: false,
      })
    }

    refresh();
  }

  return (
    <Flex justify={"space-between"} align={"center"} w={"100%"}>
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
                  tab.value === "all"
                    ? "dark"
                    : getICPScoreBadgeColor(tab.label)
                }
                variant={tab.value === "all" ? "filled" : "light"}
              >
                {tab.count}
              </Badge>
            </Box>
          </Button>
        ))}
      </Box>

      <Flex justify={"space-between"} align={"center"} gap={"0.5rem"}>
        <Button
          color="red"
          leftIcon={<IconTrash size={14} />}
          size="sm"
          onClick={() => {
            openConfirmModal({
              title: "Remove these prospects?",
              children: (
                <Text>
                  Are you sure you want to remove these {Object.keys(selectedRows).length} prospects? This will move them into your Unassigned Contacts list.
                </Text>
              ),
              labels: {
                confirm: 'Remove',
                cancel: 'Cancel'
              },
              confirmProps: { color: "red" },
              onCancel: () => { },
              onConfirm: () => { triggerMoveToUnassigned() },
            })
          }}
        >
          Remove {Object.keys(selectedRows).length} prospects
        </Button>
      </Flex>
    </Flex>
  );
};

export default GridTabs;
