import cx from 'clsx';
import { useState } from 'react';
import {
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Avatar,
  Text,
  rem,
  Paper,
  Divider,
  Pagination,
  Button,
  Stack,
  Box,
  Center,
  Loader,
  Anchor,
  Collapse,
  HoverCard,
  Tooltip,
} from '@mantine/core';
import Logo from '@assets/images/assistant.svg';
import { showNotification } from '@mantine/notifications';
import { useRecoilState, useRecoilValue } from 'recoil';
import { filterDrawerOpenState } from '@atoms/icpFilterAtoms';
import { useQuery } from '@tanstack/react-query';
import getIndividuals from '@utils/requests/getIndividuals';
import { Individual } from 'src';
import { userTokenState } from '@atoms/userAtoms';
import { currentProjectState } from '@atoms/personaAtoms';
import { proxyURL } from '@utils/general';
import { convertIndividualsToProspects } from '@utils/requests/convertIndividualsToProspects';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowUpRight, IconTargetArrow } from '@tabler/icons';

const PAGE_SIZE = 100;

export default function ChatResults(props: { changeView: () => void }) {
  const [selection, setSelection] = useState<number[]>([]);
  const toggleRow = (id: number) =>
    setSelection((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  const toggleAll = () =>
    setSelection((current) => {
      if (!data) {
        return [];
      }
      return current.length === data.length ? [] : data.map((item) => item.id);
    });

  const [convertLoading, setConvertLoading] = useState(false);
  const [openedFilters, setOpenedFilters] = useRecoilState(filterDrawerOpenState);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);
  const [activePage, setPage] = useState(1);
  const [totalFound, setTotalFound] = useState(0);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-get-individuals`, { activePage }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { activePage }] = queryKey;

      const response = await getIndividuals(
        userToken,
        currentProject!.id,
        PAGE_SIZE,
        (activePage - 1) * PAGE_SIZE
      );
      if (response.status === 'success') {
        setTotalFound(response.data.total);
        return response.data.results.map((i: Individual) => {
          return {
            ...i,
            company_name: i?.company?.name ?? '',
          };
        }) as Individual[];
      }
      return [];
    },
    enabled: !!currentProject,
    refetchOnWindowFocus: false,
  });

  const rows =
    data?.map((item) => {
      const selected = selection.includes(item.id);
      return (
        <tr key={item.id}>
          <td>
            <Checkbox checked={selected} onChange={() => toggleRow(item.id)} />
          </td>
          <td>
            <Group spacing='sm'>
              {/* <Avatar size={26} src={proxyURL(item.img_url)} radius={26} /> */}
              <Text size='sm' fw={500}>
                {item.full_name}
              </Text>
            </Group>
          </td>
          <td>{item.title}</td>
          <td>
            <Tooltip label={item.company.description} openDelay={500} width={280} multiline withinPortal>
              <Text sx={{ cursor: 'pointer' }}>{item.company.name}</Text>
            </Tooltip>
          </td>
          <td>
            {item.linkedin_url && (
              <Anchor href={item.linkedin_url} target='_blank'>
                {item.li_public_id}
              </Anchor>
            )}
          </td>
        </tr>
      );
    }) ?? [];

  return (
    <Stack spacing={5} mah={500}>
      <Group position='apart' noWrap>
        <Group noWrap>
          <Avatar radius='xl' src={Logo} alt='SellScale Assistant' />
          <Text fz='sm'>
            {isFetching
              ? 'Fetching your contacts...'
              : `I found ${totalFound.toLocaleString()} contacts.`}{' '}
            <Text fw='600' span>
              Refine your search with the chat bar
            </Text>{' '}
            at the bottom of the page.
          </Text>
        </Group>
        <Button size='sm' radius='lg' variant='subtle' onClick={props.changeView}>
          ⬇️ Collapse
        </Button>
      </Group>
      <Paper shadow='xs' radius='lg'>
        <Group px='md' py='xs' position='apart' noWrap>
          <Box>
            <Text fz='lg' fw={600}>
              Search Results
            </Text>
          </Box>
          <Group noWrap>
            {selection.length > 0 && (
              <Button
                radius='lg'
                compact
                loading={convertLoading}
                onClick={async () => {
                  setConvertLoading(true);
                  const response = await convertIndividualsToProspects(
                    userToken,
                    currentProject!.id,
                    selection
                  );
                  if (response.status === 'success') {
                    showNotification({
                      title: (
                        <Group>
                          <Text fz='md'>Success</Text>
                          <Button
                            leftIcon={<IconArrowUpRight size='0.9rem' />}
                            variant='light'
                            color='green'
                            size='xs'
                            radius='xl'
                            compact
                            onClick={() => {
                              window.location.href = '/campaigns';
                            }}
                          >
                            Edit Campaign
                          </Button>
                        </Group>
                      ),
                      message: `Currently importing prospects. This may take a few minutes...`,
                      color: 'green',
                    });
                    setSelection([]);
                    refetch();
                  }
                  setConvertLoading(false);
                }}
              >
                Import {selection.length} Contacts
              </Button>
            )}
            {selection.length === 0 && <Text fz='sm'>No contacts selected</Text>}
          </Group>
        </Group>
        <Divider />
        <ScrollArea h='50vh' p='md'>
          <Table miw={800} verticalSpacing='sm'>
            <thead>
              <tr>
                <th style={{ width: rem(40) }}>
                  <Checkbox
                    onChange={toggleAll}
                    checked={selection.length === data?.length}
                    indeterminate={selection.length > 0 && selection.length !== data?.length}
                  />
                </th>
                <th>Name</th>
                <th>Title</th>
                <th>Company</th>
                <th>LinkedIn</th>
              </tr>
            </thead>
            <tbody style={{ position: 'relative' }}>
              {
                <>
                  {isFetching ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 130,
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <Loader />
                    </Box>
                  ) : (
                    <>
                      {rows.length > 0 ? (
                        <>{rows}</>
                      ) : (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 130,
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <Text fz='sm' fs='italic' ta='center' c='dimmed'>
                            No contacts found, try adjusting your filters.
                          </Text>
                        </Box>
                      )}
                    </>
                  )}
                </>
              }
            </tbody>
          </Table>
        </ScrollArea>
        <Divider />
        <Group px='md' py='xs' position='apart' noWrap>
          <Pagination
            value={activePage}
            onChange={setPage}
            size='sm'
            radius='xl'
            total={Math.ceil(totalFound / PAGE_SIZE) || 1}
          />
          <Group spacing={10}>
            <Text fz='sm'>Seeing unexpected results? Try tuning your search with</Text>
            <Button
              variant='outline'
              radius='lg'
              size='sm'
              compact
              onClick={() => {
                setOpenedFilters(true);
              }}
            >
              Advanced Search
            </Button>
          </Group>
        </Group>
      </Paper>
    </Stack>
  );
}
