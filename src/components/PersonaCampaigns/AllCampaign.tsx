import { userTokenState } from "@atoms/userAtoms";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Input,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@utils/requests/getAnalytics";
import { useRecoilValue } from "recoil";
import { useEffect, useMemo, useState } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_SortingState,
} from "mantine-react-table";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { sortBy } from "lodash";

export interface Analytics {
  account: string;
  campaign: string;
  contacted: string;
  demoSet: number;
  open: string;
  reply: string;
  sourced: number;
  status: Status;
}

export type Status = "Complete" | "Setup" | "Active";
const AllCampaign = () => {
  const userToken = useRecoilValue(userTokenState);
  const { data, isFetching, isError, isLoading } = useQuery<Analytics[]>({
    queryKey: [`query-get-all-analytics`],
    queryFn: async () => {
      const result = await getAnalytics(userToken);
      return result.status === "success" ? result.data : [];
    },
  });

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "campaign",
    direction: "asc",
  });
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status | "All">("All");
  const [records, setRecords] = useState<Analytics[]>(sortBy(data, "name"));

  useEffect(() => {
    let newData = (
      sortStatus?.columnAccessor
        ? sortBy(data, sortStatus?.columnAccessor)
        : data
    ) as Analytics[];

    if (status !== "All") {
      newData = newData.filter((d) => d.status === status);
    }
    if (input !== "") {
      newData = newData.filter(
        (d) =>
          d.campaign.toLowerCase().includes(input.toLowerCase()) ||
          d.account.toLowerCase().includes(input.toLowerCase())
      );
    }
    if (sortStatus) {
      setRecords(sortStatus.direction === "desc" ? newData.reverse() : newData);
    }
  }, [sortStatus, status, input]);

  return (
    <>
      <Divider />

      <Box>
        <Flex justify={"space-between"} align={"center"}>
          <Title color="gray.6" order={2}>
            AllCampaign
          </Title>

          <Flex gap={"sm"} wrap={"wrap"} align={"center"}>
            <Button
              variant={status === "All" ? "filled" : "light"}
              color="dark"
              onClick={() => setStatus("All")}
            >
              All
              <Badge
                color="dark"
                variant={status === "All" ? "light" : "filled"}
                ml={"xs"}
              >
                {data?.length}
              </Badge>
            </Button>
            <Button
              variant={status === "Active" ? "filled" : "light"}
              color="blue"
              onClick={() => setStatus("Active")}
            >
              Active
              <Badge
                color="blue"
                variant={status === "Active" ? "light" : "filled"}
                ml={"xs"}
              >
                {data?.filter((r) => r.status === "Active").length}
              </Badge>
            </Button>
            <Button
              variant={status === "Setup" ? "filled" : "light"}
              color="yellow"
              onClick={() => setStatus("Setup")}
            >
              Setup
              <Badge
                color="yellow"
                variant={status === "Active" ? "light" : "filled"}
                ml={"xs"}
              >
                {data?.filter((r) => r.status === "Setup").length}
              </Badge>
            </Button>
            <Button
              variant={status === "Complete" ? "filled" : "light"}
              color="green"
              onClick={() => setStatus("Complete")}
            >
              Completed
              <Badge
                color="green"
                variant={status === "Active" ? "light" : "filled"}
                ml={"xs"}
              >
                {data?.filter((r) => r.status === "Complete").length}
              </Badge>
            </Button>

            <Input onChange={(e) => setInput(e.target.value)} value={input} />
          </Flex>
        </Flex>

        <Box mt={"md"}>
          <DataTable
            sortStatus={sortStatus}
            onSortStatusChange={(s) => {
              setSortStatus(s);
            }}
            height={"min(870px, 100vh - 200px)"}
            verticalAlignment="top"
            loaderColor="teal"
            fetching={isFetching}
            styles={(theme) => ({
              root: {
                borderRadius: theme.radius.md,
                zIndex: 10,
              },
              header: {
                backgroundColor: theme.colors.blue[6],
                color: theme.white,
                "&& th:hover": {
                  backgroundColor: `${theme.colors.blue[6]} !important`,
                },

                ":hover": { backgroundColor: theme.colors.blue[6] },
              },
            })}
            noRecordsText={"No analytic found"}
            columns={[
              {
                sortable: true,
                accessor: "campaign",
                title: "Campaign",

                titleSx(theme) {
                  return {
                    background: theme.colors.blue[6],
                    color: `${theme.white} !important`,
                    "&, &:hover": {
                      backgroundColor: `${theme.colors.blue[6]} !important`,
                    },
                  };
                },
              },
              // {
              //   accessor: "channel",
              //   title: "Channel",
              //   titleSx(theme) {
              //     return {
              //       background: theme.colors.blue[6],
              //       color: `${theme.white} !important`,
              //     };
              //   },
              // },
              {
                sortable: true,
                accessor: "account",
                title: "Account",
                titleSx(theme) {
                  return {
                    background: theme.colors.blue[6],
                    color: `${theme.white} !important`,
                    "&, &:hover": {
                      backgroundColor: `${theme.colors.blue[6]} !important`,
                    },
                  };
                },
              },
              {
                sortable: true,
                accessor: "sourced",
                title: "Sourced",
                titleSx(theme) {
                  return {
                    background: theme.colors.blue[6],
                    color: `${theme.white} !important`,
                    "&, &:hover": {
                      backgroundColor: `${theme.colors.blue[6]} !important`,
                    },
                  };
                },
              },
              {
                sortable: true,
                accessor: "contacted",
                title: "Contacted",
                titleSx(theme) {
                  return {
                    background: theme.colors.blue[6],
                    color: `${theme.white} !important`,
                    "&, &:hover": {
                      backgroundColor: `${theme.colors.blue[6]} !important`,
                    },
                  };
                },
              },
              {
                sortable: true,
                accessor: "open",
                title: "Open",
                titleSx(theme) {
                  return {
                    background: theme.colors.blue[6],
                    color: `${theme.white} !important`,
                    "&, &:hover": {
                      backgroundColor: `${theme.colors.blue[6]} !important`,
                    },
                  };
                },
              },
              {
                sortable: true,
                accessor: "reply",
                title: "Reply",
                titleSx(theme) {
                  return {
                    background: theme.colors.blue[6],
                    color: `${theme.white} !important`,
                    "&, &:hover": {
                      backgroundColor: `${theme.colors.blue[6]} !important`,
                    },
                  };
                },
              },
              // {
              //   accessor: "demoSet",
              //   title: "Demo",
              //   titleSx(theme) {
              //     return {
              //       background: theme.colors.blue[6],
              //       color: `${theme.white} !important`,
              //     };
              //   },
              // },
              // {
              //   accessor: "bounce",
              //   title: "Bounce",
              //   titleSx(theme) {
              //     return {
              //       background: theme.colors.blue[6],
              //       color: `${theme.white} !important`,
              //     };
              //   },
              // },
              {
                sortable: true,
                accessor: "status",
                title: "Status",
                titleSx(theme) {
                  return {
                    background: theme.colors.blue[6],
                    color: `${theme.white} !important`,
                    "&, &:hover": {
                      backgroundColor: `${theme.colors.blue[6]} !important`,
                    },
                  };
                },
                render: ({ status }) => {
                  let color = "blue";

                  if (status === "Active") {
                    color = "blue";
                  }
                  if (status === "Setup") {
                    color = "yellow";
                  }
                  if (status === "Complete") {
                    color = "green";
                  }
                  return <Badge color={color}>{status}</Badge>;
                },
              },

              // {
              //   accessor: "contactSample",
              //   title: "Contact Sample",
              //   titleSx(theme) {
              //     return {
              //       background: theme.colors.blue[6],
              //       color: `${theme.white} !important`,
              //     };
              //   },
              // },
            ]}
            records={records ?? []}
          />
        </Box>
      </Box>
    </>
  );
};

export default AllCampaign;
