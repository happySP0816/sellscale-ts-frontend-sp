import { userDataState } from "@atoms/userAtoms";
import { Card, Flex, Title, Text, Tooltip, Badge, Button, TextInput, Textarea, NumberInput } from "@mantine/core";
import { useState } from "react";
import { useRecoilValue } from "recoil";

export const PersonaCompanyInfo = () => {
  
  const userData = useRecoilValue(userDataState);

  return (
    <>
      <Card withBorder w="100%" mb="sm">
        <Title order={4} mb='4px'>Company Info (Global)</Title>
        <Flex direction='column'>
          <Textarea
            disabled
            autosize
            mb='sm'
            label="Company mission statement"
            value={userData?.client?.mission}
          />
          <TextInput
            mb='sm'
            label="Company 'tagline' (e.g. 'The #1 platform for...')"
            disabled
            value={userData?.client?.tagline}
          />
          <Textarea
            autosize
            mb='sm'
            label="Company description"
            disabled
            value={userData?.client?.description}
          />
          <Textarea
            autosize
            mb='sm'
            label="Company value proposition(s)"
            disabled
            value={userData?.client?.value_prop_key_points}
          />


          <Flex w='100%' direction='row' justify={'space-between'} mb='md'>
            <NumberInput
              disabled
              label="% Opens"
              value={userData?.conversion_open_pct || 9}
              precision={2}
              min={0}
              step={0.1}
              max={100}
            />
            <NumberInput
              disabled
              label="% Replies"
              value={userData?.conversion_reply_pct || 0.5}
              precision={2}
              min={0}
              step={0.1}
              max={100}
            />
            <NumberInput
              disabled
              label="% Demos"
              value={userData?.conversion_demo_pct || 0.1}
              precision={2}
              min={0}
              step={0.1}
              max={100}
            />
          </Flex>

          <Textarea
            mb='sm'
            label="Do-not-contact list"
            disabled
            value={(userData?.do_not_contact_company_names || "") + '\n' + (userData?.do_not_contact_keywords || "")}
          />

        </Flex>
      </Card >
    </>
  )
};
