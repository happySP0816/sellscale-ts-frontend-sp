import { userDataState } from "@atoms/userAtoms";
import { Card, Flex, Title, Text, Tooltip, Badge, Button, TextInput } from "@mantine/core";
import { useRecoilValue } from "recoil";

export const PersonaUserSettings = () => {

  const userData = useRecoilValue(userDataState);
  console.log('user', userData)

  return (
    <>
      <Card withBorder w="100%" mb="sm">
        <Title order={4} mb='4px'>User Info (Global)</Title>
        <Flex direction='column'>
          <TextInput
            mb='sm'
            label="Full name"
            disabled
            value={userData?.sdr_name}
          />
          <TextInput
            mb='sm'
            label="Email address"
            disabled
            value={userData?.sdr_email}
          />
          <TextInput
            mb='sm'
            label="Calendly (scheduling) link"
            disabled
            value={userData?.scheduling_link}
          />
          <TextInput
            mb='sm'
            label="LinkedIn URL"
            disabled
            value={userData?.linkedin_url}
          />

        </Flex>
      </Card>
    </>
  )
};
