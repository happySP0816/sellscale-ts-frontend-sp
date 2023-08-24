import { userTokenState } from "@atoms/userAtoms";
import { Modal, useMantineTheme, LoadingOverlay, TextInput, Card, Flex, Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { createEmailSubjectLineTemplate } from "@utils/requests/emailSubjectLines";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { MsgResponse } from "src";


interface CreateEmailSubjectLine extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  archetypeID: number | null;
}

export default function CreateEmailSubjectLineModal(props: CreateEmailSubjectLine) {
  const [userToken] = useRecoilState(userTokenState);
  const theme = useMantineTheme();

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
    }

    
    return;
  }

  return (
    <Modal
      opened={props.modalOpened}
      onClose={props.closeModal}
      title="Create New Email Subject Line"
      size='md'
      centered
      overlayProps={{
        color: theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[2],
        opacity: 0.55,
        blur: 3,
      }}
    >
      <LoadingOverlay visible={loading} />
      <TextInput
        label="Subject Line"
        description="Put AI instructions in [[double brackets]]"
        placeholder="Hey [[First Name]], can I get your thoughts on this?"
        value={subjectLine}
        onChange={(event) => setSubjectLine(event.currentTarget.value)}
        required
      />
      <Card mt='md'>
        <Flex justify={'center'}>
          Preview Coming Soon
        </Flex>
      </Card>
      <Flex justify={'center'}>
        <Button
          color='teal'
          disabled={subjectLine.length === 0}
          onClick={triggerCreateEmailSubjectLineTemplate}
        >
          Create
        </Button>
      </Flex>
    </Modal>
  )
}