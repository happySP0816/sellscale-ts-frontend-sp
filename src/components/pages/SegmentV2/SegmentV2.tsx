import {
  ActionIcon,
  rem,
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  NumberInput,
  Paper,
  Progress,
  Text,
  useMantineTheme,
  Menu,
  Modal,
  TextInput,
  Title,
  Checkbox,
  Group,
  Select,
  Divider,
} from "@mantine/core";

import {
  IconArrowRight,
  IconBackspace,
  IconBolt,
  IconButterfly,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCopy,
  IconDisc,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconFilter,
  IconLetterT,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconRobot,
  IconSearch,
  IconSwitch,
  IconTargetArrow,
  IconTemplate,
  IconTrash,
  IconUsers,
  IconWand,
} from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  IconArrowsSplit2,
  IconUsersMinus,
  IconUsersPlus,
} from "@tabler/icons-react";
import SegmentV2Overview from "./SegmentV2Overview";
import { openContextModal } from "@mantine/modals";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import { showNotification } from "@mantine/notifications";

export default function SegmentV2() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [createSegmentName, setCreateSegmentName] = useState("");
  const [createSegmentParentId, setCreateSegmentParentId] = useState(null);
  const [totalProspected, setTotalProspected] = useState(0);
  const [totalContacted, setTotalContacted] = useState(0);
  const [totalInFilters, setTotalInFilters] = useState(0);
  const [showAllSegments, setShowAllSegments] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFullscreenModalOpen, setFullscreenModalOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [showConnectCampaignModal, setShowConnectCampaignModal] = useState(
    false
  );
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [showViewProspectsModal, setShowViewProspectsModal] = useState(false);
  const [showTransferSegmentModal, setShowTransferSegmentModal] = useState(
    false
  );
  const [sdrs, setAllSDRs] = useState([] as any[]);
  const [selectedSdrId, setSelectedSdrId] = useState(null);
  const [showEditSegmentNameModal, setShowEditSegmentNameModal] = useState(
    false
  );
  const [editSegmentName, setEditSegmentName] = useState("");
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [createBatchNumber, setCreateBatchNumber] = useState(2);
  const [moveSegmentParentId, setMoveSegmentParentId] = useState(null);
  const [showMoveSegmentModal, setShowMoveSegmentModal] = useState(false);
  const [showUnassignedSegments, setShowUnassignedSegments] = useState(false);

  // methods = FROM_SCRATCH, FROM_TEMPLATE, FROM_AI
  const [createCampaignMethods, setCreateCampaignMethods] = useState(
    "FROM_SCRATCH"
  );
  const [connectCampaignView, setConnectCampaignView] = useState(
    "SELECT_METHOD"
  );

  const [arrow, setArrow] = useState(false);
  const [data, setData] = useState([]);

  const [expandedRows, setExpandedRows] = useState<any>([]);
  const toggle = (id: any) => {
    setArrow(!arrow);
    if (expandedRows.includes(id)) {
      setExpandedRows(expandedRows.filter((rowId: any) => rowId !== id));
    } else {
      setExpandedRows([...expandedRows, id]);
    }
  };
  const getNestedRows = (rows: any) => {
    const data = rows.flatMap((row: any) => {
      const hasChildren =
        expandedRows.includes(row.id) &&
        row.sub_segments &&
        row.sub_segments.length > 0;
      const nestedRows = hasChildren
        ? row.sub_segments.map(
            (subSegment: any, index: number, array: any[]) => ({
              ...subSegment,
              parentId: row.id,
              isChild: true,
              isLastChild: index === array.length - 1,
            })
          )
        : [];
      return [
        { ...row, isChild: false, hasChildren: hasChildren },
        ...nestedRows,
      ];
    });

    return data.filter((row: any) => {
      if (searchQuery) {
        return JSON.stringify(row)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      return true;
    });
  };
  const columns = [
    {
      accessorKey: "persona_name",
      minSize: 350,
      header: () => (
        <Flex align={"center"} gap={"3px"}>
          <IconLetterT color="gray" size={"0.9rem"} />
          <Text color="gray">Persona Name</Text>
        </Flex>
      ),
      cell: (cell: any) => {
        const { isChild, isLastChild } = cell.row.original;
        let {
          id,
          person_name,
          sub_segments,
          progress,
          client_archetype,
          num_prospected,
          num_contacted,
          client_sdr,
        } = cell.row.original;

        if (!num_prospected) {
          num_prospected = 0;
        }
        if (!num_contacted) {
          num_contacted = 0;
        }

        const isMySegment = client_sdr.id !== userData.id;

        return (
          <div
            className={`${isChild ? "bg-[#F7F8FA] pl-8 h-full" : ""} relative`}
          >
            {isChild && (
              <div
                className={`absolute flex flex-col  ${
                  isLastChild ? "h-[55%] justify-end" : "h-full justify-center"
                } mr-10`}
                style={{ borderLeft: "2px solid #D9DEE5" }}
              >
                <IconArrowRight
                  size={"1.2rem"}
                  color="#D9DEE5"
                  className={`${
                    isLastChild
                      ? "absolute bottom-[-9.2px] left-[-3px]"
                      : "absolute left-[-3px]"
                  }`}
                />
              </div>
            )}

            <Flex
              h={"100%"}
              px={"sm"}
              align={"center"}
              justify={"start"}
              py={"md"}
              ml={isChild ? "sm" : "0px"}
              className={`${
                isChild
                  ? "absolute before:absolute before:-inset-1 before:bg-[#8D8DC5] before:w-[2px] before:left-1 before:top-[1px]"
                  : ""
              } `}
              w="100%"
            >
              <Menu
                shadow="md"
                withinPortal
                position="right"
                disabled={isMySegment}
                styles={{
                  itemLabel: {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  },
                }}
              >
                <Menu.Target>
                  <ActionIcon disabled={isMySegment}>
                    <IconDotsVertical size={"1.2rem"} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label display={isMySegment ? "block" : "none"}>
                    Prospects
                  </Menu.Label>
                  <Menu.Item
                    onClick={() => {
                      window.location.href = `/contacts/find`;
                    }}
                  >
                    <IconUsersPlus size={"0.9rem"} />
                    Add Prospects
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setShowViewProspectsModal(true);
                      setSelectedSegmentId(id);
                    }}
                  >
                    <IconUsers size={"0.9rem"} />
                    View Prospects
                  </Menu.Item>

                  <Menu.Divider />
                  <Menu.Label>Change</Menu.Label>

                  <Menu.Item
                    onClick={() => {
                      duplicateSegment(id, true);
                    }}
                  >
                    <IconCopy size={"0.9rem"} />
                    Duplicate Segment
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setSelectedSegmentId(id);
                      setShowBatchModal(true);
                    }}
                  >
                    <IconArrowsSplit2 size={"0.9rem"} />
                    Create Batches
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setShowMoveSegmentModal(true);
                      setSelectedSegmentId(id);
                    }}
                  >
                    <IconSwitch size={"0.9rem"} />
                    Move Segment
                  </Menu.Item>

                  <Menu.Divider />
                  <Menu.Label>Split</Menu.Label>
                  <Menu.Item
                    onClick={() =>
                      openContextModal({
                        modal: "splitSegment",
                        title: (
                          <Group position="apart">
                            <div>
                              <Title
                                order={3}
                                sx={{
                                  display: "flex",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <IconButterfly
                                  color="#228be6"
                                  style={{ marginTop: "-5px" }}
                                />
                                Split Segment
                              </Title>
                            </div>
                          </Group>
                        ),
                        styles: (theme) => ({
                          title: {
                            width: "100%",
                          },
                          header: {
                            margin: 0,
                          },
                        }),
                        innerProps: {
                          parentSegments: data.map((segment: any) => ({
                            segment_id: segment.id,
                            segment_title: segment.segment_title,
                          })),
                          onSplit: (segment_id: any, segment_title: any) => {
                            createSegment(true, segment_id, segment_title);
                          },
                        },
                      })
                    }
                  >
                    <IconButterfly size={"0.9rem"} />
                    Manually Split Segment
                  </Menu.Item>
                  <Menu.Item
                    onClick={() =>
                      openContextModal({
                        modal: "autosplitsegment",
                        title: (
                          <Group position="apart">
                            <div>
                              <Title
                                order={2}
                                sx={{
                                  display: "flex",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <IconWand color="#228be6" />
                                Auto Split Segment
                              </Title>
                            </div>
                          </Group>
                        ),
                        styles: (theme) => ({
                          title: {
                            width: "100%",
                          },
                          header: {
                            margin: 0,
                          },
                        }),
                        innerProps: {},
                      })
                    }
                  >
                    <IconWand size={"0.9rem"} />
                    Auto Split Segment
                  </Menu.Item>

                  <Menu.Divider />
                  <Menu.Label color="red">Danger zone</Menu.Label>
                  <Menu.Item
                    color="red"
                    onClick={() => {
                      setSelectedSegmentId(id);
                      setShowTransferSegmentModal(true);
                    }}
                  >
                    <IconUsersMinus size={"0.9rem"} />
                    Transfer to Teammate
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    onClick={() =>
                      openContextModal({
                        modal: "clearsegment",
                        title: (
                          <Group position="apart">
                            <div>
                              <Title
                                order={2}
                                sx={{
                                  display: "flex",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <IconTrash color="red" />
                                Clear Segment
                              </Title>
                            </div>
                          </Group>
                        ),
                        styles: (theme) => ({
                          title: {
                            width: "100%",
                          },
                          header: {
                            margin: 0,
                          },
                        }),
                        innerProps: {
                          showLoader: true,
                          segmentId: id,
                          num_prospected: num_prospected,
                          clearSegmentProspects: clearSegmentProspects,
                        },
                      })
                    }
                  >
                    <IconBackspace size={"0.9rem"} />
                    Clear Prospects
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    style={{ display: "flex", alignItems: "center" }}
                    onClick={() => {
                      openContextModal({
                        modal: "deletesegment",
                        title: (
                          <Group position="apart">
                            <div>
                              <Title
                                order={2}
                                sx={{
                                  display: "flex",
                                  gap: "8px",
                                  alignItems: "center",
                                }}
                              >
                                <IconTrash color="red" />
                                Delete Segment
                              </Title>
                            </div>
                          </Group>
                        ),
                        styles: (theme) => ({
                          root: {
                            maxWidth: "40%",
                          },
                          title: {
                            width: "100%",
                          },
                          header: {
                            margin: 0,
                          },
                        }),
                        innerProps: {
                          showLoader: true,
                          segmentId: id,
                          getAllSegments: getAllSegments,
                        },
                      });
                    }}
                  >
                    <IconTrash size={"0.9rem"} />
                    Delete Segment
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              <Flex align={"center"} gap={"sm"} className="segment" w="100%">
                <Box w="100%" sx={{ flexDirection: "row", display: "flex" }}>
                  <Box
                    w="36px"
                    h="36px"
                    mr="xs"
                    sx={{
                      backgroundColor: client_archetype?.emoji
                        ? "#E1F7FF"
                        : "#F7F8FA",
                      padding: "0.5rem",
                      borderRadius: "1rem",
                    }}
                  >
                    <Text size="lg" mt="-3px">
                      {client_archetype?.emoji ? client_archetype.emoji : ""}
                    </Text>
                  </Box>
                  <Box>
                    <Flex align={"center"} gap={"sm"}>
                      <Flex>
                        <Text size={"sm"} fw={500}>
                          {person_name}
                        </Text>
                        <ActionIcon
                          onClick={() => {
                            setEditSegmentName(person_name);
                            setShowEditSegmentNameModal(true);
                            setSelectedSegmentId(id);
                          }}
                        >
                          <IconEdit size={"0.8rem"} />
                        </ActionIcon>
                      </Flex>
                      {sub_segments && sub_segments.length > 0 && (
                        <Badge
                          tt={"initial"}
                          variant="outline"
                          onClick={() => toggle(id)}
                          rightSection={
                            expandedRows.includes(id) ? (
                              <IconChevronUp
                                size={"0.9rem"}
                                style={{ marginTop: "5px" }}
                              />
                            ) : (
                              <IconChevronDown
                                size={"0.9rem"}
                                style={{ marginTop: "5px" }}
                              />
                            )
                          }
                        >
                          {expandedRows.includes(id) ? "Hide" : "Show"}{" "}
                          {sub_segments.length} Sub-Segments
                        </Badge>
                      )}
                    </Flex>
                    <Flex align={"center"} gap={"sm"} mt={3}>
                      <Progress
                        value={Math.round(
                          (num_contacted / (num_prospected + 0.0001)) * 100
                        )}
                        w={140}
                      />
                      <Text color="#3B85EF" fw={600}>
                        {Math.round(
                          (num_contacted / (num_prospected + 0.0001)) * 100
                        )}
                        % ({num_contacted} / {num_prospected})
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              </Flex>
            </Flex>
          </div>
        );
      },
    },
    {
      accessorKey: "pre_filters",
      header: () => (
        <Flex align={"center"} gap={"3px"}>
          <IconBolt color="gray" size={"0.9rem"} />
          <Text color="gray">Pre-Filters</Text>
        </Flex>
      ),
      cell: (cell: any) => {
        const { isChild } = cell.row.original;
        const {
          contacts,
          filters,
          client_sdr,
          apollo_query,
        } = cell.row.original;

        const notMyCampaign = client_sdr.id !== userData.id;

        return (
          <Flex
            w={"100%"}
            h={"100%"}
            mah={window.innerHeight}
            sx={{ overflowY: "scroll" }}
            px={"sm"}
            py={"md"}
            align={"center"}
            justify={"start"}
            bg={isChild ? "#F7F8FA" : "white"}
          >
            <Box>
              <Box>
                {apollo_query?.num_results ? (
                  <>
                    <Flex gap={4} fw={600} ml="xs">
                      <Text>{apollo_query?.num_results.toLocaleString()}</Text>
                      <Text color="gray">people</Text>
                    </Flex>
                    <Button
                      leftIcon={<IconEdit size={"0.9rem"} />}
                      variant="subtle"
                      color="blue"
                      size="xs"
                      radius="md"
                      compact
                      mb="xs"
                      onClick={() => {
                        setIframeUrl(
                          "https://sellscale.retool.com/embedded/public/7559b6ce-6f20-4649-9240-a2dd6429323e#authToken=" +
                            userToken +
                            "&segment_id=" +
                            cell.row.original.id
                        );
                        setFullscreenModalOpen(true);
                      }}
                      disabled={notMyCampaign}
                    >
                      View & Edit Filters
                    </Button>
                  </>
                ) : (
                  <Button
                    size="xs"
                    compact
                    disabled={notMyCampaign}
                    onClick={() => {
                      setIframeUrl(
                        "https://sellscale.retool.com/embedded/public/7559b6ce-6f20-4649-9240-a2dd6429323e#authToken=" +
                          userToken +
                          "&segment_id=" +
                          cell.row.original.id
                      );
                      setFullscreenModalOpen(true);
                    }}
                  >
                    Add Pre-Filters
                  </Button>
                )}
              </Box>
            </Box>
          </Flex>
        );
      },
    },
    {
      accessorKey: "campaigns",
      // minSize: 180,
      header: () => (
        <Flex align={"center"} gap={"3px"}>
          <IconTargetArrow color="gray" size={"0.9rem"} />
          <Text color="gray">Campaign</Text>
        </Flex>
      ),
      cell: (cell: any) => {
        const { isChild } = cell.row.original;
        const {
          campaign,
          client_archetype,
          client_sdr,
          id,
        } = cell.row.original;
        const notMyCampaign = client_sdr.id !== userData.id;
        return (
          <Box
            w={"100%"}
            h={"100%"}
            px={"sm"}
            py={"md"}
            bg={isChild ? "#F7F8FA" : "white"}
          >
            <Button
              variant={client_archetype?.archetype ? "filled" : "outline"}
              color="blue"
              radius="md"
              size="xs"
              leftIcon={
                client_archetype?.archetype ? (
                  <IconCheck size={"0.9rem"} />
                ) : (
                  <IconTargetArrow size={"0.9rem"} />
                )
              }
              fw={600}
              sx={{ fontSize: "12px" }}
              disabled={notMyCampaign}
              onClick={() => {
                setShowConnectCampaignModal(true);
                setSelectedSegmentId(id);
              }}
            >
              {client_archetype?.archetype
                ? client_archetype.archetype?.substring(0, 22) +
                  (client_archetype.archetype.length > 22 ? "..." : "")
                : "Connect to Campaign"}
            </Button>

            <Flex mt="xs">
              <Avatar size={"xs"} radius={"xl"} src={client_sdr?.img_url} />
              <Text size="xs" color="gray" ml="xs">
                {client_sdr?.sdr_name}
              </Text>
            </Flex>
          </Box>
        );
      },
    },
  ];

  function transformData(segments: any[]) {
    return segments.map((segment, index) => {
      // Assume progress, campaign, contacts, filters, assets are derived somehow
      return {
        id: segment.id,
        person_name: segment.segment_title,
        segment_title: segment.segment_title,
        progress: Math.floor(Math.random() * 100), // Fake random progress
        campaign: Math.floor(Math.random() * 100), // Fake random campaign ID or null
        contacts: Math.floor(Math.random() * 2000000), // Fake random contacts number
        filters: Object.keys(segment.filters).length, // Count of filter types
        assets: Math.floor(Math.random() * 100), // Fake random asset count or null
        sub_segments: [], // This needs to be populated based on more complex logic or additional data
        client_archetype: segment.client_archetype,
        client_sdr: segment.client_sdr,
        num_prospected: segment.num_prospected,
        num_contacted: segment.num_contacted,
        apollo_query: segment.apollo_query,
      };
    });
  }

  const patchEditSegmentName = async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/${selectedSegmentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_title: editSegmentName,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        setShowEditSegmentNameModal(false);
        getAllSegments(true);
      });
  };

  const createNSubsegments = async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/create_n_subsegments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: selectedSegmentId,
        num_batches: createBatchNumber,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        setShowBatchModal(false);
        getAllSegments(true);
      });
  };

  const transferSegment = async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/transfer_segment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: selectedSegmentId,
        new_client_sdr_id: selectedSdrId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        getAllSegments(true);
        setShowTransferSegmentModal(false);
      });
  };

  const connectCampaignToSegment = async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/${selectedSegmentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        client_archetype_id: selectedCampaignId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        getAllSegments(true);
        setShowConnectCampaignModal(false);
      });
  };

  const moveSegment = async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/move_segment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: selectedSegmentId,
        new_parent_segment_id: moveSegmentParentId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        getAllSegments(true);
        setShowMoveSegmentModal(false);
        setMoveSegmentParentId(null);
      });
  };

  const createSegment = async (
    showLoader: boolean,
    segmentId?: string,
    segmentName?: string
  ) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_title: segmentName ? segmentName : createSegmentName,
        filters: {},
        parent_segment_id: segmentId ? segmentId : createSegmentParentId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        setCreateSegmentName("");
        setCreateSegmentParentId(null);
        getAllSegments(true);
      });
  };

  const getAllSDRs = async () => {
    fetch(`${API_URL}/client/sdrs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAllSDRs(data.data);
      });
  };

  const getAllSegments = async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(
      `${API_URL}/segment/all` +
        (showAllSegments ? "?include_all_in_client=true" : ""),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const segments = data.segments;
        const totalProspected = segments.reduce(
          (acc: number, segment: any) => acc + (segment.num_prospected || 0),
          0
        );
        const totalContacted = segments.reduce(
          (acc: number, segment: any) => acc + (segment.num_contacted || 0),
          0
        );
        const totalProspectsInPreFilters = segments.reduce(
          (acc: number, segment: any) =>
            acc + (segment.apollo_query?.num_results || 0),
          0
        );
        setTotalProspected(totalProspected);
        setTotalContacted(totalContacted);
        setTotalInFilters(totalProspectsInPreFilters);
        const parentSegments = segments.filter(
          (segment: any) => !segment.parent_segment_id
        );
        let parentSegmentsTransformed = transformData(parentSegments);

        const parentSegmentsTransformedWithSubSegments: any = parentSegmentsTransformed?.map(
          (segment) => {
            const subSegments = segments.filter(
              (subSegment: any) => subSegment.parent_segment_id === segment.id
            );
            return {
              ...segment,
              sub_segments: transformData(subSegments),
            };
          }
        );

        setData(parentSegmentsTransformedWithSubSegments);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const duplicateSegment = async (segmentId: number, showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/duplicate_segment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: segmentId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        getAllSegments(true);
      });
  };

  const clearSegmentProspects = async (
    showLoader: boolean,
    segmentId: string
  ) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/wipe_segment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: segmentId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        getAllSegments(true);
      });
  };

  useEffect(() => {
    getAllSDRs();
    getAllSegments(true);
  }, [false, showAllSegments]);

  return (
    <Paper>
      {/* Show Unassigned Segments Modal */}
      <Modal
        opened={showUnassignedSegments}
        onClose={() => {
          setShowUnassignedSegments(false);
          getAllSegments(true);
        }}
        size="1000px"
        h={"500px"}
        padding="md"
        title="Unassigned Segments"
      >
        <iframe
          // Unassigned Contacts Retool Editor: https://sellscale.retool.com/editor/2d7d839a-034d-11ef-b670-47ca220bbc00/Segments%20v2%20Modules/Segments%20-%20View%20Unassigned%20Contacts#authToken=81EpYvSxFIcRucTnBPjpcnC6xymDqlb2
          src={`https://sellscale.retool.com/embedded/public/d2fcac97-380c-4e30-a3e4-ad393e058f6a#authToken=${userToken}`}
          width="100%"
          height="700px"
          style={{ border: "none" }}
        ></iframe>
      </Modal>
      {/* Move Segment Modal */}
      <Modal
        opened={showMoveSegmentModal}
        onClose={() => {
          setShowMoveSegmentModal(false);
          getAllSegments(true);
        }}
        size="sm"
        padding="md"
        title="Move Segment"
      >
        <Select
          withinPortal
          label="Move under new parent segment"
          placeholder="Select Parent Segment"
          data={data
            .filter((segment: any) => !segment.parent_segment_id)
            .map((segment: any) => ({
              label: "|___" + segment.segment_title,
              value: segment.id,
            }))
            .concat([
              {
                label: "No Parent Segment",
                value: null,
              },
            ])
            .reverse()}
          mb={"sm"}
          onChange={(v: any) => {
            setMoveSegmentParentId(v);
          }}
          defaultValue={null}
          clearable
        />
        <Button
          fullWidth
          size="xs"
          radius={"md"}
          mt={"md"}
          disabled={!selectedSegmentId}
          onClick={() => {
            moveSegment(true);
          }}
        >
          Move Segment
        </Button>
      </Modal>

      {/* Edit Segment Name Modal */}
      <Modal
        opened={showEditSegmentNameModal}
        onClose={() => {
          setShowEditSegmentNameModal(false);
          getAllSegments(true);
        }}
        size="sm"
        padding="md"
        title="Edit Segment Name"
      >
        <TextInput
          label="Segment Name"
          placeholder="Enter Segment Name"
          required
          mb={"sm"}
          defaultValue={editSegmentName}
          onChange={(e) => setEditSegmentName(e.target.value)}
        />
        <Button
          fullWidth
          size="xs"
          radius={"md"}
          mt={"md"}
          disabled={!editSegmentName}
          onClick={() => {
            patchEditSegmentName(true);
          }}
        >
          Edit Segment Name
        </Button>
      </Modal>
      {/* Transfer Segments Modal */}
      <Modal
        opened={showTransferSegmentModal}
        onClose={() => {
          setShowTransferSegmentModal(false);
          getAllSegments(true);
        }}
        size="sm"
        padding="md"
        title="Transfer to Teammate"
      >
        <Text color="gray" size="sm">
          Transfer all unused prospects from this segment to a teammate. After,
          the specified teammate will be able to view and manage the segment.
        </Text>
        <Select
          withinPortal
          label="Select Teammate"
          mt={"md"}
          data={sdrs?.map((x) => {
            return {
              label: x.sdr_name,
              value: x.id,
            };
          })}
          onChange={(v: any) => setSelectedSdrId(v)}
        ></Select>
        <Button
          fullWidth
          size="xs"
          radius={"md"}
          mt={"md"}
          disabled={!selectedSdrId || !selectedSegmentId}
          onClick={() => {
            transferSegment(true);
          }}
        >
          Transfer to Teammate
        </Button>
      </Modal>

      {/* View Prospects Modal */}
      <Modal
        opened={showViewProspectsModal}
        onClose={() => {
          setShowViewProspectsModal(false);
          getAllSegments(true);
        }}
        size="1200px"
        h={"500px"}
        padding="md"
        title="View Prospects"
      >
        <iframe
          // Edit URL: https://sellscale.retool.com/editor/0037d48c-00df-11ef-9943-1fa602cbecb8/Segments%20v2%20Modules/View%20Prospect%20in%20Segment
          src={`https://sellscale.retool.com/embedded/public/639c4389-18d5-42a5-ad68-e84fd643b5ee#authToken=${userToken}&segmentId=${selectedSegmentId}`}
          width="100%"
          height="700px"
          style={{ border: "none" }}
        ></iframe>
      </Modal>
      {/* Connect to Campaign Modal */}
      <Modal
        opened={showConnectCampaignModal}
        onClose={() => {
          setShowConnectCampaignModal(false);
          getAllSegments(true);
          setConnectCampaignView("SELECT_METHOD");
        }}
        size="sm"
        padding="md"
        title="Connect to Campaign"
      >
        {connectCampaignView === "SELECT_METHOD" ? (
          <>
            <Title>Select method</Title>
            <Text color="gray" size="sm">
              Choose how you want to connect this segment to a campaign
            </Text>
            <Divider mt="xs" />
            <Button
              color="violet"
              mt="md"
              onClick={() => {
                setConnectCampaignView("SELECT_CAMPAIGN");
              }}
            >
              <IconPencil size={"0.9rem"} style={{ marginRight: "4px" }} />
              Create from Scratch
            </Button>
            <Button
              mt="md"
              color="teal"
              onClick={() => {
                showNotification({
                  title: "Coming Soon",
                  message: "This feature is coming soon!",
                  color: "red",
                });
              }}
            >
              <IconRobot size={"0.9rem"} style={{ marginRight: "4px" }} />
              Request SellScale
            </Button>
            <Button
              mt="md"
              color="orange"
              onClick={() => {
                showNotification({
                  title: "Coming Soon",
                  message: "This feature is coming soon!",
                  color: "red",
                });
              }}
            >
              <IconTemplate size={"0.9rem"} style={{ marginRight: "4px" }} />
              Duplicate Template
            </Button>
          </>
        ) : (
          <>
            <PersonaSelect
              onChange={(v: any) => {
                if (!v || v.length === 0) {
                  return;
                }
                setSelectedCampaignId(v[0]["archetype_id"]);
              }}
              disabled={false}
              label="Select Campaign"
              description="Select a campaign to connect to this segment"
            />
            <Button
              fullWidth
              size="xs"
              radius={"md"}
              mt={"md"}
              disabled={!selectedCampaignId || !selectedSegmentId}
              onClick={() => {
                connectCampaignToSegment(true);
              }}
            >
              Connect to Campaign
            </Button>
          </>
        )}
      </Modal>

      {/* Set Pre Filters Modal */}
      <Modal
        opened={isFullscreenModalOpen}
        onClose={() => {
          setFullscreenModalOpen(false);
          getAllSegments(true);
        }}
        size="full"
        padding={0}
        w={window.innerWidth}
        h={window.innerHeight}
        withinPortal
        zIndex={1000}
      >
        <iframe
          src={iframeUrl}
          width={window.innerWidth - 400}
          height={window.innerHeight}
          style={{ border: "none" }}
        ></iframe>
      </Modal>

      {/* Create Segment Modal */}
      <Modal
        onClose={() => setModalOpened(false)}
        opened={modalOpened}
        size="sm"
      >
        <Title order={4}>Create Segment</Title>
        <Text size={"sm"} color="gray" fw={500} mt={"sm"} mb={"md"}>
          Create a new segment to organize your contacts and campaigns
        </Text>
        <TextInput
          label="Segment Name"
          placeholder="Enter Segment Name"
          required
          mb={"sm"}
          onChange={(e) => setCreateSegmentName(e.target.value)}
        />
        <Select
          label="(Optional) Parent Segment"
          placeholder="Select Parent Segment"
          withinPortal
          data={data
            .filter((segment: any) => !segment.parent_segment_id)
            .map((segment: any) => ({
              label: segment.segment_title,
              value: segment.id,
            }))}
          mb={"sm"}
          onChange={(v: any) => setCreateSegmentParentId(v)}
          clearable
        />
        <Flex gap={"md"} mt="xl">
          <Button
            fullWidth
            size="xs"
            radius={"md"}
            variant="outline"
            color="gray"
          >
            Cancel
          </Button>
          <Button
            fullWidth
            size="xs"
            radius={"md"}
            onClick={() => {
              createSegment(true);
              setModalOpened(false);
            }}
          >
            Create New Segment
          </Button>
        </Flex>
      </Modal>

      {/* Create Batch Modal */}
      <Modal
        onClose={() => setShowBatchModal(false)}
        opened={showBatchModal}
        size="sm"
      >
        <Title order={4}>Create Batches</Title>
        <Text size={"sm"} color="gray" fw={500} mt={"sm"} mb={"md"}>
          Equally split the unused prospects in the segment into N batches as
          child segments.
        </Text>
        <NumberInput
          label="Number of Batches (min: 2, max: 10)"
          placeholder="Enter Number of Batches"
          required
          mb={"sm"}
          max={10}
          defaultValue={createBatchNumber}
          onChange={(value: number) => setCreateBatchNumber(value)}
        />
        <Flex gap={"md"} mt="xl">
          <Button
            fullWidth
            size="xs"
            radius={"md"}
            variant="outline"
            color="gray"
            onClick={() => setShowBatchModal(false)}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            size="xs"
            radius={"md"}
            onClick={() => {
              createNSubsegments(true);
              setShowBatchModal(false);
            }}
          >
            Create New Batch
          </Button>
        </Flex>
      </Modal>

      <Flex direction={"column"} w={"90%"} mx={"auto"} pt={"lg"}>
        <Flex align={"center"} justify={"space-between"}>
          <Text size={"lg"} fw={600}>
            Segments
          </Text>
          <Button
            ml="auto"
            mr="xs"
            onClick={() =>
              (window.location.href =
                "/contacts/find?campaign_id=" + userData?.unassigned_persona_id)
            }
          >
            Add Contacts
          </Button>
          <Button onClick={() => setModalOpened(true)} leftIcon={<IconPlus />}>
            Create Segment
          </Button>
        </Flex>
        <Text color="gray" fw={500} size={"sm"} mb={"xl"}>
          View and manage your segments to organize your contacts and campaigns
        </Text>
        <SegmentV2Overview
          data={data}
          totalProspected={totalProspected}
          totalContacted={totalContacted}
          totalInFilters={totalInFilters}
        />
        <Box>
          <Flex>
            <TextInput
              miw={"200px"}
              w={"50%"}
              icon={<IconSearch size={"0.9rem"} />}
              placeholder="Search Segments"
              onChange={(e) => setSearchQuery(e.target.value)}
              mb="xs"
            />
            <Button
              ml="auto"
              size="xs"
              mr="xs"
              onClick={() => setShowUnassignedSegments(true)}
            >
              View Unassigned Prospects
            </Button>
            <Checkbox
              mt="4px"
              ml="auto"
              label="Show all client segments"
              color="blue"
              mr="md"
              onChange={(e) => setShowAllSegments(e.target.checked)}
            />
            <Button
              variant="outline"
              color="gray"
              size="xs"
              radius={"md"}
              onClick={() => getAllSegments(true)}
              leftIcon={<IconRefresh size={"0.9rem"} />}
            >
              Refresh
            </Button>
          </Flex>
          <DataGrid
            loading={loading}
            withPagination
            withBorder
            sx={{ cursor: "pointer" }}
            withColumnBorders
            data={getNestedRows(data)}
            columns={columns}
            components={{
              pagination: ({ table }) => (
                <Flex
                  justify={"space-between"}
                  align={"center"}
                  px={"sm"}
                  bg={"white"}
                  py={"1.25rem"}
                  sx={(theme) => ({
                    border: `1px solid ${theme.colors.gray[4]}`,
                    borderTopWidth: 0,
                  })}
                >
                  <Flex align={"center"} gap={"sm"}>
                    <Text fw={500} size={"sm"} color="gray.6">
                      Show
                    </Text>

                    <Flex align={"center"}>
                      <NumberInput
                        maw={100}
                        value={table.getState().pagination.pageSize}
                        onChange={(v) => {
                          if (v) {
                            table.setPageSize(v);
                          }
                        }}
                      />
                      <Flex
                        sx={(theme) => ({
                          borderTop: `1px solid ${theme.colors.gray[4]}`,
                          borderRight: `1px solid ${theme.colors.gray[4]}`,
                          borderBottom: `1px solid ${theme.colors.gray[4]}`,
                          marginLeft: "-2px",
                          paddingLeft: "1rem",
                          paddingRight: "1rem",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0.25rem",
                        })}
                        h={36}
                      >
                        <Text color="gray.5" fw={500} fz={14}>
                          of {table.getPrePaginationRowModel().rows.length}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>

                  <Flex align={"center"} gap={"sm"}>
                    <Flex align={"center"}>
                      <Select
                        maw={100}
                        value={`${table.getState().pagination.pageIndex + 1}`}
                        data={new Array(table.getPageCount())
                          .fill(0)
                          .map((i, idx) => ({
                            label: String(idx + 1),
                            value: String(idx + 1),
                          }))}
                        onChange={(v) => {
                          table.setPageIndex(Number(v) - 1);
                        }}
                      />
                      <Flex
                        sx={(theme) => ({
                          borderTop: `1px solid ${theme.colors.gray[4]}`,
                          borderRight: `1px solid ${theme.colors.gray[4]}`,
                          borderBottom: `1px solid ${theme.colors.gray[4]}`,
                          marginLeft: "-2px",
                          paddingLeft: "1rem",
                          paddingRight: "1rem",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0.25rem",
                        })}
                        h={36}
                      >
                        <Text color="gray.5" fw={500} fz={14}>
                          of {table.getPageCount()} pages
                        </Text>
                      </Flex>
                      <ActionIcon
                        variant="default"
                        color="gray.4"
                        h={36}
                        disabled={table.getState().pagination.pageIndex === 0}
                        onClick={() => {
                          table.setPageIndex(
                            table.getState().pagination.pageIndex - 1
                          );
                        }}
                      >
                        <IconChevronLeft stroke={theme.colors.gray[4]} />
                      </ActionIcon>
                      <ActionIcon
                        variant="default"
                        color="gray.4"
                        h={36}
                        disabled={
                          table.getState().pagination.pageIndex ===
                          table.getPageCount() - 1
                        }
                        onClick={() => {
                          table.setPageIndex(
                            table.getState().pagination.pageIndex + 1
                          );
                        }}
                      >
                        <IconChevronRight stroke={theme.colors.gray[4]} />
                      </ActionIcon>
                    </Flex>
                  </Flex>
                </Flex>
              ),
            }}
            w={"100%"}
            pageSizes={["20"]}
            styles={(theme) => ({
              thead: {
                "::after": {
                  backgroundColor: "transparent",
                },
              },
              th: {
                paddingTop: `${rem(10)} !important`,
                paddingBottom: `${rem(10)} !important`,
              },
              tbody: {
                backgroundColor: "white",
              },
              td: {
                padding: "0px !important",
              },

              wrapper: {
                gap: 0,
                marginTop: "0 !important",
              },
              scrollArea: {
                paddingBottom: 0,
                gap: 0,
              },

              dataCellContent: {
                width: "100%",
                whiteSpace: "normal",
              },
            })}
          />
        </Box>
      </Flex>
    </Paper>
  );
}
