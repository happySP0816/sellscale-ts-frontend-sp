import { useEffect, useState } from "react";
import CreateBumpInstructionModal from "./CreateBumpInstructionModal";
import {
  Button,
  Card,
  Container,
  Grid,
  LoadingOverlay,
  Select,
  Text,
  Textarea,
  Title,
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
};

type PropsType = {
  client_sdr_id: number;
  overall_status: string;
  onBumpFrameworkSelected: (bumpFrameworkId: number) => void;
  onAccountResearchChanged: (accountResearch: string) => void;
};

export default function SelectBumpInstruction(props: PropsType) {
  const userToken = useRecoilValue(userTokenState);
  const [prospectDrawerStatuses, setProspectDrawerStatuses] = useRecoilState(
    prospectDrawerStatusesState
  );

  console.log("prospectDrawerStatuses", prospectDrawerStatuses)

  const [bumpFrameworks, setBumpFrameworks] = useState<BumpFramework[]>([]);
  const [
    selectedBumpFramework,
    setSelectedBumpFramework,
  ] = useState<BumpFramework>();
  const [loadingBumpFrameworks, setLoadingBumpFrameworks] = useState(false);

  const triggerGetBumpFrameworks = async () => {
    setLoadingBumpFrameworks(true);
    const result = await getBumpFrameworks(userToken, prospectDrawerStatuses.overall);

    setBumpFrameworks(result.extra);
    for (const bumpFramework of result.extra as BumpFramework[]) {
      if (bumpFramework.default) {
        console.log("getting bump frameworks", prospectDrawerStatuses.overall, bumpFramework)
        setSelectedBumpFramework(bumpFramework);
        props.onBumpFrameworkSelected(bumpFramework.id);
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
              setSelectedBumpFramework(
                bumpFrameworks.find((x) => x.id == value)
              );
              props.onBumpFrameworkSelected(value);
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
