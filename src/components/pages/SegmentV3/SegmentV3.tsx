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
  Switch,
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
  IconCircleX,
  IconCopy,
  IconDisc,
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconFileDownload,
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
  IconTopologyRing2,
  IconTrash,
  IconUserPlus,
  IconUsers,
  IconWand,
  IconWebhook,
  IconX,
} from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { IconArrowsSplit2, IconUserBolt, IconUserCog, IconUserScan, IconUsersMinus, IconUsersPlus } from "@tabler/icons-react";
import { closeAllModals, openConfirmModal, openContextModal } from "@mantine/modals";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import { showNotification } from "@mantine/notifications";
import { RequestCampaignModal } from "@modals/SegmentV2/RequestCampaignModal";
import { addCampaignAiRequest } from "@utils/requests/aiRequests";
import { createSegmentTag, getAllSegmentTags, addTagToSegment, removeTagFromSegment, deleteTag } from "@utils/requests/segmentTagTemplates";
import { deterministicMantineColor } from "@utils/requests/utils";
import SegmentV3Overview from "./SegmentV3Overview";
import SegmentAutodownload from "@pages/SegmentV2/SegmentAutodownload";
import ContactAccountFilterModal from "@modals/ContactAccountFilterModal";

type PropsType = {
  onDownloadHistoryClick?: () => void;
};

export interface TransformedSegment {
  id: number;
  person_name: string;
  segment_title: string;
  progress: string;
  campaign: string;
  contacts: number;
  filters: number;
  sub_segments: any[]; // Assuming this is an array; adjust if necessary
  client_archetype: string;
  parent_segment_id: string;
  client_sdr: string;
  num_prospected: number;
  num_contacted: number;
  apollo_query: string;
  segment_tags: string[];
  autoscrape_enabled: boolean;
  current_scrape_page: number;
  is_market_map: boolean;
}

