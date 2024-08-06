import { userTokenState } from "@atoms/userAtoms";
import { logout } from "@auth/core";
import FlexSeparate from "@common/library/FlexSeparate";
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
  Title, Table, Checkbox, Space, Modal, Accordion,
} from "@mantine/core";
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
import {useDisclosure, useForceUpdate } from "@mantine/hooks";
import { closeAllModals, openConfirmModal } from "@mantine/modals";
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
import createPersona from "@utils/requests/createPersona";
import uploadProspects, {getDuplicateProspects} from "@utils/requests/uploadProspects";
import _ from "lodash";
import { DataTable } from "mantine-datatable";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { QueryCache } from "@tanstack/react-query";
import { MaxHeap } from "@datastructures-js/heap";
import {CHECKBOX} from "html2canvas/dist/types/dom/replaced-elements/input-element-container";

const MAX_FILE_SIZE_MB = 2;
const PREVIEW_FIRST_N_ROWS = 5;
const PROSPECT_DB_COLUMNS = [
  "company",
  "full_name",
  "first_name",
  "last_name",
  "title",
  "override",
  "linkedin_url",
];

function findBestPreviewRows(fileJSON: any[], previewAmount: number) {

  // Sort the file rows by the number of columns they have
  const mostColumns = new MaxHeap((row: any) => Object.keys(row).length);
  fileJSON.forEach((row) => mostColumns.insert(row));

  // Get the top N rows with the most columns
  const bestRows = [];
  for (let i = 0; i < previewAmount; i++) {
    const row = mostColumns.pop();
    if(row) {
      bestRows.push(row);
    }
  }
  return bestRows;
}

function getDefaultColumnMappings(fileJSON: any[]) {
  const map = new Map<string, string>();
  if (fileJSON.length === 0) return map;
  Object.keys(findBestPreviewRows(fileJSON, 1)[0] || {})
    .filter((key) => key !== "id")
    .forEach((key) => {
      const convertedKey = convertColumn(key);
      const defaultValue = PROSPECT_DB_COLUMNS.includes(convertedKey)
        ? convertedKey
        : "none";
      map.set(key.trim(), defaultValue);
    });
  map.set("override", "override");
  return map;
}

function determineColumns(
  columnMappings: Map<string, string>,
  setColumnMappings: React.Dispatch<React.SetStateAction<Map<string, string>>>,
  fileJSON: any[]
) {
  if (fileJSON.length === 0) return [];
  return Object.keys(findBestPreviewRows(fileJSON, 1)[0] || {})
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
                { label: "-", value: "none", group: "Skipped" },
                ...PROSPECT_DB_COLUMNS.map((column) => {
                  return {
                    label: _.startCase(column.replace("_", " ")).replace(
                      "Url",
                      "URL"
                    ),
                    value: column,
                    group:
                      column === "full_name" || column === "company"
                        ? "Required Fields"
                        : "Additional Fields",
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
        render: (value: any) => {
          return <Text sx={{ wordBreak: "break-word" }}>{_.truncate(value[key], {length: 60})}</Text>;
        },
      };
    });
}

function convertColumn(columnName: string) {
  return columnName
    .trim()
    .toLowerCase()
    .replace(/[\_\ \-\~\.\+]+/g, "_");
}

type FileDropAndPreviewProps = {
  personaId: string | null;
  createPersona?: {
    name: string;
    ctas: string[];
    description: string;
    fitReason: string;
    icpMatchingPrompt: string;
    contactObjective: string;
    contractSize: number;
  };
  onUploadSuccess?: (archetypeId: number) => void;
  onUploadFailure?: () => void;
  segmentId?: number | null;
};

