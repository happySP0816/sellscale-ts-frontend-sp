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
  IconPencil,
  IconPlus,
  IconRefresh,
  IconRobot,
  IconSearch,
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
import { useEffect, useState } from "react";
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

  // methods = FROM_SCRATCH, FROM_TEMPLATE, FROM_AI
  const [createCampaignMethods, setCreateCampaignMethods] = useState("FROM_SCRATCH");
  const [connectCampaignView, setConnectCampaignView] = useState("SELECT_METHOD");

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
      if (searchQuery) {
        return JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase());
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
        (showAllSegments ? "?include_all_in_client=true" : "") +
        (tagFilter !== -1 ? `${showAllSegments ? "&" : "?"}tag_filter=${tagFilter}` : ""),
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

  useEffect(() => {
    getAllSDRs();
    getAllSegments(true);

    if (posthog.isFeatureEnabled("segments-auto-downloads")) {
      setShowAutoDownloadFeature(true);
    }
  }, [false, showAllSegments]);

  const [requestCampaignModal, setRequestCampaignModal] = useState(false);
  const [type, setType] = useState("user");

  return (
    <Paper>
      <Flex direction={"column"} w={"90%"} mx={"auto"} pt={"lg"}>
        <Flex align={"center"} justify={"space-between"}>
          <Text size={"lg"} fw={600}>
            Segments
          </Text>
          <Button ml="auto" mr="xs" onClick={() => (window.location.href = "/contacts/find?campaign_id=" + userData?.unassigned_persona_id)}>
            Add Contacts
          </Button>
          <Button onClick={() => setModalOpened(true)} leftIcon={<IconPlus />}>
            Create Segment
          </Button>
        </Flex>
        <Text color="gray" fw={500} size={"sm"} mb={"xl"}>
          View and manage your segments to organize your contacts and campaigns
        </Text>
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
              <Text size={"xl"} fw={600}>
                Segments
              </Text>
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
              <TextInput w={200} placeholder="Search" rightSection={<IconSearch size={"0.9rem"} />} />
              <Select w={200} data={["test1", "test2", "test3"]} placeholder="Filter by Tags" />
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
                New Segment
              </Button>
            </Flex>
          </Flex>
          <SimpleGrid cols={3} mt={"lg"}>
            {data.map((item: any, index) => {
              return (
                <Paper key={index} withBorder p={"sm"} className="flex flex-col justify-between">
                  <Flex justify={"space-between"} align={"center"}>
                    <Text fw={700} lineClamp={1}>
                      {item?.person_name}
                    </Text>
                    <ActionIcon>
                      <IconEdit size={"1.2rem"} />
                    </ActionIcon>
                  </Flex>
                  <Flex align={"center"} gap={3} mt={"xs"}>
                    {item?.segment_tags &&
                      item?.segment_tags.map((segments: any, segmentsIndex: number) => {
                        return <Badge key={segmentsIndex}>{segments.name}</Badge>;
                      })}
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
                    <Button rightIcon={<IconArrowRight size={"0.9rem"} />} mt={"sm"}>
                      Create Campaign
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </SimpleGrid>
        </Box>
      </Flex>
    </Paper>
  );
}
