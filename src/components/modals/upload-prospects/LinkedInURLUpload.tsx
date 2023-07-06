import { userTokenState } from "@atoms/userAtoms";
import { Button, Flex, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { createProspectFromLinkedinLink } from "@utils/requests/createProspectFromLinkedinLink";
import { useState } from "react";
import { useRecoilValue } from "recoil";


type LinkedInUrlUploadProps = {
  archetypeID: number;
  afterUpload: () => void;
}


export default function LinkedInURLUpload(props: LinkedInUrlUploadProps) {
  const userToken = useRecoilValue(userTokenState);
  const [loading, setLoading] = useState(false);

  const [url, setURL] = useState<string>("");

  const triggerUploadProspectFromLinkedInURL = async () => {
    setLoading(true);

    const result = await createProspectFromLinkedinLink(
      userToken,
      props.archetypeID,
      url,
    )
    if (result.status === 'success') {
      showNotification({
        title: "Success",
        message: "Successfully uploaded prospect from LinkedIn URL",
        color: "green",
        autoClose: 3000,
      })
      setURL("");

      props.afterUpload();
      setLoading(false);
    } else {
      showNotification({
        title: "Error",
        message: result.message || "Could not upload. Double check profile URL and for duplicate entry.",
        color: "red",
        autoClose: 3000,
      })
      setLoading(false);
    }

    setLoading(false);
  }

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


    </Flex>
  )
}
