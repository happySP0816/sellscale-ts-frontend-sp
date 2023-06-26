import { openedBumpFameworksState, openedOutboundChannelState, openedProspectIdState } from '@atoms/inboxAtoms';
import { userDataState, userTokenState } from '@atoms/userAtoms';
import TextWithNewlines from '@common/library/TextWithNewlines';
import loaderWithText from '@common/library/loaderWithText';
import {
  Button,
  Flex,
  Group,
  Paper,
  Title,
  Text,
  Textarea,
  useMantineTheme,
  Divider,
  Tabs,
  ActionIcon,
  Badge,
  Container,
  Avatar,
  Stack,
  ScrollArea,
  LoadingOverlay,
  Center,
  Modal,
} from '@mantine/core';
import { IconExternalLink, IconWriting, IconSend, IconBrandLinkedin, IconMail, IconDots } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { convertDateToCasualTime, convertDateToLocalTime } from '@utils/general';
import { getConversation } from '@utils/requests/getConversation';
import { getProspectByID } from '@utils/requests/getProspectByID';
import DOMPurify from 'dompurify';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { BumpFramework, LinkedInMessage, Prospect } from 'src';
import { labelizeConvoSubstatus } from './utils';
import { readLiMessages } from '@utils/requests/readMessages';
import ProspectDetailsCalendarLink from '@common/prospectDetails/ProspectDetailsCalendarLink';
import ProspectDetailsOptionsMenu from '@common/prospectDetails/ProspectDetailsOptionsMenu';
import { deleteAutoBumpMessage, getAutoBumpMessage } from '@utils/requests/autoBumpMessage';
import { showNotification } from '@mantine/notifications';
import { postBumpGenerateResponse } from '@utils/requests/postBumpGenerateResponse';
import { sendLinkedInMessage } from '@utils/requests/sendMessage';
import _ from 'lodash';
import InboxProspectConvoSendBox from './InboxProspectConvoSendBox';
import SelectBumpInstruction from '@common/bump_instructions/SelectBumpInstruction';
import { API_URL } from '@constants/data';


export default forwardRef(function InboxProspectConvoBumpFramework(
  props: {
    prospect: Prospect;
    messages: LinkedInMessage[];
  },
  ref
) {
  useImperativeHandle(
    ref,
    () => {
      return {
        generateAIFollowup: () => generateAIFollowup(),
      };
    },
    []
  );

  console.log(props.prospect);
  
  const theme = useMantineTheme();
  const queryClient = useQueryClient();

  const [open, setOpen] = useRecoilState(openedBumpFameworksState);

  const userToken = useRecoilValue(userTokenState);
  const userData = useRecoilValue(userDataState);

  const [selectedBumpFrameworkId, setBumpFrameworkId] = useState(0);
  const [selectedBumpFrameworkLengthAPI, setBumpFrameworkLengthAPI] = useState('MEDIUM');
  const [accountResearch, setAccountResearch] = useState('');

  const generateAIFollowup = async () => {
    const result = await postBumpGenerateResponse(
      userToken,
      props.prospect.id,
      selectedBumpFrameworkId,
      accountResearch,
      selectedBumpFrameworkLengthAPI
    );

    if (result.status === 'success') {
      showNotification({
        id: 'generate-ai-followup-success',
        title: 'Success',
        message: 'Message generated.',
        color: 'green',
        autoClose: true,
      });
      return { msg: result.data.message, aiGenerated: true };
    } else {
      showNotification({
        id: 'generate-ai-followup-error',
        title: 'Error',
        message: 'Failed to generate message. Please try again later.',
        color: 'red',
        autoClose: false,
      });
      return { msg: '', aiGenerated: false };
    }
  };

  const autoFillBumpFrameworkAccountResearch = (bumpFramework: BumpFramework) => {
    fetch(`${API_URL}/research/personal_research_points?prospect_id=` + props.prospect.id, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then(async (res) => {
        let research_str = '';
        for (var i = 0; i < res.length; i++) {
          research_str += `- ${res[i].reason}\n`;
        }
        setAccountResearch(research_str.trim());
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Modal
      opened={open}
      onClose={() => setOpen(false)}
      title={<Title order={4}>Message Generation Config</Title>}
    >
      <SelectBumpInstruction
        client_sdr_id={userData.id}
        prospect_id={props.prospect.id}
        persona_id={props.prospect.archetype_id}
        overall_status={props.prospect.overall_status}
        account_research={accountResearch}
        convo_history={props.messages}
        onBumpFrameworkSelected={async (bumpFramework) => {
          if (bumpFramework) {
            setBumpFrameworkId(bumpFramework.id);
            setBumpFrameworkLengthAPI(bumpFramework.bump_length);

            // Autofill account research
            await autoFillBumpFrameworkAccountResearch(bumpFramework);
          }
        }}
        onAccountResearchChanged={(research) => {
          setAccountResearch(research);
        }}
      />
    </Modal>
  );
});
