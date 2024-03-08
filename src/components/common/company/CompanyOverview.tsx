import {
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Paper,
  Text,
  Image,
  Badge,
  Avatar,
  NumberInput,
  Select,
  ActionIcon,
  useMantineTheme,
  Timeline,
  Group,
  Container,
  Stack,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconBuildingSkyscraper,
  IconChevronLeft,
  IconChevronRight,
  IconDiscountCheck,
  IconExternalLink,
  IconGitPullRequest,
  IconMessage,
  IconTags,
  IconUser,
} from "@tabler/icons";
import moment from "moment";
import { IconSparkles, IconUserEdit } from "@tabler/icons-react";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useState } from "react";
import { API_URL } from "@constants/data";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useRecoilValue } from "recoil";
import { useParams } from "react-router-dom";

type CompanyOverviewType = {
  avatar: string;
  contact: string;
  title: string;
  rep_name: string;
  status: string;
}[];

type CompanyDetailsType = {
  name: string;
  description: string;
  websites: [""];
  industries: [""];
  locations: [
    {
      city: "";
      country: "";
    }
  ];
  num_employees: number;
  specialities: [""];
};

type timeDataType = {
  title: string;
  subtitle: string;
}[];

export default function CompanyOverview() {
  const theme = useMantineTheme();
  const percentage = [
    {
      percentage: 100,
      color: theme.colors.green[4],
    },
    {
      percentage: 80,
      color: theme.colors.blue[4],
    },
    {
      percentage: 60,
      color: theme.colors.yellow[4],
    },
    {
      percentage: 40,
      color: theme.colors.orange[4],
    },
    {
      percentage: 20,
      color: theme.colors.red[4],
    },
  ];
  const [companyContactData, setCompanyContactData] =
    useState<CompanyOverviewType>([]);
  const [recentActivityData, setRecentActivityData] = useState<timeDataType>(
    []
  );

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetailsType>();

  const engagedCount =
    companyContactData?.filter((item) => item.status === "engaged").length || 0;
  const totalCount = companyContactData?.length || 0;

  const currentPercentage =
    totalCount > 0 ? (engagedCount / totalCount) * 100 : 0;

  const handleTime = (oldDate: string) => {
    const date = oldDate;
    const formattedDate = moment(date, "MM/DD/YYYY").format("MMM DD, YYYY");
    return formattedDate;
  };

  const url = useParams();
  let filterData = [];
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      const response = await fetch(
        `${API_URL}/company/details?company_id=${url.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const data = await response.json();

      setCompanyDetails(data?.company_detail);
    };
    const fetchProspectEngagementData = async () => {
      const response = await fetch(
        `${API_URL}/company/engagement?company_id=${url.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            client_id: userData?.id,
          }),
        }
      );
      const data = await response.json();
      setCompanyContactData(data?.prospect_engagement);
      setFilteredData(data?.prospect_engagement);
    };
    const fetchTimelineData = async () => {
      const response = await fetch(
        `${API_URL}/company/timeline?company_id=${url.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            client_id: userData?.id,
          }),
        }
      );
      const data = await response.json();

      setRecentActivityData(data?.timeline);
    };
    fetchCompanyDetails();
    fetchProspectEngagementData();
    fetchTimelineData();
  }, []);
  const [filterOption, setFilterOption] = useState("");

  const handleFilter = (filterOption: string) => {
    setFilterOption(filterOption);
    let data: any = [];
    data =
      companyContactData?.filter((item: any) => item.status === filterOption) ||
      [];
    setFilteredData(data);
  };

  return (
    <Paper>
      <Container size="xl" py={"lg"}>
        <Flex align={"center"} gap={"sm"}>
          <Button variant="default" radius={"100%"} px={5}>
            <IconArrowLeft color="#439bf8" />
          </Button>
          <Text fw={600} size={"xl"}>
            Company Overview
          </Text>
        </Flex>
        <Divider mt={"md"} />
        <Group grow align="start" py={"xl"}>
          <Flex gap={"md"} direction={"column"} w={"100%"}>
            <Flex
              direction={"column"}
              gap={"sm"}
              p={"sm"}
              style={{ border: "1.5px solid #ededee", borderRadius: "6px" }}
            >
              <Flex gap={"md"}>
                <Flex>
                  <Card shadow="lg" radius="md" h={"fit-content"} p={0}>
                    <Image
                      radius={"md"}
                      src={`https://logo.clearbit.com/${companyDetails?.websites[0]}`}
                      height={120}
                      width={120}
                      alt="Norway"
                    />
                  </Card>
                </Flex>
                <Flex gap={"sm"} direction={"column"} mr={"sm"}>
                  <Flex align={"center"}>
                    <Text fw={700} size={24} mr={"4px"} lineClamp={1}>
                      {companyDetails?.name}
                    </Text>
                    <Flex>
                      <Divider
                        orientation="vertical"
                        h={18}
                        display={"flex"}
                        className=" items-center"
                      />
                    </Flex>
                    <Text color="gray" mx={"8px"} lineClamp={1}>
                      {companyDetails?.websites[0]}
                    </Text>
                    <Stack>
                      <IconExternalLink size={"0.8rem"} color="#439bf8" />
                    </Stack>
                  </Flex>
                  <Text fw={500}>
                    {"To accelerate the advent of sustainable transport."}
                  </Text>
                  <Text color="gray" className=" whitespace-normal" size={"xs"}>
                    {companyDetails?.description}
                  </Text>
                  <Flex align={"center"} gap={4}>
                    <IconExternalLink size={"0.8rem"} color="gray" />
                    <Text color="gray" fw={400} size={"sm"}>
                      Industry:{" "}
                    </Text>
                    <Text fw={500} size={"sm"}>
                      {companyDetails?.industries.map((item) => {
                        return <>{item}</>;
                      })}
                    </Text>
                  </Flex>
                  <Flex align={"center"} gap={4}>
                    <IconBuildingSkyscraper size={"0.8rem"} color="gray" />
                    <Text color="gray" fw={400} size={"sm"}>
                      Location:{" "}
                    </Text>
                    <Text fw={500} size={"sm"}>
                      {companyDetails?.locations[0].city},{" "}
                      {companyDetails?.locations[0].country}
                    </Text>
                  </Flex>
                  <Flex align={"center"} gap={4}>
                    <IconUser size={"0.8rem"} color="gray" />
                    <Text color="gray" fw={400} size={"sm"}>
                      No. of employees:{" "}
                    </Text>
                    <Text fw={500} size={"sm"}>
                      {companyDetails?.num_employees}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              <Divider variant="dashed" />
            </Flex>
            <Flex direction={"column"} mt={"md"}>
              <Flex w={"100%"} justify={"space-between"} align={"center"}>
                <Text color="gray" fw={600} size={"xl"}>
                  Contacts:
                </Text>
                <Flex
                  py={0}
                  px={35}
                  style={{
                    border: "1.5px solid #ededee",
                    borderRadius: "24px",
                  }}
                  gap={"sm"}
                >
                  <Text
                    color="green"
                    p={3}
                    fw={filterOption === "engaged" ? 800 : 600}
                    onClick={() => {
                      handleFilter("engaged");
                    }}
                  >
                    Engaged{" "}
                    <Badge color="green">
                      {
                        companyContactData?.filter(
                          (item) => item.status === "engaged"
                        ).length
                      }
                    </Badge>
                  </Text>
                  <Divider orientation="vertical" />
                  <Text
                    color="yellow"
                    p={3}
                    fw={filterOption === "sourced" ? 800 : 600}
                    onClick={() => {
                      handleFilter("sourced");
                    }}
                  >
                    Sourced{" "}
                    <Badge color="yellow">
                      {
                        companyContactData?.filter(
                          (item) => item.status === "sourced"
                        ).length
                      }
                    </Badge>
                  </Text>
                </Flex>
              </Flex>
              <DataGrid
                data={filteredData}
                highlightOnHover
                withPagination
                withSorting
                withBorder
                sx={{ cursor: "pointer" }}
                mt={"lg"}
                columns={[
                  {
                    accessorKey: "contacts",
                    header: "Contacts",
                    maxSize: 400,
                    cell: (cell) => {
                      const { avatar, contact } = cell.row.original;
                      return (
                        <Flex align={"center"} gap={"sm"} h={"100%"}>
                          <Avatar src={avatar} size={"sm"} radius={"xl"} />
                          <Text size={"xs"}>{contact}</Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: "title",
                    header: "Title",
                    maxSize: 130,
                    cell: (cell) => {
                      const { title } = cell.row.original;
                      return (
                        <Flex align={"center"} h={"100%"}>
                          <Text
                            color="gray"
                            lineClamp={2}
                            className=" whitespace-normal"
                            size={"xs"}
                          >
                            {title}
                          </Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: "repName",
                    header: "Rep name",
                    maxSize: 130,
                    cell: (cell) => {
                      const { rep_name } = cell.row.original;
                      return (
                        <Flex align={"center"} h={"100%"}>
                          <Text
                            color="gray"
                            lineClamp={2}
                            className=" whitespace-normal"
                            size={"xs"}
                          >
                            {rep_name}
                          </Text>
                        </Flex>
                      );
                    },
                  },
                  {
                    accessorKey: "status",
                    header: "Status",
                    maxSize: 100,
                    cell: (cell) => {
                      const { status } = cell.row.original;
                      return (
                        <Flex align={"center"} h={"100%"}>
                          <Badge
                            color={status === "engaged" ? "green" : "yellow"}
                          >
                            {status}
                          </Badge>
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
                      justify={"space-between"}
                      align={"center"}
                      px={"sm"}
                      py={"1.25rem"}
                      sx={(theme) => ({
                        border: `1px solid ${theme.colors.gray[4]}`,
                        borderTopWidth: 0,
                      })}
                    >
                      <Flex align={"center"} gap={"sm"}>
                        <Text fw={500} color="gray.6">
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
                            value={`${
                              table.getState().pagination.pageIndex + 1
                            }`}
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
                            disabled={
                              table.getState().pagination.pageIndex === 0
                            }
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
                    height: "44px",
                    backgroundColor: theme.colors.gray[0],
                    "::after": {
                      backgroundColor: "transparent",
                    },
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
                })}
              />
            </Flex>
          </Flex>
          <Flex gap={"xl"} direction={"column"} w={"100%"}>
            <Flex
              direction={"column"}
              gap={"sm"}
              p={"sm"}
              style={{ border: "1.5px solid #ededee", borderRadius: "6px" }}
            >
              <Text color="gray" fw={600} mt={"sm"} size={"xl"}>
                Intent Score:
              </Text>
              <Flex
                gap={"lg"}
                align={"center"}
                p={"lg"}
                justify={"space-between"}
                style={{
                  border: "1.5px solid #ededee",
                  borderStyle: "dashed",
                  borderRadius: "12px",
                }}
              >
                <Flex w={"100%"} justify={"center"}>
                  <Box
                    sx={{
                      width: "180px",
                      height: "90px",
                      position: "relative",

                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      overflow: "hidden",
                      boxSizing: "border-box",

                      "&:before": {
                        content: '""',
                        width: "180px",
                        height: "90px",
                        border: `20px solid ${theme.colors.gray[4]}`,
                        position: "absolute",
                        transformOrigin: "50%  0% 0",
                        borderRadius: "120px 120px 0 0",
                        borderBottom: 0,
                        left: 0,
                        top: 0,
                      },
                    }}
                  >
                    <Text fz={"sm"}>
                      <Text component="span" fw={700} fz={"md"}>
                        {Math.ceil(currentPercentage)}
                      </Text>
                      /100
                    </Text>
                    {percentage.map((i, idx) => (
                      <Box
                        key={idx}
                        sx={(theme) => ({
                          width: "180px",
                          height: "90px",
                          border: `20px solid ${i.color}`,
                          borderTop: "none",
                          position: "absolute",
                          transformOrigin: "50%  0% 0",
                          borderRadius: "0 0 120px 120px",
                          left: "0",
                          top: "100%",
                          zIndex: 5,
                          animation: "1s fillGraphAnimation ease-in",
                          boxSizing: "border-box",
                          transform: `rotate(calc(1deg*${i.percentage}*1.8))`,

                          "&:before": {
                            content: '""',
                            width: "180px",
                            height: "90px",
                            borderBottom: `3px solid white`,
                            position: "absolute",
                            transformOrigin: "left",
                            transform: `rotate(calc(1deg*100*1.8))`,
                            left: 0,
                            top: 0,
                          },
                        })}
                      />
                    ))}

                    <Box
                      sx={(theme) => ({
                        width: "180px",
                        height: "90px",
                        border: `20px solid transparent`,
                        borderTop: "none",
                        position: "absolute",
                        transformOrigin: "50%  0% 0",
                        borderRadius: "0 0 120px 120px",
                        left: "0",
                        top: "100%",
                        zIndex: 5,
                        animation: "1s fillGraphAnimation ease-in",
                        boxSizing: "border-box",
                        transform: `rotate(calc(1deg*${currentPercentage}*1.8))`,

                        "&:before": {
                          content: '""',
                          width: "20px",
                          height: "1px",
                          borderBottom: `3px solid black`,
                          position: "absolute",
                          transformOrigin: "left",
                          transform: `rotate(calc(1deg*100*1.8))`,
                          left: 0,
                          top: 0,
                        },
                      })}
                    />
                  </Box>
                </Flex>
                <Flex direction={"column"} w={"100%"}>
                  <Flex align={"center"} gap={4}>
                    <Text
                      color={
                        currentPercentage >= 80
                          ? theme.colors.green[4]
                          : currentPercentage >= 60
                          ? theme.colors.blue[4]
                          : currentPercentage >= 40
                          ? theme.colors.yellow[4]
                          : currentPercentage >= 20
                          ? theme.colors.orange[4]
                          : theme.colors.red[4]
                      }
                      fw={600}
                      size={34}
                    >
                      {currentPercentage >= 80
                        ? "Very High"
                        : currentPercentage >= 60
                        ? "High"
                        : currentPercentage >= 40
                        ? "Medium"
                        : currentPercentage >= 20
                        ? "Low"
                        : "Very Low"}
                    </Text>
                    <IconDiscountCheck
                      color={
                        currentPercentage >= 80
                          ? theme.colors.green[4]
                          : currentPercentage >= 60
                          ? theme.colors.blue[4]
                          : currentPercentage >= 40
                          ? theme.colors.yellow[4]
                          : currentPercentage >= 20
                          ? theme.colors.orange[4]
                          : theme.colors.red[4]
                      }
                      size={30}
                    />
                  </Flex>
                  <Text
                    color="gray"
                    fw={400}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    Overall intent score:{" "}
                    <Text
                      color={
                        currentPercentage >= 80
                          ? theme.colors.green[4]
                          : currentPercentage >= 60
                          ? theme.colors.blue[4]
                          : currentPercentage >= 40
                          ? theme.colors.yellow[4]
                          : currentPercentage >= 20
                          ? theme.colors.orange[4]
                          : theme.colors.red[4]
                      }
                      fw={600}
                    >
                      {currentPercentage}
                    </Text>
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex
              style={{ border: "1.5px solid #ededee", borderRadius: "6px" }}
              p={"sm"}
              direction={"column"}
            >
              <Text color="gray" fw={600} size={"xl"}>
                Recent Activity
              </Text>
              <Timeline bulletSize={30} lineWidth={2} ml={"lg"} mt={"lg"}>
                {recentActivityData?.map((item, index) => {
                  return (
                    <Timeline.Item
                      bullet={
                        item?.subtitle ? (
                          <IconMessage size={16} />
                        ) : (
                          <IconGitPullRequest size={16} />
                        )
                      }
                      title={
                        <Flex align={"center"} gap={"xs"}>
                          <Text fw={500} fz="sm">
                            {item?.title.split(" - ")[0]}
                          </Text>
                          <Text color="gray" fw={300}>
                            {handleTime(item?.title.split(" - ")[1])}
                          </Text>
                        </Flex>
                      }
                      active
                      lineVariant="dashed"
                      color={item?.subtitle ? "" : "orange"}
                    >
                      {item?.subtitle && (
                        <Text fw={400} size={"xs"}>
                          Received Message:
                          <span className=" text-gray-400 line-clamp-4">
                            {item?.subtitle}
                          </span>
                        </Text>
                      )}
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            </Flex>
          </Flex>
        </Group>
      </Container>
    </Paper>
  );
}
