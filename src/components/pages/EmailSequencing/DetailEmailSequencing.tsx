import { currentProjectState } from "@atoms/personaAtoms";
import { userTokenState } from "@atoms/userAtoms";
import DynamicRichTextArea from "@common/library/DynamicRichTextArea";
import ProspectSelect from "@common/library/ProspectSelect";
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
  Loader,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import CreateEmailSubjectLineModal from "@modals/CreateEmailSubjectLineModal";
import EmailSequenceStepModal from "@modals/EmailSequenceStepModal";
import ManageEmailSubjectLineTemplatesModal from "@modals/ManageEmailSubjectLineTemplatesModal";
import { IconCheck, IconDatabase, IconEdit, IconPencil, IconPlus, IconReload, IconRobot, IconTrash, IconWritingSign, IconX } from "@tabler/icons";
import { JSONContent } from "@tiptap/react";
import { postGenerateFollowupEmail, postGenerateInitialEmail } from "@utils/requests/emailMessageGeneration";
import { createEmailSequenceStep, patchSequenceStep } from "@utils/requests/emailSequencing";
import { patchEmailSubjectLineTemplate } from "@utils/requests/emailSubjectLines";
import DOMPurify from "dompurify";
import React, { FC, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { EmailSequenceStep, SubjectLineTemplate } from "src";


let initialEmailGenerationController = new AbortController();
let followupEmailGenerationController = new AbortController();


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
    const userToken = useRecoilValue(userTokenState);
    const currentProject = useRecoilValue(currentProjectState);
    if (!currentProject) return (<></>)

    // Page Title
    const [pageTitle, setPageTitle] = React.useState<string>("Email Sequencing");

    // Create Subject Line / Email Template
    const [createSubjectLineOpened, { open: openCreateSubject, close: closeCreateSubject }] = useDisclosure();
    const [createEmailTemplateOpened, { open: openCreateEmailTemplate, close: closeCreateEmailTemplate }] = useDisclosure();

    // Active vs Inactive Body Templates
    const [activeTemplate, setActiveTemplate] = React.useState<EmailSequenceStep>();
    const [inactiveTemplates, setInactiveTemplates] = React.useState<EmailSequenceStep[]>([]);

    // Preview Email (Generation)
    const [prospectID, setProspectID] = React.useState<number>(0);
    const [previewEmailSubject, setPreviewEmailSubject] = React.useState<string | null>('Random Subject Line');
    const [previewEmailBody, setPreviewEmailBody] = React.useState<string | null>('Random Email Body');
    const [initialEmailLoading, setInitialEmailLoading] = React.useState<boolean>(false);
    const [followupEmailLoading, setFollowupEmailLoading] = React.useState<boolean>(false);

    // Trigger Generate Initial Email
    const triggerPostGenerateInitialEmail = async () => {
      if (!prospectID || !subjectLines || subjectLines.length === 0 || currentTab !== "PROSPECTED") { return; }

      setInitialEmailLoading(true);

      try {
        const activeSubjectLines = subjectLines.filter((subjectLine: SubjectLineTemplate) => subjectLine.active)
        const randomSubjectLineID = activeSubjectLines[Math.floor(Math.random() * activeSubjectLines.length)].id

        const response = await postGenerateInitialEmail(
          userToken,
          prospectID,
          activeTemplate?.id as number,
          null,
          randomSubjectLineID as number,
          null,
          initialEmailGenerationController
        )
        if (response.status === 'success') {
          const email_body = response.data.email_body
          const subject_line = response.data.subject_line
          if (!email_body || !subject_line) {
            showNotification({
              title: 'Error',
              message: 'Something went wrong with generation, please try again.',
              icon: <IconX radius='sm' />,
            });
          }

          setPreviewEmailSubject(subject_line.completion)
          setPreviewEmailBody(email_body.completion)
        }

        setInitialEmailLoading(false);
      } catch (error) {  // Must have been aborted. No action needed
        if (currentTab !== "PROSPECTED") {
          setInitialEmailLoading(false);
        }
        console.log('Generation aborted')
      }

    }

    // Trigger Generate Followup Email
    const triggerPostGenerateFollowupEmail = async () => {
      if (!prospectID || currentTab === "PROSPECTED") { return; }

      setFollowupEmailLoading(true);

      try {
        const response = await postGenerateFollowupEmail(
          userToken,
          prospectID,
          null,
          activeTemplate?.id as number,
          null,
          followupEmailGenerationController
        )
        if (response.status === 'success') {
          const email_body = response.data.email_body
          if (!email_body) {
            showNotification({
              title: 'Error',
              message: 'Something went wrong with generation, please try again.',
              icon: <IconX radius='sm' />,
            });
          }
          setPreviewEmailBody(email_body.completion)
        }

        setFollowupEmailLoading(false);
      } catch (error) {  // Must have been aborted. No action needed
        if (currentTab !== "PROSPECTED") {
          setFollowupEmailLoading(false);
        }
        setFollowupEmailLoading(true)
        console.log('Generation aborted')
      }

    }

    // Trigger Generation Router
    const triggerGenerateEmail = () => {
      // setPreviewEmailSubject('Random Subject Line');
      // setPreviewEmailBody('Random Email Body');
      followupEmailGenerationController.abort("Creating a new generation request");
      initialEmailGenerationController.abort("Creating a new generation request");

      followupEmailGenerationController = new AbortController();
      initialEmailGenerationController = new AbortController();

      if (currentTab === "PROSPECTED") {
        triggerPostGenerateInitialEmail();
      } else {
        triggerPostGenerateFollowupEmail();
      }
    }

    // Trigger Generation
    useEffect(() => {
      triggerGenerateEmail();
    }, [prospectID, activeTemplate, subjectLines])

    // Set Active / Inactive Templates
    useEffect(() => {
      // Get active template, everything else goes into inactive
      const activeTemplate = templates.filter((template: EmailSequenceStep) => template.active)[0];
      const inactiveTemplates = templates.filter((template: EmailSequenceStep) => template.id != activeTemplate.id);

      setActiveTemplate(activeTemplate);
      setInactiveTemplates(inactiveTemplates);
    }, [templates])

    useEffect(() => {
      setPreviewEmailBody(null)
      setPreviewEmailSubject(null)

      if (currentTab === "PROSPECTED") {
        setPageTitle("Initial Email");
      } else if (currentTab === "ACCEPTED") {
        setPageTitle("First Follow Up Email");
      } else if (currentTab.includes("BUMPED-")) {
        const bumpCount = currentTab.split("-")[1];
        const bumpToFollowupMap: Record<string, string> = {
          "1": "Second",
          "2": "Third",
          "3": "Fourth",
          "4": "Fifth",
          "5": "Sixth",
          "6": "Seventh",
          "7": "Eighth",
        };
        setPageTitle(`${bumpToFollowupMap[bumpCount]} Follow Up Email`);
      }
    }, [currentTab])


    const EmailBodySection = () => (
      <Box mt={"md"}>
        <Flex justify='flex-end' mb='md'>
          <Button
            variant='light'
            leftIcon={<IconPlus size='.90rem' />}
            radius={"sm"}
            onClick={openCreateEmailTemplate}
          >
            Add Email Template
          </Button>
          <EmailSequenceStepModal
            modalOpened={createEmailTemplateOpened}
            openModal={openCreateEmailTemplate}
            closeModal={closeCreateEmailTemplate}
            type={"CREATE"}
            backFunction={() => {
              refetch()
            }}
            isDefault={true}
            status={currentTab.includes("BUMPED-") ? "BUMPED" : currentTab}
            archetypeID={currentProject.id}
            bumpedCount={currentTab.includes("BUMPED-") ? parseInt(currentTab.split("-")[1]) : null}
            onFinish={async (
              title: any,
              sequence: any,
              isDefault: any,
              status: any,
              substatus: any
            ) => {
              const result = await createEmailSequenceStep(
                userToken,
                currentProject.id,
                status ?? "",
                title,
                sequence,
                currentTab.includes("BUMPED-") ? parseInt(currentTab.split("-")[1]) : null,
                isDefault,
                substatus
              );
              return result.status === "success";
            }}
          />
        </Flex>

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
    )

    return (
      <Box mt="md">
        <Flex align={"center"} justify={"space-between"}>
          <Flex align={"center"}>
            <Text fw={700} size={"xl"}>
              Set {pageTitle}
            </Text>
          </Flex>
          {lgScreenOrLess && <Button onClick={toggleDrawer}>Open toggle</Button>}
        </Flex>

        <Box mt={"sm"}>
          <Text color="gray.6" size={"sm"} fw={600}>
            Select an email and a body.
          </Text>
        </Box>

        <Box mt={"md"}>
          <Flex align='center' justify='space-between'>
            <Flex>
              <Text color="gray.8" size={"md"} fw={700}>
                EXAMPLE EMAIL
              </Text>
            </Flex>
            <Flex align='center'>
              <Button
                mr='sm'
                size="sm"
                variant="subtle"
                compact
                leftIcon={<IconReload size="0.75rem" />}
                onClick={() => {
                  setPreviewEmailBody(null)
                  setPreviewEmailSubject(null)
                  triggerGenerateEmail()
                }}
              >
                Regenerate
              </Button>
              <ProspectSelect
                personaId={currentProject.id}
                onChange={(prospect) => {
                  if (prospect) {
                    setProspectID(prospect.id);
                  }
                }}
                // onFinishLoading={() => {}}
                autoSelect
                includeDrawer
              />
            </Flex>
          </Flex>



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

            {
              currentTab === "PROSPECTED" && (
                <Flex mb={"md"}>
                  <Flex w={80} mr='sm'>
                    <Text color="gray.6" fw={500}>
                      Subject:
                    </Text>
                  </Flex>
                  <Flex>
                    {
                      (initialEmailLoading && !previewEmailSubject) ? (
                        <Flex align='center'>
                          <Loader mr='sm' size={20} color='purple' />
                          <Text color='purple'>
                            AI generating subject line...
                          </Text>
                        </Flex>) : (
                        <Text color="gray.8" fw={500}>
                          {previewEmailSubject}
                        </Text>
                      )
                    }
                  </Flex>
                </Flex>
              )
            }
            <Flex>
              <Flex w={60} mr='md'>
                <Text color="gray.6" fw={500}>
                  Body:
                </Text>
              </Flex>
              <Flex>
                {
                  ((initialEmailLoading && !previewEmailSubject) || (followupEmailLoading && !previewEmailBody)) ? (
                    <Flex align='center'>
                      <Loader mr='sm' size={20} color='purple' />
                      <Text color='purple'>
                        AI generating email body...
                      </Text>
                    </Flex>
                  ) : (
                    <Box
                      sx={() => ({
                        // border: "1px solid #E0E0E0",
                        // borderRadius: "8px",
                        // backgroundColor: "#F5F5F5",
                      })}
                    >
                      <Text color="gray.8" fw={500}>
                        <div
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(previewEmailBody as string),
                          }}
                        />
                      </Text>
                    </Box>
                  )
                }
              </Flex>
            </Flex>
          </Box>
        </Box>

        {
          currentTab === "PROSPECTED" ? (
            <Tabs defaultValue="subject">
              <Tabs.List>
                <Tabs.Tab value="subject">
                  Subject Lines
                </Tabs.Tab>

                <Tabs.Tab value="body">
                  Body
                </Tabs.Tab>
              </Tabs.List>

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

              <Tabs.Panel value="body">
                <EmailBodySection />
              </Tabs.Panel>

            </Tabs>
          ) : (
            <EmailBodySection />
          )
        }

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
              error={editedSubjectLine.length > 120 && "Subject line must be less than 120 characters"}
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
                    disabled={editedSubjectLine === subjectLine.subject_line || editedSubjectLine.length === 0 || editedSubjectLine.length > 120}
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

  const [title, setTitle] = React.useState<string>(template.title || '')
  const [editingTitle, setEditingTitle] = React.useState<boolean>(false)

  const triggerPatchEmailBodyTemplateTitle = async () => {
    setLoading(true)

    const result = await patchSequenceStep(
      userToken,
      template.id,
      template.overall_status,
      title,
      template.template,
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
        message: 'Successfully updated email title',
        color: 'green',
      })

      await refetch();
    }

    setLoading(false);
  }

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
                {
                  editingTitle ? ( // Editing title
                    <>
                      <TextInput
                        w={200}
                        placeholder="Untitled Email Template"
                        value={title}
                        onChange={(event) => {
                          setTitle(event.currentTarget.value)
                        }}
                      />
                      <Flex justify={'flex-end'}>
                        <Button
                          mx='sm'
                          color='red'
                          onClick={() => {
                            setTitle(template.title || '');
                            setEditingTitle(false);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          color='green'
                          onClick={() => {
                            triggerPatchEmailBodyTemplateTitle();
                            setEditingTitle(false);
                          }}
                        >
                          Save
                        </Button>
                      </Flex>
                    </>

                  ) : ( // Not editing title
                    <>
                      {template.title ? (
                        <Title order={4} onClick={() => { setEditingTitle(true) }}>
                          {template.title}
                        </Title>
                      ) : (
                        <Title order={4} color='gray.5' onClick={() => { setEditingTitle(true) }}>
                          Untitled Email Template
                        </Title>
                      )}
                      <ActionIcon
                        variant='transparent'
                        onClick={() => { setEditingTitle(!editingTitle) }}
                      >
                        <IconPencil size={'0.9rem'} />
                      </ActionIcon>
                    </>
                  )
                }
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
