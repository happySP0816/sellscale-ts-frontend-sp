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
} from "@mantine/core";
import { API_URL } from "@constants/data";
import { userDataState, userTokenState } from "@atoms/userAtoms";
import { useRecoilState, useRecoilValue } from "recoil";
import { IconBrain, IconExternalLink, IconX } from "@tabler/icons";

type AIBrainPillPropsType = {
  clientSdrID?: number;
};

export default function AIBrainPill(props: AIBrainPillPropsType) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const userToken = useRecoilValue(userTokenState);
  const [isLoading, setIsLoading] = useState(false);
  const [aibrainData, setAiBrainData] = useState({} as any);

  const togglePopover = (clientSdrID: number) => {
    if (!isPopoverOpen) {
      fetchAIBrain(clientSdrID);
    }
    setIsPopoverOpen(!isPopoverOpen);
  };
  const fetchAIBrain = async (clientSdrID: number) => {
    setIsLoading(true);
    const response = await fetch(
      `${API_URL}/client/brain?client_sdr_id=${clientSdrID}`,
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
          onClick={() => togglePopover(props.clientSdrID!)}
          size='xs'
          ml='xs'
        >
          AI BRAIN
        </Badge>
      </Popover.Target>
      <Popover.Dropdown
        style={{
          padding: "0px",
          border: "1px solid #be4bdb",
        }}
      >
        {!isLoading && (
          <>
            <Flex bg={"#be4bdb"} align={"center"} pl={"xs"}>
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
              <Text color="gray" size={"sm"}>
                This is the AI's context on your business, which is used to
                inform your AI on writing.
              </Text>
              <Flex gap={"xs"} align={"center"} onClick={() => {
                setIsPopoverOpen(false)
                window.open('/settings')
              }}>
                <Text color="#be4bdb">Edit in Settings</Text>
                <IconExternalLink size={"0.8rem"} color="#be4bdb" />
              </Flex>
              <Divider color="#be4bdb" variant="dashed" />
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
