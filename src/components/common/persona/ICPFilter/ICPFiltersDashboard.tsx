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

const filters = [
  {
    color: "#3B85EF",
    name: "Very High",
  },
  {
    color: "#009512",
    name: "High",
  },
  {
    color: "#EFBA50",
    name: "Medium",
  },
  {
    color: "#EB8231",
    name: "Low",
  },
  {
    color: "#E5564E",
    name: "Very Low",
  },
  {
    color: "#84818A",
    name: "Unscored",
  },
];

const filterDashboard = [
  {
    color: "#3B85EF",
    bgColor: "rgba(59, 133, 239, 0.05)",
    percent: "10%",
    value: 125,
  },
  {
    color: "#009512",
    bgColor: "rgba(0, 149, 18, 0.05)",
    percent: "22%",
    value: 889,
  },
  {
    color: "#EFBA50",
    percent: "18%",
    bgColor: "rgba(239, 186, 80, 0.05)",
    value: 642,
  },
  {
    color: "#EB8231",
    percent: "20%",
    bgColor: "rgba(235, 130, 49, 0.05)",
    value: 1221,
  },
  {
    color: "#E5564E",
    percent: "25%",
    bgColor: "rgba(229, 86, 78, 0.05)",
    value: 1566,
  },
  {
    color: "#84818A",
    bgColor: "rgba(132, 129, 138, 0.05)",
    percent: "5%",
    value: 55,
  },
];

const demoData = [
  {
    id: 1,
    name: "Aakanksha Mitra",
    status: "Replied",
    title: "Staff Software Engineer",
    company: "Airbnb",
    channel_type: "linkedin",
    channel_url: "https://www.linkedin.com/in/ronaldnolasco/",
    icp_score: "Very High",
    value: 5000,
  },
  {
    id: 2,
    name: "Ronald Nolasco",
    status: "Outreached",
    title: "Staff Software Engineer",
    company: "Airbnb",
    channel_type: "linkedin",
    channel_url: "https://www.linkedin.com/in/ronaldnolasco/",
    icp_score: "Unscored",
    value: 5000,
  },
  {
    id: 3,
    name: "Aakanksha Mitra",
    status: "Prospected",
    title: "Staff Software Engineer",
    company: "Airbnb",
    channel_type: "linkedin",
    channel_url: "https://www.linkedin.com/in/ronaldnolasco/",
    icp_score: "High",
    value: 5000,
  },
  {
    id: 4,
    name: "Aakanksha Mitra",
    status: "Replied",
    title: "Staff Software Engineer",
    company: "Airbnb",
    channel_type: "linkedin",
    channel_url: "https://www.linkedin.com/in/ronaldnolasco/",
    icp_score: "Very High",
    value: 5000,
  },
  {
    id: 5,
    name: "Aakanksha Mitra",
    status: "Replied",
    title: "Staff Software Engineer",
    company: "Airbnb",
    channel_type: "email",
    channel_url: "https://www.linkedin.com/in/ronaldnolasco/",
    icp_score: "Very Low",
    value: 5000,
  },
  {
    id: 6,
    name: "Aakanksha Mitra",
    status: "Replied",
    title: "Staff Software Engineer",
    company: "Airbnb",
    channel_type: "linkedin",
    channel_url: "https://www.linkedin.com/in/ronaldnolasco/",
    icp_score: "High",
    value: 5000,
  },
  {
    id: 7,
    name: "Aakanksha Mitra",
    status: "Replied",
    title: "Staff Software Engineer",
    company: "Airbnb",
    channel_type: "linkedin",
    channel_url: "https://www.linkedin.com/in/ronaldnolasco/",
    icp_score: "Low",
    value: 5000,
  },
  {
    id: 8,
    name: "Aakanksha Mitra",
    status: "Prospected",
    title: "Staff Software Engineer",
    company: "Airbnb",
    channel_type: "email",
    channel_url: "https://www.linkedin.com/in/ronaldnolasco/",
    icp_score: "Medium",
    value: 5000,
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
];

const ICPFiltersDashboard: FC<{ openFilter: () => void }> = ({
  openFilter,
}) => {
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
      id: "icp_score",
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
            Contacts:
          </Title>
          <Title
            size={"24px"}
            ml={5}
            style={{ display: "flex", alignItems: "center" }}
          >
            Senior Engineering Hiring
            <Badge color="green" ml={"0.5rem"}>
              1245
            </Badge>
          </Title>
        </Box>
        <Flex gap={"1rem"}>
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
            ICP Score Distribution:
          </Title>
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            {filters.map((filter, index) => (
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
                  {filter.name}
                </Title>
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          mt={"1rem"}
          sx={{
            display: "flex",
            gap: "1rem",
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
              </Paper>
              <Progress
                value={100}
                mt={"0.5rem"}
                color={filter.color}
                radius={"11px"}
                size={"lg"}
              />
            </Box>
          ))}
        </Box>
      </Paper>

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
            placeholder="Search"
            onChange={(event) => setGlobalSearch(event.currentTarget.value)}
            rightSection={<IconSearch size={18} color={theme.colors.gray[6]} />}
          />

          <Select
            placeholder="Channel"
            data={["linkedin"]}
            clearable
            onChange={setChannel}
          />
          <Select
            placeholder="Status"
            data={["Replied", "Outreached", "Prospected"]}
            clearable
            onChange={setStatus}
          />
          <Button
            variant="subtle"
            color="gray"
            rightIcon={
              <IconAdjustmentsHorizontal
                color={theme.colors.gray[6]}
                size={18}
              />
            }
          >
            More Filters
          </Button>
        </Box>

        <Box
          style={{
            padding: "0.5rem",
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
            backgroundColor: invitedOnLinkedIn ? "rgba(231, 245, 255, 1)" : "",
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
                  .filter((x) => x.channel_type === "linkedin")
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
        <GridTabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      </Paper>
      <DataGrid
        data={demoData}
        highlightOnHover
        withPagination
        withSorting
        withRowSelection
        columns={[
          {
            accessorKey: "name",
            header: "NAME",
          },
          {
            accessorKey: "status",
            header: "STATUS",
            cell: (cell) => (
              <Badge
                variant="filled"
                color={getStatusBadgeColor(cell.getValue<string>())}
              >
                {cell.getValue<string>()?.toUpperCase()}
              </Badge>
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
            accessorKey: "channel_type",
            header: "CHANNEL",
            cell: (cell) => (
              <Anchor
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                target="_blank"
                href={cell.row.original.channel_url}
                color={theme.colors.blue[6]}
                fw={600}
              >
                {getChannelType(cell.getValue<string>())}
                <IconExternalLink size={16} />
              </Anchor>
            ),
          },
          {
            accessorKey: "icp_score",
            header: "ICP SCORE",
            cell: (cell) => (
              <Badge
                color={getICPScoreBadgeColor(
                  cell.getValue<string>()?.toLowerCase()
                )}
              >
                {cell.getValue<string>()?.toUpperCase()}
              </Badge>
            ),
          },
          {
            accessorKey: "value",
            header: "VALUE",
            cell: (cell) => (
              <Title size={"14px"} fw={500}>
                US$ {cell.getValue<number>()}K
              </Title>
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
