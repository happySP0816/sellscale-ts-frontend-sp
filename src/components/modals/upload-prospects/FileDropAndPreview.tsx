
import {
  Anchor,
  Button,
  Group,
  Text,
  Paper,
  useMantineTheme,
  Avatar,
  Stack,
  Select,
  Collapse,
  Divider,
  Container,
  Center,
  ActionIcon,
  TextInput,
  Flex,
  Textarea,
  FocusTrap,
} from "@mantine/core";
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
import { showNotification } from "@mantine/notifications";
import {
  IconUpload,
  IconX,
  IconTrashX,
  IconFileDescription,
  IconChevronDown,
  IconChevronUp,
  IconPencil,
  IconPlus,
} from "@tabler/icons";
import { convertFileToJSON } from "@utils/fileProcessing";
import _ from "lodash";
import { DataTable } from "mantine-datatable";
import { useState } from "react";

const MAX_FILE_SIZE_MB = 2;
const PREVIEW_FIRST_N_ROWS = 5;
const PROSPECT_DB_COLUMNS = [
  'company',
  'company_url',
  'email',
  'first_name',
  'full_name',
  'industry',
  'last_name',
  'last_position',
  'linkedin_bio',
  'linkedin_url',
  'title',
  'twitter_url'
];

function determineColumns(fileJSON: any[]){
  if(fileJSON.length === 0) return [];
  return Object.keys(fileJSON[0]).filter((key) => key !== 'id').map((key) => {
    const convertedKey = convertColumn(key);
    return {
      width: 155,
      accessor: key,
      title: (
        <Stack>
          <Select
            defaultValue={PROSPECT_DB_COLUMNS.includes(convertedKey) ? convertedKey : 'none'}
            data={[
              { label: '-', value: 'none'},
              ...PROSPECT_DB_COLUMNS.map((column) => {
                return {
                  label: _.startCase(column.replace('_', ' ')).replace('Url', 'URL'),
                  value: column,
                };
              }),
            ]}
          />
          <Text className="truncate">{key.trim()}</Text>
        </Stack>
      ),
    };
  });
}

function convertColumn(columnName: string){
  return columnName.trim().toLowerCase().replace(/[\_\ \-\~\.\+]+/g, '_');
}

export default function FileDropAndPreview() {

  const theme = useMantineTheme();
  const [fileJSON, setFileJSON] = useState<any[] | null>(null);

  return (
    <>
      {!fileJSON && (
        <Dropzone
          loading={false}
          multiple={false}
          maxSize={MAX_FILE_SIZE_MB * 1024 ** 2}
          onDrop={async (files: any) => {
            const result = await convertFileToJSON(files[0]);
            if (result instanceof DOMException) {
              showNotification({
                id: "file-upload-error",
                title: `Error uploading file`,
                message: result.message,
                color: "red",
                autoClose: 5000,
              });
            } else {
              setFileJSON(result.map((row: any, index: number) => {
                return {
                  id: index,
                  ...row,
                };
              }));
            }
          }}
          onReject={(files: any) => {
            const error = files[0].errors[0];
            showNotification({
              id: "file-upload-error",
              title: `Error uploading file`,
              message: error.message,
              color: "red",
              autoClose: 5000,
            });
          }}
          accept={[MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.xlsx]}
        >
          <Group
            position="center"
            spacing="xl"
            style={{ minHeight: 220, pointerEvents: "none" }}
          >
            <Dropzone.Accept>
              <IconUpload
                size={80}
                stroke={1.5}
                color={
                  theme.colors[theme.primaryColor][
                    theme.colorScheme === "dark" ? 4 : 6
                  ]
                }
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                size={80}
                stroke={1.5}
                color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFileDescription size={80} stroke={1.5} />
            </Dropzone.Idle>

            <div>
              <Text align="center" size="xl" inline>
                Drag CSV or Excel file here (or click to select)
              </Text>
              <Text align="center" size="sm" color="dimmed" inline mt={7}>
                Attached file should not exceed {MAX_FILE_SIZE_MB}mb
              </Text>
            </div>
          </Group>
        </Dropzone>
      )}
      {fileJSON && (
        <Stack spacing={0} mah={500}>
          <Text fw={500} size='sm' pl={2}>Please map your file's columns to our system</Text>
          <DataTable
            highlightOnHover
            columns={determineColumns(fileJSON)}
            records={fileJSON.slice(0, PREVIEW_FIRST_N_ROWS)}
          />
          <Center pt={20}>
            <Button variant="outline" color="teal" onClick={() => {}}>
              Start Upload!
            </Button>
          </Center>
        </Stack>
      )}
    </>
  );
}
