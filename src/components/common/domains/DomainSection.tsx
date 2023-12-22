import { userTokenState } from '@atoms/userAtoms';
import {
  Box,
  Group,
  LoadingOverlay,
  Paper,
  Stack,
  TextInput,
  Text,
  Button,
  Badge,
  ScrollArea,
  Divider,
  Modal,
  Title,
  ActionIcon,
} from '@mantine/core';
import { useDebouncedState, useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconRefreshDot, IconSearch } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import { generatePassword } from '@utils/general';
import {
  domainPurchaseWorkflow,
  findDomain,
  findSimilarDomains,
} from '@utils/requests/domainHandling';
import { set } from 'lodash';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

type Domain = {
  data: [boolean, { domain_name: string; price: number }];
};
type SimilarDomain = {
  domain_name: string;
  price: number;
};

export default function DomainSection(props: {}) {
  const userToken = useRecoilValue(userTokenState);
  const [search, setSearch] = useDebouncedState('', 500);

  const [opened, { open, close }] = useDisclosure(false);
  const [domain, setDomain] = useState<{ domain_name: string; price: number } | null>(null);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { data, isFetching, refetch } = useQuery({
    queryKey: [`query-find-domains`, { searchQuery: search }],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, { searchQuery }] = queryKey;

      const similarDomains = await findSimilarDomains(userToken, searchQuery);
      const domain = await findDomain(userToken, searchQuery);

      return {
        similar:
          similarDomains.status === 'success' ? (similarDomains.data as SimilarDomain[]) : [],
        domain: domain.status === 'success' ? ({ data: domain.data } as Domain) : null,
      };
    },
    refetchOnWindowFocus: false,
  });

  const handleRandomPassword = () => {
    setPassword(generatePassword());
  };

  const handlePurchaseOpen = (domain: { domain_name: string; price: number }) => {
    setDomain(domain);
    open();
  };

  const handlePurchase = async () => {
    handleCancel();

    const response = await domainPurchaseWorkflow(
      userToken,
      domain!.domain_name,
      username,
      password
    );

    if (response.status !== 'success') {
      showNotification({
        title: 'Error',
        message: response.message,
        color: 'red',
        autoClose: 5000,
      });
      return;
    }

    showNotification({
      title: 'Purchased domain!',
      message: 'Your email account should be in Smartlead within the next 45 minutes.',
      color: 'green',
      autoClose: 5000,
    });
  };
  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setDomain(null);
    close();
  };

  return (
    <Stack>
      <TextInput
        icon={<IconSearch size='0.8rem' />}
        placeholder='Search domains'
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />

      <Box style={{ position: 'relative' }}>
        <LoadingOverlay visible={isFetching} />

        {search ? (
          <>
            {' '}
            {data?.domain && (
              <>
                <Paper px='md' py='xs'>
                  <Group position='apart' noWrap>
                    <Text>{data?.domain?.data[1].domain_name ?? search}</Text>
                    <Group noWrap>
                      <Text>${data?.domain?.data[1].price ?? '-'}</Text>
                      {data?.domain?.data[0] ? (
                        <Button
                          radius='lg'
                          onClick={() => handlePurchaseOpen(data.domain!.data[1])}
                        >
                          Purchase
                        </Button>
                      ) : (
                        <Badge size='lg'>Unavailable</Badge>
                      )}
                    </Group>
                  </Group>
                </Paper>
                <Divider
                  my='xs'
                  variant='dashed'
                  labelPosition='center'
                  label={
                    <>
                      <Box>Other domains</Box>
                    </>
                  }
                />
              </>
            )}
            <ScrollArea h={500}>
              <Stack>
                {data?.similar.map((domain) => (
                  <Paper px='md' py='xs'>
                    <Group position='apart' noWrap>
                      <Text>{domain.domain_name}</Text>
                      <Group noWrap>
                        <Text>${domain.price}</Text>
                        <Button radius='lg' onClick={() => handlePurchaseOpen(domain)}>
                          Purchase
                        </Button>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>
          </>
        ) : (
          <>
            <Text ta='center' fs='italic'>
              Search for a domain to continue!
            </Text>
          </>
        )}
      </Box>
      <Modal
        opened={opened}
        onClose={close}
        title={<Title order={3}>Purchase Domain</Title>}
        centered
      >
        <Stack>
          <Text>
            Buy:{' '}
            <Text fs='italic' span>
              {domain?.domain_name}
            </Text>{' '}
            for{' '}
            <Text fw={500} span>
              ${domain?.price}
            </Text>
          </Text>
          <TextInput
            label='Email Username'
            placeholder='Email Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextInput
            label='Email Password'
            placeholder='Email Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightSection={
              <ActionIcon radius='xl' onClick={() => handleRandomPassword()}>
                <IconRefreshDot size='1rem' />
              </ActionIcon>
            }
          />

          <Group position='right'>
            <Button radius='lg' variant='light' color='gray' onClick={handleCancel}>
              Cancel
            </Button>
            <Button radius='lg' variant='light' onClick={handlePurchase}>
              Purchase
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