export default function SegmentV3(props: PropsType) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [createSegmentName, setCreateSegmentName] = useState("");
  const [isMarketMapSegment, setIsMarketMapSegment] = useState(false);
  const [totalProspected, setTotalProspected] = useState(0);
  const [totalContacted, setTotalContacted] = useState(0);
  const [totalUniqueCompanies, setTotalUniqueCompanies] = useState(0);
  const [totalInFilters, setTotalInFilters] = useState(0);
  const [archetypeToDisconnect, setArchetypeToDisconnect] = useState<any>(null);
  const [segmentToDisconnect, setSegmentToDisconnect] = useState<Number>(-1);
  const [showAllSegments, setShowAllSegments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConnectCampaignModal, setShowConnectCampaignModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);

  const [showViewProspectsModal, setShowViewProspectsModal] = useState(false);
  const [showViewProspectsModalOld, setShowViewProspectsModalOld] = useState(false);
  const [showTransferSegmentModal, setShowTransferSegmentModal] = useState(false);
  const [sdrs, setAllSDRs] = useState([] as any[]);
  const [selectedSdrId, setSelectedSdrId] = useState(null);
  const [segmentTagCategories, setSegmentTagCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [tagMenuLoading, setTagMenuLoading] = useState(false);
  const [showEditSegmentNameModal, setShowEditSegmentNameModal] = useState(false);
  const [editSegmentName, setEditSegmentName] = useState("");
  const [showCreateSegmentModal, setShowCreateSegmentModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
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
  const [data, setData] = useState<TransformedSegment[]>([]);
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
    const data = rows;
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

  function transformData(segments: any[]): TransformedSegment[] {
    return segments.map((segment, index) => {
      // Assume progress, campaign, contacts, filters, assets are derived somehow
      return {
        id: segment.id,
        person_name: segment.segment_title,
        segment_title: segment.segment_title,
        progress: isNaN(segment.num_contacted / (segment.num_prospected || 0.0001))
          ? "0"
          : Math.max(0, parseInt(((segment.num_contacted * 100) / (segment.num_prospected || 1)).toString())).toString(),
        campaign: segment.id.toString(),
        contacts: segment.num_prospected,
        filters: Object.keys(segment.filters).length, // Count of filter types
        // assets: Math.floor(Math.random() * 100), // Fake random asset count or null
        sub_segments: [], // This needs to be populated based on more complex logic or additional data
        client_archetype: segment.client_archetype,
        parent_segment_id: segment.parent_segment_id,
        client_sdr: segment.client_sdr,
        num_prospected: segment.num_prospected,
        num_contacted: segment.num_contacted,
        apollo_query: segment.apollo_query,
        segment_tags: segment.attached_segments,
        autoscrape_enabled: segment.autoscrape_enabled,
        current_scrape_page: segment.current_scrape_page,
        is_market_map: segment.is_market_map ?? false,
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

  const createNSubsegments = async (segmentId: number, numberOfBatches: number, showLoader: boolean) => {
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
        segment_id: segmentId,
        num_batches: numberOfBatches,
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

  const resetSegment = async (segmentId: number, newSegmentTitle: string, showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/reset_segment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        segment_id: segmentId,
        new_segment_title: newSegmentTitle,
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        closeAllModals();
        getAllSegments(true);
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
        is_market_map: isMarketMapSegment,
        filters: {},
      }),
    })
      .then((response) => response.json())
      .then((data) => {})
      .finally(() => {
        setLoading(false);
        setCreateSegmentName("");
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
        (type === "company" ? "?include_all_in_client=true" : type === "marketMap" ? "?only_market_map=true" : "") +
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

        const transformedSegments = transformData(data.segments);

        setTotalInFilters(totalProspectsInPreFilters);

        if (type === "marketMap") {
          setData(transformedSegments.filter((segment) => segment.is_market_map));
        } else {
          setData(transformedSegments.filter((segment) => !segment.is_market_map));
        }
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

  const [selected, setSelected] = useState<any>([]);
  const [disconnectCampaignModal, setDisconnectCampaignModal] = useState(false);

  return (
    <Box>
      {/* Old view prospects modal */}
      <Modal
        opened={showViewProspectsModalOld}
        onClose={() => {
          setShowViewProspectsModalOld(false);
          getAllSegments(true);
        }}
        size="1200px"
        // h={"500px"}
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
      {/* Create Segment Modal */}
      <Modal
        onClose={() => {
          if (isMarketMapSegment) {
            setIsMarketMapSegment(false);
          }
          setShowCreateSegmentModal(false);
        }}
        opened={showCreateSegmentModal}
        size="sm"
      >
        <Title order={4}>{isMarketMapSegment ? "Create Market Map" : "Create Segment"}</Title>
        <Text size={"sm"} color="gray" fw={500} mt={"sm"} mb={"md"}>
          {isMarketMapSegment
            ? "Create a market map to filter and rank your clients and campaigns"
            : "Create a new segment to organize your contacts and campaigns"}
        </Text>
        <TextInput
          label={isMarketMapSegment ? "Market Map Name" : "Segment Name"}
          placeholder={isMarketMapSegment ? "Enter Market Map Name" : "Enter Segment Name"}
          required
          mb={"sm"}
          onChange={(e) => setCreateSegmentName(e.target.value)}
        />
        <Flex gap={"md"} mt="xl">
          <Button
            fullWidth
            size="xs"
            radius={"md"}
            variant="outline"
            color="gray"
            onClick={() => {
              if (isMarketMapSegment) {
                setIsMarketMapSegment(false);
              }

              setShowCreateSegmentModal(false);
              setCreateSegmentName("");
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            size="xs"
            radius={"md"}
            onClick={() => {
              createSegment(true);
              setShowCreateSegmentModal(false);
            }}
          >
            {isMarketMapSegment ? "Create New Market Map" : "Create New Segment"}
          </Button>
        </Flex>
      </Modal>
      {/* Connect to Campaign Modal */}
      <Modal
        opened={showConnectCampaignModal}
        onClose={() => {
          setShowConnectCampaignModal(false);
          getAllSegments(true);
          setConnectCampaignView("SELECT_METHOD");
        }}
        size="550px"
        padding="md"
        centered
        title={
          <Flex align={"center"} gap={"xs"}>
            <IconTargetArrow color="#228be6" size={"1.4rem"} />
            <Text fw={600} size={"lg"}>
              Change Campaign
            </Text>
          </Flex>
        }
      >
        <Text size={"sm"} fw={400} align="center" mb={"sm"}>
          {/* ok actually it means archetype to connect */}
          Please select the campaign this segment should be routed to.
        </Text>
        <PersonaSelect
          onChange={(v: any) => {
            if (!v || v.length === 0) {
              return;
            }
            setSelectedCampaignId(v[0]["archetype_id"]);
          }}
          disabled={false}
          label=""
          description=""
        />
        <Flex align={"center"} gap={"sm"} mt={"lg"}>
          <Button variant="outline" color="gray" fullWidth onClick={() => setShowConnectCampaignModal(false)}>
            Go Back
          </Button>
          <Button
            fullWidth
            disabled={!selectedCampaignId || !selectedSegmentId}
            onClick={() => {
              connectCampaignToSegment(true);
            }}
          >
            Connect to Campaign
          </Button>
        </Flex>
        {/* {connectCampaignView === "SELECT_METHOD" ? (
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
              Attach to Existing Campaign
            </Button>
            <Button
              mt="md"
              color="teal"
              onClick={() => {
                setShowConnectCampaignModal(false);
                setRequestCampaignModal(true);
              }}
            >
              <IconRobot size={"0.9rem"} style={{ marginRight: "4px" }} />
              Request SellScale
            </Button>
            <Button
              mt="md"
              color="orange"
              disabled
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
        )} */}
      </Modal>
      <Modal
        opened={disconnectCampaignModal}
        onClose={() => {
          setDisconnectCampaignModal(false);
        }}
        size="550px"
        padding="md"
        centered
        title={
          <Flex align={"center"} gap={"xs"}>
            <IconButterfly color="red" size={"1.4rem"} />
            <Text fw={600} size={"lg"}>
              Disconnect from Campaign?
            </Text>
          </Flex>
        }
      >
        <Text size={"sm"} fw={400} align="center" mb={"sm"}>
          This segment is connected to <span className="font-semibold">{archetypeToDisconnect?.archetype || ''}</span> campaign. Are you sure you want to disconnect it from the
          campaign?
        </Text>
        <Flex align={"center"} gap={"sm"} mt={"lg"}>
          <Button variant="outline" color="gray" fullWidth onClick={() => setDisconnectCampaignModal(false)}>
            Go Back
          </Button>
          <Button
            fullWidth
            color="red"
            onClick={async () => {
              try {
                const response = await fetch(`${API_URL}/segment/remove_segment_from_campaign`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`,
                  },
                  body: JSON.stringify({ segment_id: segmentToDisconnect }),
                });

                if (!response.ok) {
                  throw new Error("Failed to disconnect segment from campaign");
                }

                const data = await response;
                showNotification({
                  title: "Success",
                  message: "Segment disconnected from campaign successfully",
                  color: "green",
                  icon: <IconCheck />,
                });
                setDisconnectCampaignModal(false);
                getAllSegments(true);
              } catch (error) {
                console.error("Error disconnecting segment from campaign:", error);
                showNotification({
                  title: "Error",
                  message: "Failed to disconnect segment from campaign",
                  color: "red",
                  icon: <IconCircleX />,
                });
              }
            }}
          >
            Disconnect
          </Button>
        </Flex>
      </Modal>
      <Modal
        opened={showAutoDownloadModal}
        onClose={() => {
          setOpenAutoDownloadModal(false);
        }}
        size="450px"
        padding="md"
      >
        <SegmentAutodownload
          getAllSegments={getAllSegments}
          segmentId={selectedSegmentId}
          onDownloadHistoryClick={() => {
            props.onDownloadHistoryClick && props.onDownloadHistoryClick();
            setOpenAutoDownloadModal(false);
          }}
        />
      </Modal>
      {/* Show Unassigned Segments Modal */}
      <Modal
        opened={showUnassignedSegments}
        onClose={() => {
          setShowUnassignedSegments(false);
          getAllSegments(true);
        }}
        size="1000px"
        // h={"500px"}
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
          Transfer all unused prospects from this segment to a teammate. After, the specified teammate will be able to view and manage the segment.
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
      <ContactAccountFilterModal
        showContactAccountFilterModal={showViewProspectsModal}
        setShowContactAccountFilterModal={setShowViewProspectsModal}
        segment={data.find((item) => item.id === selectedSegmentId)}
        isModal={true}
      />
      {/*<Modal*/}
      {/*  opened={showViewProspectsModal}*/}
      {/*  onClose={() => {*/}
      {/*    setShowViewProspectsModal(false);*/}
      {/*    getAllSegments(true);*/}
      {/*  }}*/}
      {/*  size="1200px"*/}
      {/*  // h={"500px"}*/}
      {/*  padding="md"*/}
      {/*  title="View Prospects"*/}
      {/*>*/}
      {/*  <iframe*/}
      {/*    // Edit URL: https://sellscale.retool.com/editor/0037d48c-00df-11ef-9943-1fa602cbecb8/Segments%20v2%20Modules/View%20Prospect%20in%20Segment*/}
      {/*    src={`https://sellscale.retool.com/embedded/public/639c4389-18d5-42a5-ad68-e84fd643b5ee#authToken=${userToken}&segmentId=${selectedSegmentId}`}*/}
      {/*    width="100%"*/}
      {/*    height="700px"*/}
      {/*    style={{ border: "none" }}*/}
      {/*  ></iframe>*/}
      {/*</Modal>*/}
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
                  {
                    value: "marketMap",
                    label: (
                      <Center style={{ gap: 4 }}>
                        <Text fw={500}>Market Maps</Text>
                      </Center>
                    ),
                  },
                ]}
              />
            </Flex>

            <Flex gap={"sm"}>
              <TextInput
                w={200}
                placeholder="Search"
                rightSection={<IconSearch size={"0.9rem"} color="gray" />}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                leftIcon={<IconPlus size={"0.9rem"} />}
                onClick={() => (window.location.href = "/contacts/find?campaign_id=" + userData?.unassigned_persona_id)}
              >
                Add Contacts
              </Button>
              <Button
                leftIcon={<IconPlus size={"0.9rem"} />}
                onClick={() => {
                  setShowCreateSegmentModal(true);
                }}
              >
                Create Segment
              </Button>
              <Button
                leftIcon={<IconPlus size={"0.9rem"} />}
                onClick={() => {
                  setIsMarketMapSegment(true);
                  setShowCreateSegmentModal(true);
                }}
              >
                Create Market Map
              </Button>
            </Flex>
          </Flex>
          {userData.client.id === 1 ||
            (userData.id === 34 && (
              <>
                {" "}
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

                                <Menu.Divider />

                                <Menu.Divider />
                                <Menu.Label color="red">Danger zone</Menu.Label>
                                <Menu.Item
                                  color="red"
                                  onClick={() => {
                                    setSelectedSegmentId(item.id);
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
                                        showLoader: true,
                                        segmentId: item.id,
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
              </>
            ))}
          <Flex gap={"sm"} align={"center"} w={"100%"} mt={"md"}>
            <Text sx={{ whiteSpace: "nowrap" }} fw={600}>
              {type === "marketMap" ? "Existing Market Map" : "Existing Segments"}
            </Text>
            <Flex align={"center"}>{loading ? <Loader /> : <Badge variant="filled">{data.length}</Badge>}</Flex>
            <Divider w={"100%"} />
            {/* <ActionIcon onClick={unusedToggle}>{openedUnUsed ? <IconChevronUp /> : <IconChevronDown />}</ActionIcon> */}
          </Flex>
          <SimpleGrid cols={3} mt={"lg"}>
            {getNestedRows(data).map(
              (
                item: {
                  id: number;
                  person_name: string;
                  segment_title: string;
                  progress: number;
                  campaign: number;
                  apollo_query: { num_results: number };
                  // assets: number,
                  autoscrape_enabled?: boolean;
                  client_archetype: { archetype: any; emoji: any };
                  client_sdr: { client_id: number; id: number; img_url: string; sdr_name: string };
                  contacts: number;
                  current_scrape_page?: number;
                  parent_segment_id?: number;
                  filters: number;
                  hasChildren: boolean;
                  isChild: boolean;
                  num_contacted: number;
                  num_prospected: number;
                  segment_tags: any[];
                  sub_segments: any[];
                  is_market_map: boolean;
                },
                index: number
              ) => {
                return (
                  <Paper key={index} withBorder p={"sm"} className="flex flex-col justify-between">
                    <Flex justify={"space-between"} align={"center"}>
                      <Flex align={"center"} gap={1}>
                        <Text fw={700} lineClamp={1}>
                          {item.is_market_map ? "Market Map: " : ""}
                          {item.person_name ?? ""}
                        </Text>
                        <ActionIcon
                          onClick={() => {
                            setSelectedSegmentId(item.id);
                            setShowEditSegmentNameModal(true);
                          }}
                        >
                          <IconEdit size={"1.2rem"} />
                        </ActionIcon>
                      </Flex>
                      <Flex gap={1}>
                        {selected && selected.includes(item.id) && (
                          <Tooltip label="Webhook Connected" withArrow>
                            <ActionIcon radius={"xl"} variant="light" color="green">
                              <IconWebhook size={"1rem"} />
                            </ActionIcon>
                          </Tooltip>
                        )}
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
                                  <Progress value={item.progress} w={"100%"} />
                                  <Text color="#228BE6" fw={600} size={"xs"}>
                                    {item.progress}%
                                  </Text>
                                </Flex>
                                <Text fw={600} size={"xs"}>
                                  {item.num_contacted}/{item.num_prospected} <span className=" text-gray-400">in Segment</span>
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
                          disabled={item.client_sdr.id !== userData.id}
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
                              onClick={() => {
                                window.location.href = `/contacts/find?segment_id=${item.id}`;
                              }}
                            >
                              <IconUsersPlus size={"0.9rem"} />
                              Add Prospects
                            </Menu.Item>
                            <Menu.Item
                              onClick={() => {
                                setShowViewProspectsModal(true);
                                setSelectedSegmentId(item.id);
                              }}
                            >
                              <IconUsers size={"0.9rem"} />
                              View Prospects
                            </Menu.Item>

                            <Menu.Item
                              onClick={() => {
                                setShowViewProspectsModalOld(true);
                                setSelectedSegmentId(item.id);
                              }}
                            >
                              <IconUserBolt size={"0.9rem"} />
                              Transfer Prospects
                            </Menu.Item>

                            <Menu.Divider />
                            <Menu.Label>Change</Menu.Label>

                            {!item.is_market_map && (
                              <Menu.Item
                                onClick={() => {
                                  openContextModal({
                                    modal: "connectSegment",
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
                                            <IconFileDownload color="#228be6" style={{ marginTop: "-5px" }} />
                                            Auto Import Prospects via Webhook
                                          </Title>
                                        </div>
                                      </Group>
                                    ),
                                    innerProps: {
                                      id: item.id,
                                      setSelected: setSelected,
                                      selected: selected,
                                    },
                                  });
                                }}
                              >
                                <IconWebhook size={"0.9rem"} />
                                Connect to Segment
                              </Menu.Item>
                            )}
                            <Menu.Item
                              onClick={() => {
                                duplicateSegment(item.id, true);
                              }}
                            >
                              <IconCopy size={"0.9rem"} />
                              Duplicate Segment
                            </Menu.Item>
                            {!item.is_market_map && (
                              <Menu.Item
                                onClick={() => {
                                  setSelectedSegmentId(item.id);
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
                                    innerProps: {
                                      currentSegment: data.filter((segment: any) => {
                                        return segment.id === item.id;
                                      })[0],
                                      onSplit: (segmentId: any, numberOfBatches: any) => {
                                        createNSubsegments(segmentId, numberOfBatches, true);
                                      },
                                    },
                                  });
                                }}
                              >
                                Split Segment
                              </Menu.Item>
                            )}
                            <Menu.Divider />
                            <Menu.Label color="red">Danger zone</Menu.Label>
                            <Menu.Item
                              color="red"
                              onClick={() => {
                                setSelectedSegmentId(item.id);
                                setShowTransferSegmentModal(true);
                              }}
                            >
                              <IconUsersMinus size={"0.9rem"} />
                              Transfer to Teammate
                            </Menu.Item>
                            {!item.is_market_map && (
                              <Menu.Item
                                color="red"
                                onClick={() =>
                                  openContextModal({
                                    modal: "resetsegment",
                                    title: (
                                      <Group position="apart">
                                        <div>
                                          <Title
                                            order={3}
                                            color="red"
                                            sx={{
                                              display: "flex",
                                              gap: "8px",
                                              alignItems: "center",
                                            }}
                                          >
                                            Are you sure you want to reset?
                                          </Title>
                                        </div>
                                      </Group>
                                    ),
                                    styles: (theme) => ({
                                      header: {
                                        margin: 0,
                                      },
                                      content: {
                                        minWidth: "200px",
                                        maxWidth: "500px !important",
                                      },
                                    }),
                                    innerProps: {
                                      currentSegment: {
                                        segment_title: item.segment_title,
                                        segment_id: item.id,
                                      },
                                      onClick: (segment_id: number, segment_title: string) => {
                                        resetSegment(segment_id, segment_title, true);
                                      },
                                    },
                                  })
                                }
                              >
                                <IconRefresh size={"0.9rem"} />
                                Reset Segment
                              </Menu.Item>
                            )}
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
                                    segmentId: item.id,
                                    num_prospected: item.num_prospected,
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
                                    segmentId: item.id,
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
                      </Flex>
                    </Flex>
                    <Flex align={"center"} gap={3} mt={"xs"}>
                      <SegmentTags item={item} setCurrentTime={setCurrentTime} getAllSegments={getAllSegments} />
                    </Flex>
                    <Box mt={"sm"}>
                      <Flex align={"center"} gap={"xs"}>
                        <Text color="gray" size={"sm"} fw={500}>
                          Prospects:
                        </Text>
                        <Text fw={600} size={"sm"}>
                          {item.contacts} people
                        </Text>{" "}
                        {/* <Divider orientation="vertical" />
                      <Text fw={600} size={"sm"}>
                        {item.assets} accounts
                      </Text> */}
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
                      {!item.is_market_map && (
                        <Flex mt={"sm"} align={"center"} gap={"sm"}>
                          <Button
                            variant={item.client_archetype?.archetype ? "outline" : "filled"}
                            color="blue"
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
                          {item.client_archetype?.archetype && (
                            <ActionIcon color="red" variant="filled" size={"lg"} onClick={() => {setArchetypeToDisconnect(item?.client_archetype); setSegmentToDisconnect(item.id); setDisconnectCampaignModal(true)}}>
                              <IconButterfly size={"1rem"} />
                            </ActionIcon>
                          )}
                        </Flex>
                      )}
                    </Box>
                  </Paper>
                );
              }
            )}
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
  const getAllSegments = props.getAllSegments;

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
              <Badge radius={"xs"} key={segmentsIndex} color={deterministicMantineColor(segments.name)}>
                {segments.name}
              </Badge>
            ))}
          {props.item?.segment_tags && props.item?.segment_tags.length > 0 ? (
            <ActionIcon variant="filled" color="blue" size={"sm"} ml={3} onClick={() => setPopoverOpened(true)}>
              <IconPlus size={"0.9rem"} />
            </ActionIcon>
          ) : (
            <Button
              leftIcon={<IconPlus size={"0.9rem"} />}
              color={props.item?.is_market_map ? "violet" : "blue"}
              size="xs"
              onClick={() => setPopoverOpened(true)}
            >
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
                                setPopoverOpened(true);
                                getAllSegments(true);
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
                        getAllSegments(true);
                        getAllSegmentTags(userToken).then((res) => {
                          setAvailableSegmentTags(res.data);
                          setSegmentTagsLoading(false);
                        });
                        (e.target as HTMLInputElement).value = "";
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
