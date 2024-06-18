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
  Stack,
  Input,
  Popover,
  Loader,
  SimpleGrid,
  SegmentedControl,
  Center,
  Tooltip,
} from "@mantine/core";
import posthog from "posthog-js";

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
  IconLoader,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconRobot,
  IconSearch,
  IconSend,
  IconSwitch,
  IconTag,
  IconTargetArrow,
  IconTemplate,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconWand,
  IconX,
} from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { IconArrowsSplit2, IconUsersMinus, IconUsersPlus } from "@tabler/icons-react";
import { openConfirmModal, openContextModal } from "@mantine/modals";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import { showNotification } from "@mantine/notifications";
import { RequestCampaignModal } from "@modals/SegmentV2/RequestCampaignModal";
import { addCampaignAiRequest } from "@utils/requests/aiRequests";
import { createSegmentTag, getAllSegmentTags, addTagToSegment, removeTagFromSegment, deleteTag } from "@utils/requests/segmentTagTemplates";
import { deterministicMantineColor } from "@utils/requests/utils";
import SegmentV3Overview from "./SegmentV3Overview";

type PropsType = {
  onDownloadHistoryClick?: () => void;
};

export default function SegmentV3() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [createSegmentName, setCreateSegmentName] = useState("");
  const [createSegmentParentId, setCreateSegmentParentId] = useState(null);
  const [totalProspected, setTotalProspected] = useState(0);
  const [totalContacted, setTotalContacted] = useState(0);
  const [totalUniqueCompanies, setTotalUniqueCompanies] = useState(0);
  const [totalInFilters, setTotalInFilters] = useState(0);
  const [showAllSegments, setShowAllSegments] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFullscreenModalOpen, setFullscreenModalOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState("");
  const [showConnectCampaignModal, setShowConnectCampaignModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);

  const [showViewProspectsModal, setShowViewProspectsModal] = useState(false);
  const [showTransferSegmentModal, setShowTransferSegmentModal] = useState(false);
  const [sdrs, setAllSDRs] = useState([] as any[]);
  const [selectedSdrId, setSelectedSdrId] = useState(null);
  const [segmentTagCategories, setSegmentTagCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [tagMenuLoading, setTagMenuLoading] = useState(false);
  const [showEditSegmentNameModal, setShowEditSegmentNameModal] = useState(false);
  const [editSegmentName, setEditSegmentName] = useState("");
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [createBatchNumber, setCreateBatchNumber] = useState(2);
  const [moveSegmentParentId, setMoveSegmentParentId] = useState(null);
  const [showMoveSegmentModal, setShowMoveSegmentModal] = useState(false);
  const [showUnassignedSegments, setShowUnassignedSegments] = useState(false);
  const [showAutoDownloadModal, setOpenAutoDownloadModal] = useState(false);
  const [showAutoDownloadFeature, setShowAutoDownloadFeature] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [requestCampaignModal, setRequestCampaignModal] = useState(false);
  const [type, setType] = useState("user");

  const [seletedTag, setSelectedTag] = useState<string | null>("");
  const [segmentTags, setSegmentTags] = useState([]);
  const [segmentTagLoading, setSegmentTagLoading] = useState(false);

  // methods = FROM_SCRATCH, FROM_TEMPLATE, FROM_AI
  const [createCampaignMethods, setCreateCampaignMethods] = useState("FROM_SCRATCH");
  const [connectCampaignView, setConnectCampaignView] = useState("SELECT_METHOD");

  const [arrow, setArrow] = useState(false);
  const [data, setData] = useState([]);
  let FilteredData: any = [];

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
      const hasChildren = expandedRows.includes(row.id) && row.sub_segments && row.sub_segments.length > 0;
      const nestedRows = hasChildren
        ? row.sub_segments.map((subSegment: any, index: number, array: any[]) => ({
            ...subSegment,
            parentId: row.id,
            isChild: true,
            isLastChild: index === array.length - 1,
          }))
        : [];
      return [{ ...row, isChild: false, hasChildren: hasChildren }, ...nestedRows];
    });

    return data.filter((row: any) => {
      if (searchQuery && !JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (seletedTag && !row.segment_tags.some((tag: any) => tag?.name.toLowerCase() === seletedTag.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

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
        segment_tags: segment.attached_segments,
        autoscrape_enabled: segment.autoscrape_enabled,
        current_scrape_page: segment.current_scrape_page,
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

  const createSegment = async (showLoader: boolean, segmentId?: string, segmentName?: string) => {
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

  const getAllSegments = async (showLoader: boolean, tagFilter?: Number) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(
      `${API_URL}/segment/all` +
        (type === "company" ? "?include_all_in_client=true" : "") +
        (tagFilter !== -1 ? `${type === "company" ? "&" : "?"}tag_filter=${tagFilter}` : ""),
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
        const totalProspected = segments.reduce((acc: number, segment: any) => acc + (segment.num_prospected || 0), 0);
        const totalUniqueCompanies = segments.reduce((acc: number, segment: any) => acc + (segment.unique_companies || 0), 0);
        const totalContacted = segments.reduce((acc: number, segment: any) => acc + (segment.num_contacted || 0), 0);
        const totalProspectsInPreFilters = segments.reduce((acc: number, segment: any) => acc + (segment.apollo_query?.num_results || 0), 0);
        setTotalProspected(totalProspected);
        setTotalContacted(totalContacted);
        setTotalUniqueCompanies(totalUniqueCompanies);
        setTotalInFilters(totalProspectsInPreFilters);
        const parentSegments = segments.filter((segment: any) => !segment.parent_segment_id);
        let parentSegmentsTransformed = transformData(parentSegments);

        const parentSegmentsTransformedWithSubSegments: any = parentSegmentsTransformed?.map((segment) => {
          const subSegments = segments.filter((subSegment: any) => subSegment.parent_segment_id === segment.id);
          return {
            ...segment,
            sub_segments: transformData(subSegments),
          };
        });

        setData(parentSegmentsTransformedWithSubSegments);
        FilteredData = parentSegmentsTransformedWithSubSegments;
      })
      .finally(() => {
        console.log("Stopping");
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

  const clearSegmentProspects = async (showLoader: boolean, segmentId: string) => {
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

  const customPullData = [
    {
      person_name: "Received funding in April",
      contacts: 4918,
      assets: 8202,
      client_sdr: {
        sdr_name: "David Wei",
      },
      process: 39,
    },
    {
      person_name: "B2B AI Companies",
      contacts: 4918,
      assets: 8202,
      client_sdr: {
        sdr_name: "David Wei",
      },
      process: 76,
    },
  ];

  useEffect(() => {
    getAllSDRs();
    getAllSegments(true);

    if (posthog.isFeatureEnabled("segments-auto-downloads")) {
      setShowAutoDownloadFeature(true);
    }
  }, [false, showAllSegments, currentTime, type]);

  return (
    <Box>
      <Flex direction={"column"} w={"100%"} mx={"auto"} pt={"lg"}>
        <Flex align={"center"} justify={"space-between"} mb={"md"}>
          <Flex gap={"sm"} align={"center"}>
            <Text size={"xl"} fw={600}>
              Segments
            </Text>
          </Flex>
        </Flex>
        {/* <Text color="gray" fw={500} size={"sm"} mb={"xl"}>
          View and manage your segments to organize your contacts and campaigns
        </Text> */}
        <SegmentV3Overview
          data={data}
          totalProspected={totalProspected}
          totalContacted={totalContacted}
          totalInFilters={totalInFilters}
          totalUniqueCompanies={totalUniqueCompanies}
        />
        <Box>
          <Flex align={"center"} justify={"space-between"}>
            <Flex gap={"sm"} align={"center"}>
              <SegmentedControl
                value={type}
                onChange={(value: any) => {
                  setType(value);
                }}
                data={[
                  {
                    value: "user",
                    label: (
                      <Center style={{ gap: 4 }}>
                        <Text fw={500}>Your Segments</Text>
                      </Center>
                    ),
                  },
                  {
                    value: "company",
                    label: (
                      <Center style={{ gap: 4 }}>
                        <Text fw={500}>Company Segments</Text>
                      </Center>
                    ),
                  },
                ]}
              />
            </Flex>

            <Flex gap={"sm"}>
              {/* <Select
                w={200}
                data={["test1", "test2", "test3", "Q1 STRATEGY"]}
                value={seletedTag}
                placeholder="Filter by Tags"
                onChange={(value) => {
                  setSelectedTag(value);
                  let newFilteredByTagData;
                  if (value) {
                    newFilteredByTagData = data.filter(
                      (item: any) =>
                        item.segment_tags.map((tag: any) => tag?.name.toLowerCase()).includes(value.toLowerCase()) || item.segment_tags.length === 0
                    );
                  } else {
                    newFilteredByTagData = data;
                  }
                  getNestedRows(newFilteredByTagData);
                }}
              /> */}
              <TextInput
                w={200}
                placeholder="Search"
                rightSection={<IconSearch size={"0.9rem"} color="gray" />}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                leftIcon={<IconPlus size={"0.9rem"} />}
                onClick={() => {
                  openContextModal({
                    modal: "createsegmentV3",
                    title: (
                      <Flex gap={"xs"} align={"center"}>
                        <IconUserPlus color="#228BE6" />
                        <Title order={3}>Create Segment</Title>
                      </Flex>
                    ),
                    innerProps: {},
                    centered: true,
                    styles: {
                      content: {
                        minWidth: "1000px",
                      },
                    },
                    onClose: () => {},
                  });
                }}
              >
                Add Contacts
              </Button>
            </Flex>
          </Flex>
          <Flex gap={"sm"} align={"center"} w={"100%"} mt={"sm"}>
            <IconLoader size={"1.2rem"} color="gray" className="mb-[2px]" />
            <Text sx={{ whiteSpace: "nowrap" }} fw={600}>
              Custom Pulls in Progress
            </Text>
            <Flex>
              <Badge variant="filled">{2}</Badge>
            </Flex>
            <Divider w={"100%"} />
            {/* <ActionIcon onClick={unusedToggle}>{openedUnUsed ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon> */}
          </Flex>
          <SimpleGrid cols={3} mt={"lg"}>
            {customPullData?.map((item: any, index: any) => {
              return (
                <Paper key={index} withBorder p={"sm"} className="flex flex-col justify-between" style={{ borderColor: "#fee8ab" }}>
                  <Flex justify={"space-between"} align={"center"}>
                    <Text fw={700} lineClamp={1}>
                      {item?.person_name}
                    </Text>
                    {/* <ActionIcon>
                      <IconEdit size={"1.2rem"} />
                    </ActionIcon> */}
                    <Flex gap={1}>
                      <Tooltip
                        color="white"
                        arrowPosition="center"
                        arrowOffset={45}
                        arrowSize={8}
                        position="top-start"
                        withArrow
                        label={
                          <Paper withBorder shadow="sm" p={"md"}>
                            <Flex align={"center"} gap={4}>
                              <IconSend size={"0.9rem"} color="#228be6" className="mb-[2px]" />
                              <Text fw={500} size={"sm"}>
                                Outreach Summary
                              </Text>
                            </Flex>
                            <Box mt={"sm"}>
                              <Flex gap={3} align={"center"}>
                                <Progress value={50} w={"100%"} />
                                <Text color="#228BE6" fw={600} size={"xs"}>
                                  {50}%
                                </Text>
                              </Flex>
                              <Text fw={600} size={"xs"}>
                                {213}/{213} <span className=" text-gray-400">in Segment</span>
                              </Text>
                            </Box>
                            <Box mt={"sm"}>
                              <Flex gap={3} align={"center"}>
                                <Progress value={50} w={"100%"} color="grape" />
                                <Text color="grape" fw={600} size={"xs"}>
                                  {50}%
                                </Text>
                              </Flex>
                              <Text fw={600} size={"xs"}>
                                {106}/{213} <span className=" text-gray-400">in Children Segment(s)</span>
                              </Text>
                            </Box>
                          </Paper>
                        }
                        styles={{
                          tooltip: {
                            padding: 0,
                            boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2);",
                          },
                          arrow: {
                            boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2);",
                          },
                        }}
                      >
                        <ActionIcon>
                          <IconLoader size={"1.2rem"} />
                        </ActionIcon>
                      </Tooltip>
                      <Menu
                        shadow="md"
                        withinPortal
                        position="right"
                        // disabled={isMySegment}
                        styles={{
                          itemLabel: {
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          },
                        }}
                      >
                        <Menu.Target>
                          <ActionIcon>
                            <IconDotsVertical size={"1.2rem"} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Label>Prospects</Menu.Label>
                          <Menu.Item
                          // onClick={() => {
                          //   window.location.href = `/contacts/find?segment_id=${id}`;
                          // }}
                          >
                            <IconUsersPlus size={"0.9rem"} />
                            Add Prospects
                          </Menu.Item>
                          <Menu.Item
                            onClick={() => {
                              // setShowViewProspectsModal(true);
                              // setSelectedSegmentId(id);
                            }}
                          >
                            <IconUsers size={"0.9rem"} />
                            View Prospects
                          </Menu.Item>

                          <Menu.Divider />
                          <Menu.Label>Change</Menu.Label>

                          <Menu.Item
                            onClick={() => {
                              // duplicateSegment(id, true);
                            }}
                          >
                            <IconCopy size={"0.9rem"} />
                            Duplicate Segment
                          </Menu.Item>
                          <Menu.Item
                          // onClick={() => {
                          //   setSelectedSegmentId(id);
                          //   setShowBatchModal(true);
                          // }}
                          >
                            <IconArrowsSplit2 size={"0.9rem"} />
                            Create Batches
                          </Menu.Item>
                          <Menu.Item
                          // onClick={() => {
                          //   setShowMoveSegmentModal(true);
                          //   setSelectedSegmentId(id);
                          // }}
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
                                        <IconButterfly color="#228be6" style={{ marginTop: "-5px" }} />
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
                            // onClick={() => {
                            //   setSelectedSegmentId(id);
                            //   setShowTransferSegmentModal(true);
                            // }}
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
                                  // showLoader: true,
                                  // segmentId: id,
                                  // num_prospected: num_prospected,
                                  // clearSegmentProspects: clearSegmentProspects,
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
                                  // showLoader: true,
                                  // segmentId: id,
                                  // getAllSegments: getAllSegments,
                                },
                              });
                            }}
                          >
                            <IconTrash size={"0.9rem"} />
                            Delete Segment
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Flex>
                  </Flex>
                  <Box mt={"sm"}>
                    <Flex align={"center"} gap={"xs"}>
                      <Text color="gray" size={"sm"} fw={500}>
                        Estimates:
                      </Text>
                      <Text fw={600} size={"sm"}>
                        {item.contacts} people
                      </Text>{" "}
                      <Divider orientation="vertical" />
                      <Text fw={600} size={"sm"}>
                        {item.assets} accounts
                      </Text>
                    </Flex>
                    <Flex align={"center"} gap={"sm"} mt={"sm"}>
                      <Text color="gray" size={"sm"} fw={500}>
                        Created by:
                      </Text>
                      <Avatar src={item.client_sdr.img_url} size={"sm"} radius={"xl"} />
                      <Text size={"sm"} fw={500}>
                        {item.client_sdr.sdr_name}
                      </Text>
                    </Flex>
                    {/* <Button rightIcon={<IconArrowRight size={"0.9rem"} />} mt={"sm"}>
                      Create Campaign
                    </Button> */}
                    <Progress value={item.process} mt={"sm"} />
                  </Box>
                </Paper>
              );
            })}
          </SimpleGrid>
          <Flex gap={"sm"} align={"center"} w={"100%"} mt={"md"}>
            <Text sx={{ whiteSpace: "nowrap" }} fw={600}>
              Existing Segments
            </Text>
            <Flex>
              <Badge variant="filled">{getNestedRows(data).length}</Badge>
            </Flex>
            <Divider w={"100%"} />
            {/* <ActionIcon onClick={unusedToggle}>{openedUnUsed ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon> */}
          </Flex>
          <SimpleGrid cols={3} mt={"lg"}>
            {getNestedRows(data)?.map((item: any, index: any) => {
              return (
                <Paper key={index} withBorder p={"sm"} className="flex flex-col justify-between">
                  <Flex justify={"space-between"} align={"center"}>
                    <Text fw={700} lineClamp={1}>
                      {item?.person_name}
                    </Text>
                    {/* <ActionIcon>
                      <IconEdit size={"1.2rem"} />
                    </ActionIcon> */}
                    <Flex gap={1}>
                      <Tooltip
                        color="white"
                        arrowPosition="center"
                        arrowOffset={45}
                        arrowSize={8}
                        position="top-start"
                        withArrow
                        label={
                          <Paper withBorder shadow="sm" p={"md"}>
                            <Flex align={"center"} gap={4}>
                              <IconSend size={"0.9rem"} color="#228be6" className="mb-[2px]" />
                              <Text fw={500} size={"sm"}>
                                Outreach Summary
                              </Text>
                            </Flex>
                            <Box mt={"sm"}>
                              <Flex gap={3} align={"center"}>
                                <Progress value={50} w={"100%"} />
                                <Text color="#228BE6" fw={600} size={"xs"}>
                                  {50}%
                                </Text>
                              </Flex>
                              <Text fw={600} size={"xs"}>
                                {213}/{213} <span className=" text-gray-400">in Segment</span>
                              </Text>
                            </Box>
                            <Box mt={"sm"}>
                              <Flex gap={3} align={"center"}>
                                <Progress value={50} w={"100%"} color="grape" />
                                <Text color="grape" fw={600} size={"xs"}>
                                  {50}%
                                </Text>
                              </Flex>
                              <Text fw={600} size={"xs"}>
                                {106}/{213} <span className=" text-gray-400">in Children Segment(s)</span>
                              </Text>
                            </Box>
                          </Paper>
                        }
                        styles={{
                          tooltip: {
                            padding: 0,
                            boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2);",
                          },
                          arrow: {
                            boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2);",
                          },
                        }}
                      >
                        <ActionIcon>
                          <IconLoader size={"1.2rem"} />
                        </ActionIcon>
                      </Tooltip>
                      <Menu
                        shadow="md"
                        withinPortal
                        position="right"
                        // disabled={isMySegment}
                        styles={{
                          itemLabel: {
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          },
                        }}
                      >
                        <Menu.Target>
                          <ActionIcon>
                            <IconDotsVertical size={"1.2rem"} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Label>Prospects</Menu.Label>
                          <Menu.Item
                          // onClick={() => {
                          //   window.location.href = `/contacts/find?segment_id=${id}`;
                          // }}
                          >
                            <IconUsersPlus size={"0.9rem"} />
                            Add Prospects
                          </Menu.Item>
                          <Menu.Item
                            onClick={() => {
                              // setShowViewProspectsModal(true);
                              // setSelectedSegmentId(id);
                            }}
                          >
                            <IconUsers size={"0.9rem"} />
                            View Prospects
                          </Menu.Item>

                          <Menu.Divider />
                          <Menu.Label>Change</Menu.Label>

                          <Menu.Item
                            onClick={() => {
                              // duplicateSegment(id, true);
                            }}
                          >
                            <IconCopy size={"0.9rem"} />
                            Duplicate Segment
                          </Menu.Item>
                          <Menu.Item
                          // onClick={() => {
                          //   setSelectedSegmentId(id);
                          //   setShowBatchModal(true);
                          // }}
                          >
                            <IconArrowsSplit2 size={"0.9rem"} />
                            Create Batches
                          </Menu.Item>
                          <Menu.Item
                          // onClick={() => {
                          //   setShowMoveSegmentModal(true);
                          //   setSelectedSegmentId(id);
                          // }}
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
                                        <IconButterfly color="#228be6" style={{ marginTop: "-5px" }} />
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
                            // onClick={() => {
                            //   setSelectedSegmentId(id);
                            //   setShowTransferSegmentModal(true);
                            // }}
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
                                  // showLoader: true,
                                  // segmentId: id,
                                  // num_prospected: num_prospected,
                                  // clearSegmentProspects: clearSegmentProspects,
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
                                  // showLoader: true,
                                  // segmentId: id,
                                  // getAllSegments: getAllSegments,
                                },
                              });
                            }}
                          >
                            <IconTrash size={"0.9rem"} />
                            Delete Segment
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Flex>
                  </Flex>
                  <Flex align={"center"} gap={3} mt={"xs"}>
                    <SegmentTags item={item} setCurrentTime={setCurrentTime} />
                  </Flex>
                  <Box mt={"sm"}>
                    <Flex align={"center"} gap={"xs"}>
                      <Text color="gray" size={"sm"} fw={500}>
                        Estimates:
                      </Text>
                      <Text fw={600} size={"sm"}>
                        {item.contacts} people
                      </Text>{" "}
                      <Divider orientation="vertical" />
                      <Text fw={600} size={"sm"}>
                        {item.assets} accounts
                      </Text>
                    </Flex>
                    <Flex align={"center"} gap={"sm"} mt={"sm"}>
                      <Text color="gray" size={"sm"} fw={500}>
                        Created by:
                      </Text>
                      <Avatar src={item.client_sdr.img_url} size={"sm"} radius={"xl"} />
                      <Text size={"sm"} fw={500}>
                        {item.client_sdr.sdr_name}
                      </Text>
                    </Flex>
                    {/* <Button rightIcon={<IconArrowRight size={"0.9rem"} />} mt={"sm"}>
                      Create Campaign
                    </Button> */}
                    <Button
                      variant={item.client_archetype?.archetype ? "outline" : "filled"}
                      color="blue"
                      mt={"sm"}
                      fullWidth
                      leftIcon={!item.client_archetype?.archetype ? null : <IconTargetArrow size={"0.9rem"} />}
                      rightIcon={!item.client_archetype?.archetype ? <IconArrowRight size={"0.9rem"} /> : null}
                      fw={600}
                      sx={{ fontSize: "12px" }}
                      disabled={item.client_sdr.id !== userData.id}
                      onClick={() => {
                        setShowConnectCampaignModal(true);
                        setSelectedSegmentId(item.id);
                      }}
                    >
                      {item.client_archetype?.archetype
                        ? item.client_archetype.archetype?.substring(0, 22) + (item.client_archetype.archetype.length > 22 ? "..." : "")
                        : "Connect to Campaign"}
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </SimpleGrid>
        </Box>
      </Flex>
    </Box>
  );
}

