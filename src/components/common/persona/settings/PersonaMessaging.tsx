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
            disabled
            value={userData?.client?.example_outbound_copy}
          />
          <Textarea
            mb='sm'
            label="Links to case studies"
            disabled
            value={userData?.case_study}
          />
          <TextInput
            mb='sm'
            label="Exciting, existing clients to reference"
            disabled
            value={userData?.client?.existing_clients}
          />
          <TextInput
            mb='sm'
            label="Impressive facts about your service"
            disabled
            value={userData?.client?.impressive_facts}
          />
          <Textarea
            mb='sm'
            autosize
            label="Messaging tone"
            disabled
            value={userData?.client?.tone_attributes?.join('\n')}
          />

        </Flex>
      </Card>
    </>
  )
};