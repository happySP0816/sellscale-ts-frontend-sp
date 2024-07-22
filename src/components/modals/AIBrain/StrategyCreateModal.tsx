import {userDataState, userTokenState} from "@atoms/userAtoms";
import RichTextArea from "@common/library/RichTextArea";
import { API_URL } from "@constants/data";
import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Divider,
  Flex, Loader,
  MultiSelect,
  Paper,
  ScrollArea,
  Select,
  Text,
  TextInput
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ContextModalProps } from "@mantine/modals";
import {IconCalendar, IconLink, IconPlus, IconSend} from "@tabler/icons";
import {useEffect, useRef, useState} from "react";
import { useRecoilValue } from "recoil";
import moment from "moment/moment";
import {IconSparkles, IconCopy} from "@tabler/icons-react";
import Logo from "@assets/images/logo.png";

export default function StrategyCreateModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  onSubmit: (title: string, description: string, archetypes: number[], startDate: Date | null, endDate: Date | null) => Promise<void>;
}>) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [archetypes, setArchetypes]: any = useState([]);
  const [loading, setLoading] = useState(false);

  const [allArchetypes, setAllArchetypes] = useState([]);
  const userToken = useRecoilValue(userTokenState);

  useEffect(() => {
    fetch(`${API_URL}/client/all_archetypes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setAllArchetypes(
          data.data.map((x: any) => {
            return {
              value: x.id,
              label: x.emoji + " " + x.archetype,
            };
          })
        );
      });
  }, [userToken]);

  const StrategiesChat = (props: any) => {
    const userData = useRecoilValue(userDataState);
    const userToken = useRecoilValue(userTokenState);
    const [loading, setLoading] = useState(false);

    const [prompt, setPrompt] = useState("");
    const [chatContent, setChatContent] = useState<any>([
      {
        sender: "assistant",
        query: "Hey there! I'm SellScale AI, your friendly chatbot for creating new strategies. " +
          "To get started, please paste in any context you have, (e.g. notes from a strategies meeting, chat logs, etc.)",
        created_at: moment().format("MMMM D, h:mm a"),
        id: Date.now(),
      },
    ]);

    const viewport = useRef<any>(null);

    const prepareSubmit = () => {
      if (prompt !== "") {
        const newChatPrompt = {
          sender: "user",
          query: prompt,
          id: Date.now(),
          created_at: moment().format("MMMM D, h:mm a"),
        };

        // Add a placeholder loading message
        const loadingMessage = {
          sender: "assistant",
          query: "loading",
          id: Date.now() + 1,
          created_at: moment().format("MMMM D, h:mm a"),
        };

        const newChatContent = [...chatContent, newChatPrompt, loadingMessage];
        setChatContent(newChatContent);

        setPrompt("");

        return newChatContent;
      }

      return [];
    }

    const handleSubmit = () => {
      const newChatContent = prepareSubmit();
      handleResponse(newChatContent);
    }

    const handleKeyDown = (event: any) => {
      if (event.key === "Enter") {
        handleSubmit();
      }
    };

    const copyToClipboard = (id: number) => {
      const text = chatContent.find((x: any) => x.id === id)?.query;
      navigator.clipboard.writeText(text).then(r => console.log('copied to clipboard.'));
    }

    const handleResponse = async (newChatContent: any[]) => {
      setLoading(true);
      try {
        const loadingMessage = newChatContent[newChatContent.length - 1];
        const response = await fetch(`${API_URL}/ml/strategy_copilot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`,
          },
          body: JSON.stringify({ chat_content: newChatContent}),
        });

        const data = (await response.json());
        const res = data?.response;

        const chatbotMessage = {
          sender: "assistant",
          query: res,
          id: loadingMessage.id, // Use the same id to replace the loading message
          created_at: moment().format("MMMM D, h:mm a"),
        };
        // Replace the loading message with the actual response
        setChatContent(
          newChatContent.map((message: any) =>
            message.id === loadingMessage.id ? chatbotMessage : message
          )
        );

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

    console.log('chat content: ', chatContent);

    return (
      <Paper withBorder shadow="sm" radius={"md"} w={"100%"}>
        <Flex p={"md"} align={"center"} gap={5}>
          <IconSparkles size={"1rem"} color="#be4bdb" />
          <Text fw={600}>Strategies Generation Assistant</Text>
        </Flex>
        <Divider bg="gray" />
        <ScrollArea h={375} viewportRef={viewport} scrollHideDelay={4000}>
          <Flex direction={"column"} gap={"sm"} p={"md"} h={"100%"} className=" overflow-auto">
            {chatContent.map((item: any, index: number) => {
              return (
                <Flex direction={"column"} w={"100%"} gap={4} key={index} ml={item.sender === "user" ? "auto" : "0"}
                >
                  <Flex gap={4} align={"center"}>
                    <Avatar src={item.sender === "user" ? userData.img_url : Logo} size={"xs"} radius={"xl"} />
                    <Text fw={600} size={"xs"}>
                      {item.sender === "user" ? userData.sdr_name : "SellScale AI"}
                    </Text>
                  </Flex>
                  {item.sender === "user" && <Flex justify={'space-between'} w={'100%'} gap={'4px'} align={'center'}>
                      <Button size={'xm'} variant={'subtle'} onClick={() => copyToClipboard(item.id)}>
                          <IconCopy />
                      </Button>
                      <Flex className="border-[2px] border-solid border-[#e7ebef] rounded-lg rounded-br-none" px={"sm"} py={7}>
                          <Text size={"sm"} fw={500}>
                            {item.query}
                          </Text>
                      </Flex>
                  </Flex>}
                  {item.sender === "assistant" && <Flex justify={'space-between'} w={'100%'} gap={'4px'} align={'center'}>
                      <Flex className="border-[2px] border-solid border-[#e7ebef] rounded-lg rounded-br-none" px={"sm"} py={7}>
                          <Text size={"sm"} fw={500}>
                            {item.query === 'loading' ? <Loader color = "black" variant="dots" /> : item.query}
                          </Text>
                      </Flex>
                      <Button size={'xm'} variant={'subtle'} onClick={() => copyToClipboard(item.id)}>
                          <IconCopy />
                      </Button>
                  </Flex>}
                  <Text color="gray" size={"xs"} ml={item.sender === "user" ? "auto" : "0"}>
                    {item.created_at}
                  </Text>
                </Flex>
              );
            })}
            {/* {loading && <Loader color="blue" type="dots" />} */}
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

  return (
    <Flex gap={'24px'}>
      <Paper w={'35%'}>
        {StrategiesChat(innerProps)}
      </Paper>
      <Paper w={'65%'} withBorder shadow={"sm"} radius={"md"} p={'16px'}>
        <TextInput label="Strategy Name" placeholder="Eg. Product managers in chicago" value={title} onChange={(event) => setTitle(event.currentTarget.value)} />
        <Text mt="xs">Description</Text>
        <RichTextArea
          onChange={(value) => {
            setDescription(value);
            console.log(value);
          }}
        />
        <MultiSelect
          withinPortal
          label="Attach Campaigns"
          placeholder="Search campaigns"
          searchable
          data={allArchetypes}
          onChange={(value) => {
            setArchetypes(value);
          }}
          mt={20}
        />
        <Box>
          <Text size={"sm"} fw={500} mt={"sm"}>
            Time Frame
          </Text>
          <Flex gap={"md"}>
            <DateInput valueFormat="DD/MM/YYYY" rightSection={<IconCalendar size={"0.9rem"} color="gray" />} w={"100%"} onChange={setStartDate}/>
            <DateInput valueFormat="DD/MM/YYYY" rightSection={<IconCalendar size={"0.9rem"} color="gray" />} w={"100%"} onChange={setEndDate}/>
          </Flex>
        </Box>
        <Flex gap={"xl"} mt={40}>
          <Button variant="outline" color="gray" fullWidth>
            Cancel
          </Button>
          <Button
            fullWidth
            loading={loading}
            disabled={loading || !title || !description}
            onClick={async () => {
              setLoading(true);
              await innerProps.onSubmit(title, description, archetypes, startDate, endDate);
              context.closeAll();
              setLoading(false);
            }}
          >
            Create Strategy
          </Button>
        </Flex>
      </Paper>

    </Flex>
      );
}
