import { userDataState } from "@atoms/userAtoms";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Loader,
  Paper,
  ScrollArea,
  Stepper,
  Switch,
  Text,
  TextInput,
  Textarea,
  Timeline,
  Badge,
  Table,
} from "@mantine/core";
import { IconCheck, IconCircleCheck, IconFile, IconLink, IconLoader, IconPlus, IconSend } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";

import Logo from "../../../assets/images/logo.png";
import { DataGrid } from "mantine-data-grid";

export default function SellScaleAssistant() {
  const [history, setHistory] = useState([
    { title: "Early Stage SaaS founders in NYC", time: "1 hr ago" },
    { title: "AI companies in bay area", time: "yesterday" },
    { title: "Fintech SaaS Companies", time: "2 days ago" },
  ]);

  return (
    <Box>
      <Paper withBorder radius={"sm"} p={"sm"}>
        <Flex align={"center"} gap={"md"}>
          <TextInput
            color="grape"
            w={"100%"}
            styles={{
              input: {
                ":focus": {
                  borderColor: "#be4bdb",
                },
              },
            }}
          />
          <Button leftIcon={<IconSparkles />} color="grape">
            Start Generation
          </Button>
        </Flex>
        <Flex gap={"xs"} align={"center"} mt={"sm"} wrap={"wrap"}>
          <Text color="gray" fw={500} size={"sm"}>
            History:
          </Text>
          {history.map((item, index) => {
            return (
              <Flex key={index} px={"sm"} py={8} gap={"xs"} className="border-[2px] border-solid border-[#e7ebef] rounded-md bg-[#f7f8fa]" wrap={"wrap"}>
                <Text size={"xs"} color="gray" fw={600}>
                  {item.title}
                </Text>
                <Text size={"xs"} color="gray" fw={500}>
                  {item.time}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Paper>
      <Flex mt={"md"} gap={"xl"}>
        <SegmentChat />
        <SegmentAIGeneration />
      </Flex>
    </Box>
  );
}

const SegmentChat = () => {
  const userData = useRecoilValue(userDataState);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [chatContent, setChatContent] = useState<any>([]);

  const viewport = useRef<any>(null);

  const handleSubmit = () => {
    if (prompt !== "") {
      const newChatPrompt = {
        sender: "user",
        query: prompt,
        created_at: moment().format("MM, h:mm a"),
      };
      setChatContent((chatContent: any) => [...chatContent, newChatPrompt]);
      setPrompt("");
      handleResponse();
    } else console.log("--------");
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const handleResponse = async () => {
    setLoading(true);

    try {
      const data = {
        text: "I've generated the ICP for you. Please have a look and let me know if you need any edits.",
      };

      const chatbotMessage = {
        sender: "chatbot",
        query: data.text,
        id: Date.now() + 1,
        created_at: moment().format("MM, h:mm a"),
      };

      setChatContent((chatContent: any) => [...chatContent, chatbotMessage]);
      viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    viewport.current?.scrollTo({ top: viewport.current.scrollHeight });
  }, [chatContent]);

  return (
    <Paper withBorder shadow="sm" radius={"md"} w={"35%"}>
      <Flex p={"md"} align={"center"} gap={5}>
        <IconSparkles size={"1rem"} color="#be4bdb" />
        <Text fw={600}>Refine Your Generation</Text>
      </Flex>
      <Divider bg="gray" />
      <ScrollArea h={375} viewportRef={viewport} scrollHideDelay={4000}>
        <Flex direction={"column"} gap={"sm"} p={"md"} h={"100%"} className=" overflow-auto">
          {chatContent.map((item: any, index: number) => {
            return (
              <Flex direction={"column"} w={"80%"} gap={4} key={index} ml={item.sender === "user" ? "auto" : "0"}>
                <Flex gap={4} align={"center"}>
                  <Avatar src={item.sender === "user" ? userData.img_url : Logo} size={"xs"} radius={"xl"} />
                  <Text fw={600} size={"xs"}>
                    {item.sender === "user" ? userData.sdr_name : "SellScale AI"}
                  </Text>
                </Flex>
                <Flex className="border-[2px] border-solid border-[#e7ebef] rounded-lg rounded-br-none" px={"sm"} py={7}>
                  <Text size={"sm"} fw={500}>
                    {item.query}
                  </Text>
                </Flex>
                <Text color="gray" size={"xs"} ml={item.sender === "user" ? "auto" : "0"}>
                  {item.created_at}
                </Text>
              </Flex>
            );
          })}
          {loading && <Loader color="blue" type="dots" />}
        </Flex>
      </ScrollArea>
      <Paper p={"sm"} withBorder radius={"md"} className="bg-[#f7f8fa]" my={"lg"} mx={"md"}>
        <TextInput
          multiple
          value={prompt}
          placeholder="Type '/' for command"
          onKeyDown={handleKeyDown}
          onChange={(e) => setPrompt(e.target.value)}
          variant="unstyled"
        />
        <Flex justify={"space-between"} mt={"sm"} align={"center"}>
          <Flex gap={"sm"}>
            <ActionIcon variant="outline" color="gray" radius={"xl"} size={"sm"}>
              <IconPlus size={"1rem"} />
            </ActionIcon>
            <ActionIcon variant="outline" color="gray" radius={"xl"} size={"sm"}>
              <IconLink size={"1rem"} />
            </ActionIcon>
          </Flex>
          <Button size="xs" color="grape" rightIcon={<IconSend size={"1rem"} />} onClick={handleSubmit}>
            Ask AI
          </Button>
        </Flex>
      </Paper>
    </Paper>
  );
};

const SegmentAIGeneration = () => {
  const [active, setActive] = useState(1);
  const [assets, setAssets] = useState(["Important-sales-asset.pdf", "extra-asset-1.pdf"]);
  const [segment, setSegment] = useState([
    {
      makers: "Head of Training/ Learning",
      industry: "Education",
      job: "Learning and Deveopment Managers, Head of Training, Head of Corporate Learning",
      pain_point: "Need engaging training materials, reduce costs, streamline content creation",
      specific_material: "Corporate training videos",
      lead: 1500,
      use: true,
    },
  ]);

  const rows = segment.map((element, index) => (
    <tr key={index}>
      <td>{element.makers}</td>
      <td>{element.industry}</td>
      <td>{element.job}</td>
      <td>{element.pain_point}</td>
      <td>{element.specific_material}</td>
      <td>{element.lead}</td>
      <td className="align-middle">
        <Switch defaultChecked={element.use} />
      </td>
    </tr>
  ));

  return (
    <Paper withBorder shadow="sm" w={"65%"} radius={"md"}>
      <Flex p={"md"} align={"center"} gap={5} bg={"grape"} className=" rounded-t-md">
        <IconSparkles size={"1rem"} color="white" />
        <Text fw={600} color="white">
          AI Generation
        </Text>
      </Flex>
      <Divider bg="gray" />
      <ScrollArea h={500} scrollHideDelay={4000} px={"md"}>
        <Timeline
          mt={"md"}
          color="grape"
          active={1}
          lineWidth={2}
          bulletSize={24}
          styles={{
            itemBody: {
              paddingTop: "3px",
              paddingLeft: "8px",
            },
            itemContent: {
              paddingTop: "6px",
            },
            itemBullet: {
              fontSize: "12px",
              border: "none",
              backgroundColor: "transparent",
              "&[data-with-child]": {
                backgroundColor: "white",
              },
              "&[data-line-active]": {
                borderStyle: "dashed",
                borderLeftColor: "orange",
              },
              "::before": {
                borderStyle: "dashed",
                borderLeftColor: "orange",
              },
            },
          }}
        >
          <Timeline.Item bullet={active ? <IconCheck size={"1rem"} /> : <IconLoader size={"1rem"} color="orange" />} title="Understanding your Project">
            <Box w={"100%"}>
              <Flex
                w={"100%"}
                px={"sm"}
                align={"center"}
                justify={"space-between"}
                py={5}
                gap={"xs"}
                className="border-[2px] border-solid border-[#e7ebef] rounded-md"
                wrap={"wrap"}
              >
                <Flex align={"center"} gap={"xs"}>
                  <IconLink size={"1rem"} />
                  <Text fw={500} size={"sm"}>
                    Website:
                  </Text>
                  <Text color="gray" fw={500} size={"sm"}>
                    https://www.poweredbyash.com
                  </Text>
                </Flex>
                <Text color="gray" fw={500} size={"xs"}>
                  28 Pages Analyzed
                </Text>
              </Flex>
              <Flex
                w={"100%"}
                align={"center"}
                justify={"space-between"}
                px={"sm"}
                mt={"xs"}
                py={5}
                gap={"xs"}
                className="border-[2px] border-solid border-[#e7ebef] rounded-md"
                wrap={"wrap"}
              >
                <Flex align={"center"} gap={"xs"}>
                  <IconFile size={"1rem"} />
                  <Text fw={500} size={"sm"}>
                    Sales Asset:
                  </Text>
                  {assets.map((item, index) => {
                    return (
                      <Badge color="gray" size="sm" tt={"initial"} key={index}>
                        {item}
                      </Badge>
                    );
                  })}
                </Flex>
                <Text color="gray" fw={500} size={"xs"}>
                  2 Files Analyzed
                </Text>
              </Flex>
            </Box>
          </Timeline.Item>

          <Timeline.Item
            lineActive
            bullet={active ? <IconCheck size={"1rem"} /> : <IconLoader size={"1rem"} color="orange" />}
            title="This is your ideal customer Profile"
            lineVariant={active ? "solid" : "dashed"}
          >
            <Paper withBorder px={"sm"} py={"lg"}>
              <Text color="gray" size={"xs"} fw={600}>
                AI SaaS companies with 10-100 employees, targeting tech-savvy SMBs in the healthcare and finance sectors. Focused on enhancing efficiency and
                decision-making through advanced AI solutions, looking for scalable, user-friendly platforms with robust customer support and integration
                capabilities.
              </Text>
            </Paper>
          </Timeline.Item>

          <Timeline.Item
            lineActive={active === 2 ? true : false}
            bullet={active === 2 ? <IconCheck size={"1rem"} /> : <IconLoader size={"1rem"} color="orange" />}
            title="Generated Segment"
          >
            <Table withBorder withColumnBorders fontSize="xs">
              <thead className="bg-[#f7f8fa] align-bottom rounded-t-lg">
                <tr>
                  <th>Decision Makers</th>
                  <th>Industry</th>
                  <th>Job Title</th>
                  <th>Pain Points</th>
                  <th>Specific Material</th>
                  <th>Number of Unique Leads (Estimated)</th>
                  <th>Use</th>
                </tr>
              </thead>
              <tbody className="align-top font-medium rounded-b-lg">{rows}</tbody>
            </Table>
          </Timeline.Item>

          <Timeline.Item
            bullet={active === 3 ? <IconCheck size={"1rem"} /> : <IconLoader size={"1rem"} color="orange" />}
            title="Importing Selected Segments as Assets"
          >
            <Button color="grape" size="sm">
              Create Sequence
            </Button>
          </Timeline.Item>
        </Timeline>
      </ScrollArea>
    </Paper>
  );
};
