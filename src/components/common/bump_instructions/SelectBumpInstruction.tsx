import { useEffect, useState } from "react";
import CreateBumpInstructionModal from "./CreateBumpInstructionModal";
import { Button, Card, Container, Select, Text, Title } from "@mantine/core";
import { useRecoilValue } from "recoil";
import { userTokenState } from "@atoms/userAtoms";
import { API_URL } from "@constants/data";

import { getBumpFrameworks } from "@utils/requests/getBumpFrameworks";
import { openContextModal } from "@mantine/modals";


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
};

export default function SelectBumpInstruction(props: PropsType) {
  const [bumpFrameworks, setBumpFrameworks] = useState<BumpFramework[]>([]);
  const [selectedBumpFramework, setSelectedBumpFramework] = useState<BumpFramework>();

  const userToken = useRecoilValue(userTokenState);
  const [loadingBumpFrameworks, setLoadingBumpFrameworks] = useState(false);

  const triggerGetBumpFrameworks = async () => {
    setLoadingBumpFrameworks(true);
    const result = await getBumpFrameworks(userToken, props.overall_status);

    setBumpFrameworks(result.extra);
    for (const bumpFramework of result.extra as BumpFramework[]) {
      if (bumpFramework.default) {
        setSelectedBumpFramework(bumpFramework);
        props.onBumpFrameworkSelected(bumpFramework.id);
        break
      }
    }

    setLoadingBumpFrameworks(false)
  };

  useEffect(() => {
    triggerGetBumpFrameworks();
  }, []);

  return (
    <Card withBorder mt='sm'>
      <Text fw='bold'>
        Bump Framework
      </Text>
      <Text fz='xs'>
        Bump Frameworks are used to train the AI on how to respond to specific messages. The default bump framework is used, but you can manage all bump frameworks.
      </Text>
      <Select
        mt='md'
        value={
          selectedBumpFramework
            ? selectedBumpFramework.id + ""
            : '-1'
        }
        data={bumpFrameworks.map((x: any) => {
          return { value: x.id + '', label: x.title };
        })}
        placeholder={"Select Manage Bump Frameworks"}
        onChange={(value: any) => {
          setSelectedBumpFramework(bumpFrameworks.find((x) => x.id == value));
          props.onBumpFrameworkSelected(value);
        }}
        searchable
        creatable
        withinPortal
        dropdownPosition="bottom"
      />
      <Button
        mt='md'
        onClick={() => {
          openContextModal({
            modal: "manageBumpFramework",
            title: <Title order={3}>Manage Bump Frameworks</Title>,
            innerProps: {selectedBumpFramework: selectedBumpFramework, overallStatus: props.overall_status, backTriggerGetFrameworks: triggerGetBumpFrameworks},
          });
        }}
      >
        Manage
      </Button>
    </Card >
  );
}
