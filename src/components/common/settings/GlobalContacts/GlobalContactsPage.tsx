import { userDataState, userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Flex,
  ScrollArea,
  Select,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconExternalLink,
  IconFilter,
  IconLetterT,
  IconPlus,
  IconSearch,
} from "@tabler/icons";
import { icpFitToColor } from "@common/pipeline/ICPFitAndReason";
import axios from "axios";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { nameToInitials, valueToColor } from "@utils/general";

export default function GlobalContactsPage() {
  const userData = useRecoilValue(userDataState);
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();
  const [acPageSize, setAcPageSize] = useState("20");
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const [contactsData, setContactsData] = useState([]);
  const [filter, setFilter] = useState<any>([
    { field: "last_updated", direction: "1" },
  ]);
  const [type, setType] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const [query, setQuery] = useState("");

  const [order, setOrder] = useState(1);
  const toggleOrder = (filtertype: string) => {
    const newOrder = order === 1 ? -1 : 1;
    setOrder(newOrder);
    setType(filtertype);
    setFilter([{ field: filtertype, direction: newOrder }]);
    fetchAccountBasedData([{ field: filtertype, direction: newOrder }]);
  };

  const fetchAccountBasedData = async (ordering: any) => {
    setLoading(true);
    const response = await axios
      .post(
        `${API_URL}/prospect/get_prospects`,
        {
          client_id: userData.id,
          offset: pageIndex * Number(acPageSize),
          query: query,
          channel: "",
          status: "",
          limit: 20,
          ordering: ordering,
          bumped: "",
          show_purgatory: "ALL",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      )
      .then((res) => {
        setContactsData(res.data.prospects);
        setFilteredData(res.data.prospects);
        setTotalCount(res.data.total_count);
      })
      .catch((err) => {
        console.log(err);
      });
    setLoading(false);
  };

  useEffect(() => {
    fetchAccountBasedData(filter);
  }, [pageIndex, query]);

  return (
    <Flex direction={"column"} p={"lg"}>
      <Flex align={"center"} justify={"space-between"}>
        <Title order={3}>Global Contacts</Title>
        <Flex align={"center"} gap={"sm"}>
          <TextInput
            w={200}
            placeholder="Search"
            rightSection={<IconSearch size={"0.9rem"} color="gray" />}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            variant="outline"
            color="blue"
            leftIcon={<IconFilter size={"0.9rem"} />}
          >
            Filters
          </Button>
          <Button leftIcon={<IconPlus size={"0.9rem"} />}>Add</Button>
        </Flex>
      </Flex>
      <div className="h-[calc(100vh-280px)] mt-4 p-1 relative">
        <div
          className="absolute right-[2px] w-10 h-[calc(100vh-280px)] bg-gradient-to-r from-gray-50 to-gray-600"
          style={{
            zIndex: 100,
            backgroundImage: "linear-gradient(to right, transparent, #d5d5d5)",
            width: "14px",
            pointerEvents: "none",
          }}
        ></div>
        <ScrollArea className="h-[calc(100vh-280px)]" type="hover">
          <DataGrid
            data={filteredData}
            highlightOnHover
            withPagination
            withColumnBorders
            withColumnResizing
            withBorder
            loading={loading}
            sx={{
              cursor: "pointer",
              "& .mantine-10xyzsm>tbody>tr>td": {
                padding: "0px",
              },
              "& tr": {
                background: "white",
              },
            }}
            columns={[
              {
                accessorKey: "full_name",
                header: () => (
                  <Flex
                    w={"100%"}
                    justify={"space-between"}
                    align={"center"}
                    gap={"3px"}
                    onClick={() => toggleOrder("full_name")}
                  >
                    <Flex gap={"3px"} align={"center"}>
                      <IconLetterT color="gray" size={"0.9rem"} />
                      <Text color="gray">Full Name</Text>
                    </Flex>
                    {type === "full_name" && order === 1 ? (
                      <IconChevronDown size={"0.9rem"} color="gray" />
                    ) : (
                      <IconChevronUp size={"0.9rem"} color="gray" />
                    )}
                  </Flex>
                ),
                size: 280,
                minSize: 200,
                maxSize: 340,
                cell: (cell) => {
                  let { full_name, individual_data } = cell.row.original as any;

                  return (
                    <Flex
                      gap={"xs"}
                      w={"100%"}
                      h={"100%"}
                      px={"sm"}
                      align={"center"}
                      justify={"space-between"}
                    >
                      <Flex gap={"xs"} align={"center"}>
                        <Avatar
                          src={individual_data?.img_url}
                          size={"sm"}
                          color={valueToColor(theme, full_name)}
                          radius={"xl"}
                        >
                          {nameToInitials(full_name)}
                        </Avatar>
                        <Text>{full_name}</Text>
                      </Flex>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "title",
                header: () => (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLetterT color="gray" size={"0.9rem"} />
                    <Text color="gray">Title</Text>
                  </Flex>
                ),
                size: 350,
                minSize: 280,
                cell: (cell) => {
                  let { title } = cell.row.original;

                  return (
                    <Flex
                      gap={"xs"}
                      w={"100%"}
                      h={"100%"}
                      px={"sm"}
                      py={"sm"}
                      align={"center"}
                      justify={"space-between"}
                    >
                      <Flex gap={"xs"} align={"center"}>
                        <Text>{title}</Text>
                      </Flex>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "company",
                header: () => (
                  <Flex
                    w={"100%"}
                    justify={"space-between"}
                    align={"center"}
                    gap={"3px"}
                    onClick={() => toggleOrder("company")}
                  >
                    <Flex gap={"3px"} align={"center"}>
                      <IconLetterT color="gray" size={"0.9rem"} />
                      <Text color="gray">Company</Text>
                    </Flex>
                    {type === "company" && order === 1 ? (
                      <IconChevronDown size={"0.9rem"} color="gray" />
                    ) : (
                      <IconChevronUp size={"0.9rem"} color="gray" />
                    )}
                  </Flex>
                ),
                size: 250,
                minSize: 200,
                cell: (cell) => {
                  let { company } = cell.row.original;

                  return (
                    <Flex
                      gap={"xs"}
                      w={"100%"}
                      h={"100%"}
                      px={"sm"}
                      py={"sm"}
                      align={"center"}
                      justify={"space-between"}
                    >
                      <Flex gap={"xs"} align={"center"}>
                        <Text>{company}</Text>
                      </Flex>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "linkedin",
                minSize: 160,
                size: 220,
                header: () => (
                  <Flex align={"center"} gap={"3px"} w={"fit-content"}>
                    <IconLetterT color="gray" size={"0.9rem"} />
                    <Text color="gray">Linkedin</Text>
                  </Flex>
                ),
                cell: (cell) => {
                  let { linkedin_url, full_name } = cell.row.original as any;
                  const username = full_name.toLowerCase().replace(/\s+/g, "");
                  return (
                    <Flex
                      gap={"xs"}
                      w={"100%"}
                      h={"100%"}
                      px={"sm"}
                      py={"sm"}
                      align={"center"}
                      justify={"space-between"}
                    >
                      <Flex gap={"xs"} align={"center"}>
                        <Anchor
                          href={`https://${linkedin_url}`}
                          target="_blank"
                        >
                          {username}{" "}
                          <IconExternalLink
                            size={"0.6rem"}
                            className="hover:cursor-point"
                          />
                        </Anchor>
                      </Flex>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "email",
                header: () => (
                  <Flex
                    w={"100%"}
                    justify={"space-between"}
                    align={"center"}
                    gap={"3px"}
                    onClick={() => toggleOrder("email")}
                  >
                    <Flex gap={"3px"} align={"center"}>
                      <IconLetterT color="gray" size={"0.9rem"} />
                      <Text color="gray">Email</Text>
                    </Flex>
                    {type === "email" && order === 1 ? (
                      <IconChevronDown size={"0.9rem"} color="gray" />
                    ) : (
                      <IconChevronUp size={"0.9rem"} color="gray" />
                    )}
                  </Flex>
                ),
                minSize: 200,
                size: 250,
                cell: (cell) => {
                  let { email } = cell.row.original;

                  return (
                    <Flex
                      gap={"xs"}
                      w={"100%"}
                      h={"100%"}
                      px={"sm"}
                      py={"sm"}
                      align={"center"}
                      justify={"space-between"}
                    >
                      <Flex gap={"xs"} align={"center"}>
                        <Text>{email}</Text>
                      </Flex>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "campaign",
                minSize: 200,
                size: 250,
                header: () => (
                  <Flex
                    w={"100%"}
                    justify={"space-between"}
                    align={"center"}
                    gap={"3px"}
                    onClick={() => toggleOrder("archetype_id")}
                  >
                    <Flex gap={"3px"} align={"center"}>
                      <IconLetterT color="gray" size={"0.9rem"} />
                      <Text color="gray">Campaign</Text>
                    </Flex>
                    {type === "archetype_id" && order === 1 ? (
                      <IconChevronDown size={"0.9rem"} color="gray" />
                    ) : (
                      <IconChevronUp size={"0.9rem"} color="gray" />
                    )}
                  </Flex>
                ),
                cell: (cell) => {
                  let { archetype_name } = cell.row.original;

                  return (
                    <Flex
                      gap={"xs"}
                      w={"100%"}
                      h={"100%"}
                      px={"sm"}
                      py={"sm"}
                      align={"center"}
                      justify={"space-between"}
                    >
                      <Flex gap={"xs"} align={"center"}>
                        <Badge color={valueToColor(theme, archetype_name)}>
                          {archetype_name}
                        </Badge>
                      </Flex>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "segment",
                header: () => (
                  <Flex
                    w={"100%"}
                    justify={"space-between"}
                    align={"center"}
                    gap={"3px"}
                    onClick={() => toggleOrder("segment_id")}
                  >
                    <Flex gap={"3px"} align={"center"}>
                      <IconLetterT color="gray" size={"0.9rem"} />
                      <Text color="gray">Segment</Text>
                    </Flex>
                    {type === "segment_id" && order === 1 ? (
                      <IconChevronDown size={"0.9rem"} color="gray" />
                    ) : (
                      <IconChevronUp size={"0.9rem"} color="gray" />
                    )}
                  </Flex>
                ),
                minSize: 60,
                size: 100,
                cell: (cell) => {
                  let { segment_name } = cell.row.original;

                  return (
                    <Flex
                      gap={"xs"}
                      w={"100%"}
                      h={"100%"}
                      px={"sm"}
                      py={"sm"}
                      align={"center"}
                      justify={"space-between"}
                    >
                      {segment_name && (
                        <Flex gap={"xs"} align={"center"}>
                          <Badge>{segment_name}</Badge>
                        </Flex>
                      )}
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "status",
                header: () => (
                  <Flex
                    w={"100%"}
                    justify={"space-between"}
                    align={"center"}
                    gap={"3px"}
                    onClick={() => toggleOrder("status")}
                  >
                    <Flex gap={"3px"} align={"center"}>
                      <IconLetterT color="gray" size={"0.9rem"} />
                      <Text color="gray">Status</Text>
                    </Flex>
                    {type === "status" && order === 1 ? (
                      <IconChevronDown size={"0.9rem"} color="gray" />
                    ) : (
                      <IconChevronUp size={"0.9rem"} color="gray" />
                    )}
                  </Flex>
                ),
                minSize: 100,
                size: 150,
                cell: (cell) => {
                  let { overall_status } = cell.row.original;

                  return (
                    <Flex
                      gap={"xs"}
                      w={"100%"}
                      h={"100%"}
                      px={"sm"}
                      py={"sm"}
                      align={"center"}
                      justify={"space-between"}
                    >
                      <Flex gap={"xs"} align={"center"}>
                        <Badge
                          color={
                            overall_status === "PROSPECTED"
                              ? "green"
                              : overall_status === "NOT_QUALIFIED"
                              ? "red"
                              : "orange"
                          }
                        >
                          {overall_status}
                        </Badge>
                      </Flex>
                    </Flex>
                  );
                },
              },
              {
                accessorKey: "icp_score",
                header: () => (
                  <Flex
                    w={"100%"}
                    justify={"space-between"}
                    align={"center"}
                    gap={"3px"}
                    onClick={() => toggleOrder("icp_fit_score")}
                  >
                    <Flex gap={"3px"} align={"center"}>
                      <IconLetterT color="gray" size={"0.9rem"} />
                      <Text color="gray">ICP Score</Text>
                    </Flex>
                    {type === "icp_fit_score" && order === 1 ? (
                      <IconChevronDown size={"0.9rem"} color="gray" />
                    ) : (
                      <IconChevronUp size={"0.9rem"} color="gray" />
                    )}
                  </Flex>
                ),
                minSize: 100,
                size: 150,
                cell: (cell) => {
                  let { icp_fit_score } = cell.row.original;

                  let icpColor = icpFitToColor(parseInt(icp_fit_score));

                  return (
                    <Flex
                      gap={"xs"}
                      w={"100%"}
                      h={"100%"}
                      px={"sm"}
                      py={"sm"}
                      align={"center"}
                      justify={"space-between"}
                    >
                      <Flex gap={"xs"} align={"center"}>
                        <Badge color={icpColor} size="md">
                          {icp_fit_score == "4"
                            ? "VERY HIGH"
                            : icp_fit_score == "3"
                            ? "HIGH"
                            : icp_fit_score == "2"
                            ? "MEDIUM"
                            : icp_fit_score == "1"
                            ? "LOW"
                            : icp_fit_score == "0"
                            ? "VERY LOW"
                            : "gray"}
                        </Badge>
                      </Flex>
                    </Flex>
                  );
                },
              },
            ]}
            options={{
              enableFilters: true,
            }}
            components={{
              pagination: ({ table }) => (
                <Flex
                  justify={"center"}
                  align={"center"}
                  px={"sm"}
                  py={"3px"}
                  sx={(theme) => ({
                    border: `1px solid ${theme.colors.gray[4]}`,
                    borderTopWidth: 0,
                  })}
                  className="fixed bottom-14 bg-white w-[calc(100%-254px)]"
                >
                  <Flex align={"center"} gap={"sm"}>
                    <Flex align={"center"} gap={"xl"}>
                      <ActionIcon
                        variant="transparent"
                        color="gray.8"
                        h={30}
                        disabled={
                          pageIndex === 0 ||
                          Math.ceil(totalCount / Number(acPageSize)) === 0
                        }
                        onClick={() => {
                          setPageIndex((prev) => prev - 1);
                        }}
                      >
                        <div className="flex items-center">
                          <IconChevronLeft stroke={theme.colors.gray[8]} />
                          <Text size={"sm"}>Prev</Text>
                        </div>
                      </ActionIcon>
                      <Select
                        size="xs"
                        maw={80}
                        value={`${pageIndex + 1}`}
                        data={new Array(
                          Math.ceil(totalCount / Number(acPageSize))
                        )
                          .fill(0)
                          .map((i, idx) => ({
                            label: String(idx),
                            value: String(idx),
                          }))}
                        onChange={(v) => {
                          setPageIndex(Number(v));
                        }}
                      />

                      <ActionIcon
                        variant="transparent"
                        color="gray.8"
                        h={30}
                        disabled={
                          pageIndex === totalCount / Number(acPageSize) - 1
                        }
                        onClick={() => {
                          setPageIndex((prev) => prev + 1);
                        }}
                      >
                        <div className="flex items-center">
                          <Text size={"sm"}>Next</Text>
                          <IconChevronRight stroke={theme.colors.gray[8]} />
                        </div>
                      </ActionIcon>
                    </Flex>
                  </Flex>
                  <Select
                    ml={"lg"}
                    size="xs"
                    style={{ width: "150px" }}
                    data={[{ label: "20 per page", value: "20" }]}
                    value={acPageSize}
                    disabled
                    onChange={(v) => {
                      setAcPageSize(v ?? "20");
                    }}
                  />
                </Flex>
              ),
            }}
            w={"100%"}
            pageSizes={[acPageSize]}
            styles={(theme) => ({
              thead: {
                height: "44px",
                backgroundColor: theme.colors.gray[0],
                "::after": {
                  backgroundColor: "transparent",
                },
              },
              headerCellContent: {
                width: "100%",
              },
              wrapper: {
                gap: 0,
              },
              scrollArea: {
                paddingBottom: 0,
                gap: 0,
              },

              dataCellContent: {
                width: "100%",
              },
              resizer: {
                borderRight: "1px solid #dee2e6",
                marginRight: "-1px",
              },
            })}
          />
        </ScrollArea>
        <div
          className="absolute bottom-[-5px] h-10 w-full bg-gradient-to-r from-gray-50 to-gray-600"
          style={{
            zIndex: 100,
            backgroundImage: "linear-gradient(to bottom, transparent, #d5d5d5)",
            height: "14px",
            width: "calc(100% - 8px)",
            pointerEvents: "none",
          }}
        ></div>
      </div>
    </Flex>
  );
}
