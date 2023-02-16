


import {
  Badge,
  Box,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";

import { CTA } from "src/main";
import { chunk } from "lodash";

const PAGE_SIZE = 10;

export default function CampaignCTAs({
  ctas,
}: {
  ctas: CTA[];
}) {

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "active",
    direction: "asc",
  });
  const totalRecords = useRef(0);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  // Split prospects into pages => data
  const getData = (page: number) => {
    totalRecords.current = ctas.length;
    return chunk(ctas, PAGE_SIZE)[page - 1];
  };

  return (
    <Box>
      <DataTable
        withBorder
        height={"min(670px, 100vh - 300px)"}
        verticalAlignment="top"
        loaderColor="teal"
        highlightOnHover
        noRecordsText={"No CTAs found"}
        onRowClick={(prospect, row_index) => {
          // TODO: Made make clicking on the row do something
        }}
        columns={[
          {
            accessor: "text_value",
            sortable: true,
          },
          {
            accessor: "active",
            sortable: true,
            render: ({ active }) => (
              <Badge color={active ? 'green' : 'red'}>{active+''}</Badge>
            ),
          },
        ]}
        records={getData(page)}
        totalRecords={totalRecords.current}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
        paginationColor="teal"
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
      />
    </Box>
  );
}