const SegmentTags = (props: any) => {
  const userToken = useRecoilValue(userTokenState);

  const [availableSegmentTags, setAvailableSegmentTags] = useState<Array<{ id: number; name: string }>>([]);
  const [addTagClicked, setAddTagClicked] = useState(false);
  const [segmentTagsLoading, setSegmentTagsLoading] = useState(false);
  const [segmentTags, setSegmentTags] = useState(props.item.segment_tags);
  const [popoverOpened, setPopoverOpened] = useState(false);

  return (
    <Popover
      opened={popoverOpened}
      width={400}
      position="left"
      withArrow
      shadow="md"
      onClose={() => setPopoverOpened(false)}
      onOpen={() => {
        setSegmentTagsLoading(true);
        getAllSegmentTags(userToken).then((res) => {
          setAvailableSegmentTags(res.data);
          setSegmentTagsLoading(false);
        });
      }}
    >
      <Popover.Target>
        <Flex align={"center"} gap={3} mt={"xs"} wrap={"wrap"}>
          {props.item?.segment_tags &&
            props.item?.segment_tags.length > 0 &&
            props.item?.segment_tags.map((segments: any, segmentsIndex: any) => (
              <Badge radius={"xs"} key={segmentsIndex}>
                {segments.name}
              </Badge>
            ))}
          {props.item?.segment_tags && props.item?.segment_tags.length > 0 ? (
            <ActionIcon variant="filled" color="blue" size={"sm"} ml={3} onClick={() => setPopoverOpened(true)}>
              <IconPlus size={"0.9rem"} />
            </ActionIcon>
          ) : (
            <Button leftIcon={<IconPlus size={"0.9rem"} />} size="xs" onClick={() => setPopoverOpened(true)}>
              Add Tag
            </Button>
          )}
        </Flex>
      </Popover.Target>
      <Popover.Dropdown>
        {segmentTagsLoading ? (
          <Loader />
        ) : (
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {availableSegmentTags?.map((tag: { name: string; id: number }, index: number) => {
              const isTagInSegment = segmentTags?.some((existingTag: { name: string }) => existingTag?.name === tag?.name);
              return (
                tag && (
                  <Group spacing="xs" style={{ margin: "2px" }}>
                    <Badge
                      radius="xl"
                      size="md"
                      color={deterministicMantineColor(tag.name)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isTagInSegment ? "transparent" : "",
                        color: isTagInSegment ? "darkgrey" : "",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isTagInSegment) {
                          setSegmentTags((prevTags: any) => [...prevTags, tag]);
                          addTagToSegment(userToken, props.item.id, tag.id);
                          props.setCurrentTime(new Date());
                        } else {
                          setSegmentTags((prevTags: any) => prevTags.filter((t: any) => t.id !== tag.id));
                          removeTagFromSegment(userToken, props.item.id, tag.id);
                          props.setCurrentTime(new Date());
                        }
                      }}
                    >
                      {tag.name} &nbsp;
                    </Badge>
                    <div style={{ marginLeft: "-35px" }}>
                      <ActionIcon
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          openConfirmModal({
                            title: "Confirm Global Tag Deletion",
                            children: <Text size="sm">Are you sure you want to permanently delete this tag? It will get removed from all locations.</Text>,
                            labels: {
                              confirm: "Delete Tag",
                              cancel: "Cancel",
                            },
                            confirmProps: { color: "red" },
                            onCancel: () => {
                              setPopoverOpened(true);
                            },
                            onConfirm: () => {
                              deleteTag(userToken, tag.id).then(() => {
                                // getAllSegments(true);
                                setPopoverOpened(true);
                              });
                            },
                          });
                        }}
                        sx={(theme) => ({
                          "&:hover": {
                            backgroundColor: theme.colors.red[2],
                            borderRadius: "50%",
                          },
                        })}
                      >
                        <IconX color="darkgrey" size={14} />
                      </ActionIcon>
                    </div>
                  </Group>
                )
              );
            })}
            {addTagClicked ? (
              <TextInput
                placeholder="Type here..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const newTagName = e.currentTarget.value.trim();
                    if (newTagName !== "" && !availableSegmentTags?.some((tag) => tag.name === newTagName)) {
                      createSegmentTag(userToken, props.item.id, newTagName, "#000000").then((newTag) => {
                        // getAllSegments(true);
                        e.currentTarget.value = "";
                      });
                    }
                  }
                  e.stopPropagation();
                }}
                style={{ width: "50%", margin: "5px" }}
              />
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setAddTagClicked(true);
                }}
                size="xs"
                style={{ backgroundColor: "#4682B4", color: "white" }}
              >
                <IconPlus size={18} />
              </Button>
            )}
          </Box>
        )}
      </Popover.Dropdown>
    </Popover>
  );
};
