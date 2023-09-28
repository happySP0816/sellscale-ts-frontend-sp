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
import { useRecoilState, useRecoilValue } from "recoil";
import { currentProjectState, uploadDrawerOpenState } from "@atoms/personaAtoms";
import { showNotification } from "@mantine/notifications";
import { ProjectSelect } from '@common/library/ProjectSelect';
import PersonaUploadDrawer from '@drawers/PersonaUploadDrawer';


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
      value: 0,
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
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(uploadDrawerOpenState);
  const openUploadProspects = () => {
    setUploadDrawerOpened(true);
  };

  const [prospectData, setProspectData] = useState<{
    "company": string,
    "full_name": string,
    "icp_fit_reason": string,
    "icp_fit_score": number,
    "id": number,
    "industry": string,
    "linkedin_url": string,
    "title": string,
  }[]>([])
  const [icpDashboard, setIcpDashboard] = useState<any[]>([])

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
      newFilters[3].value = selectedTab.value;
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

    // Calculate numbers and percentages
    let icp_analytics = {
      "-1": 0,
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "Total": 0,
    }
    for (const prospect of prospects) {
      let icp_fit_score = (prospect.icp_fit_score >= -1 && prospect.icp_fit_score <= 4) ? prospect.icp_fit_score : -1
      // @ts-ignore
      icp_analytics[icp_fit_score + ''] += 1
      icp_analytics["Total"] += 1
    }

    // Set ICP Dashboard
    setIcpDashboard([
      {
        label: "Very High",
        color: "#3B85EF",
        bgColor: "rgba(59, 133, 239, 0.05)",
        percent: icp_analytics["4"] / icp_analytics["Total"] * 100,
        value: icp_analytics["4"] + "",
        widthModifier: 10
      },
      {
        label: "High",
        color: "#009512",
        bgColor: "rgba(0, 149, 18, 0.05)",
        percent: icp_analytics["3"] / icp_analytics["Total"] * 100,
        value: icp_analytics["3"] + "",
        widthModifier: 5
      },
      {
        label: "Medium",
        color: "#EFBA50",
        percent: icp_analytics["2"] / icp_analytics["Total"] * 100,
        bgColor: "rgba(239, 186, 80, 0.05)",
        value: icp_analytics["2"] + "",
        widthModifier: 0
      },
      {
        label: "Low",
        color: "#EB8231",
        percent: icp_analytics["1"] / icp_analytics["Total"] * 100,
        bgColor: "rgba(235, 130, 49, 0.05)",
        value: icp_analytics["1"] + "",
        widthModifier: 0
      },
      {
        label: "Very Low",
        color: "#E5564E",
        percent: icp_analytics["0"] / icp_analytics["Total"] * 100,
        bgColor: "rgba(229, 86, 78, 0.05)",
        value: icp_analytics["0"] + "",
        widthModifier: -5
      },
      {
        label: "Unscored",
        color: "#84818A",
        bgColor: "rgba(132, 129, 138, 0.05)",
        percent: icp_analytics["-1"] / icp_analytics["Total"] * 100,
        value: icp_analytics["-1"] + "",
        widthModifier: -10
      },
    ])

    // Set prospect data
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
          <Box ml={"0.5rem"}>
            <ProjectSelect extraBig />
          </Box>
          <Title
            size={"24px"}
            ml={5}
            style={{ display: "flex", alignItems: "center" }}
          ></Title>
        </Box>
        <Flex gap={"1rem"} align={"center"}>
          <Button.Group color='gray'>
            <Button variant="default" sx={{ color: 'gray !important' }}>
              <span style={{ marginLeft: '6px', color: theme.colors.blue[5] }}>{currentProject?.num_unused_li_prospects}{" "}/{" "}{currentProject?.num_prospects}</span>
            </Button>
            <Button variant="default" sx={{ color: 'gray !important' }}>
              Left: <span style={{ marginLeft: '6px', color: theme.colors.blue[5] }}>{currentProject ? Math.round(currentProject?.num_unused_li_prospects / (currentProject?.num_prospects + 0.0001) * 100) + '% ' : '-%'}</span>
            </Button>
          </Button.Group>
          <Button onClick={openUploadProspects} leftIcon={<IconPlus />}>Add Prospects</Button>
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
            {icpDashboard.map((icp, index) => (
              <Box style={{ display: "flex", gap: "0.4rem" }} key={index}>
                <Box
                  style={{
                    width: "1rem",
                    height: "1rem",
                    borderRadius: "50%",
                    backgroundColor: icp.color,
                  }}
                />
                <Title size={"10px"} fw={400} color={theme.colors.gray[6]}>
                  {icp.label}
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
          {icpDashboard.map((icp, index) => {

            

            return (
              <Box
                key={`filter-${index}`}
                style={{
                  width: (16 + icp.widthModifier) + '%',
                }}
              >
                <Paper
                  sx={{
                    backgroundColor: icp.bgColor,
                    color: icp.color,
                    border: `1px solid #E9ECEF`,
                    overflow: 'hidden'
                  }}
                  p="md"
                  radius="7px"

                >
                  <Title size={"10px"} fw={600}>
                    {icp.percent.toFixed(1)}%
                  </Title>
                  <Title size={"20px"} fw={500}>
                    {icp.value}
                  </Title>
                  <Title fw={500} color="gray.6" fz='12px'>
                    Contacts
                  </Title>
                </Paper>
                <Progress
                  value={100}
                  mt={"0.5rem"}
                  color={icp.color}
                  radius={"11px"}
                  size={"lg"}
                  label="100%"
                />
              </Box>
            )
          })}
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
          data={prospectData}
          refresh={triggerGetProspects}
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
            cell: (cell) => {
              const score = cell.cell.getValue<number>()
              let readable_score = ""
              switch (score) {
                case -1:
                  readable_score = "Unscored"
                  break;
                case 0:
                  readable_score = "Very Low"
                  break;
                case 1:
                  readable_score = "Low"
                  break;
                case 2:
                  readable_score = "Medium"
                  break;
                case 3:
                  readable_score = "High"
                  break;
                case 4:
                  readable_score = "Very High"
                  break;
                default:
                  readable_score = "Unknown"
                  break;
              }

              return (
                <Badge
                >
                  {readable_score}
                </Badge>
              )
            }
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
      <PersonaUploadDrawer personaOverviews={currentProject ? [currentProject] : []} afterUpload={() => { }} />
    </Box>
  );
};

export default ICPFiltersDashboard;
