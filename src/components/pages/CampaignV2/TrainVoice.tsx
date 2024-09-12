import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Checkbox,
  Collapse,
  Divider,
  Flex,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconBuilding,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconEdit,
  IconLocation,
  IconMapPin,
  IconMicrophone,
  IconPin,
  IconUser,
} from "@tabler/icons";
import { IconLocationPin } from "@tabler/icons-react";
import { navigateToPage } from "@utils/documentChange";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TrainVoice() {
  const navigate = useNavigate();

  const [sampleProspects, setSampleProspects] = useState([
    {
      avatar: "",
      name: "Rob Combi",
      prospect: "very high",
      job: "Co-Founder",
      location: "United States",
      company: "Tencode Benefits",
      message:
        "Hey Rob! With over 3 years at a compnay like 5 Below, you know the importance of watching out for your hourly workers. I'm sure your team does its best tot support employees during tough times. Here at TenCodes we act as an extension of your team to ensure employees are supported during unexpected illness and end-of-life events. Would you be open to chat?",
      feedback: "We act as an extension of your team to ensure employees are supported during unexpected lines and end-of-life events.",
      research: [
        {
          status: true,
          title: "Job Industry",
          content: "Prospect works in Tech",
        },
        {
          status: true,
          title: "Year of Experience",
          content: "Prospect has 20+ years of experience in",
        },
      ],
    },
    {
      avatar: "",
      name: "Aaron Mackey",
      prospect: "very high",
      job: "VP, Head of AI and ML",
      location: "United States",
      company: "Sonata Therapeutics",
      message:
        "Hey Aaron! With over 3 years at a compnay like 5 Below, you know the importance of watching out for your hourly workers. I'm sure your team does its best tot support employees during tough times. Here at TenCodes we act as an extension of your team to ensure employees are supported during unexpected illness and end-of-life events. Would you be open to chat?",
      feedback: "We act as an extension of your team to ensure employees are supported during unexpected lines and end-of-life events.",
      research: [
        {
          status: true,
          title: "Job Industry",
          content: "Prospect works in Tech",
        },
        {
          status: true,
          title: "Year of Experience",
          content: "Prospect has 20+ years of experience in",
        },
      ],
    },
    {
      avatar: "",
      name: "Abhay A Shukla",
      prospect: "very high",
      job: "Director Molecular Research",
      location: "United States",
      company: "KSL Biomedical Company",
      message:
        "Hey Abhay! With over 3 years at a compnay like 5 Below, you know the importance of watching out for your hourly workers. I'm sure your team does its best tot support employees during tough times. Here at TenCodes we act as an ext!",
      feedback: "We act as an extension of your team to ensure employees are supported during unexpected lines and end-of-life events.",
      research: [
        {
          status: true,
          title: "Job Industry",
          content: "Prospect works in Tech",
        },
        {
          status: true,
          title: "Year of Experience",
          content: "Prospect has 20+ years of experience in",
        },
      ],
    },
  ]);
  const [selected, setSelected] = useState(sampleProspects[0]);
  const [selectedNumber, setSelectedNumber] = useState(0);

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Box p={"md"}>
      <Box>
        <Flex align={"center"} gap={"0.5rem"} mb="xs">
          <Anchor
            fz={"1rem"}
            color="gray.6"
            mt={3}
            ml={5}
            onClickCapture={() => {
              navigateToPage(navigate, `/campaign_v2/`);
            }}
          >
            <Flex align="center" gap="0.5rem">
              <IconArrowLeft size={"1.5rem"} />
              <Text fz={"1rem"}>
                Go back to <span className="text-black font-semibold">campaigns</span>
              </Text>
            </Flex>
          </Anchor>
        </Flex>
      </Box>
      <Paper bg={"blue"} p={"sm"} radius={"sm"} mt={"sm"}>
        <Flex align={"center"} gap={"sm"}>
          <IconMicrophone size={"1rem"} color="white" />
          <Text fw={500} color="white">
            Train your voice
          </Text>
        </Flex>
      </Paper>
      <Flex mt={"md"} gap={"sm"}>
        <Paper w={"25%"} withBorder radius={"sm"} h={"fit-content"}>
          <Flex p={"sm"}>
            <Text fw={600}>Example Prospects</Text>
          </Flex>
          <Divider />
          {sampleProspects.map((item, index) => {
            return (
              <>
                <Flex
                  align={"center"}
                  gap={"sm"}
                  key={index}
                  p={"xs"}
                  onClick={() => {
                    setSelected(item);
                    setSelectedNumber(index);
                  }}
                  bg={index === selectedNumber ? "#F0F2FF" : ""}
                >
                  <Avatar src={item.avatar} radius={"xl"} />
                  <Stack spacing={2}>
                    <Flex align={"center"} gap={"sm"}>
                      <Text fw={500} size={"sm"}>
                        {item.name}
                      </Text>
                      <Badge>{item.prospect}</Badge>
                    </Flex>
                    <Text color="gray" lineClamp={1} size={"xs"} fw={500}>
                      {item.job}, {item.company}
                    </Text>
                  </Stack>
                </Flex>
                <Divider bg={"gray"} />
              </>
            );
          })}
        </Paper>
        <Box w={"45%"}>
          <Paper withBorder radius={"sm"} p={"sm"}>
            <Text fw={600}>Edit message to your style</Text>
            <Text size={13} fw={500} color="gray">
              After you verify make sure to select the Verified button.
            </Text>
            <Divider my={"sm"} />
            <Flex align={"center"} gap={"sm"}>
              <Avatar src={selected.avatar} radius={"xl"} />
              <Stack spacing={2}>
                <Text fw={500} size={"sm"}>
                  {selected.name}
                </Text>
                <Text color="gray" size={"xs"} fw={500}>
                  {selected.job}, {selected.company}
                </Text>
              </Stack>
            </Flex>
            <Flex direction={"column"} align={"end"}>
              <Paper bg={"#E9ECEF"} p={4} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} mb={-1} mr={1}>
                <Text fw={500} size={"xs"} color="#ADB5BD">
                  {selected.message.length}/300
                </Text>
              </Paper>
              <Textarea
                w={"100%"}
                autosize
                minRows={7}
                maxLength={300}
                value={selected.message}
                onChange={(e) => setSelected({ ...selected, message: e.target.value })}
                styles={{
                  input: {
                    background: "#F1F3F5",
                  },
                }}
              />
            </Flex>
            <Flex align={"center"} mt={"md"} justify={"space-between"}>
              <Button variant="outline" color="gray" w={200}>
                Cancel
              </Button>
              <Button w={200} onClick={open}>
                Save
              </Button>
            </Flex>
          </Paper>
          <Flex align={"center"} gap={"sm"} w={"100%"} mt={"md"}>
            <Button color="red" fullWidth>
              Unapprove Message
            </Button>
            <Button color="green" fullWidth>
              Approve Message
            </Button>
          </Flex>
        </Box>
        <Paper withBorder radius={"sm"} w={"30%"}>
          <Flex align={"center"} gap={"sm"} p={"sm"} px={"md"}>
            <Flex direction={"column"} align={"center"}>
              <Card p={2} withBorder shadow="sm">
                <Avatar src={selected.avatar} size={"lg"} radius={"xs"} />
              </Card>
              <Badge mt={"sm"} size="sm">
                very high
              </Badge>
            </Flex>
            <Stack spacing={2}>
              <Text size={"md"} fw={600}>
                {selected.name}
              </Text>
              <Flex align={"center"} gap={"sm"}>
                <IconBuilding size={"0.8rem"} color="gray" />
                <Text size={"xs"} color="gray" fw={500}>
                  {selected.job}
                </Text>
              </Flex>
              <Flex align={"center"} gap={"sm"}>
                <IconMapPin size={"0.8rem"} color="gray" />
                <Text size={"xs"} color="gray" fw={500}>
                  {selected.location}
                </Text>
              </Flex>
              <Flex align={"center"} gap={"sm"}>
                <IconUser size={"0.8rem"} color="gray" />
                <Text size={"xs"} color="gray" fw={500}>
                  {selected.company}
                </Text>
              </Flex>
            </Stack>
          </Flex>
          <Divider />
          <Stack spacing={"sm"} p={"sm"}>
            <Text size={"sm"} color="gray" fw={500}>
              Write message with these points:
            </Text>
            <FeebackComponent data={selected.feedback} />
            <ResearchUsedComponent data={selected.research} />
          </Stack>
        </Paper>
      </Flex>
      <Modal opened={opened} size="auto" centered onClose={close} withCloseButton={false}>
        <Paper>
          <Flex justify={"center"} align={"center"} direction={"column"}>
            <IconCircleCheck fill="#37B24D" color="white" size={"3rem"} />
            <Text size={"md"} fw={500}>
              Your new voice is created!
            </Text>
            <Divider w={"100%"} my={"md"} />
            <Flex align={"center"} gap={4}>
              <Text size={"sm"} color="gray" fw={400}>
                Name:
              </Text>
              <Text size={"sm"} color="blue">
                {"Hunter's Voice (Sep 6, 2024)"}
              </Text>
              <ActionIcon color="blue">
                <IconEdit size={"1rem"} />
              </ActionIcon>
            </Flex>
            <Button mt={"sm"} fullWidth onClick={() => navigateToPage(navigate, `/campaign_v2/${1519}`)}>
              Go Back to Campaign
            </Button>
          </Flex>
        </Paper>
      </Modal>
    </Box>
  );
}

