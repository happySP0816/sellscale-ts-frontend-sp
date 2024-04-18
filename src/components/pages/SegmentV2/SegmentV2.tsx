import {
  Accordion,
  ActionIcon,
  rem,
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Modal,
  NumberInput,
  Paper,
  Progress,
  Select,
  Text,
  useMantineTheme,
  Container,
  LoadingOverlay,
  Menu,
  TextInput,
} from "@mantine/core";

import {
  IconArrowRight,
  IconBolt,
  IconButterfly,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCircleX,
  IconClearAll,
  IconDots,
  IconEdit,
  IconEye,
  IconFilter,
  IconLetterT,
  IconMenu,
  IconMessageCircle,
  IconMicrophone,
  IconPhoto,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconToggleRight,
  IconTrash,
  IconWand,
} from "@tabler/icons";
import { DataGrid } from "mantine-data-grid";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import { useRecoilValue } from "recoil";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import { IconMenuDeep } from "@tabler/icons-react";

export default function SegmentV2() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const [arrow, setArrow] = useState(false);
  const [data, setData] = useState([
    // {
    //   id: 1,
    //   person_name: "Product Leaders",
    //   progress: 22,
    //   campaign: 33,
    //   contacts: 1766890,
    //   filters: 3,
    //   assets: 51,
    //   sub_segments: [
    //     {
    //       person_name: "Product Leaders - US",
    //       progress: 69,
    //       campaign: null,
    //       contacts: 1766890,
    //       filters: 3,
    //       assets: 42,
    //     },
    //     {
    //       person_name: "Product Leaders - Middle East",
    //       progress: 22,
    //       campaign: 33,
    //       contacts: 1766890,
    //       filters: 3,
    //       assets: null,
    //     },
    //   ],
    // },
    // {
    //   id: 2,
    //   person_name: "In-house Researcher",
    //   progress: 22,
    //   campaign: 12,
    //   contacts: 1766890,
    //   filters: 10,
    //   assets: null,
    //   sub_segments: [],
    // },
    // {
    //   id: 3,
    //   person_name: "UI/UX",
    //   progress: 22,
    //   campaign: 5,
    //   contacts: 1766890,
    //   filters: 10,
    //   assets: null,
    //   sub_segments: [],
    // },
    // {
    //   id: 4,
    //   person_name: "Private Equity",
    //   progress: 22,
    //   campaign: 5,
    //   contacts: 1766890,
    //   filters: 10,
    //   assets: null,
    //   sub_segments: [
    //     {
    //       person_name: "Product Leaders - US",
    //       progress: 69,
    //       campaign: null,
    //       contacts: 1766890,
    //       filters: 3,
    //       assets: 42,
    //     },
    //   ],
    // },
  ]);

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
      minSize: 420,
      header: () => (
        <Flex align={"center"} gap={"3px"}>
          <IconLetterT color="gray" size={"0.9rem"} />
          <Text color="gray">Persona Name</Text>
        </Flex>
      ),
      cell: (cell: any) => {
        const { isChild, isLastChild } = cell.row.original;
        const {
          id,
          person_name,
          sub_segments,
          progress,
          client_archetype,
          client_sdr,
        } = cell.row.original;

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
                  <Box w="92%">
                    <Flex align={"center"} gap={"sm"}>
                      <Text size={"sm"} fw={500}>
                        {person_name}
                      </Text>
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
                          Sub-Segments
                        </Badge>
                      )}
                    </Flex>
                    <Flex align={"center"} gap={"sm"} mt={3}>
                      <Progress value={progress} w={140} />
                      <Text color="#3B85EF" fw={600}>
                        {progress}% Contacted
                      </Text>
                    </Flex>
                  </Box>
                  <Box w="5%">
                    <Menu shadow="md" withinPortal>
                      <Menu.Target>
                        <ActionIcon>
                          <IconMenuDeep />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Divider />
                        <Menu.Label>Prospects</Menu.Label>
                        <Menu.Item>View Prospects</Menu.Item>

                        <Menu.Divider />

                        <Menu.Label>Split</Menu.Label>
                        <Menu.Item>Manually Split Segment</Menu.Item>
                        <Menu.Item>Auto Split Segment</Menu.Item>

                        <Menu.Divider />
                        <Menu.Label>Danger zone</Menu.Label>
                        <Menu.Item>Transfer to Teammate</Menu.Item>

                        <Menu.Item>Clear Prospects</Menu.Item>
                        <Menu.Item color="red">Delete Segment</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
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
        const { contacts, filters } = cell.row.original;

        return (
          <Flex
            w={"100%"}
            h={"100%"}
            px={"sm"}
            py={"md"}
            align={"center"}
            justify={"start"}
            bg={isChild ? "#F7F8FA" : "white"}
          >
            <Box>
              <Flex gap={4} fw={600}>
                <Text>{contacts}</Text>
                <Text color="gray">Contacts</Text>
                <Button
                  leftIcon={<IconEye size={"0.9rem"} />}
                  variant="subtle"
                  color="blue"
                  size="xs"
                  radius="md"
                  compact
                  onClick={() => alert("Clicked View Contacts button")}
                >
                  View
                </Button>
              </Flex>
              <Flex gap={4} align={"center"} fw={600}>
                <Text>{filters}</Text>
                <Text color="gray">Filters</Text>
                <Button
                  leftIcon={<IconEdit size={"0.9rem"} />}
                  variant="subtle"
                  color="blue"
                  size="xs"
                  radius="md"
                  compact
                  onClick={open}
                >
                  Edit
                </Button>
              </Flex>
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
        const { campaign, client_archetype, client_sdr } = cell.row.original;
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
              onClick={() => {
                alert("Clicked Connect to Campaign button");
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

  const [revenueData, setRevenueData] = useState([
    "Option One",
    "Option two",
    "Option three",
    "Option Four",
    "Option Five",
  ]);
  const [headcountData, setHeadCountData] = useState([
    "Option One",
    "Option two",
    "Option three",
    "Option Four",
    "Option Five",
  ]);

  function transformData(segments: any[]) {
    return segments.map((segment, index) => {
      // Assume progress, campaign, contacts, filters, assets are derived somehow
      console.log(segment.client_sdr);
      return {
        id: segment.id,
        person_name: segment.segment_title,
        progress: Math.floor(Math.random() * 100), // Fake random progress
        campaign: Math.floor(Math.random() * 100), // Fake random campaign ID or null
        contacts: Math.floor(Math.random() * 2000000), // Fake random contacts number
        filters: Object.keys(segment.filters).length, // Count of filter types
        assets: Math.floor(Math.random() * 100), // Fake random asset count or null
        sub_segments: [], // This needs to be populated based on more complex logic or additional data
        client_archetype: segment.client_archetype,
        client_sdr: segment.client_sdr,
      };
    });
  }

  const getAllSegments = async (showLoader: boolean) => {
    if (showLoader) {
      setLoading(true);
    }
    fetch(`${API_URL}/segment/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const segments = data.segments;
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

  useEffect(() => {
    getAllSegments(true);
  }, [false]);

  return (
    <Paper>
      <Flex direction={"column"} w={"90%"} mx={"auto"} pt={"lg"}>
        <Flex align={"center"} justify={"space-between"}>
          <Text size={"lg"} fw={600}>
            Segments
          </Text>
          <Button leftIcon={<IconPlus />}>Create Segment</Button>
        </Flex>
        <Text color="gray" fw={500} size={"sm"} mb={"xl"}>
          View and manage your segments to organize your contacts and campaigns
        </Text>
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
              variant="outline"
              color="gray"
              size="xs"
              radius={"md"}
              onClick={() => getAllSegments(true)}
              ml={"auto"}
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
      <Modal
        size={"lg"}
        opened={opened}
        onClose={close}
        withCloseButton={false}
      >
        <Flex align={"center"} justify={"space-between"}>
          <Flex gap={"sm"} align={"center"}>
            <IconFilter color="#3B85EF" size={"2rem"} />
            <Text size={24} fw={600}>
              Edit Pre-filters
            </Text>
          </Flex>
          <ActionIcon onClick={close}>
            <IconCircleX />
          </ActionIcon>
        </Flex>
        <Text size={"sm"} color="gray" fw={500} mt={"sm"} mb={"md"}>
          Configure the pre-filters below to fine-tune the segment contacts.
        </Text>
        <Accordion
          defaultValue="sorting"
          styles={{
            control: {
              padding: "0px",
            },
            content: {
              paddingInline: "0px",
            },
          }}
        >
          <Accordion.Item key={"job_title"} value={"job_title"}>
            <Accordion.Control>Job Title</Accordion.Control>
            <Accordion.Panel>{"Job Title"}</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key={"headcount"} value={"headcount"}>
            <Accordion.Control>HeadCount</Accordion.Control>
            <Accordion.Panel>{"HeadCount"}</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key={"sorting"} value={"sorting"}>
            <Accordion.Control>Advanced Sorting</Accordion.Control>
            <Accordion.Panel>
              <Flex gap={"sm"} direction={"column"}>
                <CustomSelect
                  maxWidth="100%"
                  value={revenueData}
                  label="REVENUE RATE:"
                  placeholder="Select options"
                  setValue={setRevenueData}
                  data={revenueData}
                  setData={setRevenueData}
                />

                <CustomSelect
                  maxWidth="100%"
                  value={headcountData}
                  label="HEADCOUNTS BY DEPARTMENT:"
                  placeholder="Select options"
                  setValue={setHeadCountData}
                  data={headcountData}
                  setData={setHeadCountData}
                />
              </Flex>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <Flex gap={"md"} mt={50}>
          <Button
            fullWidth
            size="md"
            radius={"md"}
            variant="outline"
            color="gray"
            onClick={close}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            size="md"
            radius={"md"}
            onClick={() => alert("Clicked Update Pre-filters button")}
          >
            Update Pre-filters
          </Button>
        </Flex>
      </Modal>
    </Paper>
  );
}
