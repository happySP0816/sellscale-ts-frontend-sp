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
  Switch,
  Text,
  Tooltip,
  Title,
  useMantineTheme,
  HoverCard,
  Group,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
  IconCheck,
  IconExternalLink,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import {
  DataGrid,
  DataGridFiltersState,
  DataGridRowSelectionState,
  stringFilterFn,
} from "mantine-data-grid";
import { FC, useEffect, useMemo, useState } from "react";
import WithdrawInvitesControl from "./WithdrawInvitesControl";
import { getChannelType } from "../../../../utils/icp";
import GridTabs from "./GridTabs";
import WithdrawInvitesModal from "./modals/WithdrawInvitesModal";
import { SCREEN_SIZES } from "@constants/data";
import { getProspectsForICP } from "@utils/requests/getProspects";
import { userTokenState } from "@atoms/userAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  currentProjectState,
  uploadDrawerOpenState,
} from "@atoms/personaAtoms";
import { showNotification } from "@mantine/notifications";
import { ProjectSelect } from "@common/library/ProjectSelect";
import PersonaUploadDrawer from "@drawers/PersonaUploadDrawer";
import { PersonaOverview, ProspectICP } from "src";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { openConfirmModal } from "@mantine/modals";
import { moveToUnassigned } from "@utils/requests/moveToUnassigned";
import {
  filterProspectsState,
  filterRuleSetState,
} from "@atoms/icpFilterAtoms";
import { IconX } from "@tabler/icons";
import { navigateToPage } from '@utils/documentChange';
import { useNavigate } from 'react-router-dom';

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
    count: 0,
  },
  {
    label: "Very High",
    value: "very_high",
    count: 0,
  },
  {
    label: "High",
    value: "high",
    count: 0,
  },
  {
    label: "Medium",
    value: "medium",
    count: 0,
  },
  {
    label: "Low",
    value: "low",
    count: 0,
  },
  {
    label: "Very Low",
    value: "very_low",
    count: 0,
  },
  {
    label: "Unscored",
    value: "unscored",
    count: 0,
  },
];

