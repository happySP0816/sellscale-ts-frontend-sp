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
import { ContextModalProps } from "@mantine/modals";
import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
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
import { DataTable } from "mantine-datatable";

const ddd = [
  { value: "react", label: "React" },
  { value: "ng", label: "Angular" },
];

export default function UploadProspectsModal({
  context,
  id,
  innerProps,
}: ContextModalProps) {
  const theme = useMantineTheme();
  const [personas, setPersonas] = useState(ddd);
  const defaultPersonas = useRef(ddd);

  const [createdPersona, setCreatedPersona] = useState('');
  const [openedCTAs, setOpenedCTAs] = useState(false);
  const [newCTAText, setNewCTAText] = useState("");
  const addCTAInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [ctas, setCTAs] = useState([
    {
      cta: `I would love to chat sometime!`,
      controls: { id: 0 },
    },
    {
      cta: `Would you be interested in chatting?`,
      controls: { id: 1 },
    },
  ]);

  const addNewCTA = () => {
    if (newCTAText.length > 0) {
      const cta = {
        cta: newCTAText,
        controls: {
          id: ctas.length > 0 ? ctas[ctas.length - 1].controls.id + 1 : 0,
        },
      };
      setCTAs((current) => [...current, cta]);
      setNewCTAText("");
    }
  };
  const deleteCTA = (id: number) => {
    setCTAs((current) => current.filter((cta) => cta.controls.id !== id));
  };
  const editCTA = (id: number) => {
    setNewCTAText(ctas.filter((cta) => cta.controls.id === id)[0].cta);
    deleteCTA(id);
    addCTAInputRef.current?.focus();
  };

  return (
    <Paper
      p={0}
      style={{
        position: "relative",
        backgroundColor: theme.colors.dark[7],
      }}
    >
      <Stack spacing="xl">
        <Select
          label="Choose a Persona"
          data={personas}
          placeholder="Select or create a persona for the prospects"
          nothingFound="Nothing found"
          searchable
          creatable
          clearable
          getCreateLabel={(query) => <><span style={{ fontWeight: 700 }}>New Persona: </span>{query}</>}
          onCreate={(query) => {
            const item = { value: query, label: query };
            setPersonas((current) => [...current, item]);
            setCreatedPersona(query);
            return item;
          }}
          onChange={(value) => {
            // If created persona exists and is one of the existing personas, clear it
            if(createdPersona.length > 0 && personas.filter((personas) => personas.value === value).length > 0) {
              setPersonas(defaultPersonas.current);
              setCreatedPersona('');
            }
          }}
        />

        {createdPersona.length > 0 && (
          <Container mx={2} my={0} p={0}>
            <Text
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => setOpenedCTAs((prev) => !prev)}
            >
              <Text>Call-to-Actions (CTAs)</Text>
              {openedCTAs ? (
                <IconChevronUp size={20} />
              ) : (
                <IconChevronDown size={20} />
              )}
            </Text>
            <Divider mb={0} />
            <Collapse in={openedCTAs}>
              <Text c="dimmed" fz="xs">
                If a LinkedIn message is generated using this persona, one of
                your CTAs will be randomly selected and added to the end of the
                message.
              </Text>
              {ctas.length > 0 && (
                <DataTable
                  highlightOnHover
                  columns={[
                    {
                      accessor: "cta",
                      title: "",
                    },
                    {
                      accessor: "controls",
                      title: "",
                      render: ({ controls }) => (
                        <Group position="right" spacing={0}>
                          <ActionIcon
                            color="blue"
                            variant="transparent"
                            onClick={() => editCTA(controls.id)}
                          >
                            <IconPencil size={18} />
                          </ActionIcon>
                          <ActionIcon
                            color="red"
                            variant="transparent"
                            onClick={() => deleteCTA(controls.id)}
                          >
                            <IconTrashX size={18} />
                          </ActionIcon>
                        </Group>
                      ),
                    },
                  ]}
                  records={ctas}
                />
              )}
              <Divider my={0} />
              <Flex justify="center" align="center">
                <div style={{ flex: "5 0 0" }}>
                  <Textarea
                    pl={8}
                    variant="unstyled"
                    placeholder="Write a new CTA"
                    autosize
                    minRows={1}
                    ref={addCTAInputRef}
                    onChange={(e) => setNewCTAText(e.currentTarget.value)}
                    value={newCTAText}
                  />
                </div>
                <Center style={{ flex: "1 0 0" }}>
                  <ActionIcon
                    sx={{ flex: "1 0 0" }}
                    color="green"
                    variant="transparent"
                    onClick={addNewCTA}
                  >
                    <IconPlus size={18} />
                  </ActionIcon>
                </Center>
              </Flex>
            </Collapse>
            <Divider mt={0} />
          </Container>
        )}

        <Dropzone
          loading={false}
          onDrop={(files: any) => console.log("accepted files", files)}
          onReject={(files: any) => console.log("rejected files", files)}
          accept={[MIME_TYPES.csv]}
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
                Drag CSV here or click to select file
              </Text>
              <Text align="center" size="sm" color="dimmed" inline mt={7}>
                Attach file should not exceed 2mb
              </Text>
            </div>
          </Group>
        </Dropzone>
      </Stack>
    </Paper>
  );
}
