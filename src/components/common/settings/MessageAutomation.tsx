import { userDataState, userTokenState } from "@atoms/userAtoms";
import { syncLocalStorage } from "@auth/core";
import { Box, Modal, Stack, Switch, Title, Text, Button, Center } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { updateClientSDR } from "@utils/requests/updateClientSDR";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export default function MessageAutomation() {

  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const [prospectRespondOption, setProspectRespondOption] = useState(userData.disable_ai_on_prospect_respond);
  const [messageSendOption, setMessageSendOption] = useState(userData.disable_ai_on_message_send);
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    (async () => {
      const response = await updateClientSDR(userToken, undefined, undefined, prospectRespondOption, messageSendOption);
      if (response.status === 'success'){
        await syncLocalStorage(userToken, setUserData);
      }
    })();
  }, [prospectRespondOption, messageSendOption]);

  return (
    <>
    <Box p='lg'>
      <Title order={3}>Message Automation Settings</Title>
      <Stack p='lg'>
        <Switch
          label="Disable AI when prospect responds"
          checked={prospectRespondOption}
          onChange={(event) => setProspectRespondOption(event.currentTarget.checked)}
        />
        <Switch
          label="Disable AI when I send a message"
          checked={messageSendOption}
          onChange={(event) => {
            if(event.currentTarget.checked){
              open();
            } else {
              setMessageSendOption(false);
            }
          }}
        />
      </Stack>
    </Box>
    <Modal opened={opened} onClose={close} title={<Title order={3}>Are you sure?</Title>}>
      <Stack>
        <Text>If you turn this off, SellScale will not be able to work conversations from you. An example of this is you have a conversation with a prospect but they don’t respond. In this scenario, SellScale usually follow-ups to revive the conversation, but not when this option is enabled.</Text>
        <Center>
          <Button onClick={() => {
            setMessageSendOption(true);
            close();
          }} color="red">Disable It.</Button>
        </Center>
      </Stack>
    </Modal>
  </>
  )

}
