import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Group,
  Menu,
  Paper,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Text,
  TextInput,
  Tooltip,
  Title,
  Popover,
  Loader,
  Badge,
} from "@mantine/core";
import { openConfirmModal, openContextModal } from "@mantine/modals";
import {
  IconArrowRight,
  IconArrowsSplit2,
  IconBackspace,
  IconBrandLinkedin,
  IconButterfly,
  IconCopy,
  IconCylinder,
  IconDotsVertical,
  IconLoader,
  IconPlus,
  IconSearch,
  IconSend,
  IconSwitch,
  IconTargetArrow,
  IconTrash,
  IconUsers,
  IconWand,
  IconX,
} from "@tabler/icons";
import { IconUsersMinus, IconUsersPlus } from "@tabler/icons-react";
import { addTagToSegment, createSegmentTag, deleteTag, getAllSegmentTags, removeTagFromSegment } from "@utils/requests/segmentTagTemplates";
import { deterministicMantineColor } from "@utils/requests/utils";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";

export default function AddSegmentModal() {
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [type, setType] = useState("create");
  const [expandedRows, setExpandedRows] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [seletedTag, setSelectedTag] = useState<string | null>("");
  const [loading, setLoading] = useState(false);

  const [createSegmentName, setCreateSegmentName] = useState("");
  const [createSegmentParentId, setCreateSegmentParentId] = useState(null);

  const [totalProspected, setTotalProspected] = useState(0);
  const [totalContacted, setTotalContacted] = useState(0);
  const [totalUniqueCompanies, setTotalUniqueCompanies] = useState(0);
  const [totalInFilters, setTotalInFilters] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [showConnectCampaignModal, setShowConnectCampaignModal] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<number | null>(null);

  const [data, setData] = useState([]);
  let FilteredData: any = [];

  const getNestedRows = (rows: any) => {
    console.log("=======");
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

  useEffect(() => {
    if (type === "exist") getAllSegments(true);
  }, [false, currentTime, type]);

  return (
    <Paper>
      <SegmentedControl
        value={type}
        w={"100%"}
        h={50}
        onChange={(value: any) => {
          setType(value);
        }}
        data={[
          {
            value: "create",
            label: (
              <Center style={{ gap: 4 }}>
                <IconPlus size={"1.2rem"} />
                <Text fw={500}>Create Segment</Text>
              </Center>
            ),
          },
          {
            value: "exist",
            label: (
              <Center style={{ gap: 4 }}>
                <IconCylinder size={"1.2rem"} />
                <Text fw={500}>Add to Existing Segment</Text>
              </Center>
            ),
          },
        ]}
        styles={{
          label: {
            "&[data-active]": {
              background: "#228be6",
              color: "white",
              height: "42px",
            },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          },

          control: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          },
        }}
      />
      {type === "create" && (
        <Box>
          <Paper withBorder radius={"sm"} p={"md"} mt={"lg"}>
            <TextInput label="Segment Name" placeholder="Eg. Product managers in Chicago" />
            <TextInput label="Segment Tags" placeholder="Enter tags" mt={"sm"} />
            <Flex mt={"lg"} gap={"sm"} align={"center"}>
              <Text color="gray" fw={500} size={"sm"}>
                Estimates:
              </Text>
              <Text fw={500} size={"sm"}>
                {5} people
              </Text>
              <Divider orientation="vertical" />
              <Text fw={500} size={"sm"}>
                {5} accounts
              </Text>
            </Flex>
            <Flex mt={"xs"} gap={"sm"} align={"center"}>
              <Text color="gray" fw={500} size={"sm"}>
                Created by:
              </Text>
              <Avatar src={""} size={"sm"} radius={"xl"} />
              <Text fw={500} size={"sm"}>
                {"David Wei"}
              </Text>
            </Flex>
          </Paper>
          <Text color="red" size={"sm"} fw={500} mt={"sm"}>
            Note: This action is not reverisble. Once segment is created, contacts will start uploading. This will use your upload credits.
          </Text>
        </Box>
      )}
      {type === "exist" && (
        <Paper mt={"lg"}>
          <TextInput placeholder="Search by title, tags..." rightSection={<IconSearch size={"0.9rem"} />} />
          <SimpleGrid cols={2} mt={"lg"}>
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
        </Paper>
      )}

      <Flex gap={"lg"} mt={"lg"}>
        <Button color="gray" variant="outline" fullWidth size="md">
          Cancel
        </Button>
        <Button fullWidth size="md">
          Create Segment
        </Button>
      </Flex>
    </Paper>
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
