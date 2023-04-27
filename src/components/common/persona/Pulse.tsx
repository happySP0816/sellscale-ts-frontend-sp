import { Paper, Title, Text, Textarea, Button, LoadingOverlay } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconPencil } from "@tabler/icons";
import { useEffect, useState } from "react";

import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { Archetype } from "src";

import getICPClassificationPrompt from "@utils/requests/getICPClassificationPrompt";

export default function Pulse(props: {
  archetype: Archetype;
}) {
  const userToken = useRecoilValue(userTokenState)
  const [currentICPPrompt, setCurrentICPPrompt] = useState('')
  
  const triggerGetICPClassificationPrompt = async () => {
    const result = await getICPClassificationPrompt(userToken, props.archetype.id)

    if (result.status === 'success') {
      setCurrentICPPrompt(result.extra)
    } else {
      setCurrentICPPrompt('')
    }
  }

  useEffect(() => {
    triggerGetICPClassificationPrompt()
  }, [])

  return (
    <Paper withBorder p="xs" my={20} radius="md">
      <Textarea
        defaultValue={currentICPPrompt}
        placeholder="No prompt? Send SellScale a prompt request through here."
        label="Ideal Customer Profile Description"
        description="Description of your Ideal Customer Profile (ICP) that SellScale AI will use to filter prospects."
        autosize
        disabled
      />
      <Button
        mt="xs"
        rightIcon={<IconPencil size="1rem" />}
        variant="outline"
        radius="lg"
        color="teal"
        onClick={() => {
          currentICPPrompt ?
            openContextModal({
              modal: "managePulsePrompt",
              title: <Title order={3}>Edit Pulse Prompt</Title>,
              innerProps: { mode: "EDIT", archetype: props.archetype, backfillICPPrompt: setCurrentICPPrompt },
            })
            :
            openContextModal({
              modal: "managePulsePrompt",
              title: <Title order={3}>Create Pulse Prompt</Title>,
              innerProps: { mode: "CREATE", archetype: props.archetype, backfillICPPrompt: setCurrentICPPrompt },
            })
        }}
      >
        {currentICPPrompt ? "Edit Pulse Prompt" : "Create New Pulse Prompt"}
      </Button>
    </Paper>
  )
}
