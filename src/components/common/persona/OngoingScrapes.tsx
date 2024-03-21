import { userTokenState } from '@atoms/userAtoms';
import { Group, Progress, Stack, Title, Text, Box, Container } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getApolloScrapes } from '@utils/requests/apolloScrapes';
import { DataTable } from 'mantine-datatable';
import { useRecoilValue } from 'recoil';
import { ApolloScrape } from 'src';

export default function OngoingScrapes() {
  const userToken = useRecoilValue(userTokenState);

  const { data: scrapes } = useQuery({
    queryKey: [`query-get-apollo-scrapes`],
    queryFn: async () => {
      const response = await getApolloScrapes(userToken);
      return response.status === 'success' ? (response.data as ApolloScrape[]) : [];
    },
  });

  console.log(scrapes);

  return (
    <Container>
      <Stack>
        <Title order={3}>Ongoing Scrapes</Title>
        <DataTable
          withBorder
          verticalAlignment='top'
          loaderColor='teal'
          highlightOnHover
          noRecordsText={'No scrapes found'}
          columns={[
            {
              accessor: 'name',
              sortable: true,
            },
            {
              accessor: 'page_num',
              title: 'Progress',
              sortable: true,
              width: 200,
              render: ({ page_num, max_pages }) => (
                <Stack spacing={10}>
                  <Text>
                    Page {page_num} / {max_pages} ({Math.round((page_num / (max_pages ?? 1)) * 100)}
                    %)
                  </Text>
                  <Progress value={Math.round((page_num / (max_pages ?? 1)) * 100)} />
                </Stack>
              ),
            },
            {
              accessor: 'segment_name',
              title: 'Segment',
              sortable: true,
            },
            {
              accessor: 'archetype_name',
              title: 'Campaign',
              sortable: true,
            },
            {
              accessor: 'active',
              sortable: true,
              render: ({ active }) => <Box>{active ? 'True' : 'False'}</Box>,
            },
          ]}
          records={scrapes ?? []}
        />
      </Stack>
    </Container>
  );
}
