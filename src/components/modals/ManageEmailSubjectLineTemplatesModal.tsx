import { userTokenState } from "@atoms/userAtoms";
import { ActionIcon, Button, Flex, Modal, Switch, Title, Tooltip } from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { getEmailSubjectLineTemplates, postEmailSubjectLineTemplateActivate, postEmailSubjectLineTemplateDeactivate } from "@utils/requests/emailSubjectLines";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { SubjectLineTemplate } from "src";
import CreateEmailSubjectLineModal from "./CreateEmailSubjectLineModal";
import { useDisclosure } from "@mantine/hooks";
import { IconPencil } from "@tabler/icons";


interface ManageEmailSubjectLineTemplates extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  archetypeID: number | null;
}

export default function ManageEmailSubjectLineTemplatesModal(props: ManageEmailSubjectLineTemplates) {
  const userToken = useRecoilValue(userTokenState);
  const [isFetching, setIsFetching] = useState(false);
  const [subjectLineTemplates, setSubjectLineTemplates] = useState<SubjectLineTemplate[]>([]);

  const triggerGetEmailSubjectLineTemplates = async () => {
    setIsFetching(true);

    const result = await getEmailSubjectLineTemplates(userToken, props.archetypeID as number, false);
    if (result.status != 'success') {
      showNotification({
        title: 'Error',
        message: result.message,
        color: 'red',
      })
      setIsFetching(false);
      return;
    }

    const templates = result.data.subject_line_templates as SubjectLineTemplate[];
    setSubjectLineTemplates(templates);

    setIsFetching(false);
  }

  useEffect(() => {
    triggerGetEmailSubjectLineTemplates();
  }, []);

  const [createSubjectLineOpened, { open: openCreateSubject, close: closeCreateSubject }] = useDisclosure();
  const [patchSubjectLineOpened, { open: openPatchSubject, close: closePatchSubject }] = useDisclosure();

  return (
    <Modal
      opened={props.modalOpened}
      onClose={props.closeModal}
      title={
        <Flex justify={'space-between'} w='100%' pr='sm'>
          <Title order={5}>Manage Subject Lines</Title>
          <Button color='teal' size='xs' onClick={openCreateSubject}>
            Add Subject Line
          </Button>
          <CreateEmailSubjectLineModal
            modalOpened={createSubjectLineOpened}
            openModal={openCreateSubject}
            closeModal={closeCreateSubject}
            backFunction={() => {
              triggerGetEmailSubjectLineTemplates()
              props.backFunction()
            }}
            archetypeID={props.archetypeID}
          />
        </Flex>
      }
      size='1000px'
      styles={{ title: { width: "100%" } }}
      centered
    >
      <DataTable
        height={"min(470px, 100vh - 200px)"}
        verticalAlignment="center"
        loaderColor="teal"
        noRecordsText={"No Subject Lines"}
        fetching={isFetching}
        records={subjectLineTemplates}
        columns={[
          {
            accessor: "subject_line",
            title: "Subject Line",
            sortable: true,
            width: 250,
            render: (template: SubjectLineTemplate) => {
              const isDisabled = !!(
                template.times_used && template.times_used > 0
              );

              return (
                <Flex justify='space-between' align='center'>
                  <Flex>
                    {template.subject_line}
                  </Flex>
                  <Flex miw="24px" ml='6px'>
                    <Tooltip
                      withArrow
                      withinPortal
                      label={
                        isDisabled
                          ? "Subject Lines that have been used cannot be edited"
                          : "Edit Subject Line"
                      }
                    >
                      <div>
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          disabled={isDisabled}
                          onClick={() => {
                            openContextModal({
                              modal: "patchEmailSubjectLine",
                              title: <Title order={5}>Edit Subject Line</Title>,
                              centered: true,
                              innerProps: {
                                backFunction: () => {
                                  triggerGetEmailSubjectLineTemplates();
                                  props.backFunction();
                                },
                                subjectLine: template,
                              }
                            });
                          }}
                        >
                          <IconPencil color="black" stroke={"1"} />
                        </ActionIcon>
                      </div>
                    </Tooltip>
                  </Flex>
                </Flex>
              )
            }
          },
          {
            accessor: "template",
            title: "% Converted",
            ellipsis: true,
            sortable: true,
            width: 75,
            render: (template: SubjectLineTemplate) => {
              if (template.times_used && template.times_used > 0) {
                const conversion = template.times_accepted / template.times_used;
                return (
                  <Flex justify={"center"}>
                    {conversion.toFixed(2)}%
                  </Flex>
                )
              }
              return (
                <Flex justify={"center"}>
                  N/A
                </Flex>
              )
            }
          },
          {
            accessor: "template",
            title: "Prospects",
            sortable: true,
            width: 75,
            render: (template: SubjectLineTemplate) => {
              return (
                <Flex justify={"center"}>
                  {`${template.times_accepted} / ${template.times_used}`}
                </Flex>
              )
            }
          },
          {
            accessor: "template",
            title: "Active",
            width: 50,
            render: (template: SubjectLineTemplate) => {
              return (
                <Flex justify={"center"}>
                  <Switch
                    color="teal"
                    checked={template.active}
                    onClick={async (e) => {
                      setIsFetching(true);

                      if (template.active) {
                        const result = await postEmailSubjectLineTemplateDeactivate(userToken, template.id);
                        if (result.status != 'success') {
                          showNotification({
                            title: 'Error',
                            message: 'Failed to deactivate subject line, please try again',
                            color: 'red',
                          })
                          setIsFetching(false);
                          return;
                        }
                        showNotification({
                          title: 'Success',
                          message: 'Successfully deactivated subject line',
                          color: 'green',
                        })
                        props.backFunction();
                        triggerGetEmailSubjectLineTemplates();
                      } else {
                        const result = await postEmailSubjectLineTemplateActivate(userToken, template.id);
                        if (result.status != 'success') {
                          showNotification({
                            title: 'Error',
                            message: 'Failed to activate subject line, please try again',
                            color: 'red',
                          })
                          setIsFetching(false);
                          return;
                        }
                        showNotification({
                          title: 'Success',
                          message: 'Successfully activated subject line',
                          color: 'green',
                        })
                        props.backFunction();
                        triggerGetEmailSubjectLineTemplates();
                      }
                      setIsFetching(false);
                    }}
                    styles={(theme) => ({
                      track: {
                        cursor: "pointer",
                      },
                    })}
                  />
                </Flex>
              )
            }
          }
        ]}

      />
    </Modal>
  )
}
