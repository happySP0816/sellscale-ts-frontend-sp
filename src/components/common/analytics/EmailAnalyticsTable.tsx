import {
  Box,
  Flex,
  Image,
  Text,
  Chip,
  Group,
  Badge,
  Avatar,
  useMantineTheme,
  Grid,
  Select,
  TextInput,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { forwardRef, useEffect, useRef, useState } from "react";
import { MultiSelect } from "@mantine/core";
import CampaignDetailsDrawer from "@drawers/CampaignDetailsDrawer";
import { IconCalendar, IconSearch, IconUsers } from "@tabler/icons";

import { useRecoilState, useRecoilValue } from "recoil";
import {
  campaignDrawerIdState,
  campaignDrawerOpenState,
} from "@atoms/campaignAtoms";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import { useQuery } from "react-query";
import { formatDate, temp_delay, valueToColor } from "@utils/general";
import { chunk } from "lodash";
import { faker } from "@faker-js/faker";
import { Campaign } from "src/main";
import { logout } from "@auth/core";
import { userTokenState } from "@atoms/userAtoms";
import { useDebouncedState, useMediaQuery } from "@mantine/hooks";
import { SCREEN_SIZES } from "@constants/data";
import _ from "lodash";

const PAGE_SIZE = 10;

type EmailAnalytics = {
  campaign_end_date: string,
  campaign_id: number,
  campaign_start_date: string,
  demo_percent: number,
  demos: string,
  num_demos: number,
  num_prospects: number,
  open_percent: number,
  replies: string,
  reply_percent: number,
  sequence_name: string,
}

export default function EmailAnalyticsTable() {
  const theme = useMantineTheme();
  const smScreenOrLess = useMediaQuery(`(max-width: ${SCREEN_SIZES.SM})`);

  const userToken = useRecoilValue(userTokenState);
  const totalRecords = useRef(0);

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "num_demos",
    direction: "desc",
  });

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: [
      `query-analytics-email-data`,
      { page, sortStatus },
    ],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus }] =
        queryKey;

      totalRecords.current = 0;

      const response = await fetch(
        `${process.env.REACT_APP_API_URI}/campaigns/email_analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.status === 401) {
        logout();
      }
      const res = await response.json();
      if (!res || !res.data) {
        return [];
      }

      totalRecords.current = res.data.length;

      let pageData = _.chunk(res.data as EmailAnalytics[], PAGE_SIZE)[page - 1]?.map((data, i) => {
        return {
          ...data,
          id: i,
        };
      });
      if (!pageData) {
        return [];
      }

      pageData = _.sortBy(pageData, sortStatus.columnAccessor);
      return sortStatus.direction === "desc" ? pageData.reverse() : pageData;
    },
    refetchOnWindowFocus: false,
  });

  return (
    <Box>
      <DataTable
        withBorder
        height={"min(670px, 100vh - 200px)"}
        verticalAlignment="top"
        loaderColor="teal"
        highlightOnHover
        noRecordsText={"No email analytics found"}
        fetching={isFetching}
        rowSx={{ height: 50 }}
        columns={[
          {
            accessor: "num_demos",
            title: "# Demos",
            sortable: true,
          },
          {
            accessor: "sequence_name",
            sortable: true,
          },
          {
            accessor: "campaign_id",
            sortable: true,
          },
          {
            accessor: "campaign_start_date",
            sortable: true,
            render: ({ campaign_start_date }) => {
              return (
                <Text>
                  {new Date(campaign_start_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              );
            },
          },
          {
            accessor: "campaign_end_date",
            sortable: true,
            render: ({ campaign_end_date }) => {
              return (
                <Text>
                  {new Date(campaign_end_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              );
            },
          },
          {
            accessor: "num_prospects",
            title: "# Prospects",
            sortable: true,
          },
          {
            accessor: "demos",
            sortable: true,
            width: 240,
          },
          {
            accessor: "replies",
            sortable: true,
            width: 240,
          },
          {
            accessor: "open_percent",
            title: "Open %",
            sortable: true,
          },
          {
            accessor: "reply_percent",
            title: "Reply %",
            sortable: true,
          },
          {
            accessor: "demo_percent",
            title: "Demo %",
            sortable: true,
          },
        ]}
        records={data}
        page={page}
        onPageChange={setPage}
        totalRecords={totalRecords.current}
        recordsPerPage={PAGE_SIZE}
        paginationColor="teal"
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
      />
      <CampaignDetailsDrawer />
    </Box>
  );
}