const ICPFiltersDashboard: FC<{
  setIsTesting: (val: boolean) => void;
  isTesting: boolean;
  openFilter: () => void;
}> = ({ isTesting, openFilter }) => {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [icpProspects, setIcpProspects] = useRecoilState(filterProspectsState);
  const navigate = useNavigate();

  const smScreenOrLess = useMediaQuery(
    `(max-width: ${SCREEN_SIZES.LG})`,
    false,
    {
      getInitialValueInEffect: true,
    }
  );
  const theme = useMantineTheme();
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<{
    label: string;
    value: string;
    count: number;
  }>(tabFilters[0]);

  const [invitedOnLinkedIn, setInvitedOnLinkedIn] = useState(false);
  const [selectedRows, setSelectedRows] = useState<DataGridRowSelectionState>(
    {}
  );
  const [uploadDrawerOpened, setUploadDrawerOpened] = useRecoilState(
    uploadDrawerOpenState
  );
  const openUploadProspects = () => {
    setUploadDrawerOpened(true);
  };

  const [icpDashboard, setIcpDashboard] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [columnFilters, setColumnFilters] = useState<DataGridFiltersState>([]);

  const withdrawInvites = () => {
    open();
  };

  const cancel = () => {
    setSelectedRows({});
  };

  const getSelectedRowCount = useMemo(() => {
    return Object.keys(selectedRows).length;
  }, [selectedRows]);
  const globalRuleSetData = useRecoilValue(filterRuleSetState);

  useEffect(() => {
    let newFilters: DataGridFiltersState = [];
    // if (globalSearch) {
    //   newFilters = [
    //     {
    //       id: "title",
    //       value: {
    //         op: "in",
    //         value: globalSearch,
    //       },
    //     },
    //   ];
    // }

    if (selectedTab && selectedTab.value !== "all") {
      newFilters = [
        ...newFilters,
        {
          id: "icp_fit_score",
          value: {
            op: "eq",
            value: selectedTab.value,
          },
        },
      ];
    }

    setColumnFilters(newFilters);
  }, [selectedTab, globalSearch]);

  const triggerMoveToUnassigned = async () => {
    if (currentProject === null) {
      return;
    }

    const prospects = icpProspects.filter((_, index) => {
      return selectedRows[index] === true;
    });
    const prospectIDs = prospects.map((prospect) => {
      return prospect.id;
    });

    const response = await moveToUnassigned(
      userToken,
      currentProject.id,
      prospectIDs
    );
    if (response.status === "success") {
      showNotification({
        id: "prospect-removed",
        title: "Prospects removed",
        message:
          "These prospects has been moved to your Unassigned Contacts list.",
        color: "green",
        autoClose: 3000,
      });
    } else {
      showNotification({
        id: "prospect-removed",
        title: "Prospects removal failed",
        message:
          "These prospects could not be removed. Please try again, or contact support.",
        color: "red",
        autoClose: false,
      });
    }

    refetch();
  };

  const { isFetching, refetch } = useQuery({
    queryKey: [`query-get-icp-prospects`, { isTesting }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { isTesting }] = queryKey;

      const result = await getProspectsForICP(
        userToken,
        currentProject!.id,
        isTesting,
        invitedOnLinkedIn
      );

      // Get prospects
      const prospects = result.data.prospects as ProspectICP[];

      // Calculate numbers and percentages
      let icp_analytics = {
        "-1": 0,
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 0,
        Total: 0,
      };
      for (const prospect of prospects) {
        let icp_fit_score =
          prospect.icp_fit_score >= -1 && prospect.icp_fit_score <= 4
            ? prospect.icp_fit_score
            : -1;
        // @ts-ignore
        icp_analytics[icp_fit_score + ""] += 1;
        icp_analytics["Total"] += 1;
      }

      // Set ICP Dashboard
      setIcpDashboard([
        {
          label: "Very High",
          color: "#009512",
          badgeColor: "green",
          bgColor: "rgba(0, 149, 18, 0.05)",
          percent: (icp_analytics["4"] / icp_analytics["Total"]) * 100,
          value: icp_analytics["4"] + "",
          gridWidthOf20:
            icp_analytics["4"] / icp_analytics["Total"] < 0.1
              ? 2
              : (icp_analytics["4"] / icp_analytics["Total"]) * 20,
        },
        {
          label: "High",
          color: "#3B85EF",
          badgeColor: "blue",
          bgColor: "rgba(59, 133, 239, 0.05)",
          percent: (icp_analytics["3"] / icp_analytics["Total"]) * 100,
          value: icp_analytics["3"] + "",
          gridWidthOf20:
            icp_analytics["3"] / icp_analytics["Total"] < 0.1
              ? 2
              : (icp_analytics["3"] / icp_analytics["Total"]) * 20,
        },
        {
          label: "Medium",
          color: "#EFBA50",
          badgeColor: "yellow",
          percent: (icp_analytics["2"] / icp_analytics["Total"]) * 100,
          bgColor: "rgba(239, 186, 80, 0.05)",
          value: icp_analytics["2"] + "",
          gridWidthOf20:
            icp_analytics["2"] / icp_analytics["Total"] < 0.1
              ? 2
              : (icp_analytics["2"] / icp_analytics["Total"]) * 20,
        },
        {
          label: "Low",
          color: "#EB8231",
          badgeColor: "orange",
          percent: (icp_analytics["1"] / icp_analytics["Total"]) * 100,
          bgColor: "rgba(235, 130, 49, 0.05)",
          value: icp_analytics["1"] + "",
          gridWidthOf20:
            icp_analytics["1"] / icp_analytics["Total"] < 0.1
              ? 2
              : (icp_analytics["1"] / icp_analytics["Total"]) * 20,
        },
        {
          label: "Very Low",
          color: "#E5564E",
          badgeColor: "red",
          percent: (icp_analytics["0"] / icp_analytics["Total"]) * 100,
          bgColor: "rgba(229, 86, 78, 0.05)",
          value: icp_analytics["0"] + "",
          gridWidthOf20:
            icp_analytics["0"] / icp_analytics["Total"] < 0.1
              ? 2
              : (icp_analytics["0"] / icp_analytics["Total"]) * 20,
        },
        {
          label: "Unscored",
          color: "#84818A",
          badgeColor: "gray",
          bgColor: "rgba(132, 129, 138, 0.05)",
          percent: (icp_analytics["-1"] / icp_analytics["Total"]) * 100,
          value: icp_analytics["-1"] + "",
          gridWidthOf20:
            icp_analytics["-1"] / icp_analytics["Total"] < 0.1
              ? 2
              : (icp_analytics["-1"] / icp_analytics["Total"]) * 20,
        },
      ]);

      // Set prospect data
      setIcpProspects(prospects);

      return prospects;
    },
    enabled: !!currentProject,
  });
  const displayProspects = useMemo(() => {
    let filteredProspects = icpProspects;

    filteredProspects = filteredProspects.filter((prospect) => {
      return (
        prospect.full_name.includes(globalSearch) ||
        prospect.title.includes(globalSearch) ||
        prospect.company.includes(globalSearch)
      );
    });

    return filteredProspects;
  }, [globalSearch, icpProspects]);

  let averageICPFitScore = 0
  let averageICPFitLabel = ""
  let averageICPFitColor = ""
  if (icpProspects.length > 0) {
    averageICPFitScore = icpProspects.map(x => x.icp_fit_score).reduce((a,b) => a+b) / icpProspects.length
    averageICPFitLabel = ""
    averageICPFitColor = ""
  }
  if (averageICPFitScore < 0.5) {
    averageICPFitLabel = "Very Low"
    averageICPFitColor = "red"
  } else if (averageICPFitScore < 1.5) {
    averageICPFitLabel = "Low"
    averageICPFitColor = "orange"
  } else if (averageICPFitScore < 2.5) {
    averageICPFitLabel = "Medium"
    averageICPFitColor = "yellow"
  } else if (averageICPFitScore < 3.5) {
    averageICPFitLabel = "High"
    averageICPFitColor = "blue"
  } else {
    averageICPFitLabel = "Very High"
    averageICPFitColor = "green"
  }

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
            <ProjectSelect
              extraBig
              onClick={(persona?: PersonaOverview) => {
                // queryClient.refetchQueries({
                //   queryKey: [`query-get-icp-prospects`],
                // });
                // refetch();
                navigateToPage(navigate, `/prioritize/${persona?.id}`);
              }}
            />
          </Box>
        </Box>
        <Flex gap={"1rem"} align={"center"}>
          <Button.Group color="gray">
            <Button variant="default" sx={{ color: "gray !important" }}>
              <span style={{ marginLeft: "6px", color: theme.colors.blue[5], marginRight: '4px' }}>
                {currentProject?.num_unused_li_prospects} /{" "}
                {currentProject?.num_prospects}
              </span>
              {" "}remaining{" "}(
              <span style={{ marginLeft: "0px", color: theme.colors.blue[5] }}>
                {currentProject
                  ? Math.round(
                      (currentProject?.num_unused_li_prospects /
                        (currentProject?.num_prospects + 0.0001)) *
                        100
                    ) + "% Left"
                  : "-% Left"}
              </span>)
            </Button>
          </Button.Group>
          <Button onClick={openUploadProspects} leftIcon={<IconPlus />}>
            Add Prospects
          </Button>
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
          <Flex>
            <Title size={"21px"} fw={600}>
              Average ICP Fit Score:
            </Title>
            <Badge color={averageICPFitColor} size="lg" variant="outline" ml='8px'>
              {averageICPFitLabel} ({averageICPFitScore.toFixed(2)})
            </Badge>
          </Flex>
          {/* Legend */}
          {/* <Box
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
          </Box> */}
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
                  width: Math.floor((icp.gridWidthOf20 / 20) * 100) + "%",
                }}
              >
                <Paper
                  sx={{
                    backgroundColor: icp.bgColor,
                    color: icp.color,
                    border: `1px solid #E9ECEF`,
                    overflow: "hidden",
                  }}
                  p="md"
                  radius="7px"
                >
                  <Text fz="10px" fw="bold">
                    {icp.label}
                  </Text>
                  <Flex>
                    <Title size={"20px"} fw={500}>
                      {icp.value}
                    </Title>
                    {/* <Badge
                      color={icp.badgeColor}
                      size="xs"
                      mt="4px"
                      ml="4px"
                      variant="filled"
                    >
                      {icp.percent.toFixed(1)}%
                    </Badge> */}
                  </Flex>
                  <Title fw={500} color="gray.6" fz="12px">
                    Contacts
                  </Title>
                </Paper>
                <Progress
                  value={100}
                  mt={"0.5rem"}
                  color={icp.color}
                  radius={"11px"}
                  size={"xl"}
                  label={icp.percent.toFixed(1) + "%"}
                />
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <Button
          color="red"
          leftIcon={<IconTrash size={14} />}
          size="sm"
          onClick={() => {
            openConfirmModal({
              title: "Remove these prospects?",
              children: (
                <Text>
                  Are you sure you want to remove these{" "}
                  {Object.keys(selectedRows).length} prospects? This will move
                  them into your Unassigned Contacts list.
                </Text>
              ),
              labels: {
                confirm: "Remove",
                cancel: "Cancel",
              },
              confirmProps: { color: "red" },
              onCancel: () => {},
              onConfirm: () => {
                triggerMoveToUnassigned();
              },
            });
          }}
        >
          Remove {Object.keys(selectedRows).length} prospects
        </Button>
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
          icpDashboard={icpDashboard}
        />
      </Paper>

      <DataGrid
        data={displayProspects}
        highlightOnHover
        withPagination
        withSorting
        withRowSelection
        withColumnResizing
        columns={[
          {
            accessorKey: "icp_fit_score",
            header: "ICP SCORE",
            maxSize: 140,
            cell: (cell) => {
              const score = cell.cell.getValue<number>();
              let readable_score = "";
              let color = "";

              switch (score) {
                case -1:
                  readable_score = "Unscored";
                  color = "gray";
                  break;
                case 0:
                  readable_score = "Very Low";
                  color = "red";
                  break;
                case 1:
                  readable_score = "Low";
                  color = "orange";
                  break;
                case 2:
                  readable_score = "Medium";
                  color = "yellow";
                  break;
                case 3:
                  readable_score = "High";
                  color = "blue";
                  break;
                case 4:
                  readable_score = "Very High";
                  color = "green";
                  break;
                default:
                  readable_score = "Unknown";
                  color = "gray";
                  break;
              }

              return <Badge color={color}>{readable_score}</Badge>;
            },
            filterFn: stringFilterFn,
          },
          {
            accessorKey: "title",
            header: "TITLE",
            filterFn: stringFilterFn,
          },
          {
            accessorKey: "company",
            filterFn: stringFilterFn,
            header: "COMPANY",
          },
          {
            accessorKey: "icp_fit_reason",
            filterFn: stringFilterFn,
            header: "ICP FIT REASON",
            cell: (cell) => {
              const values = cell.cell
                ?.getValue<string>()
                ?.split(") (")
                .map((x) => x.replaceAll(")", "").replaceAll("(", ""));

              return (
                <Flex gap={"0.25rem"} align={"center"}>
                  {values?.map((v) => (
                    <Flex key={v} gap={"0.25rem"} align={"center"}>
                      <Tooltip label={v}>
                        <Flex
                          justify={"center"}
                          align={"center"}
                          style={{ borderRadius: "4px" }}
                          bg={
                            v.includes("✅")
                              ? "green"
                              : v.includes("❌")
                              ? "red"
                              : "yellow"
                          }
                          p={"0.25rem"}
                          w={"1rem"}
                          h={"1rem"}
                          sx={{ cursor: "pointer" }}
                        >
                          {v.includes("✅") ? (
                            <IconCheck color="white" />
                          ) : v.includes("❌") ? (
                            <IconX color="white" />
                          ) : (
                            <IconPlus color="white" />
                          )}
                        </Flex>
                      </Tooltip>
                      {/* {v} */}
                    </Flex>
                  ))}
                  <HoverCard width={280} shadow="md">
                    <HoverCard.Target>
                      <Badge
                        color="green"
                        ml="xs"
                        variant="outline"
                        size="xs"
                        sx={{ cursor: "pointer" }}
                      >
                        Show Details
                      </Badge>
                    </HoverCard.Target>
                    <HoverCard.Dropdown w="280" p="0">
                      {values?.map((v, i) => (
                        <>
                          <Flex
                            key={v}
                            gap={"0.25rem"}
                            align={"center"}
                            mb="8px"
                            mt="8px"
                          >
                            <Tooltip label={v}>
                              <Flex
                                ml="md"
                                mr="md"
                                justify={"center"}
                                align={"center"}
                                style={{ borderRadius: "4px" }}
                                bg={
                                  v.includes("✅")
                                    ? "green"
                                    : v.includes("❌")
                                    ? "red"
                                    : "yellow"
                                }
                                p={"0.25rem"}
                                w={"1rem"}
                                h={"1rem"}
                                sx={{ cursor: "pointer" }}
                              >
                                <IconCheck color="white" />
                              </Flex>
                            </Tooltip>
                            <Text size="xs">{v.substring(2)}</Text>
                          </Flex>
                          {i !== values.length - 1 && <Divider />}
                        </>
                      ))}
                    </HoverCard.Dropdown>
                  </HoverCard>
                </Flex>
              );
            },
          },
          {
            accessorKey: "linkedin_url",
            header: "LINKEDIN URL",
            filterFn: stringFilterFn,
            cell: (cell) => (
              <Anchor
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
                target="_blank"
                href={"https://" + cell.row.original.linkedin_url}
                color={theme.colors.blue[6]}
                fw={600}
              >
                {cell.row.original.full_name}'s{" "}
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
        onRowSelectionChange={(rows) => {
          if (Object.keys(rows).length > 10) {
            setSelectedRows(
              Object.keys(rows)
                .slice(0, 10)
                .reduce((obj: any, key: any) => {
                  obj[key] = rows[key];
                  return obj;
                }, {})
            );
          }
          setSelectedRows(rows)
        }}
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
        selectedRows={selectedRows}
        data={icpProspects}
        refresh={refetch}
      />

      <PersonaUploadDrawer
        personaOverviews={currentProject ? [currentProject] : []}
        afterUpload={() => {}}
      />
    </Box>
  );
};

export default ICPFiltersDashboard;
