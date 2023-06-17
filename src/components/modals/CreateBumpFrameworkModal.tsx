import { userTokenState } from "@atoms/userAtoms";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import { Modal, TextInput, Text, Textarea, Tooltip, Slider, Flex, Select, Switch, Button, useMantineTheme, LoadingOverlay, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons";
import { createBumpFramework } from "@utils/requests/createBumpFramework";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { MsgResponse } from "src";


const bumpFrameworkLengthMarks = [
  { value: 0, label: "Short", api_label: "SHORT" },
  { value: 50, label: "Medium", api_label: "MEDIUM" },
  { value: 100, label: "Long", api_label: "LONG" },
];


interface CreateBumpFramework extends Record<string, unknown> {
  modalOpened: boolean;
  openModal: () => void;
  closeModal: () => void;
  backFunction: () => void;
  dataChannels: MsgResponse | undefined;
  archetypeID: number | null;
  status?: string;
  bumpedCount?: number | null;
}

export default function CreateBumpFrameworkModal(props: CreateBumpFramework) {
  const [userToken] = useRecoilState(userTokenState);
  const theme = useMantineTheme();
  
  const [bumpLengthValue, setBumpLengthValue] = useState(50);
  const [selectedStatus, setSelectedStatus] = useState<string | null>('');
  const [selectedSubstatus, setSelectedSubstatus] = useState<string | null>('');
  const [loading, setLoading] = useState(false);

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

    const result = await createBumpFramework(
      userToken,
      form.values.archetypeID,
      selectedStatus as string,
      form.values.title,
      form.values.description,
      bumpFrameworkLengthMarks.find((mark) => mark.value === bumpLengthValue)
        ?.api_label as string,
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
      description: "",
      archetypeID: props.archetypeID,
      default: false,
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
      title="Create New Framework"
      size='lg'
    >
      <LoadingOverlay visible={loading} />
      <TextInput
        label="Title"
        placeholder={"Mention the Super Bowl"}
        withAsterisk
        {...form.getInputProps("title")}
      />
      <Textarea
        mt="md"
        label="Description"
        placeholder={
          "Mention the Super Bowl which is coming up soon."
        }
        withAsterisk
        autosize
        {...form.getInputProps("description")}
      />
      <Text fz="sm" mt="md">
        Bump Length
      </Text>
      <Flex
        align="center"
        justify={'center'}
      >
        <Tooltip
          multiline
          width={220}
          withArrow
          label="Control how long you want the generated bump to be."
        >
          <Slider
            label={null}
            step={50}
            marks={bumpFrameworkLengthMarks}
            mt="xs"
            mb="xl"
            p="md"
            w='75%'
            value={bumpLengthValue}
            onChange={(value) => {
              setBumpLengthValue(value);
            }}
          />
        </Tooltip>
      </Flex>

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
      {(selectedStatus === "BUMPED" && form.values.bumpedCount) && (
        <NumberInput
          label="Bump Number"
          description="The position in the bump sequence."
          placeholder="1"
          value={form.values.bumpedCount}
          onChange={(e) => {
            form.setFieldValue("bumpedCount", e as number);
          }}
          min={1}
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
            form.values.description.trim() == "" ||
            selectedStatus == null ||
            (selectedStatus === "ACTIVE_CONVO" &&
              selectedSubstatus == null)
          }
          onClick={() => {
            triggerCreateBumpFramework();
          }}
        >
          Create
        </Button>
      </Flex>
    </Modal>
  )
}