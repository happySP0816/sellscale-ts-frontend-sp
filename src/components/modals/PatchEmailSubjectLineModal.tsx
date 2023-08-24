import { userTokenState } from "@atoms/userAtoms";
import { Modal, useMantineTheme, LoadingOverlay, TextInput, Card, Flex, Button } from "@mantine/core";
import { ContextModalProps } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { patchEmailSubjectLineTemplate } from "@utils/requests/emailSubjectLines";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { SubjectLineTemplate } from "src";


interface PatchEmailSubjectLine extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  subjectLine: SubjectLineTemplate;
}

export default function PatchEmailSubjectLineModal({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  backFunction: () => void;
  subjectLine: SubjectLineTemplate;
}>) {
  const [userToken] = useRecoilState(userTokenState);
  const theme = useMantineTheme();

  const [loading, setLoading] = useState(false);
  const [subjectLine, setSubjectLine] = useState<string>(innerProps.subjectLine.subject_line);

  const triggerPatchEmailSubjectLineTemplate = async () => {
    setLoading(true);

    const result = await patchEmailSubjectLineTemplate(userToken, innerProps.subjectLine.id as number, subjectLine);
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
        message: 'Successfully updated email subject line',
        color: 'green',
      })
      setLoading(false);
      innerProps.backFunction();
      context.closeModal(id);
    }
    
    return;
  }

  return (
    <>
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
          disabled={subjectLine === innerProps.subjectLine.subject_line}
          onClick={triggerPatchEmailSubjectLineTemplate}
        >
          Create
        </Button>
      </Flex>
    </>
  )
}