import {
  Anchor,
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Paper,
  Progress,
  Select,
  Switch,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconAdjustmentsHorizontal,
  IconExternalLink,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import {
  DataGrid,
  DataGridFiltersState,
  DataGridRowSelectionState,
} from "mantine-data-grid";
import { FC, useEffect, useMemo, useState } from "react";
import WithdrawInvitesControl from "./WithdrawInvitesControl";
import {
  getChannelType,
  getICPScoreBadgeColor,
  getStatusBadgeColor,
} from "../../../../utils/icp";
import GridTabs from "./GridTabs";
import WithdrawInvitesModal from "./modals/WithdrawInvitesModal";
import { SCREEN_SIZES } from "@constants/data";
import PersonaSelect from "../PersonaSplitSelect";
import { getProspectsForICP } from "@utils/requests/getProspects";
import { userTokenState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";
import { currentProjectState } from "@atoms/personaAtoms";
import { showNotification } from "@mantine/notifications";

const filterDashboard = [
  {
    label: "Very High",
    color: "#3B85EF",
    bgColor: "rgba(59, 133, 239, 0.05)",
    percent: "10%",
    value: 125,
  },
  {
    label: "High",
    color: "#009512",
    bgColor: "rgba(0, 149, 18, 0.05)",
    percent: "22%",
    value: 889,
  },
  {
    label: "Medium",
    color: "#EFBA50",
    percent: "18%",
    bgColor: "rgba(239, 186, 80, 0.05)",
    value: 642,
  },
  {
    label: "Low",
    color: "#EB8231",
    percent: "20%",
    bgColor: "rgba(235, 130, 49, 0.05)",
    value: 1221,
  },
  {
    label: "Very Low",
    color: "#E5564E",
    percent: "25%",
    bgColor: "rgba(229, 86, 78, 0.05)",
    value: 1566,
  },
  {
    label: "Unscored",
    color: "#84818A",
    bgColor: "rgba(132, 129, 138, 0.05)",
    percent: "5%",
    value: 55,
  },
];

const demoData = [
  {
    id: 1,
    full_name: "Aakanksha Mitra",
    title: "Staff Software Engineer",
    company: "Airbnb",
    linkedin_url: "https://www.linkedin.com/in/ronaldnolasco/",
    icp_fit_score: "Very High",
    icp_fit_reason: "Random Reason",
  },
];

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
  {
    label: "Unscored",
    value: "unscored",
    count: 150,
  },
];

const ICPFiltersDashboard: FC<{ isTesting: boolean, openFilter: () => void }> = ({
  isTesting,
  openFilter,
}) => {
  const userToken = useRecoilValue(userTokenState)
  const currentProject = useRecoilValue(currentProjectState)

  const initialFilters = [
    {
      id: "status",
      value: "",
    },
    {
      id: "name",
      value: "",
    },
    {
      id: "channel_type",
      value: "",
    },
    {
      id: "icp_fit_score",
      value: "",
    },
  ];
  const smScreenOrLess = useMediaQuery(
    `(max-width: ${SCREEN_SIZES.LG})`,
    false,
    {
      getInitialValueInEffect: true,
    }
  );
  const theme = useMantineTheme();
  const [globalSearch, setGlobalSearch] = useState("");
  const [channel, setChannel] = useState<string | null>("");
  const [status, setStatus] = useState<string | null>("");
  const [selectedTab, setSelectedTab] = useState<{
    label: string;
    value: string;
    count: number;
  }>(tabFilters[0]);

  const [invitedOnLinkedIn, setInvitedOnLinkedIn] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DataGridRowSelectionState>(
    {}
  );

  const [prospectData, setProspectData] = useState<any[]>([])

  const [opened, { open, close }] = useDisclosure(false);
  const [columnFilters, setColumnFilters] =
    useState<DataGridFiltersState>(initialFilters);

  const withdrawInvites = () => {
    open();
  };

  const cancel = () => {
    setSelectedRows({});
  };

  const getSelectedRowCount = useMemo(() => {
    return Object.keys(selectedRows).length;
  }, [selectedRows]);

  useEffect(() => {
    const newFilters = [...initialFilters];

    if (status) {
      newFilters[0].value = status;
    }

    if (globalSearch) {
      newFilters[1].value = globalSearch;
    }

    if (channel) {
      newFilters[2].value = channel;
    }

    if (selectedTab) {
      newFilters[3].value =
        selectedTab.value === "all" ? "" : selectedTab.label;
    }

    setColumnFilters(newFilters);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSearch, channel, status, selectedTab]);

  const triggerGetProspects = async () => {
    if (!currentProject?.id) {
      showNotification({
        title: "Error",
        message: "No project selected",
        color: "red",
      })
      return
    }

    const result = await getProspectsForICP(
      userToken,
      currentProject?.id,
      isTesting,
    )

    // Get prospects
    const prospects = result.data.prospects
    console.log('prospects', prospects)

    setProspectData(prospects)

  }

  useEffect(() => {
    if (!currentProject?.id) return

    triggerGetProspects()
  }, [currentProject?.id, isTesting])

  return (
    <Box
      sx={(theme) => ({
        padding: theme.spacing.lg,
        width: "100%",
      })}
    >
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Title size={"24px"} color={theme.colors.gray[6]}>
            Persona:
          </Title>
          <Box ml={"0.5rem"}>
            <PersonaSelect
              disabled={false}
              onChange={(archetypes) => {
                console.log(archetypes);
              }}
              label={""}
              description={""}
            />
          </Box>
          <Title
            size={"24px"}
            ml={5}
            style={{ display: "flex", alignItems: "center" }}
          ></Title>
        </Box>
        <Flex gap={"1rem"} align={"center"}>
          <Badge color="blue" ml={"0.5rem"}>
            1245/2000 | Left: 75%
          </Badge>
          <Button leftIcon={<IconPlus />}>Add Prospects</Button>
          {smScreenOrLess && <Button onClick={openFilter}>Open filter</Button>}
        </Flex>
      </Box>
      <Divider my="sm" />
      <Paper
        shadow="xs"
        p="sm"
        radius="6px"
        style={{ backgroundColor: "#FFF" }}
      >
        <Box style={{ display: "flex", justifyContent: "space-between" }}>
          <Title size={"21px"} fw={600}>
            Average ICP Fit Score:
          </Title>
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            {filterDashboard.map((filter, index) => (
              <Box style={{ display: "flex", gap: "0.4rem" }} key={index}>
                <Box
                  style={{
                    width: "1rem",
                    height: "1rem",
                    borderRadius: "50%",
                    backgroundColor: filter.color,
                  }}
                />
                <Title size={"10px"} fw={400} color={theme.colors.gray[6]}>
                  {filter.label}
                </Title>
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          mt={"1rem"}
          sx={{
            display: "flex",
            gap: "1.25rem",
            justifyContent: "space-between",
          }}
        >
          {filterDashboard.map((filter, index) => (
            <Box
              key={`filter-${index}`}
              style={{
                width: filter.percent,
              }}
            >
              <Paper
                sx={{
                  backgroundColor: filter.bgColor,
                  color: filter.color,
                  border: `1px solid #E9ECEF`,
                }}
                p="md"
                radius="7px"
              >
                <Title size={"10px"} fw={600}>
                  {filter.percent}
                </Title>
                <Title size={"20px"} fw={500}>
                  {filter.value}
                </Title>
                <Title size={"14px"} fw={500} color="gray.6">
                  Prospects
                </Title>
              </Paper>
              <Progress
                value={100}
                mt={"0.5rem"}
                color={filter.color}
                radius={"11px"}
                size={"lg"}
                label="100%"
              />
            </Box>
          ))}
        </Box>
      </Paper>

      <Box>
        <Box
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Box
            mt="1rem"
            mb="1rem"
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Search Contacts"
              onChange={(event) => setGlobalSearch(event.currentTarget.value)}
              rightSection={
                <IconSearch size={18} color={theme.colors.gray[6]} />
              }
            />
          </Box>

          <Box
            style={{
              padding: "0.5rem",
              border: "1px solid #E0E0E0",
              borderRadius: "8px",
              backgroundColor: invitedOnLinkedIn
                ? "rgba(231, 245, 255, 1)"
                : "",
            }}
          >
            <Switch
              color="blue"
              label="Invited on LinkedIn"
              labelPosition="left"
              styles={{
                label: {
                  color: invitedOnLinkedIn
                    ? theme.colors.blue[6]
                    : theme.colors.gray[6],
                  fontWeight: 600,
                },
              }}
              checked={invitedOnLinkedIn}
              onChange={(event) => {
                setInvitedOnLinkedIn(event.currentTarget.checked);
                if (event.currentTarget.checked) {
                  // Select all rows
                  const newSelectedRows = { ...selectedRows };

                  demoData
                    .filter((x) => x)
                    .forEach((row) => {
                      newSelectedRows[row.id - 1] = true;
                    });

                  setSelectedRows(newSelectedRows);
                } else {
                  setSelectedRows({});
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      <Paper
        radius={"8px"}
        shadow="lg"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem",
        }}
      >
        {invitedOnLinkedIn && getSelectedRowCount > 0 && (
          <WithdrawInvitesControl
            count={getSelectedRowCount}
            onCancel={cancel}
            onConfirm={withdrawInvites}
          />
        )}
        <GridTabs
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          selectedRows={selectedRows}
        />
      </Paper>
      <DataGrid
        data={prospectData}
        highlightOnHover
        withPagination
        withSorting
        withRowSelection
        columns={[
          {
            accessorKey: "icp_fit_score",
            header: "ICP SCORE",
            cell: (cell) => (
              "test"
              // <Badge
              //   color={getICPScoreBadgeColor(
              //     cell.getValue<string>()?.toLowerCase()
              //   )}
              // >
              //   {cell.getValue<string>()?.toUpperCase()}
              // </Badge>
            ),
          },
          {
            accessorKey: "title",
            header: "TITLE",
          },
          {
            accessorKey: "company",
            header: "COMPANY",
          },
          {
            accessorKey: "icp_fit_reason",
            header: "ICP FIT REASON",
          },
          {
            accessorKey: "linkedin_url",
            header: "LINKEDIN URL",
            cell: (cell) => (
              <Anchor
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                target="_blank"
                href={cell.row.original.linkedin_url}
                color={theme.colors.blue[6]}
                fw={600}
              >
                {getChannelType(cell.getValue<string>())}
                <IconExternalLink size={16} />
              </Anchor>
            ),
          },
        ]}
        options={{
          enableFilters: true,
        }}
        state={{
          columnFilters,
          rowSelection: selectedRows,
        }}
        w={"100%"}
        onRowSelectionChange={setSelectedRows}
        styles={(theme) => ({
          thead: {
            backgroundColor: theme.colors.gray[0],
            "::after": {
              backgroundColor: "transparent",
            },
          },
        })}
      />
      <WithdrawInvitesModal
        opened={opened}
        close={close}
        count={getSelectedRowCount}
      />
    </Box>
  );
};

export default ICPFiltersDashboard;