const FeebackComponent = (props: any) => {
  return (
    <Box>
      <Text size={"sm"} fw={500}>
        CTA Used
      </Text>
      <Paper p={"sm"} pt={"md"} mt={"md"} withBorder style={{ border: "2px solid #38D9A9", position: "relative" }}>
        <Badge color="teal" tt={"initial"} className="absolute top-[-10px]">
          Feedback Based
        </Badge>
        <Text size={"sm"} fw={500}>
          {props.data}
        </Text>
      </Paper>
    </Box>
  );
};

const ResearchUsedComponent = (props: any) => {
  const unUsedData = [
    {
      status: false,
      title: "Personal Data",
      content: "This is the actual research point. Lorem",
    },
    {
      status: false,
      title: "Current Experience",
      content: "This is the actual research point. Lorem",
    },
  ];
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Box>
      <Text size={"sm"} fw={500}>
        Research Used
      </Text>
      <Paper p={"sm"} pt={"md"} mt={"md"} withBorder style={{ border: "2px solid #FCC419", position: "relative" }}>
        <Badge color="yellow" tt={"initial"} className="absolute top-[-10px]">
          Used Points
        </Badge>
        <Flex direction={"column"} gap={"xs"} mt={4}>
          {props.data.map((item: any, index: number) => {
            return (
              <Flex gap={"xs"} bg={"#F8F9FA"} key={index} align={"start"} p={"xs"} className="rounded-sm">
                <Checkbox size={"xs"} defaultChecked={item.status} />
                <Stack spacing={2} mt={-2}>
                  <Text size={"sm"} fw={500}>
                    {item.title}
                  </Text>
                  <Text size={"xs"} color="gray" fw={500} lineClamp={1}>
                    {item.content}
                  </Text>
                </Stack>
              </Flex>
            );
          })}
        </Flex>
      </Paper>
      <Divider
        my="xs"
        variant="dashed"
        labelPosition="center"
        label={
          <Flex align={"center"} gap={6}>
            <Text color="gray">View more research points</Text>
            <ActionIcon variant="light" size={"xs"} radius={"xl"} onClick={toggle}>
              {!opened ? <IconChevronDown size={"1rem"} /> : <IconChevronUp size={"1rem"} />}
            </ActionIcon>
          </Flex>
        }
      />
      <Collapse in={opened}>
        <Flex direction={"column"} gap={"xs"} mt={4}>
          {unUsedData.map((item: any, index: number) => {
            return (
              <Flex gap={"xs"} bg={"#F8F9FA"} key={index} align={"start"} p={"xs"} className="rounded-sm">
                <Checkbox size={"xs"} defaultChecked={item.status} />
                <Stack spacing={2} mt={-2}>
                  <Text size={"sm"} fw={500}>
                    {item.title}
                  </Text>
                  <Text size={"xs"} color="gray" fw={500} lineClamp={1}>
                    {item.content}
                  </Text>
                </Stack>
              </Flex>
            );
          })}
        </Flex>
      </Collapse>
    </Box>
  );
};
