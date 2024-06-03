import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import { Avatar, Button, Flex, Group, Text, TextInput, Title, createStyles } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconBriefcase, IconSocial } from "@tabler/icons";
import { proxyURL } from "@utils/general";
import { createProspectFromLinkedinLink } from "@utils/requests/createProspectFromLinkedinLink";
import { getProspectByID } from "@utils/requests/getProspectByID";
import { useState } from "react";
import { useRecoilValue } from "recoil";
import { ProspectDetails } from "src";

const useStyles = createStyles((theme) => ({
  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
  },

  name: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },
}));

type LinkedInUrlUploadProps = {
  afterUpload: () => void;
}


export default function LinkedInURLUpload(props: LinkedInUrlUploadProps) {
  const { classes } = useStyles();
  
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);
  const currentProject = useRecoilValue(currentProjectState);

  const [url, setURL] = useState<string>("");
  const [prospectDetails, setProspectDetails] = useState<ProspectDetails>();

  const triggerUploadProspectFromLinkedInURL = async () => {
    setLoading(true);
    setProspectDetails(undefined);

    const result = await createProspectFromLinkedinLink(
      userToken,
      currentProject?.id || -1,
      url,
    )
    console.log('result', result)
    if (result.status === 'success') {
      showNotification({
        title: "Success",
        message: "Successfully uploaded prospect from LinkedIn URL",
        color: "green",
        autoClose: 3000,
      })
      setURL("");

      props.afterUpload();

      const prospectResponse = await getProspectByID(userToken, result?.data?.data?.prospect_id);
      if (prospectResponse.status === 'success') {
        setProspectDetails(prospectResponse.data satisfies ProspectDetails);
      }

      setLoading(false);
    } else {
      let message: any = result.message.split("Res: ")[1];
      message = JSON.parse(message);
      showNotification({
        title: "Error",
        message: message.message || "Could not upload. Double check profile URL and for duplicate entry.",
        color: "red",
        autoClose: 3000,
      })
      setLoading(false);
    }

    setLoading(false);
  }

  const linkedin_public_id = prospectDetails?.li.li_profile?.split('/in/')[1]?.split('/')[0] ?? '';

  return (
    <Flex w='100%' direction='column'>
      <TextInput
        placeholder="https://www.linkedin.com/in/..."
        label="LinkedIn URL"
        value={url}
        onChange={(event) => setURL(event.currentTarget.value)}
        withAsterisk
        error={
          url.length > 0 && !url.includes('linkedin.com/in/') && !url.includes('linkedin.com/sales/lead/') ?
            'Please submit a valid LinkedIn URL'
            :
            null
        }
        disabled={loading}
      />
      <Flex justify='flex-end'>
        <Button
          mt='md'
          disabled={!url || (url.length > 0 && !url.includes('linkedin.com/in/') && !url.includes('linkedin.com/sales/lead/'))}
          color='teal'
          w='128px'
          onClick={triggerUploadProspectFromLinkedInURL}
          loading={loading}
        >
          Upload
        </Button>
      </Flex>
      <Flex justify={'flex-end'}>
        {
          url.length > 0 && (url.includes('linkedin.com/in/') || url.includes('linkedin.com/sales/lead/')) &&
          <Text fz='xs' mt='xs'>
            Note: This may take upwards of 1 minute.
          </Text>
        }
      </Flex>

      {prospectDetails && (
        <Group noWrap spacing={10} align='flex-start' pt='xs'>
          <Avatar
            src={
              proxyURL(prospectDetails.details.profile_pic)
            }
            size={94}
            radius='md'
          />
          <div>
            <Title order={3}>
              {prospectDetails.details.full_name}
            </Title>

            <Group noWrap spacing={10} mt={3}>
              <IconBriefcase stroke={1.5} size={16} className={classes.icon} />
              <Text size='xs' color='dimmed'>
                {prospectDetails.details.title}
              </Text>
            </Group>

            <Group noWrap spacing={10} mt={5}>
              <IconSocial stroke={1.5} size={16} className={classes.icon} />
              <Text
                size='xs'
                color='dimmed'
                component='a'
                target='_blank'
                rel='noopener noreferrer'
                href={`https://www.linkedin.com/in/${linkedin_public_id}`}
              >
                linkedin.com/in/{linkedin_public_id}
              </Text>
            </Group>
          </div>
        </Group>
      )}

    </Flex>
  )
}
