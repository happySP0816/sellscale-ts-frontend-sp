import { userDataState, userTokenState } from '@atoms/userAtoms';
import { syncLocalStorage } from '@auth/core';
import { Box, Modal, Stack, Switch, Title, Text, Button, Center, Card, Notification, TextInput, Flex, Badge, ActionIcon, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconExternalLink, IconPlus, IconX } from '@tabler/icons';
import patchSDRBlacklist from '@utils/requests/postPatchBlacklist';
import postToggleAutoBump from '@utils/requests/postToggleAutoBump';
import { updateClientSDR } from '@utils/requests/updateClientSDR';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import RealtimeResponseEngine from './RealtimeResponseEngine';

export default function MessageAutomation() {
  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);
  const [loading, setLoading] = useState(false);

  const [prospectRespondOption, setProspectRespondOption] = useState(userData.disable_ai_on_prospect_respond);
  const [messageSendOption, setMessageSendOption] = useState(userData.disable_ai_on_message_send);
  const [opened, { open, close }] = useDisclosure(false);

  const [blacklistWords, setBlacklistWords] = useState(userData.blacklisted_words || []); // ['howdy', 'hello', 'hi']
  const [newBlacklistWord, setNewBlacklistWord] = useState('');
  const [saveDisabled, setSaveDisabled] = useState(true);

  useEffect(() => {
    setSaveDisabled(JSON.stringify(blacklistWords) === JSON.stringify(userData.blacklisted_words));
  }, [blacklistWords]);

  useEffect(() => {
    (async () => {
      const response = await updateClientSDR(userToken, undefined, undefined, prospectRespondOption, messageSendOption);
      if (response.status === 'success') {
        await syncLocalStorage(userToken, setUserData);
      }
    })();
  }, [prospectRespondOption, messageSendOption]);

  const triggerToggleAutoBump = async () => {
    let status = userData.auto_bump;
    let old_status;
    if (status == true) {
      status = 'Disabled';
      old_status = 'Enabled';
    } else {
      status = 'Enabled';
      old_status = 'Disabled';
    }

    const result = await postToggleAutoBump(userToken);

    if (result.status === 'success') {
      setUserData({ ...userData, auto_bump: !userData.auto_bump });
      showNotification({
        title: `AutoBump ${status}`,
        message: `AutoBump has been ${status.toLower()}. You can ${old_status.toLowerCase()} it at any time.`,
        color: 'green',
        icon: <IconCheck size='1rem' />,
      });
    } else {
      showNotification({
        title: 'Error',
        message: 'Something went wrong. Please try again later.',
        color: 'red',
        icon: <IconAlertTriangle size='1rem' />,
      });
    }
  };

  const triggerUpdateBlacklistWords = async () => {
    setLoading(true);

    const response = await patchSDRBlacklist(userToken, blacklistWords);
    if (response.status === 'success') {
      setUserData({ ...userData, blacklisted_words: blacklistWords });
      showNotification({
        title: 'Success',
        message: 'Blacklist words updated successfully.',
        color: 'green',
        icon: <IconCheck size='1rem' />,
      });
      setUserData({ ...userData, blacklisted_words: blacklistWords });
      setSaveDisabled(true);
    } else {
      showNotification({
        title: 'Error',
        message: 'Blacklist words could not be saved. Please try again later.',
        color: 'red',
        icon: <IconAlertTriangle size='1rem' />,
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Box p='lg'>
        <Title order={3}>Message Automation Settings</Title>
        <Stack p='lg'>
          <Card withBorder shadow='md'>
            <Title order={4}>General Settings</Title>
            <Switch
              mt='sm'
              label='Disable AI when prospect responds'
              checked={prospectRespondOption}
              onChange={(event) => setProspectRespondOption(event.currentTarget.checked)}
            />
            <Switch
              mt='md'
              label='Disable AI when I send a message'
              checked={messageSendOption}
              onChange={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (event.currentTarget.checked) {
                  open();
                } else {
                  setMessageSendOption(false);
                }
              }}
            />
          </Card>

          <RealtimeResponseEngine />

          <Card withBorder shadow='md'>
            <Title order={4}>AutoBump</Title>
            <Text mt='sm' lh='1.5rem'>
              AutoBump is SellScale AI's system for automatically sending follow-up messages to prospects. AutoBumps are sent when a prospect does not respond
              to a message, and are sent at random times between 9am and 5pm in your timezone on workdays.
            </Text>

            <Notification
              closeButtonProps={{ opacity: 0 }}
              icon={<IconAlertTriangle size='1rem' />}
              color={'yellow'}
              title='Please test your bumps'
              withBorder
              mt='md'
            >
              <Text>
                Please test your bump frameworks before enabling AutoBump. AutoBump will always use your default bump framework, so make sure it is working as
                expected.
              </Text>
              <Text mt='md' fw='bold'>
                AutoBumps using personalized bump frameworks see a significant increase in response rates.
              </Text>
            </Notification>
            <Switch
              label='Enable AutoBump'
              checked={userData.auto_bump}
              mt='xl'
              onChange={() => {
                let status = userData.auto_bump;
                let old_status;
                if (status == true) {
                  status = 'disable';
                  old_status = 'enable';
                } else {
                  status = 'enable';
                  old_status = 'disable';
                }
                openConfirmModal({
                  title: 'Toggle AutoBump',
                  children: (
                    <Text>
                      Are you sure you want to {status.toLowerCase()} AutoBump? You can {old_status.toLowerCase()} it at any time.
                    </Text>
                  ),
                  labels: { confirm: 'Confirm', cancel: 'Cancel' },
                  onCancel: () => {},
                  onConfirm: () => {
                    triggerToggleAutoBump();
                  },
                });
              }}
            ></Switch>
          </Card>

          <Card withBorder shadow='md'>
            <Title order={4}>Blacklisted Words</Title>
            <Text mt='sm' lh='1.5rem'>
              Our AI will not send any messages that contain words that are in your blacklist. This is useful for preventing the AI from sending messages that
              may not fit your speaking style. Case-insensitive (capitalizations don't matter).
            </Text>

            <TextInput
              mt='sm'
              label='Add a new word to your blacklist'
              placeholder="e.g. 'howdy'"
              value={newBlacklistWord}
              onChange={(event) => setNewBlacklistWord(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && newBlacklistWord.length > 0) {
                  setBlacklistWords([...blacklistWords, newBlacklistWord]);
                  setNewBlacklistWord('');
                }
              }}
              rightSection={
                <ActionIcon
                  p='4px'
                  variant='transparent'
                  color='blue'
                  disabled={newBlacklistWord.length === 0}
                  onClick={() => {
                    setBlacklistWords([...blacklistWords, newBlacklistWord]);
                    setNewBlacklistWord('');
                  }}
                >
                  <IconPlus size={'.75 rem'} />
                </ActionIcon>
              }
            />

            <Flex mt='md'>
              {!blacklistWords || blacklistWords.length > 0 ? (
                <>
                  {blacklistWords &&
                    blacklistWords.map((word: string) => {
                      const removeButton = // Removes the word from the blacklist
                        (
                          <ActionIcon
                            mx='-5px'
                            size='xs'
                            variant='transparent'
                            onClick={() => {
                              const newBlacklistWords = blacklistWords.filter((w: string) => w !== word);
                              setBlacklistWords(newBlacklistWords);
                            }}
                          >
                            <IconX size={rem(10)} />
                          </ActionIcon>
                        );

                      return (
                        <Badge rightSection={removeButton} mx='2px'>
                          {word}
                        </Badge>
                      );
                    })}
                </>
              ) : (
                <Text fz='xs' color='gray'>
                  No blacklisted words.
                </Text>
              )}
            </Flex>
            <Flex mt='sm' justify={'flex-end'}>
              <Button onClick={triggerUpdateBlacklistWords} disabled={saveDisabled}>
                Save
              </Button>
            </Flex>
          </Card>
        </Stack>
      </Box>
      <Modal opened={opened} onClose={close} title={<Title order={3}>Are you sure?</Title>}>
        <Stack>
          <Text>
            If you turn this off, SellScale will not be able to work conversations from you. An example of this is you have a conversation with a prospect but
            they don’t respond. In this scenario, SellScale usually follow-ups to revive the conversation, but not when this option is enabled.
          </Text>
          <Center>
            <Button
              onClick={() => {
                setMessageSendOption(true);
                close();
              }}
              color='red'
            >
              Disable It.
            </Button>
          </Center>
        </Stack>
      </Modal>
    </>
  );
}
