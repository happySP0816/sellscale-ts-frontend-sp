import { userDataState, userTokenState } from "@atoms/userAtoms";
import { syncLocalStorage } from "@auth/core";
import {
  Text,
  Group,
  Box,
  NumberInput,
  Flex,
} from "@mantine/core";
import { updateConversionPercentages } from "@utils/requests/updateClientSDR";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";


export default function SettingPreferences() {

  const userToken = useRecoilValue(userTokenState);
  const [userData, setUserData] = useRecoilState(userDataState);

  const [openPercentage, setOpenPercentage] = useState(
    userData.conversion_open_pct || 9.0
  );
  const [replyPercentage, setReplyPercentage] = useState(
    userData.conversion_reply_pct || 0.5
  );
  const [demoPercentage, setDemoPercentage] = useState(
    userData.conversion_demo_pct || 0.1
  );

  useEffect(() => {
    updateConversionPercentages(
      userToken,
      openPercentage,
      replyPercentage,
      demoPercentage,
    ).then((response) => {
      syncLocalStorage(userToken, setUserData);
    });
  }, [
    openPercentage,
    replyPercentage,
    demoPercentage,
  ]);

  return (
    <Box>
      <Group position="center" my="xl" align='center'>
        <Flex maw='600px' direction='column'>
          <Flex direction='column' justify='center'>
            <Text fw='bold'>Custom Conversion Percentages</Text>
            <Text>Supplying custom conversion percentages may help you benchmark SellScale across your services.</Text>
          </Flex>
          <Flex w='100%' direction='row' justify={'space-between'} mt='lg'>
            <NumberInput
              label="Opens"
              value={openPercentage}
              onChange={(value) => setOpenPercentage(value || 0)}
              precision={1}
              min={0}
              step={0.1}
              max={100}
            />
            <NumberInput
              label="Replies"
              value={replyPercentage}
              onChange={(value) => setReplyPercentage(value || 0)}
              precision={1}
              min={0}
              step={0.1}
              max={100}
            />
            <NumberInput
              label="Demos"
              value={demoPercentage}
              onChange={(value) => setDemoPercentage(value || 0)}
              precision={1}
              min={0}
              step={0.1}
              max={100}
            />
          </Flex>
        </Flex>
      </Group>
    </Box>
  );
}
