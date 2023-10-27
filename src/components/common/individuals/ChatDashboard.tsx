import { filterRuleSetState } from '@atoms/icpFilterAtoms';
import PersonFilterDrawer from '@drawers/PersonFilterDrawer';
import {
  Avatar,
  Box,
  Button,
  Text,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  useMantineTheme,
  Badge,
  TextInput,
  ActionIcon,
  Container,
} from '@mantine/core';
import { useRecoilValue } from 'recoil';
import { proxyURL, valueToColor, nameToInitials, formatToLabel } from '@utils/general';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import { IconArrowUpRight, IconSend, IconThumbDown, IconThumbUp } from '@tabler/icons';
import { useState } from 'react';
import _ from 'lodash';
import ChatConvo, { ConvoMessage } from './ChatConvo';
import ChatResults from './ChatResults';
import { getHotkeyHandler } from '@mantine/hooks';
import { generateNewICPFilters } from '@utils/requests/icpScoring';
import { currentProjectState } from '@atoms/personaAtoms';
import { useQuery } from '@tanstack/react-query';
import getIndividuals from '@utils/requests/getIndividuals';
import { Individual } from 'src';

export default function ChatDashboard() {
  const globalRuleSetData = useRecoilValue(filterRuleSetState);
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const [totalFound, setTotalFound] = useState(0);
  const [showResults, setShowResults] = useState(true);
  const [convoMessages, setConvoMessages] = useState<ConvoMessage[]>([{ isLoading: true }]);

  const { isFetching, refetch } = useQuery({
    queryKey: [`query-get-individuals`, {}],
    queryFn: async ({ queryKey }) => {
      // @ts-ignore
      // eslint-disable-next-line
      const [_key, {}] = queryKey;

      const response = await getIndividuals(
        userToken,
        currentProject!.id,
        20,
        0,
      );
      if (response.status === 'success') {
        if(convoMessages.length === 1){
          setConvoMessages([{ foundContacts: response.data.total }]);
        }
        setTotalFound(response.data.total);
        return response.data.results as Individual[];
      }
      return [];
    },
    enabled: !!currentProject,
    refetchOnWindowFocus: false,
  });

  return (
    <Container h='100%'>
      <Stack justify='space-between' h='100%'>
        {showResults ? (
          <ChatResults changeView={() => setShowResults(false)} />
        ) : (
          <ChatConvo convoMessages={convoMessages} changeView={() => setShowResults(true)} />
        )}
        <SearchBox
          onSend={(message) => {
            setConvoMessages([
              ...convoMessages,
              { message: message, isYou: true },
              { isLoading: true },
            ]);
            setShowResults(false);
          }}
          onComplete={(message, filters) => {
            setConvoMessages([
              { foundContacts: totalFound },
              { message: message, isYou: true },
              { requirements: filters },
            ]);
          }}
        />
      </Stack>
      <PersonFilterDrawer />
    </Container>
  );
}

function SearchBox(props: {
  onSend: (message: string) => void;
  onComplete: (message: string, filters: any) => void;
}) {
  const theme = useMantineTheme();
  const [value, setValue] = useState('');

  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  const sendMessage = async () => {
    if (!currentProject) {
      return;
    }
    const inputValue = value.trim();
    setValue('');
    props.onSend(inputValue);

    const response = await generateNewICPFilters(userToken, currentProject?.id, inputValue);
    const newFilters = response.status === 'success' ? response.data : null;

    props.onComplete(inputValue, newFilters);
  };

  return (
    <Box
      p={8}
      sx={{
        border: `1px solid ${theme.colors.blue[3]}`,
        borderRadius: theme.radius.md,
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
      }}
    >
      <TextInput
        placeholder='Type a search command or a question: "Show me people in the bay area", "Head of sales at tech companies", etc'
        variant='unstyled'
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        rightSection={
          <ActionIcon color='blue' onClick={sendMessage}>
            <IconSend size='1.125rem' />
          </ActionIcon>
        }
        onKeyDown={getHotkeyHandler([
          [
            'Enter',
            () => {
              sendMessage();
            },
          ],
          [
            'mod+Enter',
            () => {
              sendMessage();
            },
          ],
        ])}
      />
    </Box>
  );
}
