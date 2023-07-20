import { userTokenState } from "@atoms/userAtoms";
import { Avatar, Button, Flex, LoadingOverlay, Modal, TextInput, Title, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconBrandLinkedin, IconBriefcase, IconBuildingStore, IconDeviceFloppy, IconMail } from "@tabler/icons";
import { nameToInitials, valueToColor } from "@utils/general";
import { getProspectByID } from "@utils/requests/getProspectByID";
import { patchProspect } from "@utils/requests/patchProspect";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { Prospect } from "src";


interface EditProspect extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  prospectID: number;
}


export default function EditProspectModal(props: EditProspect) {
  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const [prospect, setProspect] = useState<Prospect | null>(null);

  const triggerGetProspectByID = async () => {
    setLoading(true)

    const result = await getProspectByID(userToken, props.prospectID)

    if (result.status === 'success') {
      setProspect({...result.data.details, ...result.data.email, linkedin_url: result.data.li.li_profile})
      prospectInfoForm.setValues({
        title: result.data.details.title,
        email: result.data.email.email,
        linkedinURL: result.data.li.li_profile,
        companyName: result.data.details.company,
        companyWebsite: result.data.details.company_url,
      })
    } else {
      showNotification({
        title: "Error",
        message: "Failed to get prospect.",
        color: "red",
      });
    }

    setLoading(false)
  }

  const triggerUpdateProspect = async () => {
    setLoading(true)

    const result = await patchProspect(
      userToken,
      props.prospectID,
      prospectInfoForm.values.title,
      prospectInfoForm.values.email,
      prospectInfoForm.values.linkedinURL,
      prospectInfoForm.values.companyName,
      prospectInfoForm.values.companyWebsite,
    )
    if (result.status === 'success') {
      showNotification({
        title: "Success",
        message: "Prospect updated.",
        color: "green",
        autoClose: 2000,
      });
      setProspect(null)
      prospectInfoForm.reset()
      triggerGetProspectByID()
      props.backFunction()
      props.closeModal()
      setLoading(false)
    } else {
      showNotification({
        title: "Error",
        message: "Failed to update prospect.",
        color: "red",
      });
    }

    setLoading(false)
  }

  const prospectInfoForm = useForm({
    initialValues: {
      title: prospect?.title,
      email: prospect?.email,
      linkedinURL: prospect?.linkedin_url,
      companyName: prospect?.company,
      companyWebsite: prospect?.company_url,
    },
  })

  useEffect(() => {
    triggerGetProspectByID()
  }, [props.prospectID])

  return (
    <Modal
      opened={props.modalOpened}
      onClose={props.closeModal}
      title={
        <Title order={3}>
          Edit Prospect Details
        </Title>
      }
      size="lg"
    >
      <LoadingOverlay visible={loading} />
      <Flex mb='lg'>
        <Flex>
          <Avatar
            src={prospect?.img_url}
            alt={prospect?.full_name}
            color={valueToColor(theme, prospect?.full_name || "")}
            radius="md"
            size={94}
          >
            {nameToInitials(prospect?.full_name || "?")}
          </Avatar>
        </Flex>
        <Flex direction='column' ml='md' w='100%'>
          <Title order={4}>{prospect?.full_name}</Title>
          <TextInput
            label="Title"
            placeholder="e.g. CEO"
            size='xs'
            w='90%'
            value={prospectInfoForm.values.title}
            onChange={(event) => prospectInfoForm.setValues({ title: event.currentTarget.value })}
            icon={<IconBriefcase size={16} />}
          />
          <TextInput
            mt='4px'
            label="Email"
            placeholder="e.g. ceo@company.com"
            size='xs'
            w='90%'
            value={prospectInfoForm.values.email}
            onChange={(event) => prospectInfoForm.setValues({ email: event.currentTarget.value })}
            icon={<IconMail size={16} />}
          />
          <TextInput
            mt='4px'
            label="LinkedIn URL"
            placeholder="e.g. https://www.linkedin.com/in/ceo"
            size='xs'
            w='90%'
            value={prospectInfoForm.values.linkedinURL}
            onChange={(event) => prospectInfoForm.setValues({ linkedinURL: event.currentTarget.value })}
            icon={<IconBrandLinkedin size={16} />}
          />
          <TextInput
            mt='4px'
            label="Company Name"
            placeholder="e.g. Company Inc."
            size='xs'
            w='90%'
            value={prospectInfoForm.values.companyName}
            onChange={(event) => prospectInfoForm.setValues({ companyName: event.currentTarget.value })}
            icon={<IconBuildingStore size={16} />}
          />
          <Button
            mt='lg'
            w='100px'
            size='xs'
            leftIcon={<IconDeviceFloppy stroke={1.5} size={16} />}
            disabled={
              prospectInfoForm.values.title === prospect?.title &&
              prospectInfoForm.values.email === prospect?.email &&
              prospectInfoForm.values.linkedinURL === prospect?.linkedin_url &&
              prospectInfoForm.values.companyName === prospect?.company &&
              prospectInfoForm.values.companyWebsite === prospect?.company_url
            }
            onClick={() => triggerUpdateProspect()}
          >
            Save
          </Button>
        </Flex>
      </Flex>
    </Modal>
  )
}