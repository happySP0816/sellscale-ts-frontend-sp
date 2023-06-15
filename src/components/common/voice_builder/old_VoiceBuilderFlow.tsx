import { useEffect, useState } from 'react';
import {
  Checkbox,
  Group,
  Avatar,
  Text,
  TransferList,
  TransferListItemComponent,
  TransferListItemComponentProps,
  Textarea,
  ActionIcon,
  Flex,
  Container,
  Button,
  TransferListItem,
  TransferListData,
  Center,
  LoadingOverlay,
  HoverCard,
} from '@mantine/core';
import { Archetype } from 'src';
import { IconEdit, IconHeart, IconHeartOff, IconPencil, IconRefresh } from '@tabler/icons';
import { getHotkeyHandler, useDebouncedState } from '@mantine/hooks';
import { useRecoilState, useRecoilValue } from 'recoil';
import { voiceBuilderMessagesState } from '@atoms/voiceAtoms';
import { MIN_MSG_AMOUNT, MSG_GEN_AMOUNT, STARTING_INSTRUCTIONS } from '@modals/old_VoiceBuilderModal';
import { userTokenState } from '@atoms/userAtoms';
import {
  createVoice,
  deleteSample,
  generateSamples,
  updateOnboardingInstructions,
  updateSample,
} from '@utils/requests/voiceBuilder';

const ItemComponent: TransferListItemComponent = ({ data, selected }: TransferListItemComponentProps) => {
  const [message, setMessage] = useState<string>(data.label);
  const [editing, setEditing] = useState<boolean>(false);

  const [voiceBuilderMessages, setVoiceBuilderMessages] = useRecoilState(voiceBuilderMessagesState);

  const saveMessages = () => {
    const oldMessage = voiceBuilderMessages.find((item) => item.value === data.label);
    if (oldMessage) {
      // Update global state list and set new local state message
      setVoiceBuilderMessages(
        voiceBuilderMessages.map((item) => {
          if (item === oldMessage) {
            return {
              value: message,
              id: item.id,
              prospect: null,
            };
          }
          return item;
        })
      );
    }
  };

  return (
    <Group noWrap spacing={0}>
      <Container
        style={{ flex: 1 }}
        m={0}
        p={0}
        onClick={(e) => {
          if (editing) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {editing ? (
          <Textarea
            size='xs'
            autosize
            variant='unstyled'
            onChange={(e) => {
              setMessage(e.currentTarget.value);
            }}
            value={message}
            onKeyDown={getHotkeyHandler([
              [
                'Enter', //mod+Enter
                () => {
                  setEditing(false);
                  saveMessages();
                },
              ],
            ])}
            styles={{
              input: {
                padding: '0!important',
                paddingTop: '0!important',
                paddingBottom: '0!important',
              },
            }}
          />
        ) : (
          <Text size='xs' color='dimmed'>
            {message}
          </Text>
        )}
      </Container>
      <Group spacing={5}>
        <ActionIcon
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditing(!editing);
            saveMessages();
          }}
        >
          <IconPencil size='1.125rem' />
        </ActionIcon>
        <Checkbox checked={selected} onChange={() => {}} tabIndex={-1} sx={{ pointerEvents: 'none' }} />
      </Group>
    </Group>
  );
};

export default function VoiceBuilderFlow(props: { persona: Archetype; voiceBuilderOnboardingId: number }) {
  const [voiceBuilderMessages, setVoiceBuilderMessages] = useRecoilState(voiceBuilderMessagesState);
  const userToken = useRecoilValue(userTokenState);

  // Set global state to loaded messages
  useEffect(() => {
    setVoiceBuilderMessages([]);
    (async () => {
      await generateMessages();
    })();
  }, []);

  const [loadingMsgGen, setLoadingMsgGen] = useState(false);
  const [instructions, setInstructions] = useDebouncedState('', 200);

  useEffect(() => {
    (async () => {
      const response = await updateOnboardingInstructions(
        userToken,
        props.voiceBuilderOnboardingId,
        `${STARTING_INSTRUCTIONS}\n${instructions.trim()}`
      );
    })();
  }, [instructions]);

  const sampleMessages = voiceBuilderMessages
    .filter((item) => false === false)
    .map((item) => ({ value: item.id + '', label: item.value }))
    .sort((a, b) => a.value.localeCompare(b.value));
  const savedMessages = voiceBuilderMessages
    .filter((item) => true === true)
    .map((item) => ({ value: item.id + '', label: item.value }))
    .sort((a, b) => a.value.localeCompare(b.value));

  const canCreate = voiceBuilderMessages.filter((item) => true).length >= MIN_MSG_AMOUNT;

  // Generate sample messages
  const generateMessages = async () => {
    setLoadingMsgGen(true);

    for (const message of voiceBuilderMessages) {
      if (true) {
        const response = await updateSample(userToken, message.id, message.value);
      } else {
        const response = await deleteSample(userToken, message.id);
      }
    }

    const response = await generateSamples(userToken, props.voiceBuilderOnboardingId, MSG_GEN_AMOUNT);

    console.log(response);

    if (response.status === 'success') {
      setVoiceBuilderMessages((prev) => {
        const savedItems = prev.filter((item) => true);
        const newItems = response.data.map((item: any) => {
          return { id: item.id, value: item.sample_completion, saved: false };
        });
        return savedItems.concat(newItems);
      });
    }
    setLoadingMsgGen(false);
  };

  return (
    <>
      <Textarea
        placeholder={`- Please adjust titles to be less formal (i.e. lowercase, acronyms).\n- Avoid using the word 'impressive'.\n- If mentioning their title, don't use commas - keep it natural.`}
        label='Additional Instructions'
        minRows={3}
        onChange={(e) => setInstructions(e.currentTarget.value)}
      />
      <div style={{ position: 'relative' }}>
        <Button
          sx={{ position: 'absolute', top: 35, left: 5, zIndex: 3 }}
          radius='xl'
          size='sm'
          compact
          rightIcon={<IconRefresh size='0.925rem' />}
          onClick={async () => {
            await generateMessages();
          }}
        >
          Generate Messages
        </Button>
        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={loadingMsgGen} />
          <TransferList
            mt={10}
            value={[sampleMessages, savedMessages]}
            onChange={(value) => {
              let messages = value[0].map((item) => ({ id: +item.value, value: item.label, prospect: null }));
              messages = messages.concat(value[1].map((item) => ({ id: +item.value, value: item.label, prospect: null })));
              setVoiceBuilderMessages(messages);
            }}
            titles={['Samples', 'Saved Messages']}
            listHeight={350}
            breakpoint='sm'
            itemComponent={ItemComponent}
            filter={(query, item) => true}
            nothingFound='No messages'
            searchValues={['', '']}
            transferIcon={({ reversed }) => (reversed ? <IconHeartOff /> : <IconHeart />)}
            showTransferAll={false}
          />
        </div>
      </div>
      <Center mt={10}>
        <HoverCard width={395} shadow='md' position='top' withArrow disabled={canCreate}>
          <HoverCard.Target>
            <div>
              <Button
                radius='xl'
                size='sm'
                m='auto'
                disabled={!canCreate}
                compact
                variant='light'
                onClick={async () => {
                  const response = await createVoice(userToken, props.voiceBuilderOnboardingId);
                  if (response.status === 'success') {
                    window.location.href = `/linkedin/voices`;
                  }
                }}
              >
                Create Voice from Saved Messages
              </Button>
            </div>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size='sm'>
              You need to save at least {MIN_MSG_AMOUNT} messages to create a voice.
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Center>
    </>
  );
}
