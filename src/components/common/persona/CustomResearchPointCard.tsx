import { Card, Container, Code, Button, Title, Text, Textarea, FileInput, rem } from '@mantine/core';
import { MIME_TYPES } from '@mantine/dropzone';
import { showNotification } from '@mantine/notifications';
import { IconUpload } from '@tabler/icons';
import { convertFileToJSON } from '@utils/fileProcessing';
import { useState } from 'react';

export default function CustomResearchPointCard(props: {}) {
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

    console.log(result)
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
          placeholder='Any Excel, CSV or TSV file works'
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
