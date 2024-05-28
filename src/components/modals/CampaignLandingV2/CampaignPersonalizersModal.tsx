import { ActionIcon, Avatar, Badge, Box, Button, Checkbox, Divider, Title, Flex, Paper, ScrollArea, Select, Text, Textarea } from "@mantine/core";
import { ContextModalProps, openContextModal } from "@mantine/modals";
import { IconBuilding, IconBulb, IconEdit, IconPlus, IconPoint, IconTrash } from "@tabler/icons";
import { IconSparkles } from "@tabler/icons-react";
import { useState } from "react";

export default function CampaignPersonalizersModal({
  innerProps,
  context,
  id,
}: ContextModalProps<{
  setPersonalizers: Function;
}>) {
  // const [personalizersData, setPersonalizersData] = useState([
  //   {
  //     title: "10K Filing",
  //     content: "Find any mention of sales",
  //   },
  //   {
  //     title: "Recent Job Opening",
  //     content: "Mention of SDRs is great!",
  //   },
  // ]);
  const [researchData, setResearchData] = useState([
    {
      title: "Linkedin Bio",
      type: "Linkedin",
      content: "Use anything in their bio taht we can connect with and be humanistic (i.e quotes, fun facts, anything).",
    },
    {
      title: "Is [[company]] hiring for data engineers?",
      type: "Question",
      content: "If the company is hiring for data roles, they probably have a need to build out ETL pipelines for business systems and databases.",
    },
    {
      title: "Conduct general research about [[company]]",
      type: "General",
      content: "If there is any information pertaining to how the company uses data, databases, warehouses in their product or services, that would be useful.",
    },
    {
      title: "Linkedin Bio",
      type: "linkedin",
      content: "Use anything in their bio taht we can connect with and be humanistic (i.e quotes, fun facts, anything).",
    },
    {
      title: "Is [[company]] hiring for data engineers?",
      type: "Question",
      content: "If the company is hiring for data roles, they probably have a need to build out ETL pipelines for business systems and databases.",
    },
  ]);
  const [simulateData, setSimulateData] = useState([
    {
      title: "Conduct general research about [[company]]",
      type: "General",
      content:
        "Security and Compliance: Bubble is hosted on Amazon Web Services (AWS), which is compliant with certifications such as SOC 2, CSA, and ISO 27001.",
      ai_response:
        "Relevant, as it details the security measures and compliance standards that Bubble adheres to, which are important considerations for data integration and ETL syncing.",
      status: true,
    },
    {
      title: "Linkedin Bio",
      type: "Linkedin",
      content: "Could not find the information related to this query",
      ai_response: "Could not find the information related to this query",
      status: false,
    },
    {
      title: "Conduct general research about [[company]]",
      type: "Question",
      content:
        "Security and Compliance: Bubble is hosted on Amazon Web Services (AWS), which is compliant with certifications such as SOC 2, CSA, and ISO 27001.",
      ai_response:
        "Relevant, as it details the security measures and compliance standards that Bubble adheres to, which are important considerations for data integration and ETL syncing.",
      status: false,
    },
    {
      title: "Linkedin Bio",
      type: "LinkedIn",
      content: "Could not find the information related to this query",
      ai_response: "Could not find the information related to this query",
      status: false,
    },
  ]);
  return (
    <>
      {/* <Paper withBorder w={"100%"}>
        <Box p={"lg"} style={{ borderBottom: "1px solid #dee2e6" }}>
          <Text size={"lg"} fw={600}>
            Example Contact
          </Text>
          <Flex justify={"space-between"} style={{ border: "1px solid #3B85EF", borderRadius: "6px", padding: "12px" }}>
            <Box>
              <Flex gap={10}>
                <Avatar src={""} size={"xl"} radius={"100%"} />
                <Box>
                  <Text fw={600} size={"xl"}>
                    {"Aaron Cessar"}
                  </Text>
                  <Text fw={400} size={"xs"}>
                    {"Founding Software Engineer @ SellScale"}
                  </Text>
                  <Text fw={400} color="gray" size={"xs"}>
                    {"San Francisco, CA"}
                  </Text>
                  <Flex gap={3} align={"center"} mt={4}>
                    <IconBuilding size={"0.9rem"} color="gray" />
                    <Text fw={400} color="gray" size={"xs"}>
                      {"SellScale, Wanderer's Guide, and 7 more"}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
            </Box>
            <ActionIcon>
              <IconEdit />
            </ActionIcon>
          </Flex>
        </Box>
        <ScrollArea h={400} scrollbarSize={8} mt={"sm"}>
          <Box p={"lg"}>
            <Text size={"lg"} fw={600}>
              Personalizations
            </Text>
            <Box mt={"xs"}>
              <Flex align={"center"} gap={4}>
                <IconPoint size={"2rem"} fill="#3B85EF" color="white" className="ml-[-8px]" />
                <Text size={"sm"} fw={500} color="#3B85EF">
                  Account Research
                </Text>
              </Flex>
              <Paper withBorder p={"xs"}>
                <Checkbox label="Are they hiring for SDRs on any job boards?" />
                <Textarea mt={"sm"} label="Explain how this is relevant:" placeholder="Job boards mean they need more top of funnel." minRows={3} />
              </Paper>
              <Checkbox
                label="Does their website mention anything about a login button?"
                styles={{
                  root: {
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    paddingInline: "12px",
                    paddingBlock: "8px",
                  },
                }}
                mt={"sm"}
              />
              <Button
                mt={"sm"}
                leftIcon={<IconPlus size={"0.9rem"} />}
                w={"100%"}
                variant="outline"
                styles={{
                  root: {
                    display: "flex",
                    justifyContent: "start",
                  },
                }}
              >
                Add research point
              </Button>
            </Box>
            <Box mt={"xs"}>
              <Flex align={"center"} gap={4}>
                <IconPoint size={"2rem"} fill="#17b26a" color="white" className="ml-[-8px]" />
                <Text size={"sm"} fw={500} color="#17b26a">
                  Account Level Personalization
                </Text>
              </Flex>
              <Checkbox.Group>
                <Flex direction={"column"} gap={"sm"}>
                  <Checkbox
                    value="company_news"
                    label="Company News"
                    styles={{
                      root: {
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        paddingInline: "12px",
                        paddingBlock: "8px",
                      },
                    }}
                  />
                  <Checkbox
                    value="company_tools"
                    label="Company Tools"
                    styles={{
                      root: {
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        paddingInline: "12px",
                        paddingBlock: "8px",
                      },
                    }}
                  />
                  <Checkbox
                    value="company_website"
                    label="Company Websit"
                    styles={{
                      root: {
                        border: "1px solid #dee2e6",
                        borderRadius: "4px",
                        paddingInline: "12px",
                        paddingBlock: "8px",
                      },
                    }}
                  />
                </Flex>
              </Checkbox.Group>
            </Box>
            <Box mt={"xs"}>
              <Flex align={"center"} gap={4}>
                <IconPoint size={"2rem"} fill="#d444f1" color="white" className="ml-[-8px]" />
                <Text size={"sm"} fw={500} color="#d444f1">
                  Prospect Level Personalization
                </Text>
              </Flex>
              <Paper withBorder p={"xs"}>
                <Checkbox label="Linkedin Bio" />
                <Textarea
                  mt={"sm"}
                  label="Explain how this is relevant:"
                  placeholder="For eg. `If bio mentions data, that means they're likely involved in data pipelines`"
                  minRows={3}
                />
              </Paper>
              <Checkbox
                label="Linkedin Current Experience"
                styles={{
                  root: {
                    border: "1px solid #dee2e6",
                    borderRadius: "4px",
                    paddingInline: "12px",
                    paddingBlock: "8px",
                  },
                }}
                mt={"sm"}
              />
            </Box>
          </Box>
        </ScrollArea>
      </Paper>
      <Flex gap={"md"} mt={"md"}>
        <Button fullWidth variant="outline" color="gray">
          Go Back
        </Button>
        <Button
          fullWidth
          onClick={() => {
            innerProps.setPersonalizers(personalizersData);
            context.closeModal(id);
          }}
        >
          Save
        </Button>
      </Flex> */}
      <Flex mt={"lg"} style={{ border: "1px solid gray", borderRadius: "6px" }}>
        <Paper p={"md"} pr={"xs"} w={"40%"} display={"flex"} style={{ gap: "16px", flexDirection: "column" }}>
          <Flex align={"center"} justify={"space-between"}>
            <Text fw={600}>Research Points</Text>
          </Flex>
          <Flex>
            <Button fullWidth leftIcon={<IconPlus size={"0.9rem"} />} mr={"md"}>
              Research point
            </Button>
            <Button
              fullWidth
              variant="outline"
              color="pink"
              leftIcon={<IconSparkles size={"0.9rem"} />}
              onClick={() =>
                openContextModal({
                  modal: "simulatepersonalizerModal",
                  title: (
                    <Title order={3}>
                      <span className=" text-gray-500">Go back to</span> Personalizers
                    </Title>
                  ),
                  innerProps: {},
                  centered: true,
                  styles: {
                    content: {
                      minWidth: "700px",
                    },
                  },
                })
              }
            >
              Personalize
            </Button>
          </Flex>
          <ScrollArea h={500} scrollbarSize={8} pr={"md"}>
            <Flex h={"100%"} gap={"xs"} direction={"column"}>
              {researchData.map((item, index) => {
                return (
                  <Paper withBorder p={"md"} key={index}>
                    <Flex align={"start"} justify={"space-between"}>
                      <Text size={"sm"} fw={600} pt={4}>
                        {item.title}
                      </Text>
                      <Flex gap={3} align={"center"}>
                        <ActionIcon>
                          <IconEdit color="gray" size={"0.9rem"} />
                        </ActionIcon>
                        <ActionIcon>
                          <IconTrash color="gray" size={"0.9rem"} />
                        </ActionIcon>
                        <Badge size="sm" radius={"sm"} color={item.type === "General" ? "orange" : item.type === "Linkedin" ? "" : "green"}>
                          {item.type}
                        </Badge>
                      </Flex>
                    </Flex>
                    <Text size={"sm"} mt={2}>
                      {item.content}
                    </Text>
                  </Paper>
                );
              })}
            </Flex>
          </ScrollArea>
        </Paper>
        <Divider orientation="vertical" />
        <Paper w={"66%"} display={"flex"} style={{ gap: "16px", flexDirection: "column" }}>
          <Flex p={"lg"} justify={"space-between"} align={"center"} gap={"sm"} style={{ borderBottom: "1px solid gray" }}>
            <Text fw={600}>Simulate Research</Text>
            <Flex gap={"sm"} align={"center"}>
              <Text color="gray" size={"sm"}>
                Simulating on:
              </Text>
              <Select
                placeholder="Select Sequence type"
                // value={sequenceType || ""}
                // onChange={(value) => setSequenceType(value)}
                data={[
                  { label: "Linkedin", value: "linkedin" },
                  { label: "Email", value: "email" },
                ]}
              />
            </Flex>
          </Flex>
          <ScrollArea h={500} scrollbarSize={8} px={"md"}>
            <Flex gap={"xs"} direction={"column"}>
              {simulateData.map((item, index) => {
                return (
                  <Paper withBorder p={"lg"}>
                    <Flex justify={"space-between"}>
                      <Flex>
                        <IconPoint size={"2rem"} fill={item.status ? "#17B26A" : "red"} color="white" className="mt-[-6px] ml-[-12px]" />
                        <Text fw={600} size={"sm"}>
                          {item.title}
                        </Text>
                      </Flex>
                      <Badge radius={"sm"} size="sm" color={item.type === "General" ? "orange" : item.type === "Linkedin" ? "" : "green"}>
                        {item.type}
                      </Badge>
                    </Flex>
                    <Text size={"sm"} fw={500}>
                      {item.content}
                    </Text>
                    <Flex p={"sm"} className="bg-[#D444F1]/5" gap={4} align={"start"}>
                      <Flex>
                        <IconBulb size={"0.9rem"} color="#D444F1" />
                      </Flex>
                      <Text color="#D444F1" size={"xs"}>
                        {item.ai_response}
                      </Text>
                    </Flex>
                  </Paper>
                );
              })}
            </Flex>
          </ScrollArea>
        </Paper>
      </Flex>
      <Flex align={"center"} gap={"md"} mt={"lg"}>
        <Button variant="outline" color="gray" fullWidth onClick={() => context.closeModal(id)}>
          Go Back
        </Button>
        <Button onClick={() => context.closeModal(id)} fullWidth>
          Save
        </Button>
      </Flex>
    </>
  );
}
