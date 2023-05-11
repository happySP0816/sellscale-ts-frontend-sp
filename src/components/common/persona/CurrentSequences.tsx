import { sequenceDrawerOpenState } from "@atoms/sequenceAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import FlexSeparate from "@common/library/FlexSeparate";
import { API_URL } from "@constants/data";
import ViewSequenceDrawer from "@drawers/ViewSequenceDrawer";
import { Paper, Title, Text, Button, Select, SelectItem } from "@mantine/core";
import { IconUser } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import getPersonas from "@utils/requests/getPersonas";
import _ from "lodash";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Archetype, Sequence } from "src";

const PAGE_SIZE = 10;

export default function CurrentSequences() {
  const userToken = useRecoilValue(userTokenState);
  const totalRecords = useRef(0);
  const [data, setData] = useState<any[]>([]);
  const [personaId, setPersonaId] = useState<number>(-1);
  const [sequenceId, setSequenceId] = useState<number>(-1);
  const [opened, setOpened] = useRecoilState(sequenceDrawerOpenState);

  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "title",
    direction: "desc",
  });

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  const { data: personas, isFetching } = useQuery({
    queryKey: [`query-personas-data`],
    queryFn: async () => {
      const response = await getPersonas(userToken);
      const result =
        response.status === "success" ? (response.data as Archetype[]) : [];

      const mapped_result = result.map((res) => {
        return {
          value: res.id + "",
          label: res.archetype,
        };
      });
      return mapped_result satisfies SelectItem[];
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    (async () => {
      totalRecords.current = 0;

      const response = await fetch(
        `${API_URL}/email_generation/all_sequences?archetype_id=${personaId}`,
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
        return setData([]);
      }

      let pageData = _.chunk(res.data as Sequence[], PAGE_SIZE)[page - 1]?.map(
        (data, i) => {
          return {
            ...data,
            num_steps: data.data.length,
          };
        }
      );
      if (!pageData) {
        return setData([]);
      }

      // @ts-ignore
      pageData = _.sortBy(pageData, sortStatus.columnAccessor);
      setData(sortStatus.direction === "desc" ? pageData.reverse() : pageData);
    })();
  }, [personas, personaId, page, sortStatus]);

  return (
    <Paper withBorder p="md" mt={25} radius="md" w="100%">
      <FlexSeparate>
        <Title order={2}>Your Sequences</Title>
        <Select
          pr="sm"
          pb="xs"
          placeholder="Select a persona"
          color="teal"
          // @ts-ignore
          data={personas ?? []}
          icon={<IconUser size="1rem" />}
          value={personaId + ""}
          onChange={(value) => setPersonaId(value ? +value : -1)}
        />
      </FlexSeparate>
      <Text>Here are sequences that you've created on SellScale.</Text>

      <DataTable
        withBorder
        height={"min(670px, 100vh - 200px)"}
        verticalAlignment="top"
        loaderColor="teal"
        noRecordsText={"No sequences found"}
        fetching={isFetching}
        rowSx={{ height: 50 }}
        columns={[
          {
            accessor: "title",
            title: "Title",
            sortable: true,
          },
          {
            accessor: "num_steps",
            title: "# Steps",
            sortable: true,
          },
          {
            accessor: "data",
            title: "",
            width: 150,
            render(record, index) {
              return <Button size="xs" onClick={() => {
                setSequenceId(record.id);
                setOpened(true);
              }}>View Sequence</Button>;
            },
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
      <ViewSequenceDrawer sequence={data.find((s) => s.id === sequenceId)} />
    </Paper>
  );
}
