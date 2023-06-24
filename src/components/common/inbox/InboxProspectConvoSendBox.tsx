import { userTokenState } from '@atoms/userAtoms';
import { Paper, Flex, Textarea, Text, Button, useMantineTheme, Group, ActionIcon } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { IconExternalLink, IconWriting, IconSend, IconChevronUp, IconChevronDown } from '@tabler/icons';
import { IconMessage2Cog } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { deleteAutoBumpMessage } from '@utils/requests/autoBumpMessage';
import { sendLinkedInMessage } from '@utils/requests/sendMessage';
import _ from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { LinkedInMessage } from 'src';

export default forwardRef(function InboxProspectConvoSendBox(
  props: {
    prospectId: number;
    messages: LinkedInMessage[];
    linkedin_public_id: string;
    scrollToBottom?: () => void;
  },
  ref
) {
  useImperativeHandle(
    ref,
    () => {
      return {
        getAiGenerated: () => aiGenerated,
        setAiGenerated: setAiGenerated,
        getMessageDraft: () => messageDraft,
        setMessageDraft: setMessageDraft,
      };
    },
    []
  );

  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const userToken = useRecoilValue(userTokenState);
  const messages = useRef(props.messages);

  const [expanded, setExpanded] = useState(false);

  const [messageDraft, setMessageDraft] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);
  const [generateMsgLoading, setGenerateMsgLoading] = useState(false);

  const sendMessage = async () => {
    setMsgLoading(true);
    const msg = messageDraft;
    setMessageDraft('');

    // Delete the auto bump message if it exists
    await deleteAutoBumpMessage(userToken, props.prospectId);

    const result = await sendLinkedInMessage(userToken, props.prospectId, msg, aiGenerated);
    if (result.status === 'success') {
      let yourMessage = _.cloneDeep(messages.current)
        .reverse()
        .find((msg) => msg.connection_degree === 'You');
      if (yourMessage) {
        yourMessage.message = msg;
        yourMessage.date = new Date().toUTCString();
        yourMessage.ai_generated = false;
        messages.current.push(yourMessage);
      }
    } else {
      showNotification({
        id: 'send-linkedin-message-error',
        title: 'Error',
        message: 'Failed to send message. Please try again later.',
        color: 'red',
        autoClose: false,
      });
    }
    setMsgLoading(false);
    setTimeout(() => props.scrollToBottom && props.scrollToBottom(), 100);

    queryClient.invalidateQueries({
      queryKey: [`query-dash-get-prospects`],
    });
  };

  /*
  const generateAIFollowup = async () => {
    setGenerateMsgLoading(true);
    const result = await postBumpGenerateResponse(
      userToken,
      props.prospect_id,
      selectedBumpFrameworkId,
      accountResearch,
      selectedBumpFrameworkLengthAPI
    );

    if (result.status === "success") {
      showNotification({
        id: "generate-ai-followup-success",
        title: "Success",
        message: "Message generated.",
        color: "green",
        autoClose: true,
      });
      setMessageDraft(result.data.message);
      setAiGenerated(true);
    } else {
      showNotification({
        id: "generate-ai-followup-error",
        title: "Error",
        message: "Failed to generate message. Please try again later.",
        color: "red",
        autoClose: false,
      });
      setMessageDraft("");
    }
    setGenerateMsgLoading(false);
  };*/

  return (
    <Paper
      shadow='sm'
      withBorder
      radius={theme.radius.lg}
      sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap' }}
      mx={10}
      mb={10}
      h={'calc(100% - 10px)'}
    >
      <div
        style={{
          flexBasis: '20%',
          backgroundColor: theme.colors.dark[6],
          borderTopLeftRadius: theme.radius.lg,
          borderTopRightRadius: theme.radius.lg,
        }}
      >
        <Group spacing={0} position='apart'>
          <Flex wrap='nowrap' align='center'>
            <Text color='white' fz={14} fw={500} pl={15} pt={5}>
              Message via LinkedIn
            </Text>
            <Text
              pl={10}
              pt={5}
              size='xs'
              fs='italic'
              color='gray.3'
              component='a'
              target='_blank'
              rel='noopener noreferrer'
              href={`https://www.linkedin.com/in/${props.linkedin_public_id}`}
              /* TODO: Message convo link instead */
            >
              linkedin.com/in/{props.linkedin_public_id} <IconExternalLink size='0.65rem' />
            </Text>
          </Flex>
          {false && ( // TODO: Added chat box expanding
            <div style={{ paddingRight: 5 }}>
              <ActionIcon color='gray.3' size='lg' variant='transparent' onClick={() => setExpanded((prev) => !prev)}>
                {expanded ? <IconChevronDown size='1.525rem' /> : <IconChevronUp size='1.525rem' />}
              </ActionIcon>
            </div>
          )}
        </Group>
      </div>
      <div
        style={{
          flexBasis: '80%',
          position: 'relative',
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <Textarea
          minRows={3}
          maxRows={3}
          placeholder='Your message...'
          variant='unstyled'
          value={messageDraft}
          onChange={(event) => setMessageDraft(event.currentTarget.value)}
        />
        <Group style={{ position: 'absolute', bottom: 10, left: 10 }}>
          <Button
            leftIcon={<IconWriting size='1rem' />}
            variant='light'
            color='gray'
            radius={theme.radius.lg}
            size='xs'
          >
            Generate Message
          </Button>
          <ActionIcon radius="xl">
            <IconMessage2Cog size="1.125rem" />
          </ActionIcon>
        </Group>
        <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
          <Button leftIcon={<IconSend size='1rem' />} radius={theme.radius.lg} size='xs'
            onClick={() => sendMessage()}
          >
            Send
          </Button>
        </div>
      </div>
    </Paper>
  );
});
