import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
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
  HoverCard,
  List,
  LoadingOverlay,
} from "@mantine/core";
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
import { useForceUpdate } from "@mantine/hooks";
import { closeAllModals } from "@mantine/modals";
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
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

const MAX_FILE_SIZE_MB = 2;
const PREVIEW_FIRST_N_ROWS = 5;
const PROSPECT_DB_COLUMNS = [
  "company",
  "company_url",
  "email",
  "first_name",
  "full_name",
  "industry",
  "last_name",
  "last_position",
  "linkedin_bio",
  "linkedin_url",
  "title",
  "twitter_url",
];

function getDefaultColumnMappings(fileJSON: any[]) {
  const map = new Map<string, string>();
  if (fileJSON.length === 0) return map;
  Object.keys(fileJSON[0])
    .filter((key) => key !== "id")
    .forEach((key) => {
      const convertedKey = convertColumn(key);
      const defaultValue = PROSPECT_DB_COLUMNS.includes(convertedKey)
        ? convertedKey
        : "none";
      map.set(key.trim(), defaultValue);
    });
  return map;
}

function determineColumns(
  columnMappings: Map<string, string>,
  setColumnMappings: React.Dispatch<React.SetStateAction<Map<string, string>>>,
  fileJSON: any[]
) {
  if (fileJSON.length === 0) return [];
  return Object.keys(fileJSON[0])
    .filter((key) => key !== "id")
    .map((key) => {
      return {
        width: 155,
        accessor: key,
        title: (
          <Stack>
            <Select
              value={columnMappings.get(key.trim())}
              data={[
                { label: "-", value: "none" },
                ...PROSPECT_DB_COLUMNS.map((column) => {
                  return {
                    label: _.startCase(column.replace("_", " ")).replace(
                      "Url",
                      "URL"
                    ),
                    value: column,
                  };
                }),
              ]}
              onChange={(value) => {
                setColumnMappings((prev) => {
                  const newMap = new Map(prev);
                  newMap.set(key.trim(), value ? value : "none");
                  return newMap;
                });
              }}
            />
            <Text className="truncate">{key.trim()}</Text>
          </Stack>
        ),
      };
    });
}

function convertColumn(columnName: string) {
  return columnName
    .trim()
    .toLowerCase()
    .replace(/[\_\ \-\~\.\+]+/g, "_");
}

async function makePersona(userToken: string, name: string, ctas: string[]) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/client/archetype`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype: name,
        disable_ai_after_prospect_engaged: true,
      }),
    }
  );
  if (response.status === 401) {
    logout();
    return false;
  }
  if (response.status !== 200) {
    showNotification({
      id: "persona-create-not-okay",
      title: "Error",
      message: `Responded with: ${response.status}, ${response.statusText}`,
      color: "red",
      autoClose: false,
    });
    return false;
  }
  const res = await response.json().catch((error) => {
    console.error(error);
    showNotification({
      id: "persona-create-error",
      title: "Error",
      message: `Error: ${error}`,
      color: "red",
      autoClose: false,
    });
  });
  if (!res) {
    return false;
  }

  const personaId = res.client_archetype_id;
  for (const cta of ctas) {
    const success = await makeCTA(userToken, personaId, cta);
    if(!success) return false;
  }

  return true;
}

async function makeCTA(userToken: string, personaId: string, cta: string) {
  const response = await fetch(
    `${process.env.REACT_APP_API_URI}/message_generation/create_cta`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        archetype_id: personaId,
        text_value: cta,
      }),
    }
  );
  if (response.status === 401) {
    logout();
    return false;
  }
  if (response.status !== 200) {
    showNotification({
      id: "cta-create-not-okay",
      title: "Error",
      message: `Responded with: ${response.status}, ${response.statusText}`,
      color: "red",
      autoClose: false,
    });
    return false;
  }
  const res = await response.json().catch((error) => {
    console.error(error);
    showNotification({
      id: "cta-create-error",
      title: "Error",
      message: `Error: ${error}`,
      color: "red",
      autoClose: false,
    });
  });
  return res != null;
}

type FileDropAndPreviewProps = {
  personaId: string | null;
  createPersona?: {
    name: string;
    ctas: string[];
  };
};

// personaId is null if creating a new persona
export default function FileDropAndPreview({
  personaId,
  createPersona,
}: FileDropAndPreviewProps) {

  const theme = useMantineTheme();
  const userToken = useRecoilValue(userTokenState);
  const [fileJSON, setFileJSON] = useState<any[] | null>(null);
  const [columnMappings, setColumnMappings] = useState<Map<string, string>>(
    new Map()
  );
  const [preUploading, setPreUploading] = useState(false);

  useEffect(() => {
    if (fileJSON) {
      setColumnMappings(getDefaultColumnMappings(fileJSON));
    }
  }, [fileJSON]);

  /**
   * Checks if the user can upload the file
   * @returns an array of strings, each string is a reason why the user can't upload
   */
  const checkCanUpload = () => {
    const hasScrapeTarget = Array.from(columnMappings.values()).some(
      (value) => {
        // Bug with Mantine? This should be returning the select value, but it's returning the label
        return value === "email" || value === "linkedin_url";
      }
    );
    // TODO: could check that the email and URLs are valid?

    const hasPersona = createPersona
      ? createPersona.name.length > 0
      : personaId !== null && personaId.length > 0;
    const hasCTA = createPersona ? createPersona.ctas.length > 0 : true;

    let failureReasons = [];
    if (!hasPersona) {
      failureReasons.push("Please select a persona to upload to.");
    }
    if (!hasCTA) {
      failureReasons.push(
        "Please create at least one CTA for your new persona."
      );
    }
    if (!hasScrapeTarget) {
      failureReasons.push(
        "Please map at least one column to a profile target (such as an email or LinkedIn URL)."
      );
    }

    return failureReasons;
  };

  const startUpload = async () => {
    if (checkCanUpload().length > 0) {
      return;
    }
    setPreUploading(true);

    console.log(createPersona);

    if(createPersona){
      const success = await makePersona(userToken, createPersona.name, createPersona.ctas);
      if(!success) {
        console.error("Failed to create persona & CTAs");
        return;
      }
    }

    console.log('Uploading prospects');
    // start uploading prospects
    // send notifcation in corner

    closeAllModals();
    setPreUploading(false);
    
  };

  return (
    <>
      <LoadingOverlay visible={preUploading} overlayBlur={2} />
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
              setFileJSON(
                result.map((row: any, index: number) => {
                  return {
                    id: index,
                    ...row,
                  };
                })
              );
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
          <Text fw={500} size="sm" pl={2}>
            Please map your file's columns to our system
          </Text>
          <DataTable
            mih={300}
            highlightOnHover
            columns={determineColumns(
              columnMappings,
              setColumnMappings,
              fileJSON
            )}
            records={fileJSON.slice(0, PREVIEW_FIRST_N_ROWS)}
          />
          <Center pt={20}>
            <HoverCard
              width={280}
              position="top"
              shadow="md"
              withArrow
              disabled={checkCanUpload().length === 0}
            >
              <HoverCard.Target>
                <Button
                  variant="outline"
                  color={checkCanUpload().length > 0 ? "red" : "teal"}
                  onClick={startUpload}
                >
                  Start Upload!
                </Button>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <List size="sm">
                  {checkCanUpload().map((reason, index) => (
                    <List.Item key={index}>{reason}</List.Item>
                  ))}
                </List>
              </HoverCard.Dropdown>
            </HoverCard>
          </Center>
        </Stack>
      )}
    </>
  );
}
