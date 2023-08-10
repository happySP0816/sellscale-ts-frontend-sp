import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import TextWithNewline from "@common/library/TextWithNewlines";
import {
  Stack,
  Group,
  Button,
  Box,
  HoverCard,
  Badge,
  Flex,
  Tooltip,
  Title,
  Text,
  FileButton,
  rem,
  LoadingOverlay,
  useMantineTheme,
  Paper,
  Input,
  TextInput,
} from "@mantine/core";
import { MIME_TYPES } from "@mantine/dropzone";
import { useDebouncedState } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconFileImport, IconRefresh, IconSearch, IconTransferIn, IconUpload, IconUserPlus } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import { convertFileToJSON } from "@utils/fileProcessing";
import { valueToColor, formatToLabel } from "@utils/general";
import { addExistingContacts } from "@utils/requests/addExistingContacts";
import { addExistingContactsToPersona } from "@utils/requests/addExistingContactsToPersona";
import getExistingContacts from "@utils/requests/getExistingContacts";
import _ from "lodash";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

const PAGE_SIZE = 20;

export default function YourNetworkSection() {

  const [loading, setLoading] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const theme = useMantineTheme();

  const totalRecords = useRef(0);
  const [search, setSearch] = useDebouncedState("", 200);
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "full_name",
    direction: "desc",
  });
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);

  const handleSortStatusChange = (status: DataTableSortStatus) => {
    setPage(1);
    setSortStatus(status);
  };

  useEffect(() => {
    setPage(1);
  }, [search]);


  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-get-existing-contacts`, { page, sortStatus, search }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { page, sortStatus, search }]: any = queryKey;

      totalRecords.current = 0;

      const response = await getExistingContacts(userToken, PAGE_SIZE, (page-1)*20, search);
      if(response.status == 'success'){

        totalRecords.current = response.data.total_rows;

        let data = response.data.existing_contacts as any[];
        data = data.filter((d) => !d.used);
        
        const pageData = _.sortBy(data, sortStatus.columnAccessor);
        return sortStatus.direction === "desc" ? pageData.reverse() : pageData;

      } else {
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  console.log(data, totalRecords.current);

  return (
    <Stack sx={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <Group position="apart">
        <Text>
          Import your existing contacts into SellScale to send them outreach.
        </Text>
        <Group>
          <FileButton
            onChange={async (file) => {
              if (!file) {return;}
              setLoading(true);
              const result = await convertFileToJSON(file);
              if (result instanceof DOMException) {
                showNotification({
                  id: "file-upload-error",
                  title: `Error uploading file`,
                  message: result.message,
                  color: "red",
                  autoClose: 5000,
                });
              } else {
                const fileJSON = result.map((row: any, index: number) => {
                  return {
                    id: index,
                    ...row,
                  };
                });

                const response = await addExistingContacts(userToken, fileJSON, 'LINKEDIN');
                console.log(response);
                if(response.status == 'success'){
                  refetch();
                }
              }
              setLoading(false);
            }}
            accept={[
              MIME_TYPES.csv,
              MIME_TYPES.xls,
              MIME_TYPES.xlsx,
              "text/tsv",
              "text/tab-separated-values",
            ].join()}
          >
            {(props) => <Button leftIcon={<IconUpload size={rem(14)} />} {...props}>Upload CSV of Contacts</Button>}
          </FileButton>
          <Tooltip label="Coming Soon!" withArrow>
            <Box>
              <Button leftIcon={<IconTransferIn size={rem(14)} />} disabled>Import your LinkedIn Connections</Button>
            </Box>
          </Tooltip>
        </Group>
      </Group>

      <Paper
        radius="md"
        withBorder
        p="lg"
      >
        <Group position="apart">
          <TextInput
            placeholder="Search by Name, Company, or Title"
            sx={{ minWidth: '40%' }}
            onChange={(e) => setSearch(e.currentTarget.value)}
            icon={<IconSearch size={14} />}
            className="truncate"
          />
          <Box>
          <Button
            leftIcon={<IconUserPlus size={rem(14)} />}
            onClick={async () => {
              if(!currentProject){return;}
              setLoading(true);

              const response = await addExistingContactsToPersona(
                userToken,
                currentProject.id,
                selectedRecords.map((m) => m.id)
              );
              console.log(response);

              if(response.status === 'success'){
                setTimeout(() => {
                  refetch();
                  setLoading(false);
                }, 5000);
              }

            }}
            disabled={selectedRecords.length === 0}
          >Add {selectedRecords.length || ''} to Persona</Button>
          </Box>
        </Group>
      <DataTable
        mt="sm"
        withBorder
        shadow="sm"
        borderRadius="sm"
        highlightOnHover
        records={data || []}
        fetching={isFetching}
        columns={[
          {
            accessor: "full_name",
            title: "Name",
            sortable: true,
          },
          {
            accessor: "title",
            title: "Position",
            sortable: true,
            render: ({ title, company_name }) => {
              return (
                <Text>{title} @ {company_name}</Text>
              );
            },
          },
          {
            accessor: "connection_source",
            title: "From",
            sortable: true,
            render: ({ connection_source }) => {
              return (
                <Badge
                  color={valueToColor(theme, formatToLabel(connection_source))}
                >
                  {formatToLabel(connection_source)}
                </Badge>
              );
            },
          },
        ]}
        page={page}
        onPageChange={setPage}
        totalRecords={totalRecords.current}
        recordsPerPage={PAGE_SIZE}
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
        onRowClick={(contact, row_index) => {
          setSelectedRecords((prev) => {
            if (prev.includes(contact)) {
              return prev.filter((c) => c !== contact);
            } else {
              return [...prev, contact];
            }
          })
        }}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
        isRecordSelectable={(record) => selectedRecords.length < 100 || selectedRecords.includes(record)}
      />
      </Paper>
    </Stack>
  );
}
