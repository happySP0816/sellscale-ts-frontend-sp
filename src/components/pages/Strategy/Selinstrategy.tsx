import { Badge, Box, Button, Flex, Paper, Stack, Text } from "@mantine/core";
import { useState } from "react";

export default function SelinStrategy(props: any) {
  const [edit, setEdit] = useState(false);

  return (
    <Paper withBorder radius={"sm"}>
      <Flex bg={"#37414E"} p={"sm"}>
        <Text tt={"uppercase"} fw={600} color="white">
          Strategy Creator: <span className="text-gray-400">Input for a campaign</span>
        </Text>
      </Flex>
      <Stack p={"sm"}>
        <Flex>
          <Text color="gray" fw={500} w={160} size={"xs"}>
            Strategy Name:
          </Text>
          <Text fw={500} size={"xs"}>
            {"MachineCon NYC 24 - Booth Invitation"}
          </Text>
        </Flex>
        <Flex>
          <div className="w-[160px]">
            <Text color="gray" fw={500} w={160} size={"xs"}>
              Description:
            </Text>
          </div>
          <Stack spacing={"sm"}>
            <Box>
              <Text fw={600} size={"xs"}>
                Goal:
              </Text>
              <Text fw={500} size={"xs"}>
                {
                  "This primary goal of this campaign is to invite prospects to our booth (#142) at MachineCon in NYC on July 26th. We want to engage them in meaningful converstaions about potential collaboration opportunties, and we are offering to buy them a drink to facilitate these discussions."
                }
              </Text>
            </Box>
            <Box>
              <Text fw={600} size={"xs"}>
                Angle:
              </Text>
              <Text fw={500} size={"xs"}>
                {
                  "The main approach for this campaign is to leverage the MachineCon conference to establish initial contact with prospects and discuss potential collaboration opportunites. The focus will be on inviting them to our booth for a personal chat."
                }
              </Text>
              <Box>
                <Text fw={600} size={"xs"}>
                  Prospects:
                </Text>
                <Text fw={500} size={"xs"}>
                  {"We will target professionals attending MachineCon, particularly those with titles such as,"}
                </Text>
              </Box>
            </Box>
          </Stack>
        </Flex>
        <Flex>
          <div className="w-[160px]">
            <Text size={"xs"} color="gray" fw={500} w={160}>
              Attach Campaigns:
            </Text>
          </div>
          <Badge color="green">MachineCon outreach</Badge>
        </Flex>
        <Flex>
          <div className="w-[160px]">
            <Text color="gray" fw={500} w={160} size={"xs"}>
              Time Frame:
            </Text>
          </div>
          <Text size={"xs"}>{"22/07/2024 - 28/07/2024"}</Text>
        </Flex>
        <Flex align={"center"} gap={"md"}>
          <Button variant="outline" color="gray" fullWidth>
            Edit
          </Button>
          <Button fullWidth onClick={() => props.handleSpecialEvent()}>
            Execute Strategy
          </Button>
        </Flex>
      </Stack>
    </Paper>
  );
}
