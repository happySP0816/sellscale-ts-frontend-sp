import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import DynamicRichTextArea from "@common/library/DynamicRichTextArea";
import { SCREEN_SIZES } from "@constants/data";
import {
  Badge,
  Box,
  Text,
  Flex,
  Grid,
  Button,
  Table,
  Switch,
  Card,
  ActionIcon,
  Tabs,
  Tooltip,
  TextInput,
  LoadingOverlay,
  Title,
  Accordion,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import CreateEmailSubjectLineModal from "@modals/CreateEmailSubjectLineModal";
import ManageEmailSubjectLineTemplatesModal from "@modals/ManageEmailSubjectLineTemplatesModal";
import { IconCheck, IconDatabase, IconEdit, IconPencil, IconPlus, IconReload, IconRobot, IconTrash, IconWritingSign, IconX } from "@tabler/icons";
import { JSONContent } from "@tiptap/react";
import { createEmailSequenceStep, patchSequenceStep } from "@utils/requests/emailSequencing";
import { patchEmailSubjectLineTemplate } from "@utils/requests/emailSubjectLines";
import DOMPurify from "dompurify";
import React, { FC, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { EmailSequenceStep, SubjectLineTemplate } from "src";


const DetailEmailSequencing: FC<{
  toggleDrawer: () => void,
  currentTab: string,
  templates: EmailSequenceStep[],
  subjectLines: SubjectLineTemplate[],
  refetch: () => Promise<void>
}> = ({
  toggleDrawer,
  currentTab,
  templates,
  subjectLines,
  refetch,
}) => {
    const lgScreenOrLess = useMediaQuery(
      `(max-width: ${SCREEN_SIZES.LG})`,
      false,
      { getInitialValueInEffect: true }
    );
    const currentProject = useRecoilValue(currentProjectState);
    if (!currentProject) return (<></>)

    // Create Subject Line
    const [createSubjectLineOpened, { open: openCreateSubject, close: closeCreateSubject }] = useDisclosure();

    const [activeTemplate, setActiveTemplate] = React.useState<EmailSequenceStep>();
    const [inactiveTemplates, setInactiveTemplates] = React.useState<EmailSequenceStep[]>([]);

    useEffect(() => {
      // Get active template, everything else goes into inactive
      const activeTemplate = templates.filter((template: EmailSequenceStep) => template.active)[0];
      const inactiveTemplates = templates.filter((template: EmailSequenceStep) => template.id != activeTemplate.id);

      setActiveTemplate(activeTemplate);
      setInactiveTemplates(inactiveTemplates);
    }, [templates])

    return (
      <Box mt="md">
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"}>
            <Text fw={700} size={"xl"}>
              Set First Message
            </Text>
          </Flex>
          {lgScreenOrLess && <Button onClick={toggleDrawer}>Open toggle</Button>}
        </Flex>

        <Box mt={"sm"}>
          <Text color="gray.6" size={"sm"} fw={600}>
            Configure your email sequencing
          </Text>
        </Box>

        <Box mt={"md"}>
          <Text color="gray.8" size={"md"} fw={700}>
            EXAMPLE EMAIL
          </Text>
          <Box
            mt="sm"
            px={"sm"}
            py={"md"}
            sx={(theme) => ({
              borderRadius: "12px",
              border: `1px dashed ${theme.colors.blue[5]}`,
            })}
            pos={"relative"}
          >
            <Button
              variant="light"
              pos={"absolute"}
              style={{ right: 20, top: 20 }}
              leftIcon={<IconReload></IconReload>}
            >
              REGENERATE
            </Button>
            <Flex>
              <Box w={80}>
                <Text color="gray.6" fw={500}>
                  Subject:
                </Text>
              </Box>
              <Box>
                <Text color="gray.8" fw={500} pr={200}>
                  {subjectLines && subjectLines.filter((subjectLine: SubjectLineTemplate) => subjectLine.active)[0]?.subject_line}
                </Text>
              </Box>
            </Flex>
            <Flex mt={"md"}>
              <Box w={80}>
                <Text color="gray.6" fw={500} pr={200}>
                  Body:
                </Text>
              </Box>
              <Flex direction={"column"} gap={"0.5rem"}>
                <Text color="gray.8" fw={500}>
                  Hi Richard
                </Text>
                <Text color="gray.8" fw={500}>
                  In working with other industry, on of the key issuse they're
                  struggling with is key issue.
                </Text>
                <Text color="gray.8" fw={500}>
                  All the best,
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Box>

        <Tabs defaultValue={currentTab === "PROSPECTED" ? "subject" : "body"} mt='sm'>
          <Tabs.List>
            {
              currentTab === "PROSPECTED" && (
                <Tabs.Tab value="subject">
                  Subject Lines
                </Tabs.Tab>
              )
            }

            <Tabs.Tab value="body">
              Body
            </Tabs.Tab>
          </Tabs.List>

          {
            currentTab === "PROSPECTED" && (
              <Tabs.Panel value="subject">
                <Flex direction='column' w='100%'>
                  <Flex justify='flex-end'>
                    <Button
                      mt='md'
                      variant='light'
                      leftIcon={<IconPlus size='.90rem' />}
                      radius={"sm"}
                      onClick={openCreateSubject}
                    >
                      Add Subject Line
                    </Button>
                    <CreateEmailSubjectLineModal
                      modalOpened={createSubjectLineOpened}
                      openModal={openCreateSubject}
                      closeModal={closeCreateSubject}
                      backFunction={() => {
                        refetch()
                      }}
                      archetypeID={currentProject.id}
                    />
                  </Flex>
                  {subjectLines.map((subjectLine: SubjectLineTemplate, index: any) => {
                    return (
                      <Box w={"100%"}>
                        <SubjectLineItem
                          key={subjectLine.id}
                          subjectLine={subjectLine}
                          refetch={async () => {
                            await refetch();
                          }}
                        />
                      </Box>
                    )
                  })}
                </Flex>
              </Tabs.Panel>
            )
          }


          <Tabs.Panel value="body">
            <Box mt={"md"}>

              {/* ACTIVE TEMPLATE */}
              {activeTemplate && (
                <EmailBodyItem
                  key={activeTemplate.id}
                  template={activeTemplate}
                  refetch={async () => {
                    await refetch();
                  }}
                />
              )}

              {/* INACTIVE TEMPLATES */}
              {inactiveTemplates && inactiveTemplates.length > 0 && (
                <Flex mt='md' w='100%'>
                  <Accordion w='100%'>
                    {inactiveTemplates.map((template: EmailSequenceStep, index: any) => {
                      return (
                        <Accordion.Item value={'test'}>
                          <Accordion.Control>
                            <Flex direction='row' w='100%' justify={'space-between'}>
                              <Flex direction='row' align='center'>
                                <Text fw={500}>
                                  {template.title}
                                </Text>
                              </Flex>
                              <Flex>
                                <Tooltip label='Coming Soon' withArrow withinPortal>
                                  <Text fz='sm' mr='md'>
                                    Open %: <b>TBD</b>
                                  </Text>
                                </Tooltip>
                                <Tooltip label='Coming Soon' withArrow withinPortal>
                                  <Text fz='sm'>
                                    Reply %: <b>TBD</b>
                                  </Text>
                                </Tooltip>
                              </Flex>
                            </Flex>

                          </Accordion.Control>
                          <Accordion.Panel>
                            <EmailBodyItem
                              key={template.id}
                              template={template}
                              refetch={async () => {
                                await refetch();
                              }}
                              hideHeader
                            />
                          </Accordion.Panel>
                        </Accordion.Item>
                      )
                    })}
                  </Accordion>
                </Flex>
              )}

            </Box>
          </Tabs.Panel>


        </Tabs>

      </Box>
    );
  };


const SubjectLineItem: React.FC<{
  subjectLine: SubjectLineTemplate,
  refetch: () => Promise<void>
}> = ({ subjectLine, refetch }) => {
  const [
    manageSubjectLineOpened,
    { open: openManageSubject, close: closeManageSubject },
  ] = useDisclosure();
  const userToken = useRecoilValue(userTokenState);

  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [editedSubjectLine, setEditedSubjectLine] = React.useState(subjectLine.subject_line);

  // Edit Subject Line
  const triggerPatchEmailSubjectLineTemplate = async () => {
    setLoading(true);

    const result = await patchEmailSubjectLineTemplate(
      userToken,
      subjectLine.id as number,
      editedSubjectLine,
      subjectLine.active
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      })
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: 'Successfully updated email subject line',
        color: 'green',
      })

      await refetch();
    }

    setLoading(false);
    return;
  }

  // Toggle Subject Line Active / Inactive
  const triggerPatchEmailSubjectLineTemplateActive = async () => {
    setLoading(true);

    const result = await patchEmailSubjectLineTemplate(
      userToken,
      subjectLine.id as number,
      subjectLine.subject_line,
      !subjectLine.active
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      })
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: `Successfully ${subjectLine.active ? 'deactivated' : 'activated'} email subject line`,
        color: 'green',
      })

      await refetch();
    }

    setLoading(false);
    return;
  }

  return (
    <Card
      mt='sm'
      shadow="xs"
      radius={"md"}
      py={10}
      mb={5}
      sx={(theme) => ({
        border: subjectLine.active
          ? "1px solid " + theme.colors.blue[4]
          : "1px solid transparent",
      })}
    >
      <LoadingOverlay visible={loading} />
      <Flex direction={"column"} w={"100%"}>
        <Flex gap={"0.5rem"} mb={"0.5rem"} justify={"space-between"}>
          <Flex>
            <Tooltip
              label={`Prospects: ${subjectLine.times_accepted} / ${subjectLine.times_used}`}
              withArrow
              withinPortal
            >
              <Button
                variant={'white'}
                size="xs"
                color={'blue'}
                h="auto"
                fz={"0.75rem"}
                py={"0.125rem"}
                px={"0.25rem"}
                fw={"400"}
              >
                Acceptance: {Math.max(Math.floor(subjectLine.times_accepted / subjectLine.times_used) || 0)}%
              </Button>
            </Tooltip>
          </Flex>

          <Flex wrap={"wrap"} gap={"1rem"} align={"center"}>
            {/* <Menu shadow="md" width={200} withinPortal withArrow>
                <Menu.Target>
                  <ActionIcon radius="xl" size="sm">
                    <IconPencil size="1.0rem" />
                  </ActionIcon>
                </Menu.Target>
  
                <Menu.Dropdown>
                  <Menu.Item icon={<IconEdit size={14} />} onClick={onClickEdit}>
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    icon={<IconTrash size={14} />}
                    onClick={onClickDelete}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu> */}
            <Tooltip
              label={subjectLine.times_used > 0 ? 'Cannot edit subject line after it has been used' : 'Edit subject line'}
              withinPortal
              withArrow
            >
              <ActionIcon
                size="sm"
                onClick={() => {
                  setEditing(!editing);
                }}
                disabled={subjectLine.times_used > 0}
              >
                <IconPencil size="1.0rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip
              label='Coming Soon'
              withinPortal
              withArrow
            >
              <ActionIcon
                size="sm"
                disabled={editing}
              >
                <IconTrash size="1.0rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip
              label={subjectLine.active ? 'Deactivate subject line' : 'Activate subject line'}
              withinPortal
              withArrow
            >
              <div>
                <Switch
                  disabled={editing}
                  checked={subjectLine.active}
                  color={"blue"}
                  size="xs"
                  onChange={({ currentTarget: { checked } }) => {
                    triggerPatchEmailSubjectLineTemplateActive();
                  }}
                />
              </div>
            </Tooltip>
          </Flex>
          <ManageEmailSubjectLineTemplatesModal
            modalOpened={manageSubjectLineOpened}
            openModal={openManageSubject}
            closeModal={closeManageSubject}
            backFunction={() => { }}
            archetypeID={subjectLine.client_archetype_id}
          />
        </Flex>

        {
          editing ? (
            <TextInput
              value={editedSubjectLine}
              rightSection={
                <Flex mr='150px'>
                  <Button
                    size='sm'
                    h='24px'
                    mr='4px'
                    color='red'
                    onClick={() => {
                      setEditedSubjectLine(subjectLine.subject_line);
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size='sm'
                    h='24px'
                    color='green'
                    onClick={() => {
                      triggerPatchEmailSubjectLineTemplate();
                      setEditing(false);
                    }}
                  >
                    Save
                  </Button>
                </Flex>
              }
              onChange={(e) => {
                setEditedSubjectLine(e.currentTarget.value);
              }}
            />
          ) : (
            <Text fw={"400"} fz={"0.9rem"} color={"gray.8"}>
              {editedSubjectLine}
            </Text>
          )
        }
      </Flex>
    </Card >
  )
}


const EmailBodyItem: React.FC<{
  template: EmailSequenceStep,
  refetch: () => Promise<void>,
  hideHeader?: boolean
}> = ({ template, refetch, hideHeader }) => {
  const userToken = useRecoilValue(userTokenState);
  const currentProject = useRecoilValue(currentProjectState);

  if (!currentProject) return (<></>)

  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [sequence, _setSequence] = React.useState<string>(template.template || '');
  const sequenceRichRaw = React.useRef<JSONContent | string>(template.template || '');

  const triggerPatchEmailBodyTemplate = async () => {
    setLoading(true)

    const result = await patchSequenceStep(
      userToken,
      template.id,
      template.overall_status,
      template.title,
      sequence,
      template.bumped_count,
      template.default
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      })
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: 'Successfully updated email body',
        color: 'green',
      })

      await refetch();
    }

    setLoading(false);
  }

  const triggerToggleEmailBodyTemplateActive = async () => {
    setLoading(true)

    const result = await patchSequenceStep(
      userToken,
      template.id,
      template.overall_status,
      template.title,
      template.template,
      template.bumped_count,
      !template.default
    );
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      })
      setLoading(false);
      return;
    } else {
      showNotification({
        title: 'Success',
        message: `Successfully ${template.default ? 'deactivated' : 'activated'} email body`,
        color: 'green',
      })

      await refetch();
    }

    setLoading(false);
  }

  useEffect(() => {
    setEditing(false);
    _setSequence(template.template || '')
    sequenceRichRaw.current = template.template || '';
  }, [template])

  return (
    <Flex w='100%'>
      <LoadingOverlay visible={loading} />
      <Flex direction='column' w='100%'>
        {
          hideHeader ? (
            <Flex justify={'flex-end'} mb='md'>

              <div>
                <Button
                  variant='light'
                  disabled={editing}
                  color={"green"}
                  size="xs"
                  onClick={() => {
                    triggerToggleEmailBodyTemplateActive();
                  }}
                >
                  {template.default ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </Flex>
          ) : (
            <Flex mb='sm' direction='row' w='100%' justify={'space-between'}>
              <Flex align='center'>
                <Title order={4}>
                  {template.title}
                </Title>
              </Flex>
              <Flex align='center'>
                <Tooltip label='Coming Soon' withArrow withinPortal>
                  <Text fz='sm' mr='md'>
                    Open %: <b>TBD</b>
                  </Text>
                </Tooltip>
                <Tooltip label='Coming Soon' withArrow withinPortal>
                  <Text fz='sm' mr='md'>
                    Reply %: <b>TBD</b>
                  </Text>
                </Tooltip>
                <Tooltip
                  label={template.default ? 'Deactivate template' : 'Activate template'}
                  withinPortal
                  withArrow
                >
                  <div>
                    <Switch
                      disabled={editing}
                      checked={template.default}
                      color={"blue"}
                      size="xs"
                      onChange={({ currentTarget: { checked } }) => {
                        triggerToggleEmailBodyTemplateActive();
                      }}
                    />
                  </div>
                </Tooltip>
              </Flex>
            </Flex>
          )
        }

        {
          editing ? (
            <>
              <Box>
                <DynamicRichTextArea
                  height={400}
                  onChange={(value, rawValue) => {
                    sequenceRichRaw.current = rawValue;
                    _setSequence(value);
                  }}
                  value={sequenceRichRaw.current}
                  signifyCustomInsert={false}
                  inserts={[
                    {
                      key: "first_name",
                      label: "First Name",
                      icon: <IconWritingSign stroke={1.5} size="0.9rem" />,
                      color: "blue",
                    },
                    {
                      key: "last_name",
                      label: "Last Name",
                      icon: <IconRobot stroke={2} size="0.9rem" />,
                      color: "red",
                    },
                    {
                      key: "company_name",
                      label: "Company Name",
                      icon: <IconDatabase stroke={2} size="0.9rem" />,
                      color: "teal",
                    }
                  ]}
                />
              </Box>
              <Flex mt='sm' justify={'flex-end'}>
                <Button
                  mr='sm'
                  color='red'
                  onClick={() => {
                    _setSequence(template.template || '');
                    sequenceRichRaw.current = template.template || '';
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  color='green'
                  onClick={() => {
                    triggerPatchEmailBodyTemplate();
                    setEditing(false);
                  }}
                >
                  Save
                </Button>
              </Flex>
            </>
          ) : (
            <Box
              sx={() => ({
                border: "1px solid #E0E0E0",
                borderRadius: "8px",
                backgroundColor: "#F5F5F5",
              })}
              px="md"
            >
              <Text fz="sm">
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(sequence),
                  }}
                />
              </Text>
              <Flex h='0px' w='100%'>
                <Button
                  leftIcon={<IconEdit size='1.0rem' />}
                  variant='outline'
                  pos='relative'
                  bottom='50px'
                  left='88%'
                  h='32px'
                  onClick={() => {
                    setEditing(true);
                  }}
                >
                  Edit
                </Button>
              </Flex>
            </Box>
          )
        }
      </Flex>
    </Flex>
  )
}


export default DetailEmailSequencing;
