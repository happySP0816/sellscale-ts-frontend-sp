import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Image,
  NumberInput,
  Select,
  Text,
  TextInput,
  Title,
  useMantineTheme,
  LoadingOverlay,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { openContextModal } from "@mantine/modals";
import {
  IconArrowRight,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconFileDownload,
  IconInfoCircle,
  IconPlus,
  IconSearch,
  IconWorld,
} from "@tabler/icons";
import { IconUserSquareRounded } from "@tabler/icons-react";
import { DataGrid } from "mantine-data-grid";
import { useEffect, useState } from "react";
import { useChampionApi } from "./ChampionChangeApi";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import moment from "moment";
import { CSVLink } from 'react-csv';

interface ChampionDataType {
  prospect_name: string;
  change_date: string;
  origin_company_url: string;
  origin_company: string;
  new_company_url: string;
  new_company: string;
  type: string;
  avatar: string;
}

export default function ChampionChange() {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();
  const { isLoading, getChampionChanges, getChampionStats, postRefreshChampionJobData } = useChampionApi(userToken);
  const [loading, setLoading] = useState(isLoading);

  const [championData, setChampionData] = useState<ChampionDataType[]>([]);
  const [data, setData] = useState({
    num_changed_last_60_days: 0,
    num_companies: 0,
    num_contacts: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 300);
  const [showJobChanges, setShowJobChanges] = useState(false);
  const [showChampionsInWonAccounts, setShowChampionsInWonAccounts] = useState(false);

  useEffect(() => {
    refreshStats();
  }, [userToken]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchChampions(debouncedSearchTerm);
    } else {
      refreshStats();
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (showJobChanges) {
      filterJobChanges();
    } else {
      refreshStats();
    }
  }, [showJobChanges]);

  useEffect(() => {
    if (showChampionsInWonAccounts) {
      filterChampionsInWonAccounts();
    } else {
      refreshStats();
    }
  }, [showChampionsInWonAccounts]);

  const refreshStats = () => {
    getChampionStats().then((data: any) => {
      setData(data.data);
    });

    setLoading(true);
    getChampionChanges()
      .then((data: any) => {
        let updatedData = data.data.map((d: any) => ({
          prospect_name: d.full_name,
          change_date: d.new_company_start_date,
          origin_company_url: d.old_company_logo,
          origin_company: d.last_company_name,
          new_company_url: d.new_company_logo,
          linkedin_url: d.linkedin_url,
          new_company: d.new_company_name,
          type: d.change_detected ? "Job Changed" : "",
          avatar: d.linkedin_url,
        }));

        if (showJobChanges) {
          updatedData = updatedData.filter((d: any) => d.type === "Job Changed");
        }

        setChampionData(updatedData);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const searchChampions = (term: string) => {
    setLoading(true);
    getChampionChanges(term)
      .then((data: any) => {
        let updatedData = data.data.map((d: any) => ({
          prospect_name: d.full_name,
          change_date: d.new_company_start_date,
          origin_company_url: d.old_company_logo,
          origin_company: d.last_company_name,
          new_company_url: d.new_company_logo,
          new_company: d.new_company_name,
          type: d.change_detected ? "Job Changed" : "",
          avatar: d.linkedin_url,
        }));

        if (showJobChanges) {
          updatedData = updatedData.filter((d: any) => d.type === "Job Changed");
        }

        setChampionData(updatedData);
      })
      .finally(() => {
        setLoading(false);
        setShowChampionsInWonAccounts(false);
      });
  };

  const filterJobChanges = () => {
    setChampionData((prevData) => prevData.filter((d) => d.type === "Job Changed"));
  };

  const filterChampionsInWonAccounts = () => {
    setShowJobChanges(false);
    searchChampions('')
  };

  const handleJobRefreshData = () => {
    setLoading(true);
    postRefreshChampionJobData()
      .then(() => {
        refreshStats();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const downloadCSV = () => {
    const csvData = championData.map((d: any) => ({
      first_name: d.prospect_name.split(' ')[0],
      last_name: d.prospect_name.split(' ')[1],
      linkedin_url: d.linkedin_url,
      old_company: d.origin_company,
      new_company: d.new_company,
      date_of_change: moment(d.change_date).format("MMMM DD, YYYY"),
      job_changed: d.type === "Job Changed",
    }));

    const csvHeaders = [
      { label: "First Name", key: "first_name" },
      { label: "Last Name", key: "last_name" },
      { label: "Linkedin URL", key: "linkedin_url" },
      { label: "Old Company", key: "old_company" },
      { label: "New Company", key: "new_company" },
      { label: "Date of Change", key: "date_of_change" },
      { label: "Job Changed", key: "job_changed" },
    ];

    const csvReport = {
      data: csvData,
      headers: csvHeaders,
      filename: 'Champion_Changes_Report.csv'
    };

    return (
      <CSVLink {...csvReport}>
        <Button color="green" leftIcon={<IconFileDownload size={"0.9rem"} />}>
          Download CSV
        </Button>
      </CSVLink>
    );
  };

  return (
    <Flex direction={"column"} gap={"xl"}>
      <Flex align={"center"} justify={"space-between"}>
        <Title order={3} fw={600}>
          Champion Change Detector
        </Title>
        <Flex gap={"sm"} align={"center"}>
          <Button color="blue" onClick={handleJobRefreshData} loading={loading}>
            Refresh Job Data
          </Button>
          {downloadCSV()}
          <Button leftIcon={<IconWorld size={"0.9rem"} />}>Synced to Salesforce</Button>
          <Button
            leftIcon={<IconPlus size={"0.9rem"} />}
            onClick={() => {
              openContextModal({
                modal: "championChange",
                title: <Title order={3}>Add New Champion</Title>,
                innerProps: {},
              });
            }}
          >
            Champion Import
          </Button>
        </Flex>
      </Flex>
      <Flex gap={"xl"} justify={"space-between"}>
        <Card withBorder radius={"sm"} px={"xl"} py={"md"} w={"100%"}>
          <Box>
            <Flex gap={"xs"} align={"end"}>
              <Title order={2} fw={600}>
                {data.num_companies}
              </Title>
              <Text color="gray" fw={600} size={"sm"} mb={2}>
                Closed Won Accounts
              </Text>
            </Flex>
            <Flex gap={"xs"} align={"center"} mt={3}>
              <IconInfoCircle size={"0.9rem"} color="gray" />
              <Text fz={10} fw={500} color="gray">
                Number of unique companies where champions are employed
              </Text>
            </Flex>
          </Box>
        </Card>
        <Card
          withBorder
          radius={"sm"}
          px={"xl"}
          py={"md"}
          w={"100%"}
          sx={{
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
            backgroundColor: showChampionsInWonAccounts ? theme.colors.blue[0] : "white",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            },
          }}
          onClick={() => setShowChampionsInWonAccounts((prev) => !prev)}
        >
          <Box>
            <Flex gap={"xs"} align={"end"}>
              <Title order={2} fw={600}>
                {data.num_contacts}
              </Title>
              <Text color="gray" fw={600} size={"sm"} mb={2}>
                Champions in Won Accounts
              </Text>
            </Flex>
            <Flex gap={"xs"} align={"center"} mt={3}>
              <IconInfoCircle size={"0.9rem"} color="gray" />
              <Text fz={10} fw={500} color="gray">
                # of unique champions in the closed won accounts
              </Text>
            </Flex>
          </Box>
        </Card>
        <Card
          withBorder
          radius={"sm"}
          px={"xl"}
          py={"md"}
          w={"100%"}
          sx={{
            cursor: "pointer",
            transition: "transform 0.2s, box-shadow 0.2s",
            backgroundColor: showJobChanges ? theme.colors.blue[0] : "white",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            },
          }}
          onClick={() => {
            setShowJobChanges((prev) => !prev);
            setShowChampionsInWonAccounts(false);
          }}
        >
          <Box>
            <Flex gap={"xs"} align={"end"}>
              <Title order={2} fw={600}>
                {data.num_changed_last_60_days}
              </Title>
              <Text color="gray" fw={600} size={"sm"} mb={2}>
                # Job Changes (Last 60 Days)
              </Text>
            </Flex>
            <Flex gap={"xs"} align={"center"} mt={3}>
              <IconInfoCircle size={"0.9rem"} color="gray" />
              <Text fz={10} fw={500} color="gray">
                # of champions that have changed jobs in the last 60 days
              </Text>
            </Flex>
          </Box>
        </Card>
      </Flex>
      <Box sx={{ position: 'relative' }}>
      <TextInput
            maw={200}
            placeholder="Search"
            rightSection={<IconSearch size={"0.9rem"} />}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.currentTarget.value)}
            mb={'sm'}
          />
        <LoadingOverlay visible={loading} overlayBlur={2} />
        <DataGrid
          bg={"white"}
          data={championData}
          highlightOnHover
          withSorting
          withBorder
          withPagination
          withColumnBorders
          sx={{ cursor: "pointer" }}
          columns={[
            {
              accessorKey: "prospect_name",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconUserSquareRounded color="gray" size={"0.9rem"} />
                  <Text color="gray">Prospect Name</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { prospect_name, avatar, type } = cell.row.original;
                return (
                  <Flex gap={"xs"} w={"100%"} h={"100%"} align={"center"}>
                    <Avatar src={avatar} size={"sm"} radius={"xl"} />
                    <Text size={"sm"}>{prospect_name}</Text>
                    {type && (
                      <Badge color="teal" variant="filled">
                        ✨ {type} ✨
                      </Badge>
                    )}
                  </Flex>
                );
              },
            },
            {
              accessorKey: "change_date",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconCalendar color="gray" size={"0.9rem"} />
                  <Text color="gray">Date of Change</Text>
                </Flex>
              ),
              maxSize: 200,
              cell: (cell) => {
                const { change_date } = cell.row.original;
                return (
                  <Flex w={"100%"} h={"100%"} align={"center"}>
                    <Text color="gray" fw={400} size={"sm"}>
                      ~ {moment(change_date).format("MMMM DD, YYYY")}
                    </Text>
                  </Flex>
                );
              },
            },
            {
              accessorKey: "people",
              header: () => (
                <Flex align={"center"} gap={"3px"}>
                  <IconUserSquareRounded color="gray" size={"0.9rem"} />
                  <Text color="gray">People</Text>
                </Flex>
              ),
              cell: (cell) => {
                const { new_company, new_company_url, origin_company, origin_company_url } = cell.row.original;

                return (
                  <Flex align={"center"} gap={"md"} w={"100%"} h={"100%"}>
                    <Flex gap={"xs"} align={"center"}>
                      <Image src={origin_company_url} width={20} height={20} />
                      <Text fw={500} size={"sm"}>
                        {origin_company}
                      </Text>
                    </Flex>
                    <Flex>
                      <IconArrowRight size={"0.9rem"} />
                    </Flex>
                    <Flex gap={"xs"} align={"center"}>
                      <Image src={new_company_url} width={20} height={20} />
                      <Text fw={500} size={"sm"}>
                        {new_company}
                      </Text>
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
                      value={`${table.getState().pagination.pageIndex + 1}`}
                      data={new Array(table.getPageCount()).fill(0).map((i, idx) => ({
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
                        table.setPageIndex(table.getState().pagination.pageIndex - 1);
                      }}
                    >
                      <IconChevronLeft stroke={theme.colors.gray[4]} />
                    </ActionIcon>
                    <ActionIcon
                      variant="default"
                      color="gray.4"
                      h={36}
                      disabled={table.getState().pagination.pageIndex === table.getPageCount() - 1}
                      onClick={() => {
                        table.setPageIndex(table.getState().pagination.pageIndex + 1);
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
          styles={(theme) => ({
            thead: {
              height: "44px",
              "::after": {
                backgroundColor: "transparent",
              },
            },
            td: {
              paddingBlock: "20px !important",
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
      </Box>
    </Flex>
  );
}
