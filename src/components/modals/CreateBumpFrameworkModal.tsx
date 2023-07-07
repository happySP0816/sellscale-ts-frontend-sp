import { userTokenState } from "@atoms/userAtoms";
import TextWithNewline from "@common/library/TextWithNewlines";
import PersonaSelect from "@common/persona/PersonaSplitSelect";
import { Modal, TextInput, Text, Textarea, Slider, Flex, Select, Switch, Button, useMantineTheme, LoadingOverlay, NumberInput, HoverCard, Paper } from "@mantine/core";
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
  showStatus?: boolean;
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
        color: "red",
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
      form.values.bumpDelayDays,
      form.values.default,
      selectedSubstatus
    );

    if (result.status === "success") {
      showNotification({
        title: "Success",
        message: "Bump Framework created successfully",
        color: "green",
      });
      form.reset();
      props.backFunction();
      props.closeModal();
    } else {
      showNotification({
        title: "Error",
        message: result.message,
        color: "red",
      });
    }

    setLoading(false);
  };

  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      archetypeID: props.archetypeID,
      default: true,
      bumpedCount: props.bumpedCount,
      bumpDelayDays: 2,
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
        <HoverCard width={280} shadow="md">
          <HoverCard.Target>
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
          </HoverCard.Target>
          <HoverCard.Dropdown style={{ "backgroundColor": "rgb(34, 37, 41)", "padding": 0 }}>
            <Paper style={{ "backgroundColor": "rgb(34, 37, 41)", "color": "white", "padding": 10 }}>
              <TextWithNewline breakheight="10px">
                {"Control how long you want the generated bump to be:\n\nShort: 1-2 sentences\nMedium: 3-4 sentences\nLong: 2 paragraphs"}
              </TextWithNewline>
            </Paper>
          </HoverCard.Dropdown>
        </HoverCard>
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
          mt='md'
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
        <Flex justify='space-between' align='center'>
          <NumberInput
            mt='md'
            label="Bump Delay"
            description="The number of days to wait before sending the bump."
            placeholder="2"
            value={form.values.bumpDelayDays}
            onChange={(e) => {
              form.setFieldValue("bumpDelayDays", e as number);
            }}
            min={2}
            withAsterisk
          />
          <Switch
            pt="md"
            my='md'
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
        </Flex>

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