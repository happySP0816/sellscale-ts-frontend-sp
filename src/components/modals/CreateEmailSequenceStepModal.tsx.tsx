import { userTokenState } from "@atoms/userAtoms";
import { EmailBlocksDND } from "@common/emails/EmailBlocksDND";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import { Modal, TextInput, Flex, Select, Switch, Button, useMantineTheme, LoadingOverlay, NumberInput, Divider, ScrollArea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import { createEmailSequenceStep } from "@utils/requests/emailSequencing";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { MsgResponse } from "src";


interface CreateEmailSequenceStep extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  dataChannels: MsgResponse | undefined;
  archetypeID: number | null;
  status?: string;
  showStatus?: boolean;
  bumpedCount?: number | null;
}

export default function CreateEmailSequenceStepModal(props: CreateEmailSequenceStep) {
  const [userToken] = useRecoilState(userTokenState);
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<string | null>('');
  const [selectedSubstatus, setSelectedSubstatus] = useState<string | null>('');
  const [template, setTemplate] = useState<string>('');


  const getActiveConvoSubstatusValues = () => {
    const activeConvoStatuses = [];
    const statuses_avilable =
      props.dataChannels?.data["LINKEDIN"]?.statuses_available;
    if (statuses_avilable != null) {
      for (const item of statuses_avilable) {
        const statusLabel = props.dataChannels?.data["LINKEDIN"][item]?.name;
        if (statusLabel.includes("Active Convo")) {
          activeConvoStatuses.push({
            label: statusLabel,
            value: item,
          });
        }
      }
    }
    return activeConvoStatuses;
  };

  const triggerCreateBumpFramework = async () => {
    setLoading(true);

    if (form.values.archetypeID == null) {
      showNotification({
        title: "Error",
        message: "Please select an archetype",
        icon: <IconX radius="sm" color={theme.colors.red[7]} />,
      });
      return;
    }

    const result = await createEmailSequenceStep(
      userToken,
      form.values.archetypeID,
      selectedStatus as string,
      form.values.title,
      "TODO: REPLACE ME WITH TEMPLATE",
      form.values.bumpedCount as number,
      form.values.default,
      selectedSubstatus
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework created successfully",
        icon: <IconCheck radius="sm" color={theme.colors.green[7]} />,
      });
      form.reset();
      props.backFunction();
      props.closeModal();
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        icon: <IconX radius="sm" color={theme.colors.red[7]} />,
      });
    }

    setLoading(false);
  };

  const form = useForm({
    initialValues: {
      title: "",
      objective: "",
      archetypeID: props.archetypeID,
      default: true,
      bumpedCount: props.bumpedCount,
    },
  });


  useEffect(() => {
    // Set the statuses to the correct values
    if (props.status != null) {
      setSelectedStatus(props.status);
      if (props.status.includes("ACTIVE_CONVO_")) {
        setSelectedStatus("ACTIVE_CONVO");
        setSelectedSubstatus(props.status);
      }
    }
  }, [props.status])


  return (
    <Modal
      opened={props.modalOpened}
      onClose={props.closeModal}
      title="Create New Email Framework"
      size='75rem'
      mih='75vh'
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Flex direction='row' mih='75vh'>
        <LoadingOverlay visible={loading} />

        <Flex direction='column' w='30%' >
          <ScrollArea type='never'>
            <TextInput
              label="Title"
              placeholder={"Mention the Super Bowl"}
              withAsterisk
              {...form.getInputProps("title")}
            />

            <Flex wrap="wrap" mt="xs" w="100%">
              <PersonaSelect
                disabled={false}
                onChange={(archetypes) =>
                  form.setFieldValue("archetypes", archetypes)
                }
                selectMultiple={false}
                label="Personas"
                description="Select the personas this framework applies to."
                defaultValues={[form.values.archetypeID || -1]}
              />
            </Flex>
            {props.showStatus && (
              <Select
                label="Status"
                description="Which status should use this bump?"
                placeholder="select status..."
                data={props.dataChannels?.data[
                  "SELLSCALE"
                ]?.statuses_available?.map((status: string) => {
                  return {
                    label:
                      props.dataChannels?.data["SELLSCALE"][status].name,
                    value: status,
                  };
                })}
                value={selectedStatus ? selectedStatus : null}
                onChange={setSelectedStatus}
                mt="md"
                withAsterisk
              />
            )}
            {selectedStatus === "ACTIVE_CONVO" && (
              <Select
                label="Substatus"
                description="Which substatus should use this bump?"
                placeholder="select substatus..."
                value={selectedSubstatus ? selectedSubstatus : null}
                data={getActiveConvoSubstatusValues()}
                onChange={setSelectedSubstatus}
                mt="md"
                withAsterisk
              />
            )}
            {(selectedStatus === "BUMPED" && form.values.bumpedCount != null && props.showStatus) && (
              <NumberInput
                mt="md"
                label="Bump Number"
                description="The position in the bump sequence."
                placeholder="1"
                value={form.values.bumpedCount}
                onChange={(e) => {
                  form.setFieldValue("bumpedCount", e as number);
                }}
                min={1}
                withAsterisk
              />
            )}
            <Flex w="100%" justify="flex-end" direction={'column'}>
              <Switch
                pt="md"
                label="Make default?"
                labelPosition="right"
                checked={form.values.default}
                onChange={(e) => {
                  form.setFieldValue(
                    "default",
                    e.currentTarget.checked
                  );
                }}
              />
              <Button
                mt="md"
                disabled={
                  form.values.title.trim() == "" ||
                  form.values.archetypeID == null ||
                  selectedStatus == null ||
                  (selectedStatus === "ACTIVE_CONVO" &&
                    selectedSubstatus == null) ||
                  (selectedStatus === "BUMPED" &&
                    (form.values.bumpedCount == null || form.values.bumpedCount < 1)) ||
                  template.length === 0
                }
                onClick={() => {
                  triggerCreateBumpFramework();
                }}
              >
                Create
              </Button>
            </Flex>
          </ScrollArea>
        </Flex>
        <Divider orientation="vertical" mx='md' />

        <Flex w='auto'>
          <Flex w='60%' mr='md' mah='80vh'>
            <ScrollArea type='hover' offsetScrollbars>
              <EmailBlocksDND
                archetypeId={props.archetypeID as number}
                creating
                getNewOrder={(newEmailBlocks) => { setTemplate("TODO:REPLACE ME") }}
              />
            </ScrollArea>
          </Flex>
          <Flex maw='50%' mah='80vh'>
            <ScrollArea type='hover'>
              {/* <EmailTemplatePreview archetypeId={props.archetypeID as number} template={template} selectTemplate={false} /> */}
            </ScrollArea>
          </Flex>
        </Flex>

      </Flex>
    </Modal>
  )
}