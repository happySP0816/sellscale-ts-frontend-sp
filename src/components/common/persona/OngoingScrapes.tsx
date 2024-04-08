import { userTokenState } from '@atoms/userAtoms';
import {
  Group,
  Progress,
  Stack,
  Title,
  Text,
  Box,
  Container,
  Switch,
  Button,
  Anchor,
  TextInput,
  ActionIcon,
  Center,
  LoadingOverlay,
} from '@mantine/core';
import { IconAdjustments, IconReload } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import {
  getApolloScrapes,
  updateApolloScrape,
  upsertAndRunApolloScrape,
} from '@utils/requests/apolloScrapes';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ApolloScrape } from 'src';

export default function OngoingScrapes() {
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = useState(false);

  const { data: scrapes } = useQuery({
    queryKey: [`query-get-apollo-scrapes`],
    queryFn: async () => {
      const response = await getApolloScrapes(userToken);
      return response.status === 'success' ? (response.data as ApolloScrape[]) : [];
    },
  });

  const updateScrape = async (
    id: number,
    name?: string,
    active?: boolean,
    updateFilters?: boolean
  ) => {
    await updateApolloScrape(userToken, id, name, active, updateFilters);
  };

  console.log(scrapes);

  return (
    <Container>
      <LoadingOverlay visible={loading} />
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
              render: ({ id, name }) => (
                <>
                  <TextInput
                    placeholder='Name'
                    defaultValue={name}
                    onChange={async (e) => {
                      await updateScrape(id, e.currentTarget.value, undefined, undefined);
                    }}
                  />
                </>
              ),
            },
            {
              accessor: 'page_num',
              title: 'Progress',
              sortable: true,
              width: 200,
              render: ({ page_num, max_pages }) => (
                <Stack spacing={10}>
                  <Text>
                    Page {page_num.toLocaleString()} / {max_pages?.toLocaleString()} (
                    {Math.round((page_num / (max_pages ?? 1)) * 100)}
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
              render: ({ archetype_name, archetype_id }) => (
                <>
                  {archetype_name && (
                    <Group spacing={10}>
                      <Anchor
                        onClick={() => {
                          // Set to the campaign page
                          window.location.href = `/setup/linkedin/${archetype_id}`;
                        }}
                      >
                        {archetype_name}
                      </Anchor>
                    </Group>
                  )}
                </>
              ),
            },
            {
              accessor: 'active',
              sortable: true,
              render: ({ id, archetype_id, segment_id, name, active }) => (
                <Box>
                  <Switch
                    size='sm'
                    defaultChecked={active}
                    onChange={async (event) => {
                      if (event.currentTarget.checked) {
                        await upsertAndRunApolloScrape(userToken, name, archetype_id, segment_id);
                        await updateScrape(id, undefined, true, undefined);
                      } else {
                        await updateScrape(id, undefined, false, undefined);
                      }
                    }}
                    onLabel='ON'
                    offLabel='OFF'
                  />
                </Box>
              ),
            },
            {
              accessor: 'filters',
              title: 'Update Filters',
              render: ({ id }) => (
                <Center>
                  <ActionIcon
                    variant='subtle'
                    radius='lg'
                    size='md'
                    color='blue'
                    aria-label='Refetch Filters'
                    onClick={async () => {
                      setLoading(true);
                      await updateScrape(id, undefined, undefined, true);
                      setLoading(false);
                    }}
                  >
                    <IconReload style={{ width: '70%', height: '70%' }} stroke={2} />
                  </ActionIcon>
                </Center>
              ),
            },
          ]}
          records={scrapes ?? []}
        />
      </Stack>
    </Container>
  );
}
