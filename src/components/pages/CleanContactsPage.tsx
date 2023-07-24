import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { Flex, Title, Text, Badge, useMantineTheme, Card, Stack, Avatar, Button, ScrollArea, Loader } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { setPageTitle } from "@utils/documentChange"
import { nameToInitials, proxyURL, valueToColor } from "@utils/general";
import { getCleanableProspects } from "@utils/requests/getCleanableProspects";
import { postUnassignContacts } from "@utils/requests/postUnassignContacts";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Prospect } from "src";

export default function CleanContactsPage() {
  setPageTitle("Clean Contacts")
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [currentProject, _] = useRecoilState(currentProjectState);

  const [loading, setLoading] = useState(false)
  const [previewProspects, setPreviewProspects] = useState<Prospect[]>([])

  const triggerGetUnassignableContacts = async () => {
    setLoading(true)

    if (!currentProject) {
      showNotification({
        title: 'No persona selected',
        message: 'Please select a persona to clean contacts from.',
        color: 'red',
        autoClose: 5000,
      })
      setLoading(false)
      return
    }

    const response = await getCleanableProspects(userToken, currentProject.id)
    if (response.status === 'success') {
      setPreviewProspects(response.data.prospects)
    }

    setLoading(false)
  }

  const triggerPostUnassignContacts = async () => {
    setLoading(true)

    if (!currentProject) {
      showNotification({
        title: 'No persona selected',
        message: 'Please select a persona to clean contacts from.',
        color: 'red',
        autoClose: 5000,
      })
      setLoading(false)
      return
    }
    const response = await postUnassignContacts(userToken, currentProject.id)
    if (response.status === 'success') {
      showNotification({
        title: 'Contacts Cleaned',
        message: 'All contacts have been cleaned.',
        color: 'green',
        autoClose: 5000,
      })
      setPreviewProspects([])
      triggerGetUnassignableContacts()
    } else {
      showNotification({
        title: 'Error',
        message: 'Something went wrong. Please try again.',
        color: 'red',
        autoClose: 5000,
      })
    }

    setLoading(false)
  }

  useEffect(() => {
    if (!currentProject) return
    triggerGetUnassignableContacts()
  }, [currentProject])


  return (
    <Flex p='lg' direction='column'>
      <Card withBorder>

        <Title>Clean Contacts</Title>
        <Text mt='md'>
          Use this tool to help clean contacts which may be unsuitable for this Persona. This tool will quickly move all
          <Badge color={'red'} size='sm' mx='4px' variant='filled'>
            low
          </Badge>
          and
          <Badge color={'orange'} size='sm' mx='4px' variant='filled'>
            very low
          </Badge>
          ICP fit prospects from this persona into your Unassigned persona.
        </Text>
        <Text mt='sm'>
          By doing this, you will ensure that SellScale AI only reaches out to
          <Badge color={'green'} size='sm' mx='4px' variant='filled'>
            medium
          </Badge>
          and above ICP fits.
        </Text>

        <Card withBorder shadow="sm" mt='lg'>
          <Title order={5}>
            Cleanup Preview
          </Title>
          <Text>These prospects will be reassigned. If something looks incorrect, please readjust your ICP prompt.</Text>
          {
            loading ? (
              <Flex align='center' justify='center' mt='md'>
                <Loader variant='oval' size='md' />
              </Flex>
            ) : (
              <ScrollArea h={400} mt='md'>
                <Stack mt='sm'>
                  {previewProspects.map((prospect, index) => (
                    <Card key={index} withBorder>
                      <Flex align='center'>
                        <Avatar
                          src={proxyURL(prospect.img_url)}
                          alt={prospect.full_name}
                          color={valueToColor(theme, prospect.full_name)}
                          radius="md"
                          size="lg"
                        >
                          {nameToInitials(prospect.full_name)}
                        </Avatar>
                        <Flex direction='column' ml='md'>
                          <Text fw='bold'>{prospect.full_name} - {prospect.company}</Text>
                          <Text>{prospect.icp_fit_reason}</Text>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Stack>
              </ScrollArea>
            )
          }
        </Card>

        <Flex justify='center'>
          <Button
            mt='lg'
            radius='sm'
            variant="outline"
            color='red'
            onClick={() => {
              openConfirmModal({
                title: 'Clean Contacts',
                children: (
                  <Text>
                    Are you sure you want to clean contacts. This will remove prospects from this persona and move them to the Unassigned persona. SellScale AI will not reach out to these prospects.
                  </Text>
                ),
                labels: { confirm: 'Clean', cancel: 'Cancel' },
                confirmProps: { color: 'red' },
                onCancel: () => { },
                onConfirm: () => { triggerPostUnassignContacts() }
              })
            }}>
            Clean Contacts
          </Button>
        </Flex>

      </Card >
    </Flex >
  )
}
