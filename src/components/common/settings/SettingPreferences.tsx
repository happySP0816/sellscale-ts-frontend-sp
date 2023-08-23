import { userDataState, userTokenState } from "@atoms/userAtoms";
import { syncLocalStorage } from "@auth/core";
import {
  useMantineColorScheme,
  Text,
  SegmentedControl,
  Group,
  Center,
  Box,
  Stack,
  NumberInput,
  Divider,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { updateConversionPercentages } from "@utils/requests/updateClientSDR";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

export default function SettingPreferences() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const [activeConvoPercentage, setActiveConvoPercentage] = useState(userData.conversion_percentages.active_convo || 0.02);
  const [schedulingPercentage, setSchedulingPercentage] = useState(userData.conversion_percentages.scheduling || 0.1);
  const [demoSetPercentage, setDemoSetPercentage] = useState(userData.conversion_percentages.demo_set || 0.2);
  const [closedDemoPercentage, setClosedDemoPercentage] = useState(userData.conversion_percentages.demo_won || 0.5);
  const [notInterestedPercentage, setNotInterestedPercentage] = useState(userData.conversion_percentages.not_interested || 0);
  useEffect(() => {
    updateConversionPercentages(
      userToken,
      activeConvoPercentage,
      schedulingPercentage,
      demoSetPercentage,
      closedDemoPercentage,
      notInterestedPercentage
    ).then((response) => {
      syncLocalStorage(userToken, setUserData);
    })
  }, [activeConvoPercentage, schedulingPercentage, demoSetPercentage, closedDemoPercentage, notInterestedPercentage]);

  return (
    <Box>
    <Group position="center" my="xl">
        <Text>Toggle site theme</Text>
        <SegmentedControl
          value={colorScheme}
          onChange={(value: "light" | "dark") => toggleColorScheme(value)}
          data={[
            {
              value: "light",
              label: (
                <Center>
                  <IconSun size="1rem" stroke={1.5} />
                  <Box ml={10}>Light</Box>
                </Center>
              ),
            },
            {
              value: "dark",
              label: (
                <Center>
                  <IconMoon size="1rem" stroke={1.5} />
                  <Box ml={10}>Dark</Box>
                </Center>
              ),
            },
          ]}
        />
        </Group>
        <Divider />
        <Group position="center" my="xl">
      <Stack maw={400}>
        <Text>Pipeline Conversion Percentages</Text>

        <NumberInput
          label="Active Conversation"
          value={activeConvoPercentage}
          onChange={(value) => setActiveConvoPercentage(value || 0)}
          precision={2}
          min={0}
          step={0.01}
          max={1}
        />
        <NumberInput
          label="Scheduling"
          value={schedulingPercentage}
          onChange={(value) => setSchedulingPercentage(value || 0)}
          precision={2}
          min={0}
          step={0.01}
          max={1}
        />
        <NumberInput
          label="Demo Set"
          value={demoSetPercentage}
          onChange={(value) => setDemoSetPercentage(value || 0)}
          precision={2}
          min={0}
          step={0.01}
          max={1}
        />
        <NumberInput
          label="Closed Demo"
          value={closedDemoPercentage}
          onChange={(value) => setClosedDemoPercentage(value || 0)}
          precision={2}
          min={0}
          step={0.01}
          max={1}
        />
        <NumberInput
          label="Not Interested"
          value={notInterestedPercentage}
          onChange={(value) => setNotInterestedPercentage(value || 0)}
          precision={2}
          min={0}
          step={0.01}
          max={1}
        />
      </Stack>
      </Group>
    </Box>
  );
}
