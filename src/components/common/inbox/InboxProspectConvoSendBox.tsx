import { openedProspectIdState, openedOutboundChannelState, openedBumpFameworksState, selectedBumpFrameworkState } from '@atoms/inboxAtoms';
import { userTokenState } from '@atoms/userAtoms';
import { Paper, Flex, Textarea, Text, Button, useMantineTheme, Group, ActionIcon, LoadingOverlay, Tooltip } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IconExternalLink, IconWriting, IconSend, IconChevronUp, IconChevronDown, IconSettings } from '@tabler/icons';
import { IconMessage2Cog, IconSettingsFilled } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { deleteAutoBumpMessage } from '@utils/requests/autoBumpMessage';
import { postBumpGenerateResponse } from '@utils/requests/postBumpGenerateResponse';
import { sendLinkedInMessage } from '@utils/requests/sendMessage';
import _, { get } from 'lodash';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { BumpFramework, LinkedInMessage } from 'src';
import { generateAIFollowup } from './InboxProspectConvoBumpFramework';
import AutoBumpFrameworkInfo from '@common/prospectDetails/AutoBumpFrameworkInfo';

export default forwardRef(function InboxProspectConvoSendBox(
  props: {
    prospectId: number;
    messages: LinkedInMessage[];
    linkedin_public_id: string;
    scrollToBottom?: () => void;
    msgLoading?: boolean;
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
        setMessageDraft: (msg: string, bumpFramework?: {
          description?: string,
          id?: number,
          length?: string,
          title?: string
        }, accountResearch?: string) => {
          setMessageDraft(msg);
          // Patching the response into a bump framework
          if (bumpFramework) {
            setBumpFramework((prev) => {
              let newFramework: BumpFramework;
              if(!prev) {
                newFramework = {
                  id: -1,
                  title: '',
                  description: '',
                  overall_status: '',
                  substatus: '',
                  active: true,
                  default: false,
                  bump_length: '',
                  bumped_count: null,
                  accountResearch: undefined,
                }
              } else {
                newFramework = { ...prev };
              }
              if(bumpFramework.description){
                newFramework.description = bumpFramework.description;
              }
              if(bumpFramework.id){
                newFramework.id = bumpFramework.id;
              }
              if(bumpFramework.title){
                newFramework.title = bumpFramework.title;
              }
              if(bumpFramework.length){
                newFramework.bump_length = bumpFramework.length;
              }
              if(accountResearch){
                newFramework.accountResearch = accountResearch;
              }
              return newFramework;
            });
          }
        },
      };
    },
    []
  );

  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const userToken = useRecoilValue(userTokenState);

  const [expanded, setExpanded] = useState(false);

  const openedProspectId = useRecoilValue(openedProspectIdState);
  const openedOutboundChannel = useRecoilValue(openedOutboundChannelState);
  const [openBumpFrameworks, setOpenBumpFrameworks] = useRecoilState(openedBumpFameworksState);
  const [selectedBumpFramework, setBumpFramework] = useRecoilState(selectedBumpFrameworkState);

  const [messageDraft, setMessageDraft] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
  const [msgLoading, setMsgLoading] = useState(props.msgLoading || false);

  const sendMessage = async () => {
    setMsgLoading(true);
    const msg = messageDraft;
    setMessageDraft('');

    // Delete the auto bump message if it exists
    await deleteAutoBumpMessage(userToken, props.prospectId);

    const result = await sendLinkedInMessage(userToken, props.prospectId, msg, aiGenerated);
    if (result.status === 'success') {
      /*
      let yourMessage = _.cloneDeep(props.messages)
        .reverse()
        .find((msg) => msg.connection_degree === 'You');
      if (yourMessage) {
        yourMessage.message = msg;
        yourMessage.date = new Date().toUTCString();
        yourMessage.ai_generated = false;
        messages.current.push(yourMessage);
      }
      */
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
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: [`query-get-dashboard-prospect-${openedProspectId}-convo-${openedOutboundChannel}`],
      });
      queryClient.invalidateQueries({
        queryKey: [`query-get-dashboard-prospect-${openedProspectId}`],
      });
    }, 1000);
  };

  console.log(selectedBumpFramework);

  return (
    <Paper
      shadow='sm'
      withBorder
      radius={theme.radius.lg}
      sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', position: 'relative' }}
      mx={10}
      mb={10}
      h={'calc(100% - 10px)'}
      mah={195}
    >
      <LoadingOverlay visible={msgLoading} />
      <div
        style={{
          flexBasis: '15%',
          backgroundColor: '#25262b',
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
          flexBasis: '85%',
          position: 'relative',
          paddingLeft: 10,
          paddingRight: 10,
        }}
      >
        <Textarea
          minRows={5}
          maxRows={5}
          placeholder='Your message...'
          variant='unstyled'
          value={messageDraft}
          onChange={(event) => setMessageDraft(event.currentTarget.value)}
          onKeyDown={getHotkeyHandler([
            [
              "mod+Enter",
              () => {
                sendMessage();
              },
            ],
          ])}
        />
        <Group style={{ position: 'absolute', bottom: 5, left: 10 }}>
          <Button.Group>
            <Button
              leftIcon={<IconWriting size='1rem' />}
              variant='outline'
              color="gray.8"
              radius={theme.radius.lg}
              size='xs'
              onClick={async () => {
                setMsgLoading(true);
                const result = await generateAIFollowup(userToken, props.prospectId, selectedBumpFramework);
                setMessageDraft(result.msg);
                setAiGenerated(result.aiGenerated);
                setMsgLoading(false);
              }}
            >
              Generate Message
            </Button>
            <Tooltip label={selectedBumpFramework ? `Using ${selectedBumpFramework.title}` : `Configure Msg Gen`} withArrow>
            <Button
              variant="outline"
              color="gray.8"
              radius={theme.radius.lg}
              size='xs'
              onClick={() => setOpenBumpFrameworks(true)}
            >
              {selectedBumpFramework ? (<IconSettingsFilled size="1.225rem" />) : (<IconSettings size="1.225rem" />)}
            </Button>
            </Tooltip>
          </Button.Group>
        </Group>
        <div style={{ position: 'absolute', bottom: 5, right: 10 }}>
          <Button leftIcon={<IconSend size='1rem' />} radius={theme.radius.lg} size='xs'
            onClick={() => sendMessage()}
          >
            Send
          </Button>
        </div>
        {aiGenerated && selectedBumpFramework && selectedBumpFramework.id !== -1 && (
          <AutoBumpFrameworkInfo
            bump_title={selectedBumpFramework.title}
            bump_description={selectedBumpFramework.description}
            bump_length={selectedBumpFramework.bump_length}
            account_research_points={selectedBumpFramework?.accountResearch ? (
              selectedBumpFramework.accountResearch.split('\n').map(point => point.replace(/^- /, '').trim())
            ) : []}
          />
        )}
      </div>
    </Paper>
  );
});
