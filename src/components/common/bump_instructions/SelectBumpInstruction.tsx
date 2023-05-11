import { useEffect, useState } from "react";
import CreateBumpInstructionModal from "./CreateBumpInstructionModal";
import {
  Button,
  Card,
  Container,
  Grid,
  LoadingOverlay,
  Select,
  Slider,
  Text,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import { useRecoilState, useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";

import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import { openContextModal } from "@mantine/modals";
import { prospectDrawerStatusesState } from "@atoms/prospectAtoms";

type BumpFramework = {
  id: number;
  title: string;
  description: string;
  overall_status: string;
  active: boolean;
  default: boolean;
  bump_length: string;
};

type PropsType = {
  client_sdr_id: number;
  overall_status: string;
  onBumpFrameworkSelected: (bumpFrameworkId: number, bumpFrameworkLengthAPI: string) => void;
  onAccountResearchChanged: (accountResearch: string) => void;
};

const bumpFrameworkLengthMarks = [
  { value: 0, label: 'Short', api_label: "SHORT" },
  { value: 50, label: 'Medium', api_label: "MEDIUM" },
  { value: 100, label: 'Long', api_label: "LONG" },
];

export default function SelectBumpInstruction(props: PropsType) {
  const userToken = useRecoilValue(userTokenState);
  const [prospectDrawerStatuses, setProspectDrawerStatuses] = useRecoilState(
    prospectDrawerStatusesState
  );

  const [bumpLengthValue, setBumpLengthValue] = useState(50);

  const [bumpFrameworks, setBumpFrameworks] = useState<BumpFramework[]>([]);
  const [
    selectedBumpFramework,
    setSelectedBumpFramework,
  ] = useState<BumpFramework>();
  const [loadingBumpFrameworks, setLoadingBumpFrameworks] = useState(false);

  const triggerGetBumpFrameworks = async () => {
    setLoadingBumpFrameworks(true);
    const result = await getBumpFrameworks(userToken, prospectDrawerStatuses.overall);

    setBumpFrameworks(result.data);
    for (const bumpFramework of result.data as BumpFramework[]) {
      if (bumpFramework.default) {
        let length = bumpFrameworkLengthMarks.find((marks) => marks.api_label === bumpFramework.bump_length)?.value
        if (length == null) {
          length = 50;
        }

        setSelectedBumpFramework(bumpFramework);
        setBumpLengthValue(length);
        props.onBumpFrameworkSelected(bumpFramework.id, bumpFramework.bump_length);
        break;
      }
    }

    setLoadingBumpFrameworks(false);
  };

  useEffect(() => {
    triggerGetBumpFrameworks();
  }, [prospectDrawerStatuses]);

  return (
    <Card withBorder mt="sm">
      <LoadingOverlay visible={loadingBumpFrameworks} />
      <Text fw="bold">Bump Framework</Text>
      <Text fz="xs">
        Bump Frameworks are used to train the AI on how to respond to specific
        messages. The default bump framework is used, but you can manage all
        bump frameworks.
      </Text>
      <Grid>
        <Grid.Col span={8}>
          <Select
            mt="md"
            value={selectedBumpFramework ? selectedBumpFramework.id + "" : "-1"}
            data={bumpFrameworks.map((x: any) => {
              return { value: x.id + "", label: x.title };
            })}
            placeholder={"Select Bump Frameworks"}
            onChange={(value: any) => {
              let bumpFramework = bumpFrameworks.find((x) => x.id == value)
              let length = bumpFrameworkLengthMarks.find((marks) => marks.api_label === bumpFramework?.bump_length)?.value
              if (length == null) {
                length = 50;
              }

              setSelectedBumpFramework(bumpFramework);
              setBumpLengthValue(length);
              props.onBumpFrameworkSelected(value, bumpFramework?.bump_length || "MEDIUM");
            }}
            searchable
            creatable
            withinPortal
            dropdownPosition="bottom"
          />
        </Grid.Col>
        <Grid.Col span={2}>
          <Button
            mt="md"
            onClick={() => {
              openContextModal({
                modal: "manageBumpFramework",
                title: <Title order={3}>Manage Bump Frameworks</Title>,
                innerProps: {
                  selectedBumpFramework: selectedBumpFramework,
                  overallStatus: props.overall_status,
                  backTriggerGetFrameworks: triggerGetBumpFrameworks,
                },
              });
            }}
          >
            Manage
          </Button>
        </Grid.Col>
      </Grid>
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
          mt='xs'
          mb='xl'
          p='md'
          value={bumpLengthValue}
          onChange={(value) => {
            setBumpLengthValue(value);
            let bumpLength = bumpFrameworkLengthMarks.find((marks) => marks.value === value)?.api_label
            if (bumpLength == null) {
              bumpLength = "MEDIUM";
            }
            props.onBumpFrameworkSelected(selectedBumpFramework?.id || -1, bumpLength);
          }}
        />
      </Tooltip>
      <Textarea
        mt="md"
        onChange={(event) => {
          props.onAccountResearchChanged(event.currentTarget.value);
        }}
        placeholder="(optional) 'Acme Corp. raised a $20m Series B'"
        label="Account Research"
        description="AI will use this information to write the bump."
      />
    </Card>
  );
}
