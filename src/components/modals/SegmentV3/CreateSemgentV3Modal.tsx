import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import { Accordion, Avatar, Box, Button, Divider, Flex, Paper, ScrollArea, Select, Text, TextInput } from "@mantine/core";
import { IconBrandLinkedin } from "@tabler/icons";
import { useState } from "react";

export default function CreateSegmentV3Modal() {
  const accordionType = [
    {
      title: "Job Title",
      content: null,
      value: "job",
    },
    {
      title: "Headcount",
      content: null,
      value: "headcount",
    },
    {
      title: "Seniority",
      content: null,
      value: "seniority",
    },
    {
      title: "Industry",
      content: null,
      value: "industry",
    },
    {
      title: "Skills",
      content: null,
      value: "skills",
    },
    {
      title: "Locations",
      content: null,
      value: "locations",
    },
    {
      title: "Bios & Job Descriptions",
      content: null,
      value: "description",
    },
    {
      title: "Education",
      content: null,
      value: "education",
    },
  ];
  const [contacts, setContacts] = useState([
    {
      avatar: "",
      first_name: "Ishan",
      last_name: "Sharma",
      company: "Cofounder & CEO, SellScale",
      linkedin: "https://linkedin.com/xxx",
    },
    {
      avatar: "",
      first_name: "Ishan",
      last_name: "Sharma",
      company: "Cofounder & CEO, SellScale",
      linkedin: "https://linkedin.com/xxx",
    },
    {
      avatar: "",
      first_name: "Ishan",
      last_name: "Sharma",
      company: "Cofounder & CEO, SellScale",
      linkedin: "https://linkedin.com/xxx",
    },
    {
      avatar: "",
      first_name: "Ishan",
      last_name: "Sharma",
      company: "Cofounder & CEO, SellScale",
      linkedin: "https://linkedin.com/xxx",
    },
    {
      avatar: "",
      first_name: "Ishan",
      last_name: "Sharma",
      company: "Cofounder & CEO, SellScale",
      linkedin: "https://linkedin.com/xxx",
    },
  ]);
  const [whitelistData, setWhitelistData] = useState([""]);
  const [blacklistData, setBlacklistData] = useState([""]);
  return (
    <Paper>
      <Flex w={"100%"} gap={"md"}>
        <Paper w={"50%"}>
          <TextInput label="Segment Name" placeholder="Eg. Product managers in chicago" />
          <Paper withBorder radius={"sm"} mt={"sm"}>
            <Text fw={500} size={"sm"} m={"sm"}>
              Whitelist / Blacklist
            </Text>
            <Divider />
            <Flex direction={"column"} gap={"xs"} p={"sm"}>
              <Select data={["text1", "test2", "test3"]} placeholder="Add Manually" />
              <Divider w={"100%"} variant="dashed" />
              <CustomSelect
                maxWidth="100%"
                minHeight="137px"
                value={whitelistData}
                label="Whitelist"
                placeholder="Select options"
                setValue={setWhitelistData}
                data={whitelistData}
                setData={setWhitelistData}
              />
              <CustomSelect
                maxWidth="100%"
                minHeight="137px"
                value={blacklistData}
                label="Blacklist"
                placeholder="Select options"
                setValue={setBlacklistData}
                data={blacklistData}
                setData={setBlacklistData}
              />
            </Flex>
          </Paper>
        </Paper>
        <Paper w={"100%"}>
          <TextInput label="Segment Tags" placeholder="Enter tags" />
          <Flex gap={"sm"} mt={"sm"}>
            <Paper withBorder radius={"sm"} w={"100%"}>
              <Text my={"sm"} mx={"lg"} fw={500}>
                Search Filters
              </Text>
              <Divider />
              <ScrollArea h={380}>
                <Accordion transitionDuration={200}>
                  {accordionType?.map((item, index) => {
                    return (
                      <Accordion.Item value={item.value}>
                        <Accordion.Control>{item.title}</Accordion.Control>
                        <Accordion.Panel>{item.content}</Accordion.Panel>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </ScrollArea>
            </Paper>
            <Paper withBorder radius={"sm"} w={"100%"}>
              <Text my={"sm"} mx={"lg"} fw={500}>
                Example Contacts
              </Text>
              <Divider />
              <Flex align={"center"} justify={"center"} gap={4} mt={"sm"}>
                <Text color="gray" fw={400} size={"sm"}>
                  {10534}+ people
                </Text>
                <Divider orientation="vertical" />
                <Text color="gray" fw={400} size={"sm"}>
                  {3980} accounts
                </Text>
              </Flex>
              <ScrollArea h={380}>
                <Flex direction="column" gap="sm" mt={"xs"}>
                  {contacts.map((contact, index) => {
                    return (
                      <Flex key={index} gap="sm" w={"100%"}>
                        <Box ml="md" w={"100%"}>
                          <Flex align="center" gap="xs" w={"100%"} pr={"sm"}>
                            <Avatar size="md" radius="xl" src={contact.avatar} />
                            <Flex direction="column" w={"100%"}>
                              <Flex align="center" gap="xs" justify={"space-between"} w={"100%"}>
                                <Text fw={500} size={"sm"}>
                                  {(contact.first_name + " " + contact.last_name).slice(0, 25)}
                                  {(contact.first_name + " " + contact.last_name).length > 25 ? "..." : ""}
                                </Text>
                                <IconBrandLinkedin color="white" fill="#228BE6" size={"2rem"} />
                              </Flex>
                              <Text color="gray" fw={500} fz={10}>
                                {contact.company}
                                {/* {(contact.title + " at " + contact.company).slice(0, 40)}
                              {(contact.title + " at " + contact.company).length > 40 ? "..." : ""} */}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                      </Flex>
                    );
                  })}
                  {/* {loading && (
                    <Flex direction="column" gap="sm">
                      {Array.from({ length: batchSize }).map((_, index) => (
                        <Flex key={index} direction="row" align="center" gap="sm" ml="lg">
                          <Skeleton height={50} width={50} radius="150%" />
                          <Flex direction="column" gap="xs" w="100%">
                            <Skeleton height={8} radius="xl" width="80%" />
                            <Skeleton height={8} radius="xl" width="60%" />
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  )} */}
                </Flex>
              </ScrollArea>
            </Paper>
          </Flex>
        </Paper>
      </Flex>
      <Flex gap={"md"} mt={"lg"}>
        <Button variant="outline" color="gray" fullWidth>
          Cancel
        </Button>
        <Button fullWidth>Create Segment</Button>
      </Flex>
    </Paper>
  );
}
