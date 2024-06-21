// Simulate Magic Subject Line Modal Component
import { useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { campaignContactsState, emailSequenceState, userTokenState } from "@atoms/userAtoms";
import { LoadingOverlay, TextInput, Card, Flex, Button, Box, CloseButton, Select, Textarea, Title, Progress, ScrollArea } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { closeAllModals } from "@mantine/modals";
import { API_URL } from "@constants/data";
import { set } from "lodash";
import { Contact } from "@pages/CampaignV2/ContactsInfiniteScroll";
import { currentProjectState } from "@atoms/personaAtoms";
import {socket} from '../App'
import BracketGradientWrapper from "@common/sequence/BracketGradientWrapper";

interface SimulateMagicSubjectLineProps extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
}

export default function SimulateMagicSubjectLineModal(props: SimulateMagicSubjectLineProps) {
  const [userToken] = useRecoilState(userTokenState);
  const [loading, setLoading] = useState(false);
  const [sequence, setSequence] = useState<string | null>(null);
  const [prospectId, setProspectId] = useState<string>('');
  const [generatedSubjectLine, setGeneratedSubjectLine] = useState<string>("");
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const campaignContacts = useRecoilValue(campaignContactsState);
  const emailSequenceData = useRecoilValue(emailSequenceState);
  const currentProject = useRecoilValue(currentProjectState);
  const [progressStep, setProgressStep] = useState<Number>(0);
  const roomIDref = useRef<string>('');
  const [sections, setSections] = useState<{ value: number; color: string; label: string; }[]>([]);

  const personalizationIsEnabled = currentProject?.is_ai_research_personalization_enabled;

  console.log('campaignContacts', campaignContacts)
  console.log('emailSequenceData', emailSequenceData)

useEffect(() => {
  const handleData = (data: any) => {
    if (data.step !== undefined && data.room_id === roomIDref.current) {
      setProgressStep(data.step);
      setSections(prevSections => {
        const newSection = (() => {
          switch (data.step) {
            case 1:
              return { value: 33.33, color: 'orange', label: 'Researching Prospect' };
            case 2:
              return { value: 33.33, color: 'grape', label: 'Generating Email' };
            case 3:
              return { value: 33.33, color: 'green', label: 'Generating Subject Line' };
            default:
              return null;
          }
        })();
        return newSection ? [...prevSections, newSection] : prevSections;
      });
    }
  };

  socket.on("subject-stream", handleData);

  return () => {
    socket.off("subject-stream", handleData);
  };
}, []);


  const triggerSimulateMagicSubjectLine = async (sequenceId: Number) => {
    setSections([]);
    if (!sequence || prospectId === '') {
      showNotification({
        title: 'Error',
        message: 'Please select both a sequence and a prospect',
        color: 'red',
      });
      return;
    }

    setLoading(true);

    try {
      const room_id = Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join('');
      roomIDref.current = room_id;
      socket.emit("join-room", {
        payload: { room_id: room_id },
      });
      const response = await fetch(API_URL + '/ml/simulate-magic-subject-line', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          sequence_id: sequenceId,
          prospect_id: Number(prospectId),
          archetype_id: currentProject?.id,
          room_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.magic_subject_line) {
        setGeneratedSubjectLine(data.magic_subject_line);
      }
      if (data.personalized_email){
        setGeneratedEmail(data.personalized_email);
      }
    } catch (error) {
      showNotification({
        title: 'Error',
        message: 'Failed to simulate magic subject line. Please try again later.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!props.modalOpened) {
    return null;
  }

  const selectedSequence = sequence ? emailSequenceData.flat().find((seq) => (seq as unknown as { title: string }).title === sequence) : null;
  const sequenceContent = selectedSequence?.description || "";
  const minRows = Math.max(3, Math.ceil(sequenceContent.length / 100));

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={() => {
        props.closeModal();
        setGeneratedSubjectLine("");
      }}
    >
      <Card
        sx={{
          position: 'relative',
          width: '800px',
          padding: '10px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Title order={3} mb="md" align="center">Simulate Magic Subject Line</Title>
        <CloseButton
          onClick={() => {
            props.closeModal();
            setGeneratedSubjectLine("");
          }}
          sx={{ position: 'absolute', top: 10, right: 10 }}
        />
        <Select
          label="Select Template"
          placeholder="Pick one"
          data={emailSequenceData.flat().map((seq: any) => ({ value: seq.title, label: seq.title }))}
          value={sequence}
          onChange={setSequence}
          required
        />
        {sequence && (
         <ScrollArea style={{ height: '6em' }}>
           <Box>
             <div style={{ fontSize: "11px" }}>
               <BracketGradientWrapper>{sequenceContent}</BracketGradientWrapper>
             </div>
           </Box>
         </ScrollArea>
        )}
        <Select
          label="Select Prospect"
          placeholder="Pick one"
          data={campaignContacts.map((contact) => ({
            value: String(contact.id),
            label: `${contact.first_name} ${contact.last_name} - ${contact.title} at ${contact.company}`
          }))}
          value={prospectId}
          onChange={(value) => {setProspectId(value ?? ''); setGeneratedEmail(''); setGeneratedSubjectLine('');}}
          required
          mt="md"
        />
        {generatedSubjectLine !== '' && <TextInput
          label="Generated Subject Line"
          mb="sm"
          placeholder="Generated subject line will appear here..."
          value={generatedSubjectLine}
          readOnly
          mt="md"
        />}
       {generatedEmail !== '' && <ScrollArea style={{ height: '6em' }}>
           <Box>
             <div style={{ fontSize: "11px" }}>
               <BracketGradientWrapper>{generatedEmail.replace(/\n/g, '<br/>')}</BracketGradientWrapper>
            </div>
           </Box>
         </ScrollArea>}
        <Flex justify={'center'} mt='xl'>
          {!loading && <Button
            color='grape'
            onClick={() => triggerSimulateMagicSubjectLine(
              selectedSequence?.id || -1
            )}
            disabled={!sequence || prospectId === '' || loading}
          >
            Simulate
          </Button>}
        </Flex>
        {loading && <Progress
        mt="md"
        size="xl"
        radius="xl"
        sections={sections}
        animate
        />}
      </Card>
    </Box>
  );
}
