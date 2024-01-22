import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Loader,
  Popover,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { API_URL } from "@constants/data";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { IconArrowRight, IconBrain, IconExternalLink, IconX } from "@tabler/icons";

type AIBrainPillPropsType = {};

export default function AIBrainPill(props: AIBrainPillPropsType) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const [isLoading, setIsLoading] = useState(false);
  const [aibrainData, setAiBrainData] = useState({} as any);
  const userData = useRecoilValue(userDataState)

  const togglePopover = () => {
    if (!isPopoverOpen) {
      fetchAIBrain();
    }
    setIsPopoverOpen(!isPopoverOpen);
  };
  const fetchAIBrain = async () => {
    setIsLoading(true);
    const response = await fetch(
      `${API_URL}/client/brain`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    const data = await response.json();
    setAiBrainData(data);
    setIsLoading(false);
  };

  const theme = useMantineTheme();

  return (
    <Popover
      width={500}
      position="bottom"
      withArrow
      shadow="md"
      opened={isPopoverOpen}
      onOpen={() => setIsPopoverOpen(true)}
      onClose={() => setIsPopoverOpen(false)}
    >
      <Popover.Target>
        <Badge
          color="pink"
          styles={{ root: { textTransform: "initial" } }}
          style={{ display: "flex", alignItems: "center" }}
          leftSection={<IconBrain size={"0.5rem"} />}
          onClick={() => togglePopover()}
          size='xs'
          ml='xs'
        >
          AI BRAIN
        </Badge>
      </Popover.Target>
      <Popover.Dropdown
        style={{
          padding: "0px",
          border: theme.colors.pink[6],
        }}
      >
        {!isLoading && (
          <>
            <Flex bg={theme.colors.pink[6]} align={"center"} pl={"xs"}>
              <Flex gap={1} w={"100%"} align={"center"}>
                <IconBrain size={"0.8rem"} color="white" />
                <Text color="white">AI BRAIN</Text>
              </Flex>
              <Button variant="transparent">
                <IconX
                  color="white"
                  size={"1rem"}
                  style={{ cursor: "pointer" }}
                  onClick={() => setIsPopoverOpen(false)}
                />
              </Button>
            </Flex>
            <Flex direction={"column"} p={"xs"} gap={"sm"}>
              <Title color='pink' p={0} m={0} order={4}>🧠 {userData.client.company}'s AI Brain</Title>
              <Text color='pink' p={0} mt={-10} size='xs'>Company info fed into your AI to inform writing.</Text>
              <Divider color={theme.colors.pink[6]} variant="dashed" />
              <Text fw={500} size={"sm"}>
                Company Name:{" "}
                <span className="text-[#868e96] text-[14px]">
                  {aibrainData?.name}
                </span>
              </Text>
              <Divider />
              <Flex>
                <Text fw={500} size={"sm"} w={"100%"}>
                  Company Tagline:{" "}
                  <span className="text-[#868e96] text-[14px]">
                    {aibrainData?.tagline}
                  </span>
                </Text>
              </Flex>
              <Divider />
              <Flex>
                <Text fw={500} size={"sm"} w={"100%"}>
                  Company Description:{" "}
                  <span className="text-[#868e96] text-[14px]">
                    {" "}
                    {aibrainData?.description}
                  </span>
                </Text>
              </Flex>
              <Button onClick={() => {
                setIsPopoverOpen(false)
                window.open('/settings')
              }} color='pink' w='60%' ml='auto' mr='auto'>
                Edit in Settings <IconArrowRight size={"1rem"} />
              </Button>
            </Flex>
          </>
        )}
        {isLoading && (
          <Card
            sx={{
              width: "100%",
              height: "300px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Loader />
          </Card>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}
