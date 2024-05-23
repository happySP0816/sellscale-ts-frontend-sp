import { ActionIcon, Avatar, Badge, Box, Button, Flex, Image, Paper, ScrollArea, Text, TextInput, Title } from "@mantine/core";
import { IconBrandLinkedin, IconBulb, IconChevronLeft, IconChevronRight, IconCircleCheck, IconSearch } from "@tabler/icons";
import { useState } from "react";

import LogoWhite from "../../../assets/images/icon.svg";

interface QuestionData {
  question: string;
  answer: string;
}

interface GeneralData {
  title: string;
  content: string | Array<{ title: string; content: string }>;
}

interface ContactData {
  avatar: string;
  username: string;
  linkedinURL: string;
  job: string;
}

interface CRMData {
  type: string;
  content: string;
  date: string | null;
}

export default function B2BSearch() {
  const [search, setSearch] = useState("");

  const [generalData, setGeneralData] = useState<GeneralData[]>([]);
  const [questionData, setQuestionsData] = useState<QuestionData[]>([]);
  const [contactsData, setContactsData] = useState<ContactData[]>([]);
  const [crmData, setCRMData] = useState<CRMData[]>([]);
  const [loading, setLoading] = useState(false);
  const handleSearch = () => {
    if (search) {
      setLoading(true);
      setGeneralData([
        {
          title: "overview",
          content:
            "Sellscale is a technology company that specializes in using artificial intelligence (AI) and natural language processing (NLP) to enhance sales outreach. Here are the key details about Sellscale:",
        },
        {
          title: "foundes",
          content: "Ishan Sharma, who previously worked at Mckinsey & Company and Athelas.",
        },
        {
          title: "service and technology",
          content:
            "Sellscale provides AI-driven tools designed to automate and personalize sales outreach at scale. The company's technology integrates with various platforms such as LinkedIn, Gmail, Zapier, Apollo, and Outreach to streamline the sales process.",
        },
        {
          title: "key features",
          content: [
            {
              title: "Hyper-Personalized Outreach",
              content: "Uses data from over 40 publicly available sources and clients' CRMs to create personalized emails. ",
            },
            {
              title: "subtitle1",
              content: "xxxxxxxxxxxxxxxx",
            },
          ],
        },
      ]);
      setQuestionsData([
        {
          question: "Is SellScale hiring SDRS?",
          answer: "Yes! Sellscale is hiring SDRs to grow out their bizdev function.",
        },
        {
          question: "Is SellScale growing?",
          answer: "Yes! Sellscale raised a $3.4m seed round 1 year ago.",
        },
        {
          question: "Any interesting points?",
          answer: "Sellscale sells an AI SDR solution that is ranked 4.95 / 5 on sites",
        },
      ]);
      setContactsData([
        {
          avatar: "",
          username: "Ishan Sharma",
          linkedinURL: "https://linkedin.com/xxx",
          job: "Cofounder & CEO",
        },
        {
          avatar: "",
          username: "Aakash Adesara",
          linkedinURL: "https://linkedin.com/xxx",
          job: "Cofounder & CTO",
        },
        {
          avatar: "",
          username: "Aaron Cassar",
          linkedinURL: "https://linkedin.com/xxx",
          job: "Founding Engineer",
        },
        {
          avatar: "",
          username: "David Wei",
          linkedinURL: "https://linkedin.com/xxx",
          job: "Founding Engineer",
        },
      ]);
      setCRMData([
        {
          type: "Opportunity",
          content: "Jordan Smith from Sellscale signed up for your Bandana offering 11 months ago.",
          date: "May 21, 2024",
        },
        {
          type: "Interaction: Conference",
          content: "Samantha from your company met with Luis from Sellscale at DevCon 2024 at the booth.",
          date: null,
        },
      ]);
      setLoading(false);
    }
  };

  return (
    <Paper
      h={generalData.length > 0 && questionData.length > 0 && contactsData.length > 0 && crmData.length > 0 ? undefined : "90%"}
      withBorder
      style={{ display: "flex", flexDirection: "column" }}
      m={40}
      p={40}
    >
      <Flex align={"center"} direction={"column"} gap={"lg"} m={"auto"}>
        <Flex align={"center"} gap={"sm"}>
          <Image src={LogoWhite} style={{ width: "40px" }} />
          <Text fw={400} size={40} style={{ lineHeight: "24px" }}>
            SellScale
          </Text>
        </Flex>
        <Text fw={500} size={"xl"}>
          Business Research
        </Text>
        <Flex gap={"md"}>
          <TextInput placeholder="Eg. Tell me about SellScale" onChange={(e) => setSearch(e.target.value)} w={300} size="md" />
          <Button leftIcon={<IconSearch size={"0.9rem"} />} onClick={handleSearch} size="md">
            Search
          </Button>
        </Flex>
        <Flex>
          <Badge
            leftSection={<IconCircleCheck size={"1.4rem"} className="mt-3" fill="#40c057" color="#ebfbee" />}
            styles={{ inner: { fontWeight: 500 } }}
            size="xl"
            color="green"
            radius={"sm"}
          >
            CRM Connected
          </Badge>
        </Flex>
      </Flex>
      {generalData.length > 0 && questionData.length > 0 && contactsData.length > 0 && crmData.length > 0 && (
        <Flex gap={"xl"} mt={"lg"}>
          <Paper withBorder p={"lg"} pr={"xs"} w={"80%"}>
            <Text fw={500}>General</Text>
            <ScrollArea h={500} scrollbarSize={6} offsetScrollbars>
              <Flex direction={"column"} gap={"lg"} mt={"lg"}>
                {generalData.map((item, index) => {
                  return (
                    <Flex direction={"column"}>
                      <Text color="gray" tt={"uppercase"} fw={400}>
                        {item.title}
                      </Text>
                      {typeof item.content === "string" ? (
                        <Text fw={500} size={"sm"}>
                          {item.content}
                        </Text>
                      ) : (
                        item.content.map((subItem, subIndex) => (
                          <div key={subIndex}>
                            <Text fw={500} size={"sm"}>
                              <span className=" font-semibold">{subItem.title}:</span>
                              <span className="ml-[2px]">{subItem.content}</span>
                            </Text>
                          </div>
                        ))
                      )}
                    </Flex>
                  );
                })}
              </Flex>
            </ScrollArea>
          </Paper>
          <Flex direction={"column"} gap={"xl"} w={"100%"}>
            <Flex gap={"xl"}>
              <Paper withBorder p={"lg"} pr={"xs"} w={"100%"}>
                <Text fw={500}>Core Questions</Text>
                <ScrollArea scrollbarSize={6} h={240} offsetScrollbars>
                  <Flex direction={"column"} gap={"sm"} mt={"lg"}>
                    {questionData.map((item, index) => {
                      return (
                        <Flex direction={"column"}>
                          <Flex align={"center"} gap={"xs"}>
                            <IconBulb color="pink" size={"1.2rem"} className="mb-1" />
                            <Text fw={500} size={"sm"}>
                              {item.question}
                            </Text>
                          </Flex>
                          <Text size={"sm"} color="gray">
                            {item.answer}
                          </Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                </ScrollArea>
              </Paper>
              <Paper withBorder p={"lg"} pr={"xs"} w={"100%"}>
                <Text fw={500}>Key Contacts</Text>
                <ScrollArea h={240} scrollbarSize={6} offsetScrollbars>
                  <Flex direction={"column"} gap={"sm"} mt={"lg"} w={"100%"}>
                    {contactsData.map((item, index) => {
                      return (
                        <Flex w={"100%"} gap={"xs"}>
                          <Avatar src={item.avatar} radius={"xl"} size={"md"} />
                          <Box w={"100%"}>
                            <Flex align={"center"} justify={"space-between"}>
                              <Text fw={500} size={"sm"}>
                                {item.username}
                              </Text>
                              <IconBrandLinkedin size={"1.5rem"} fill="#228be6" color="white" />
                            </Flex>
                            <Text color="gray" size={"xs"} fw={400}>
                              {item.job}
                            </Text>
                          </Box>
                        </Flex>
                      );
                    })}
                  </Flex>
                </ScrollArea>
              </Paper>
            </Flex>
            <Paper withBorder p={"lg"}>
              <Flex justify={"space-between"} align={"center"}>
                <Text fw={500}>CRM Intel</Text>
                <Flex align={"center"} gap={"sm"}>
                  <ActionIcon style={{ border: "1px solid #dee2e6" }} radius={"xl"}>
                    <IconChevronLeft size={"1rem"} />
                  </ActionIcon>
                  <ActionIcon style={{ border: "1px solid #dee2e6" }} radius={"xl"}>
                    <IconChevronRight size={"1rem"} />
                  </ActionIcon>
                </Flex>
              </Flex>
              <Flex gap={"xl"} mt={"lg"}>
                {crmData.map((item, index) => {
                  return (
                    <Paper withBorder p={"md"} w={"100%"} key={index}>
                      <Badge radius={"xs"}>{item.type}</Badge>
                      <Text fw={600} size={"sm"} mt={"xs"}>
                        {item.content}
                      </Text>
                      {item.date && (
                        <Text fw={400} color="gray" size={"xs"} mt={"xs"}>
                          Created on {item.date}
                        </Text>
                      )}
                    </Paper>
                  );
                })}
              </Flex>
            </Paper>
          </Flex>
        </Flex>
      )}
    </Paper>
  );
}