// personaId is null if creating a new persona
export default function FileDropLinkedinURLFinderPreview(props: FileDropAndPreviewProps) {
  const theme = useMantineTheme();
  const queryClient = useQueryClient();
  const userToken = useRecoilValue(userTokenState);
  const [fileJSON, setFileJSON] = useState<any[] | null>(null);
  const [columnMappings, setColumnMappings] = useState<Map<string, string>>(
    new Map()
  );

  const [duplicateProspects, setDuplicateProspects] = useState<any[] | null>(null);

  const [preUploading, setPreUploading] = useState(false);
  const queryCache = new QueryCache();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fileJSON) {
      setColumnMappings(getDefaultColumnMappings(fileJSON));
    }
  }, [fileJSON]);

  useEffect(() => {
    if (fileJSON && columnMappings) {
      getDupProspects();
    }
  }, [fileJSON, columnMappings])


  console.log('duplicateProspects', duplicateProspects);

  const setOverrideAll = (override: boolean, same_archetype: boolean) => {
    if (duplicateProspects) {
      setDuplicateProspects(prevState => prevState!.map((prospect) => {
        if (same_archetype) {
          if (prospect.same_archetype) {
            return {...prospect, override: override}
          }

          return prospect;
        }
        else {
          if (!prospect.same_archetype) {
            return {...prospect, override: override}
          }

          return prospect;
        }
      }))
    }
  }

  const getDupProspects = async () => {
    if (checkCanUpload().length === 0) {
      setLoading(true);
      const uploadJSON = (fileJSON as any[])
        .map((row) => {
          const mappedRow = {};
          // Only include columns that are mapped to a prospect db column
          Object.keys(row)
            .filter((key) =>
              PROSPECT_DB_COLUMNS.includes(
                columnMappings.get(key.trim()) as string
              )
            )
            .forEach((key) => {
              // Use the mapped prospect db column intead of the original column name
              // @ts-ignore
              mappedRow[columnMappings.get(key.trim())] = row[key];
            });
          return mappedRow;
          // Remove prospects that don't have a linkedin_url or email column
        })
        .filter((row: any) => row.linkedin_url || row.email || (row.company && row.full_name) || (row.company && row.first_name && row.last_name));

      const data = await getDuplicateProspects(userToken, uploadJSON ?? [], props.personaId ? +props.personaId : undefined);

      setDuplicateProspects(data.data.data);
      setLoading(false);
    }
  }

  const checkCanUpload = () => {
    const hasScrapeTarget = Array.from(columnMappings.values()).some(
      (value) => {
        return value === "linkedin_url" || value === "email";
      }
    );
    // TODO: could check that the email and URLs are valid?

    const hasPersona = props.createPersona
      ? props.createPersona.name.length > 0
      : props.personaId !== null && props.personaId.length > 0;
    const hasCTA = props.createPersona
      ? props.createPersona.ctas.length > 0
      : true;

    let failureReasons = [];
    if (!hasPersona) {
      failureReasons.push("Please select a persona to upload to.");
    }
    /*
    if (!hasCTA) {
      failureReasons.push(
        "Please create at least one CTA for your new persona."
      );
    }
    */
    if (!hasScrapeTarget) {
      if (!["full_name", "company"].every((column) => {
        return Array.from(columnMappings.values()).includes(column)
      }) && !["first_name", "last_name", "company"].every((column) => {
        return Array.from(columnMappings.values()).includes(column)
      })) {
        failureReasons.push(
          "Please map at least First name, last name or full name, and company columns."
        );
      }
    }

    return failureReasons;
  };

  const startUpload = async () => {
    setPreUploading(true);

    let archetype_id = props.personaId;
    if (props.createPersona) {
      const result = await createPersona(
        userToken,
        props.createPersona.name,
        props.createPersona.ctas,
        {
          fitReason: props.createPersona.fitReason,
          icpMatchingPrompt: props.createPersona.icpMatchingPrompt,
          contactObjective: props.createPersona.contactObjective,
          contractSize: props.createPersona.contractSize,
          template_mode: false,
        }
      );
      if (result.status === "error") {
        console.error("Failed to create persona & CTAs");
        return;
      }
      archetype_id = result.data;
    }

    const modifiedJSON = fileJSON?.map((prospect) => {
      const duplicate = duplicateProspects?.find(dup => dup.row === prospect.id);

      if (duplicate) {
        return {...prospect, override: duplicate.override};
      }

      return prospect;
    });

    const uploadJSON = (modifiedJSON as any[])
      .map((row) => {
        const mappedRow = {};
        // Only include columns that are mapped to a prospect db column
        Object.keys(row)
          .filter((key) =>
            PROSPECT_DB_COLUMNS.includes(
              columnMappings.get(key.trim()) as string
            )
          )
          .forEach((key) => {
            // Use the mapped prospect db column intead of the original column name
            // @ts-ignore
            mappedRow[columnMappings.get(key.trim())] = row[key];
          });
        return mappedRow;
        // Remove prospects that don't have a linkedin_url or email column
      })
      .filter((row: any) => row.linkedin_url || row.email || (row.company && row.full_name) || (row.company && row.first_name && row.last_name));


    const result = await uploadProspects(
      +(archetype_id as string),
      userToken,
      uploadJSON,
      props.segmentId
    );
    if (result.status === "error") {
      console.error("Failed to start prospects upload");
      showNotification({
        id: "uploading-prospects-failed",
        title: result.title,
        message: result.message,
        color: "red",
        autoClose: false,
      });
      setPreUploading(false);
      if (props.onUploadFailure) {
        props.onUploadFailure();
      }
      return;
    }

    showNotification({
      id: "uploading-prospects",
      loading: true,
      title: "Uploading prospects...",
      message: "Check the persona for progress",
      color: "teal",
      autoClose: 10000,
    });

    close();
    setPreUploading(false);
    // Invalidates the query for the personas data so that the new persona will be fetched
    queryClient.invalidateQueries({ queryKey: ["query-personas-data"] });
    queryCache.clear();

    if (props.onUploadSuccess) {
      props.onUploadSuccess(parseInt(archetype_id || '-1'));
    }
  };

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal  opened={opened} onClose={close} title="Ready To Upload?" size={'1100px'}>
        <LoadingOverlay visible={preUploading} />
        {duplicateProspects && duplicateProspects.length !== 0 &&<>
            <Text>We have found some prospects that are already added to your prospect database.</Text>
            <Text>Please check the prospects that you want to overwrite and move to your new segment/campaign.</Text>
            <Text>We will also reset the prospect's status</Text>
            <Space h={'xl'} />
            <Text>Click "Yes, let's do it! 🚀" whenever you are ready.</Text>
            <Space h={'xl'} />

            <Accordion variant={'separated'} defaultValue={'duplicate-different-archetypes'}>
                <Accordion.Item value={'duplicate-different-archetypes'}>
                    <Accordion.Control>Prospects from different campaigns</Accordion.Control>
                    <Accordion.Panel>
                        <Table>
                            <thead>
                            <tr>
                                <th>
                                    <Checkbox onChange={(event) => setOverrideAll(event.currentTarget.checked, false)}
                                              checked={duplicateProspects.filter(item => !item.same_archetype).every(item => item.override)}
                                    />
                                </th>
                                <th>Name</th>
                                <th>Company</th>
                                <th>Title</th>
                                <th>SDR</th>
                                <th>Segment</th>
                                <th>Campaign</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                              duplicateProspects.filter(prospect => !prospect.same_archetype).map((prospect) => {
                                return (
                                  <tr key={prospect.row}>
                                    <td>
                                      <Checkbox checked={prospect.override} onChange={(event) => {
                                        setDuplicateProspects(prevState => {
                                          return prevState!.map(item => {
                                            if (item.row === prospect.row) {
                                              return {...item, override: event.currentTarget.checked};
                                            }

                                            return item;
                                          })
                                        })
                                      }}/>
                                    </td>
                                    <td>
                                      {prospect.full_name}
                                    </td>
                                    <td>
                                      {prospect.company}
                                    </td>
                                    <td>
                                      {prospect.title}
                                    </td>
                                    <td>
                                      {prospect.sdr}
                                    </td>
                                    <td>
                                      {prospect.segment_title ?? "None"}
                                    </td>
                                    <td>
                                      {prospect.archetype}
                                    </td>
                                    <td>
                                      {prospect.status}
                                    </td>
                                  </tr>
                                )
                              })
                            }
                            </tbody>
                        </Table>
                    </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value={'duplicate-same-archetypes'}>
                    <Accordion.Control>Prospects from the current campaign</Accordion.Control>
                    <Accordion.Panel>
                        <Table>
                            <thead>
                            <tr>
                                <th>
                                    <Checkbox onChange={(event) => setOverrideAll(event.currentTarget.checked, true)}
                                              checked={duplicateProspects.filter(item => item.same_archetype).every(item => item.override)}
                                    />
                                </th>
                                <th>Name</th>
                                <th>Company</th>
                                <th>Title</th>
                                <th>SDR</th>
                                <th>Segment</th>
                                <th>Campaign</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                              duplicateProspects.filter(prospect => prospect.same_archetype).map((prospect) => {
                                return (
                                  <tr key={prospect.row}>
                                    <td>
                                      <Checkbox checked={prospect.override} onChange={(event) => {
                                        setDuplicateProspects(prevState => {
                                          return prevState!.map(item => {
                                            if (item.row === prospect.row) {
                                              return {...item, override: event.currentTarget.checked};
                                            }

                                            return item;
                                          })
                                        })
                                      }}/>
                                    </td>
                                    <td>
                                      {prospect.full_name}
                                    </td>
                                    <td>
                                      {prospect.company}
                                    </td>
                                    <td>
                                      {prospect.title}
                                    </td>
                                    <td>
                                      {prospect.sdr}
                                    </td>
                                    <td>
                                      {prospect.segment_title ?? "None"}
                                    </td>
                                    <td>
                                      {prospect.archetype}
                                    </td>
                                    <td>
                                      {prospect.status}
                                    </td>
                                  </tr>
                                )
                              })
                            }
                            </tbody>
                        </Table>
                    </Accordion.Panel>
                </Accordion.Item>

            </Accordion>
            {/*<Accordion>*/}

            {/*</Accordion>*/}

        </>}
        {duplicateProspects && duplicateProspects.length === 0 && <>
            <Text>We’re ready to process your file! Here’s the summary:</Text>
            <List withPadding>
              {Array.from(columnMappings.values())
                .filter((value) => {
                  return value === "linkedin_url" || value === "email";
                })
                .map((value) => convertColumn(value))
                .map((value) => (
                  <List.Item key={value}>
                    {value === "linkedin_url" ? (
                      <>
                        You’re uploading <b>LinkedIn</b> prospects
                      </>
                    ) : value === "email" ? (
                      <>
                        You’re uploading <b>email</b> prospects
                      </>
                    ) : (
                      ""
                    )}
                  </List.Item>
                ))}
            </List>
            <Text pt="xs">
                <>
                    You’re about to upload <b>{fileJSON?.length}</b> prospects.
                </>
            </Text>
            <Text fs="italic" pt="xs">
                Looks good?
            </Text>
        </>
        }
        <Space h={'96px'} />
        <Flex justify={'space-between'}>
          <Button onClick={() => {
            close();
            setOverrideAll(false, true);
            setOverrideAll(false, false);
          }} variant={'outline'} color={'gray'}>Skip All</Button>
          <Button onClick={() => startUpload()}>Override Selected 🚀</Button>
        </Flex>
      </Modal>
      {!fileJSON && (
        <Dropzone
          loading={false}
          multiple={false}
          maxSize={MAX_FILE_SIZE_MB * 1024 ** 2}
          onDrop={async (files: any) => {
            console.log(files)
            const result = await convertFileToJSON(files[0]);
            console.log(result)
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
          accept={[
            MIME_TYPES.csv,
            MIME_TYPES.xls,
            MIME_TYPES.xlsx,
            "text/tsv",
            "text/tab-separated-values",
          ]}
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
              <Table withColumnBorders>
                <thead>
                <tr>
                  <th>
                    Full Name
                  </th>
                  <th>
                    Company Name
                  </th>
                  <th>
                    Title
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr key={'example1'}>
                  <td>

                  </td>
                  <td>

                  </td>
                  <td>

                  </td>
                </tr>
                <tr key={'example2'}>
                  <td>

                  </td>
                  <td>

                  </td>
                  <td>

                  </td>
                </tr>
                </tbody>
              </Table>
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
          <FlexSeparate>
            <Text fw={500} size="sm" pl={2}>
              Please map your file's columns to our system
            </Text>
            <ActionIcon
              color="red"
              size="sm"
              onClick={() => {
                setFileJSON(null);
                setColumnMappings(new Map());
                setDuplicateProspects(null);
              }}
            >
              <IconTrashX size="0.875rem" />
            </ActionIcon>
          </FlexSeparate>
          <DataTable
            mih={300}
            highlightOnHover
            columns={determineColumns(
              columnMappings,
              setColumnMappings,
              fileJSON
            )}
            records={findBestPreviewRows(fileJSON, PREVIEW_FIRST_N_ROWS)}
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
                  onClick={() => {
                    if (checkCanUpload().length === 0) {
                      getDupProspects();
                      // openModal();
                      open();
                    }
                  }}
                  disabled={loading}
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
