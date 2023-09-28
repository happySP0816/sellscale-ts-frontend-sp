import { userDataState } from "@atoms/userAtoms";
import { Card, Flex, Title, TextInput, Textarea } from "@mantine/core";
import { useRecoilValue } from "recoil";

export const PersonaMessaging = () => {

  const userData = useRecoilValue(userDataState);
  console.log('user', userData)

  return (
    <>
      <Card withBorder w="100%" mb="sm">
        <Title order={4} mb='4px'>Messaging Info (Global)</Title>
        <Flex direction='column'>
          <Textarea
            mb='sm'
            label="Example outbound copy"
            contentEditable={false}
            autosize
            minRows={2}
            maxRows={11}
            value={userData?.client?.example_outbound_copy}
          />
          <Textarea
            mb='sm'
            label="Links to case studies"
            contentEditable={false}
            autosize
            minRows={2}
            maxRows={4}
            value={userData?.case_study}
          />
          <TextInput
            mb='sm'
            label="Exciting, existing clients to reference"
            contentEditable={false}
            autosize
            minRows={2}
            maxRows={3}
            value={userData?.client?.existing_clients}
          />
          <TextInput
            mb='sm'
            label="Impressive facts about your service"
            contentEditable={false}
            autosize
            minRows={2}
            maxRows={3}
            value={userData?.client?.impressive_facts}
          />
          <Textarea
            mb='sm'
            label="Messaging tone"
            contentEditable={false}
            autosize
            minRows={2}
            maxRows={3}
            value={userData?.client?.tone_attributes?.join('\n')}
          />

        </Flex>
      </Card>
    </>
  )
};