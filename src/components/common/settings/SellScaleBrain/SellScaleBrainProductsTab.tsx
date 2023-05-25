import { userTokenState } from '@atoms/userAtoms';
import { Avatar, Table, Group, Title, Text, ActionIcon, Menu, ScrollArea, Stack, Anchor, Button } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconPencil, IconMessages, IconNote, IconReportAnalytics, IconTrash, IconDots } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getClientProducts, removeClientProduct } from '@utils/requests/clientProducts';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

export default function SellScaleBrainProductsTab() {
  const userToken = useRecoilValue(userTokenState);

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-company-products`],
    queryFn: async () => {
      const response = await getClientProducts(userToken);
      return response.status === 'success' ? response.data.sort((a: any, b: any) => a.name.localeCompare(b.name)) : [];
    },
  });
  console.log(data);

  const rows = data?.map((item: any, index: number) => (
    <tr key={index}>
      <td style={{ verticalAlign: 'top', width: 140 }}>
        <Group spacing='sm'>
          <div>
            <Text fz='md' fw={600}>
              {item.name}
            </Text>
            <Anchor c='dimmed' fz='xs' sx={{ wordBreak: 'break-all' }} href={item.product_url} target='_blank'>
              {item.product_url}
            </Anchor>
          </div>
        </Group>
      </td>
      <td>
        <Stack>
          {item.description && (
            <div>
              <Text fz='sm' fw={600}>
                Description
              </Text>
              <Text fz='sm'>{item.description}</Text>
            </div>
          )}
          {item.how_it_works && (
            <div>
              <Text fz='sm' fw={600}>
                How it Works
              </Text>
              <Text fz='sm'>{item.how_it_works}</Text>
            </div>
          )}
          {item.use_cases && (
            <div>
              <Text fz='sm' fw={600}>
                Use Cases
              </Text>
              <Text fz='sm'>{item.use_cases}</Text>
            </div>
          )}
        </Stack>
      </td>
      <td style={{ verticalAlign: 'top', width: 80 }}>
        <Group spacing={0} position='right'>
          <ActionIcon
            onClick={() => {
              openContextModal({
                modal: 'clientProduct',
                title: <Title order={3}>Client Product</Title>,
                innerProps: {
                  editProduct: item,
                  refetch: refetch,
                },
              });
            }}
          >
            <IconPencil size='1rem' stroke={1.5} />
          </ActionIcon>
          <Menu transitionProps={{ transition: 'pop' }} withArrow position='bottom-end' withinPortal>
            <Menu.Target>
              <ActionIcon>
                <IconDots size='1rem' stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconTrash size='1rem' stroke={1.5} />}
                color='red'
                onClick={async () => {
                  const response = await removeClientProduct(userToken, item.id);
                  if(response.status === 'success') {
                    showNotification({
                      title: 'Success',
                      message: 'Product deleted successfully.',
                      color: 'green',
                    });
                    refetch();
                  }
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </td>
    </tr>
  ));

  return (
    <>
      <Group position='right'>
        <Button
          size='xs'
          onClick={() => {
            openContextModal({
              modal: 'clientProduct',
              title: <Title order={3}>Client Product</Title>,
              innerProps: {
                editProduct: null,
                refetch: refetch,
              },
            });
          }}
        >
          Add Product
        </Button>
      </Group>
      <ScrollArea>
        <Table sx={{ minWidth: 800 }} verticalSpacing='md'>
          {rows.length > 0 && (
            <tbody>{rows}</tbody>
          )}
          {rows.length === 0 && (
            <tbody>
              <tr>
                <td>
                  <Text fz='sm' c='dimmed' ta="center" fs="italic">
                    No products added yet.
                  </Text>
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </ScrollArea>
    </>
  );
}
