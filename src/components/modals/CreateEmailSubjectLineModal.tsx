import { userTokenState } from "@atoms/userAtoms";
import { LoadingOverlay, TextInput, Card, Flex, Button, Box, Overlay, CloseButton } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { createEmailSubjectLineTemplate } from "@utils/requests/emailSubjectLines";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { MsgResponse } from "src";
import {
  closeAllModals,
} from "@mantine/modals";


interface CreateEmailSubjectLine extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  archetypeID: number | null;
}

export default function CreateEmailSubjectLineModal(props: CreateEmailSubjectLine) {
  const [userToken] = useRecoilState(userTokenState);

  const [loading, setLoading] = useState(false);
  const [subjectLine, setSubjectLine] = useState<string>("");

  const triggerCreateEmailSubjectLineTemplate = async () => {
    setLoading(true);

    const result = await createEmailSubjectLineTemplate(userToken, props.archetypeID as number, subjectLine);
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      })
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: 'Successfully created email subject line',
        color: 'green',
      })
      setLoading(false);
      props.backFunction();
      props.closeModal();
      closeAllModals();
      setSubjectLine("");
    }

    
    return;
  }

  if (!props.modalOpened) {
    return null;
  }

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
        setSubjectLine("");
      }}
    >
      <Card
        sx={{
          position: 'relative',
          width: '400px',
          padding: '20px',
          backgroundColor: 'white',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseButton
          onClick={() => {
            props.closeModal();
            setSubjectLine("");
          }}
          sx={{ position: 'absolute', top: 10, right: 10 }}
        />
        <LoadingOverlay visible={loading} />
        <TextInput
          label="Subject Line"
          description="AI will do its best to smartfill in any prompts (denoted with double brackets e.g., [[First name]])"
          placeholder="ex. [[First name]] - Supercharge your outbound?"
          value={subjectLine}
          onChange={(event) => setSubjectLine(event.currentTarget.value)}
          required
          error={
            subjectLine.length > 120 && "Subject line must be less than 120 characters"
          }
        />
        <Flex justify={'center'} mt='xl'>
          <Button
            color='teal'
            disabled={subjectLine.length === 0 || subjectLine.length > 120}
            onClick={triggerCreateEmailSubjectLineTemplate}
          >
            Create
          </Button>
        </Flex>
      </Card>
    </Box>
  )
}
