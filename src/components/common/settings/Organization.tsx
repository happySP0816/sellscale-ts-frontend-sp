import { userTokenState } from '@atoms/userAtoms';
import { API_URL } from '@constants/data';
import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Select,
  Stack,
  Title,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconAdjustments, IconDots } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { proxyURL, valueToColor, nameToInitials } from '@utils/general';
import { getClientSDRs } from '@utils/requests/client';
// import { MRT_ColumnDef, MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { ClientSDR } from 'src';

export default function Organization(props: {}) {
  const userToken = useRecoilValue(userTokenState);
  const theme = useMantineTheme();

  const { data, refetch } = useQuery({
    queryKey: [`query-get-org-sdrs`],
    queryFn: async () => {
      const result = await getClientSDRs(userToken);
      return result.status === 'success' ? (result.data as ClientSDR[]) : [];
    },
  });

  const saveSDR = async (
    sdrId: number,
    active: boolean | null,
    role: 'ADMIN' | 'MEMBER' | null
  ) => {
    // These all should be put into specific request functions
    if (active !== null) {
      if (active) {
        await fetch(`${API_URL}/client/sdr/activate_seat`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sdr_id: sdrId,
          }),
        });
      } else {
        await fetch(`${API_URL}/client/sdr/deactivate_seat`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sdr_id: sdrId,
          }),
        });
      }
    }

    if (role !== null) {
      await fetch(`${API_URL}/client/sdr`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdr_id: sdrId,
          role,
        }),
      });
    }

    refetch();

    showNotification({
      title: 'SDR Updated',
      message: 'SDR has been updated successfully',
    });
  };

  const columns = useMemo<MRT_ColumnDef<ClientSDR>[]>(
    () => [
      {
        accessorKey: 'sdr_name',
        header: 'Name',
        Cell: ({ renderedCellValue, row }) => (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Avatar
              src={proxyURL(row.original.img_url)}
              alt={`${row.original.sdr_name}'s Profile Picture`}
              color={valueToColor(theme, row.original.sdr_name)}
              radius='xl'
              size='sm'
            >
              {nameToInitials(row.original.sdr_name)}
            </Avatar>
            <Stack spacing={0}>
              <span>{renderedCellValue}</span>
              <Text c='dimmed'>{row.original.sdr_email}</Text>
            </Stack>
          </Box>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ renderedCellValue, row }) => (
          <Box>
            <Select
              placeholder='Role'
              data={[
                { value: 'ADMIN', label: 'Admin' },
                { value: 'MEMBER', label: 'Member' },
              ]}
              value={row.original.role ?? 'MEMBER'}
              onChange={(value) => {
                saveSDR(row.original.id, null, value as 'ADMIN' | 'MEMBER' | null);
              }}
            />
          </Box>
        ),
      },
      {
        accessorKey: 'active',
        header: 'Active',
        Cell: ({ renderedCellValue, row }) => (
          <Badge color={row.original.active ? 'teal' : 'yellow'}>
            {row.original.active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        accessorKey: 'client_name',
        header: '',
        enableSorting: false,
        enableColumnActions: false,
        Cell: ({ renderedCellValue, row }) => (
          <Menu shadow='md' width={200}>
            <Menu.Target>
              <ActionIcon variant='subtle' color='gray' radius='xl' aria-label='Options'>
                <IconDots style={{ width: '70%', height: '70%' }} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() => {
                  saveSDR(row.original.id, row.original.active ? false : true, null);
                }}
              >
                {row.original.active ? 'Deactivate SDR' : 'Activate SDR'}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ),
      },
    ],
    []
  );

  // const table = useMantineReactTable({
  //   columns,
  //   data: data ?? [],
  // });

  return (
    <Box>
      <Stack>
        <Group noWrap position='apart'>
          <Title order={3}>Your Organization</Title>
          <Button>Add Seat</Button>
        </Group>
        {/* <MantineReactTable table={table} /> */}
      </Stack>
    </Box>
  );
}
