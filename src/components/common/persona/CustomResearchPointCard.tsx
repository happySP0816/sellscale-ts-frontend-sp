import { userTokenState } from '@atoms/userAtoms';
import { Card, Container, Code, Button, Title, Text, Textarea, FileInput, rem } from '@mantine/core';
import { MIME_TYPES } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { IconUpload } from '@tabler/icons';
import { convertFileToJSON } from '@utils/fileProcessing';
import { isEmail, isLinkedInURL } from '@utils/general';
import uploadCustomResearchPoint from '@utils/requests/uploadCustomResearchPoint';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';

export default function CustomResearchPointCard(props: {}) {

  const userToken = useRecoilValue(userTokenState);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<File | null>();

  const complete = async () => {
    if (!value || !description) {
      return;
    }

    const result = await convertFileToJSON(value);
    if (result instanceof DOMException) {
      showNotification({
        id: 'file-upload-error',
        title: `Error uploading file`,
        message: result.message,
        color: 'red',
        autoClose: 5000,
      });
      return;
    }

    // show notification in progress
    showNotification({
      id: 'file-upload-in-progress',
      title: `Uploading file`,
      message: `Please wait while we process your file`,
      color: 'blue',
      autoClose: 5000,
    });

    const entries = [];
    for(const row of result) {

      const email = Object.values(row).find((value) => isEmail(value as string));
      const li_url = Object.values(row).find((value) => isLinkedInURL(value as string));
      if (!email && !li_url) {
        continue;
      }

      const custom_data_key = Object.keys(row).find((key) => (key.toLowerCase().trim() === 'custom_data'));
      let custom_data_value = null;
      if (custom_data_key) {
        custom_data_value = row[custom_data_key];
      } else {
        continue;
      }

      entries.push({
        email: email as string,
        li_url: li_url as string,
        value: custom_data_value as string,
      });
    }

    if (entries.length === 0) {
      showNotification({
        id: 'file-upload-error',
        title: `Error uploading file`,
        message: `No LinkedIn URL / email or 'custom_data' column found in file`,
        color: 'red',
        autoClose: 5000,
      });
      return;
    }

    const response = await uploadCustomResearchPoint(userToken, description, entries);
    // show notification about uploading entries.length points
    showNotification({
      id: 'file-upload-in-progress',
      title: `Uploading file`,
      message: `Please wait while we process your file with ${entries.length} entries`,
      color: 'blue',
      autoClose: 5000,
    });
    if (response.status === 'success') {
      showNotification({
        id: 'file-upload-success',
        title: `Custom Data Point Added`,
        message: `Please allow some time for it to propagate through our systems! It may take a few minutes.`,
        color: 'blue',
        autoClose: 5000,
      });
    } else {
      showNotification({
        id: 'file-upload-error',
        title: `Error uploading file`,
        message: `Unknown error occurred, please try again later`,
        color: 'red',
        autoClose: 5000,
      });
    }

  };

  return (
    <Card pl='sm' pr='sm' mt='md' mr='md'>
      <Container>
        <Title order={3}>Import Custom Data Point</Title>
        <Text size='sm'>
          Create a CSV with a LinkedIn URL or email and a <Code>custom_data</Code> field. This is used to add an
          additional data point to your prospects.
        </Text>
      </Container>
      <Container>
        <Textarea
          placeholder='What does your custom data represent or describe?'
          label='Description'
          withAsterisk
          value={description}
          onChange={(event) => {
            setDescription(event.currentTarget.value);
          }}
        />

        <FileInput
          label='Upload File'
          icon={<IconUpload size={rem(14)} />}
          accept={[MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.xlsx, 'text/tsv', 'text/tab-separated-values'].join()}
          withAsterisk
          value={value}
          onChange={setValue}
        />

        <Button
          size='md'
          color='blue'
          mt='md'
          mb='sm'
          onClick={async () => {
            await complete();
          }}
        >
          Add Custom Data Point
        </Button>
      </Container>
    </Card>
  );
}
