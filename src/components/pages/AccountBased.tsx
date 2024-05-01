import { userDataState, userTokenState } from "@atoms/userAtoms";
import PageFrame from "@common/PageFrame";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Badge,
  Box,
  Flex,
  Image,
  Select,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAffiliate,
  IconCalendar,
  IconChecks,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconLetterT,
  IconLoader,
  IconSend,
  IconToggleRight,
} from "@tabler/icons";
import { IconMessageCheck } from "@tabler/icons-react";
import axios from "axios";
import { DataGrid } from "mantine-data-grid";
import moment from "moment";
import { useEffect, useState } from "react";
import { Sparklines, SparklinesCurve } from "react-sparklines";
import { useRecoilValue } from "recoil";

interface AccountBasedDataType {
  company: string;
  company_id: number;
  company_url: string;
  latest_reply: string;
  num_accepted: number;
  num_demo: number;
  num_positive_reply: number;
  num_replied: number;
  num_sent: number;
  sparkline_data: [];
  status: string;
}

export default function AccountBased() {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);
  const [acPageSize, setAcPageSize] = useState("25");
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accountBasedData, setAccountBasedData] = useState<
    AccountBasedDataType[]
  >([]);

  useEffect(() => {
    const fetchAccountBasedData = async () => {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/campaigns/account_based`,
        {
          client_id: userData.id,
          offset: pageIndex * Number(acPageSize),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      setAccountBasedData(response.data.data.results);
      setTotalCount(response.data.data.count);
      setLoading(false);
    };
    fetchAccountBasedData();
  }, [pageIndex]);

  // const data = [
  //   {
  //     avatar: '',
  //     name: 'Tesla',
  //     makers: 5,
  //     penetrate: 11,
  //   },
  //   {
  //     avatar: '',
  //     name: 'Tesla',
  //     makers: 56,
  //     penetrate: 41,
  //   },
  // ];

  // const piechartOptions = {
  //   responsive: true, // Ensure responsiveness is enabled
  //   maintainAspectRatio: false, // Allow the chart to resize in non-proportional ways to fit the container
  //   rotation: 270,
  //   circumference: 180,
  //   cutout: '78%',
  //   plugins: {
  //     legend: {
  //       display: false,
  //     },
  //   },
  // };
  return (
    <PageFrame>
      {/* <Flex direction={'column'} gap={'md'}>
      {/* <Flex direction={'column'} gap={'md'}>
        {data.map((item, index) => {
          const penetrateData = {
            labels: ['Label 1', 'Label 2'],
            datasets: [
              {
                data: [item.penetrate, 100 - item.penetrate], // Use item.percent for the first value
                backgroundColor: ['#2ea640', '#eaecf0'],
                borderWidth: 0,
                borderRadius: 1,
              },
            ],
          };

          return (
            <Card w='100%' withBorder radius={'md'} bg={'white'} key={index} p={0}>
              <Flex align={'center'} justify={'space-between'}>
                <Flex align={'center'} px={'sm'} gap={'sm'}>
                  <Avatar src={item.avatar} radius={'xl'} size={'md'} />
                  <Box>
                    <Text size={'md'} fw={700}>
                      {item.name}
                    </Text>
                    <Text size={'sm'} fw={600} sx={{ display: 'flex', gap: '3px' }}>
                      {item.makers}
                      <span style={{ color: '#868e96' }}>Decision Makers</span>
                    </Text>
                  </Box>
                </Flex>
                <div className='w-[140px] h-[100px] pr-4 relative'>
                  <Doughnut data={penetrateData} options={piechartOptions} />
                  <Flex
                    style={{
                      position: 'absolute',
                      top: '40px',
                      right: '8px',
                      width: '100%',
                      alignItems: 'center',
                    }}
                    direction={'column'}
                  >
                    <Text fw={600} size={'lg'}>
                      {item.penetrate}%
                    </Text>
                    <Text size={'xs'} color='gray' fw={500} mt={'-5px'}>
                      Penetrated
                    </Text>
                  </Flex>
                </div>
              </Flex>
            </Card>
          );
        })}
      </Flex> */}
      <DataGrid
        data={accountBasedData}
        highlightOnHover
        withPagination
        withSorting
        withColumnBorders
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
            accessorKey: "company",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLetterT color="gray" size={"0.9rem"} />
                <Text color="gray">Company</Text>
              </Flex>
            ),
            minSize: 400,
            cell: (cell) => {
              let { company_url, company } = cell.row.original;
              company_url = company_url
                ?.replace("http://", "")
                .replace("https://", "")
                .split("/")[0];

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
                    <Image
                      src={`https://logo.clearbit.com/${company_url}`}
                      width={30}
                      height={30}
                    />
                    <Box>
                      <Text fw={600} size={"xs"}>
                        {company}
                      </Text>
                      <Text fw={500} color="gray" size={"xs"}>
                        {company_url?.substring(0, 40)}
                        {company_url?.length > 40 ? "..." : ""}
                      </Text>
                    </Box>
                  </Flex>
                  <ActionIcon>
                    <IconAffiliate color="orange" size={"1.2rem"} />
                  </ActionIcon>
                </Flex>
              );
            },
          },
          {
            accessorKey: "engagment",
            minSize: 200,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconLoader color="gray" size={"0.9rem"} />
                <Text color="gray">Engagement</Text>
              </Flex>
            ),
            cell: (cell) => {
              let { sparkline_data, status }: any = cell.row.original;

              let new_sparkline_data = [];
              let random_entropy = [0.1, -0.1, 0.05, -0.05];
              for (let i = 0; i < sparkline_data.length; i++) {
                // if sparkline_data is > 1 length
                if (sparkline_data.length <= 1) {
                  new_sparkline_data.push(sparkline_data[i]);
                  new_sparkline_data.push(sparkline_data[i]);
                  new_sparkline_data.push(sparkline_data[i]);
                } else {
                  for (let j = 0; j < 5; j++) {
                    new_sparkline_data.push(
                      sparkline_data[i] +
                        random_entropy[Math.floor(Math.random() * 4)]
                    );
                  }
                }
              }
              sparkline_data = new_sparkline_data;

              return (
                <Flex
                  gap={"sm"}
                  w={"100%"}
                  h={"100%"}
                  px={"sm"}
                  align={"center"}
                >
                  <Sparklines
                    data={sparkline_data}
                    width={100}
                    height={30}
                    margin={3}
                  >
                    <SparklinesCurve
                      color={
                        status.toLowerCase() === "high"
                          ? "green"
                          : status.toLowerCase() === "mid"
                          ? "orange"
                          : "red"
                      }
                    />
                  </Sparklines>
                  <Flex>
                    <Badge
                      color={
                        status.toLowerCase() === "high"
                          ? "green"
                          : status.toLowerCase() === "mid"
                          ? "orange"
                          : "red"
                      }
                      size="sm"
                    >
                      {status}
                    </Badge>
                  </Flex>
                </Flex>
              );
            },
          },
          {
            accessorKey: "last_activity",
            minSize: 210,
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconCalendar color="gray" size={"0.9rem"} />
                <Text color="gray">Last Activity</Text>
              </Flex>
            ),
            cell: (cell) => {
              const { latest_reply } = cell.row.original;

              return (
                <Flex w={"100%"} px={"sm"} h={"100%"} align={"center"}>
                  <Text fw={500} color="gray" size={"xs"}>
                    {moment(latest_reply).format("MMM DD, YYYY hh:mm A")}
                  </Text>
                </Flex>
              );
            },
          },
          {
            accessorKey: "sent",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconSend color="#228be6" size={"0.9rem"} />
                <Text color="gray">Sent</Text>
              </Flex>
            ),
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { num_sent } = cell.row.original;

              return (
                <Flex
                  align={"center"}
                  justify={"center"}
                  gap={4}
                  py={"lg"}
                  w={"100%"}
                  h={"100%"}
                  bg={"#f9fbfe"}
                >
                  <Text color="#228be6" fw={600}>
                    {num_sent}
                  </Text>
                  <Badge
                    variant="light"
                    color={theme.colors.blue[1]}
                    styles={{
                      root: {
                        fontWeight: 600,
                      },
                    }}
                  >
                    {num_sent}%
                  </Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: "open",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconChecks color="#db66f3" size={"0.9rem"} />
                <Text color="gray">Open</Text>
              </Flex>
            ),
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { num_accepted } = cell.row.original;

              return (
                <Flex
                  align={"center"}
                  justify={"center"}
                  gap={4}
                  w={"100%"}
                  py={"lg"}
                  h={"100%"}
                  bg={"#fdf9fe"}
                >
                  <Text color={"#db66f3"} fw={600}>
                    {num_accepted}
                  </Text>
                  <Badge
                    variant="light"
                    bg="rgba(219,102,243, 0.1)"
                    style={{ color: "#db66f3" }}
                    styles={{
                      root: {
                        fontWeight: 600,
                      },
                    }}
                  >
                    {num_accepted}%
                  </Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: "reply",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconMessageCheck color="#f0ab78" size={"0.9rem"} />
                <Text color="gray">Reply</Text>
              </Flex>
            ),
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { num_replied } = cell.row.original;

              return (
                <Flex
                  align={"center"}
                  justify={"center"}
                  gap={4}
                  py={"lg"}
                  w={"100%"}
                  h={"100%"}
                  bg={"#fffbf8"}
                >
                  <Text color={"#f0ab78"} fw={600}>
                    {num_replied}
                  </Text>
                  <Badge
                    variant="light"
                    bg="rgba(240, 171, 120, 0.1)"
                    style={{ color: "#f0ab78" }}
                    styles={{
                      root: {
                        fontWeight: 600,
                      },
                    }}
                  >
                    {num_replied}%
                  </Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: "demo",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconCalendar color="#73d0a5" size={"0.9rem"} />
                <Text color="gray">Demo</Text>
              </Flex>
            ),
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { num_positive_reply } = cell.row.original;

              return (
                <Flex
                  align={"center"}
                  justify={"center"}
                  gap={4}
                  py={"lg"}
                  w={"100%"}
                  h={"100%"}
                  bg={"#f8fbf9"}
                >
                  <Text color={"#73d0a5"} fw={600}>
                    {num_positive_reply}
                  </Text>
                  <Badge
                    variant="light"
                    bg="rbga(115, 208, 165, 0.1)"
                    style={{ color: "#73d0a5" }}
                    styles={{
                      root: {
                        fontWeight: 600,
                      },
                    }}
                  >
                    {num_positive_reply}%
                  </Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: "demo",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconCalendar color="#73d0a5" size={"0.9rem"} />
                <Text color="gray">Demo</Text>
              </Flex>
            ),
            maxSize: 110,
            enableResizing: true,
            cell: (cell) => {
              const { num_demo } = cell.row.original;

              return (
                <Flex
                  align={"center"}
                  justify={"center"}
                  gap={4}
                  py={"lg"}
                  w={"100%"}
                  h={"100%"}
                  bg={"#f8fbf9"}
                >
                  <Text color={"#73d0a5"} fw={600}>
                    {num_demo}
                  </Text>
                  <Badge
                    variant="light"
                    bg="rbga(115, 208, 165, 0.1)"
                    style={{ color: "#73d0a5" }}
                    styles={{
                      root: {
                        fontWeight: 600,
                      },
                    }}
                  >
                    {num_demo}%
                  </Badge>
                </Flex>
              );
            },
          },
          {
            accessorKey: "action",
            header: () => (
              <Flex align={"center"} gap={"3px"}>
                <IconToggleRight color="gray" size={"0.9rem"} />
                <Text color="gray">Action</Text>
              </Flex>
            ),
            maxSize: 130,
            enableResizing: true,
            cell: (cell) => {
              return (
                <Flex
                  align={"center"}
                  justify={"center"}
                  gap={"xs"}
                  py={"lg"}
                  w={"100%"}
                  h={"100%"}
                >
                  <Badge
                    tt={"initial"}
                    variant="filled"
                    rightSection={
                      <IconExternalLink
                        size={"0.9rem"}
                        style={{ marginTop: "5px" }}
                      />
                    }
                    styles={{
                      root: {
                        fontWeight: 400,
                      },
                    }}
                  >
                    View Details
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
              <Select
                style={{ width: "150px" }}
                data={[
                  { label: "Show 25 rows", value: "25" },
                  // { label: "Show 10 rows", value: "10" },
                  // { label: "Show 5 rows", value: "5" },
                ]}
                value={acPageSize}
                onChange={(v) => {
                  setAcPageSize(v ?? "25");
                }}
              />
              <Flex align={"center"} gap={"sm"}>
                <Flex align={"center"}>
                  <Select
                    maw={100}
                    // value={`${table.getState().pagination.pageIndex + 1}`}
                    value={`${pageIndex}`}
                    // data={new Array(table.getPageCount())
                    //   .fill(0)
                    //   .map((i, idx) => ({
                    //     label: String(idx + 1),
                    //     value: String(idx + 1),
                    //   }))}
                    data={new Array(Math.ceil(totalCount / Number(acPageSize)))
                      .fill(0)
                      .map((i, idx) => ({
                        label: String(idx),
                        value: String(idx),
                      }))}
                    onChange={(v) => {
                      // table.setPageIndex(Number(v) - 1);
                      setPageIndex(Number(v));
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
                      of {Math.ceil(totalCount / Number(acPageSize))} pages
                    </Text>
                  </Flex>
                  <ActionIcon
                    variant="default"
                    color="gray.4"
                    h={36}
                    disabled={Math.ceil(totalCount / Number(acPageSize)) === 0}
                    onClick={() => {
                      // table.setPageIndex(
                      //   table.getState().pagination.pageIndex - 1
                      // );
                      setPageIndex((prev) => prev - 1);
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
                      // table.setPageIndex(
                      //   table.getState().pagination.pageIndex + 1
                      // );
                      setPageIndex((prev) => prev + 1);
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
        pageSizes={[acPageSize]}
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
    </PageFrame>
  );
}
