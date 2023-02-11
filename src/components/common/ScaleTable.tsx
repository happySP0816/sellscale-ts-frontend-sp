
export {}
/* TODO

import { Group, Container, Divider, useMantineTheme, Box, Stack, Text } from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useRef, useState } from "react";
import { useQuery } from "react-query";

type ScaleTableProps = {
  id: string;
  noneFoundText: string;
  queryFn: () => Promise<{ msg: string, httpCode: number }>,
  rowInnerContent: React.ReactNode;
};

export default function ScaleTable(props: ScaleTableProps) {

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'ticker', direction: 'asc' });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data, isFetching } = useQuery({
    queryKey: [`query-${props.id}`, { page, sortStatus }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus }] = queryKey;

      let result = await props.queryFn();
      if(result.httpCode >= 200 && result.httpCode < 300) {
        return result.msg;
      }
      
    },
    refetchOnWindowFocus: false,
  });

  const {
    breakpoints: { xs: xsBreakpoint, sm: smBreakpoint, md: mdBreakpoint },
  } = useMantineTheme();
  const aboveXsMediaQuery = `(min-width: ${xsBreakpoint}px)`;
  const aboveSmMediaQuery = `(min-width: ${smBreakpoint}px)`;
  const aboveMdMediaQuery = `(min-width: ${mdBreakpoint}px)`;

  return (
    <DataTable
      verticalAlignment="top"
      noRecordsText={props.noneFoundText}
      fetching={props.isFetching}
      columns={[
        {
          accessor: "ticker",
          title: "Symbol",
          //width: 100,
          ellipsis: true,
          sortable: true,
          render: ({ ticker }) => <Text fw={600}>{ticker}</Text>,
        },
        {
          accessor: "qty",
          title: "Shares",
          //width: 100,
          ellipsis: true,
          sortable: true,
        },
        {
          accessor: "totalValue",
          title: "Value",
          //width: 150,
          ellipsis: true,
          sortable: true,
          visibleMediaQuery: aboveMdMediaQuery,
          // TODO: Make it the currency type instead of the $
          render: ({ totalValue }) => `$ ${totalValue.toFixed(2)}`,
        },
        {
          accessor: "todayReturn",
          title: `Today's Return`,
          ellipsis: true,
          sortable: true,
          visibleMediaQuery: aboveMdMediaQuery,
          // TODO: Make it the currency type instead of the $
          render: ({ todayReturn }) => (
            <Text color={todayReturn.amt >= 0 ? "green" : "red"}>
              $ {todayReturn.amt.toFixed(2)} (
              {sign(+todayReturn.percent.toFixed(2))}%)
            </Text>
          ),
        },
        {
          accessor: "totalReturn",
          title: `Return`,
          ellipsis: true,
          sortable: true,
          visibleMediaQuery: aboveXsMediaQuery,
          // TODO: Make it the currency type instead of the $
          render: ({ totalReturn }) => (
            <Text color={totalReturn.amt >= 0 ? "green" : "red"}>
              $ {totalReturn.amt.toFixed(2)} (
              {sign(+totalReturn.percent.toFixed(2))}%)
            </Text>
          ),
        },
        {
          accessor: "price",
          title: "Price/Share",
          //width: 150,
          ellipsis: true,
          sortable: true,
          // TODO: Make it the currency type instead of the $
          render: ({ price }) => `$ ${price?.toFixed(2)}`,
        },
      ]}
      records={data}
      rowExpansion={{
        content: ({ record }) => (
          props.rowInnerContent
        ),
        collapseProps: {
          animateOpacity: false,
        },
      }}
      page={page}
      onPageChange={setPage}
      totalRecords={totalRecords.current}
      recordsPerPage={PORTFOLIO_PAGE_SIZE}
      paginationColor={"cyan"}
      sortStatus={sortStatus}
      onSortStatusChange={handleSortStatusChange}
      sx={(theme) => ({
        borderRadius: "8px",
        thead: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
        tr: {
          backgroundColor:
            (theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0]),
          margin: "20px 0",
        },
      })}
    />
  );
}

*/