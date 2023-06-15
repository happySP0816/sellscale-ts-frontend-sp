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
  Anchor,
  Divider,
  ScrollArea,
  Tooltip,
} from '@mantine/core';
import { Archetype, Prospect } from 'src';
import { IconEdit, IconHeart, IconHeartOff, IconPencil, IconRefresh, IconTrash } from '@tabler/icons';
import { getHotkeyHandler, useDebouncedState } from '@mantine/hooks';
import { useRecoilState, useRecoilValue } from 'recoil';
import { voiceBuilderMessagesState } from '@atoms/voiceAtoms';
import { MAX_EDITING_PHASES, MSG_GEN_AMOUNT, STARTING_INSTRUCTIONS } from '@modals/VoiceBuilderModal';
import { userTokenState } from '@atoms/userAtoms';
import {
  createVoice,
  deleteSample,
  generateSamples,
  updateOnboardingInstructions,
  updateSample,
} from '@utils/requests/voiceBuilder';
import { prospectDrawerIdState, prospectDrawerOpenState } from '@atoms/prospectAtoms';
import _ from 'lodash';
import { el } from '@fullcalendar/core/internal-common';

const ItemComponent = (props: { id: number; defaultValue: string }) => {
  const [message, setMessage] = useState<string>(props.defaultValue);
  const [editing, setEditing] = useState<boolean>(false);

  const [_opened, setProspectOpened] = useRecoilState(prospectDrawerOpenState);
  const [_prospectId, setProspectId] = useRecoilState(prospectDrawerIdState);

  const [voiceBuilderMessages, setVoiceBuilderMessages] = useRecoilState(voiceBuilderMessagesState);

  const existingMessage = voiceBuilderMessages.find((item) => item.id === props.id);

  const saveMessages = (newMessage?: string) => {
    const oldMessage = voiceBuilderMessages.find((item) => item.id === props.id);
    if (oldMessage) {
      // Update global state list and set new local state message
      setVoiceBuilderMessages(
        voiceBuilderMessages.map((item) => {
          if (item.id === oldMessage.id) {
            return {
              id: item.id,
              value: newMessage !== undefined ? newMessage : message,
              prospect: item.prospect,
            };
          }
          return item;
        })
      );
      if (newMessage !== undefined) {
        setMessage(newMessage);
      }
    }
  };

  if(!editing && !message){
    return (<></>);
  }

  return (
    <Container>
      <Group noWrap spacing={0}>
        <div style={{ flexGrow: 1 }}>
          <Anchor
            component='button'
            type='button'
            onClick={() => {
              if (existingMessage?.prospect) {
                setProspectId(existingMessage.prospect.id);
                setProspectOpened(true);
              }
            }}
          >
            {existingMessage?.prospect?.full_name || 'Example Prospect'}
          </Anchor>
          <Container
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
        </div>
        <div style={{ flexGrow: 0 }}>
          <Tooltip label='Edit' position='left' openDelay={500} withArrow>
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
          </Tooltip>
          <Tooltip label='Discard' position='left' openDelay={500} withArrow>
            <ActionIcon
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditing(false);
                saveMessages('');
              }}
            >
              <IconTrash size='1.125rem' />
            </ActionIcon>
          </Tooltip>
        </div>
      </Group>
      <Divider my='sm' />
    </Container>
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

  const [editingPhase, setEditingPhase] = useState(1);
  const [loadingMsgGen, setLoadingMsgGen] = useState(false);
  const [instructions, setInstructions] = useDebouncedState('', 200);

  const canCreate = editingPhase > MAX_EDITING_PHASES;

  useEffect(() => {
    (async () => {
      const response = await updateOnboardingInstructions(
        userToken,
        props.voiceBuilderOnboardingId,
        `${STARTING_INSTRUCTIONS}\n${instructions.trim()}`
      );
    })();
  }, [instructions]);

  // Generate sample messages
  const generateMessages = async () => {
    setLoadingMsgGen(true);
    // Clone so we don't have to deal with async global state changes bs
    const currentMessages = _.cloneDeep(voiceBuilderMessages);

    // Delete all samples that are empty
    for (const message of currentMessages) {
      if(message.value === ''){
        await deleteSample(userToken, message.id);
      } else {
        await updateSample(userToken, message.id, message.value);
      }
    }

    // Generate new samples
    const response = await generateSamples(userToken, props.voiceBuilderOnboardingId, MSG_GEN_AMOUNT);
    console.log(response);

    // Delete all old samples
    for (const message of currentMessages) {
      // We don't need to wait for this, just needs to happen before the next generateMessages call
      deleteSample(userToken, message.id);
    }

    if (response.status === 'success') {
      // Replace global state with only new samples
      setVoiceBuilderMessages((prev) => {
        return response.data.map((item: any) => {
          return { id: item.id, value: item.sample_completion, prospect: item.prospect };
        });
      });
    }

    setLoadingMsgGen(false);
  };

  console.log(voiceBuilderMessages);

  return (
    <>
      <Textarea
        placeholder={`- Please adjust titles to be less formal (i.e. lowercase, acronyms).\n- Avoid using the word 'impressive'.`}
        label='Additional Instructions'
        minRows={2}
        onChange={(e) => setInstructions(e.currentTarget.value)}
      />
      <div style={{ position: 'relative' }}>
        <Text pt={15} px={2} fz='sm' fw={500}>
          Please edit these messages to your liking or click to discard. Once you’re satisfied, click to continue.
        </Text>
        <ScrollArea style={{ position: 'relative', height: 410 }}>
          <LoadingOverlay variant='bars' visible={loadingMsgGen} />
          <Container>
            <Divider my='sm' />
          </Container>
          {voiceBuilderMessages.map((item) => (
            <ItemComponent key={item.id} id={item.id} defaultValue={item.value} />
          ))}
        </ScrollArea>
      </div>
      <Center mt={10}>
        <Button
          radius='xl'
          size='md'
          m='auto'
          compact
          variant='light'
          disabled={loadingMsgGen}
          onClick={async () => {
            if (canCreate) {
              const response = await createVoice(userToken, props.voiceBuilderOnboardingId);
              if (response.status === 'success') {
                window.location.href = `/linkedin/voices`;
              }
            } else {
              await generateMessages();
              setEditingPhase(editingPhase + 1);
            }
          }}
        >
          {canCreate ? `Create Voice` : `Continue ${editingPhase}/${MAX_EDITING_PHASES}`}
        </Button>
      </Center>
    </>
  );
}
