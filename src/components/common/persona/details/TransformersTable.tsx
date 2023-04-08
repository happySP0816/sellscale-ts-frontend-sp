import { currentPersonaIdState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import TransformersChart from "@common/charts/TransformersChart";
import { Box, Container, Switch, Text, useMantineTheme } from "@mantine/core";
import { valueToColor } from "@utils/general";
import getTransformers from "@utils/requests/getTransformers";
import _ from "lodash";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { Channel } from "src";

const PAGE_SIZE = 20;

export default function TransformersTable(props: { channel: Channel }) {
  const theme = useMantineTheme();
  const [currentPersonaId, setCurrentPersonaId] = useRecoilState(
    currentPersonaIdState
  );
  const userToken = useRecoilValue(userTokenState);

  // Pagination and sorting
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "percentage",
    direction: "desc",
  });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-transformers-data-${currentPersonaId}-${props.channel}`,
      { page, sortStatus, channel: props.channel },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus, channel }] = queryKey;

      const response = await getTransformers(userToken, currentPersonaId, channel === 'EMAIL');
      const result =
        response.status === "success" ? (response.extra as any[]) : [];

      totalRecords.current = result.length;
      let pageData = _.chunk(result, PAGE_SIZE)[page - 1]?.map((data, i) => {
        return {
          ...data,
          id: i,
          name: _.startCase(
            data.research_point_type.replaceAll("_", " ").toLowerCase()
          ),
          percentage: Math.round(data.percent_accepted * 100),
          active: true,
        };
      });
      if (!pageData) {
        return [];
      }

      pageData = _.sortBy(pageData, sortStatus.columnAccessor);
      return sortStatus.direction === "desc" ? pageData.reverse() : pageData;
    },
    refetchOnWindowFocus: false,
    enabled: currentPersonaId !== -1,
  });

  return (
    <DataTable
      height={240}
      verticalAlignment="top"
      loaderColor="teal"
      fetching={isFetching}
      noRecordsText={"No transformers found"}
      columns={[
        {
          accessor: "name",
          title: "Transformer",
          sortable: true,
          render: ({ name }) => (
            <Text>
              <span
                style={{
                  color: theme.colors[valueToColor(theme, name)][5] + "70",
                }}
              >
                ◉
              </span>{" "}
              {name}
            </Text>
          ),
        },
        {
          accessor: "percentage",
          title: "%Accepted",
          sortable: true,
          ellipsis: true,
          width: 100,
          render: ({ percentage }) => `${percentage}%`,
        },
        {
          accessor: "num_prospects",
          title: "Prospects",
          sortable: true,
          width: 120,
        },
        {
          accessor: "active",
          title: "Active",
          render: ({ active, id }) => (
            <Switch
              color="teal"
              checked={active}
              onClick={(e) => {
                if (data) {
                  throw new Error(
                    "Not transformer enable/disabling implemented yet"
                  );
                }
              }}
              styles={(theme) => ({
                track: {
                  cursor: "pointer",
                },
              })}
            />
          ),
        },
      ]}
      records={data ?? []}
      /*
        totalRecords={totalRecords.current}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
        paginationColor="teal"
        */
      sortStatus={sortStatus}
      onSortStatusChange={handleSortStatusChange}
    />
  );
}
