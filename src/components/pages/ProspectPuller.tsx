import { ActionIcon, Avatar, Box, Button, Collapse, Flex, Paper, ScrollArea, Switch, Tabs, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconBrandLinkedin, IconChevronDown, IconChevronUp, IconGlobe } from "@tabler/icons";
import { useState } from "react";

export default function ProspectPuller() {
  //   const [opened, { toggle }] = useDisclosure(false);
  const [menu, setMenu] = useState([
    "Name",
    "Job Title Keywords",
    "Industries",
    "Locations",
    "Fundraise",
    "Company",
    "# Employees",
    "Revenue Range",
    "Technology",
    "Recent News",
  ]);

  const [searchResult, setSearchResult] = useState([
    {
      avatar: "",
      name: "Joyce Jing",
      job: "General Manager @ ZW HR Consulting - Shanghai, Shanghai, China",
      linekdin: "https://linkedin.com/",
      company_name: "ZW HR Consulting",
      company_url: "http://www.zwhrcons/",
      company_avatar: "",
      company_linkedin: "https://linkedin.com/",
      company_global: "",
    },
    {
      avatar: "",
      name: "Suze Orman",
      job: "Co-Founder, SecureSave @ SecureSave - Santa Monica, California, United States",
      linekdin: "https://linkedin.com/",
      company_name: "SecureSave",
      company_url: "http://www.seciresave/",
      company_avatar: "",
      company_linkedin: "https://linkedin.com/",
      company_global: "",
    },
    {
      avatar: "",
      name: "Pooja Sarren",
      job: "Cofounder & EIC @ Inc42 Media - New Delhi, Delhi, India",
      linekdin: "https://linkedin.com/",
      company_name: "Inc42 Media",
      company_url: "http://www.inc42.com/",
      company_avatar: "",
      company_linkedin: "https://linkedin.com/",
      company_global: "",
    },
    {
      avatar: "",
      name: "Robert Johnson",
      job: "President/CEO @ Cimcor, Inc. - Merrillbille, Indiana, United States",
      linekdin: "https://linkedin.com/",
      company_name: "Cimcor, Inc.",
      company_url: "http://www.cimcor.com/",
      company_avatar: "",
      company_linkedin: "https://linkedin.com/",
      company_global: "",
    },
    {
      avatar: "",
      name: "Pooja Sarren",
      job: "Cofounder & EIC @ Inc42 Media - New Delhi, Delhi, India",
      linekdin: "https://linkedin.com/",
      company_name: "Inc42 Media",
      company_url: "http://www.inc42.com/",
      company_avatar: "",
      company_linkedin: "https://linkedin.com/",
      company_global: "",
    },
    {
      avatar: "",
      name: "Robert Johnson",
      job: "President/CEO @ Cimcor, Inc. - Merrillbille, Indiana, United States",
      linekdin: "https://linkedin.com/",
      company_name: "Cimcor, Inc.",
      company_url: "http://www.cimcor.com/",
      company_avatar: "",
      company_linkedin: "https://linkedin.com/",
      company_global: "",
    },
  ]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [opened, setOpened] = useState(false);

  const handleToggle = (key: number) => {
    if (selectedOption === key) {
      setOpened(!opened);
    } else {
      setOpened(true);
      setSelectedOption(key);
    }
    setSelectedOption(key);
  };

  return (
    <Paper p={"md"}>
      <Flex gap={"md"}>
        <Paper withBorder radius={"sm"} w={"30%"}>
          <Tabs
            defaultValue="search"
            styles={{
              tab: {
                padding: "16px",
              },
              tabLabel: {
                "&:active": {
                  color: "blue",
                },
              },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="search">Search</Tabs.Tab>
              <Tabs.Tab value="save">Saved searches</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="search">
              <Box p={"sm"}>
                <Button fullWidth size="md" my={"sm"}>
                  Search Database
                </Button>
                {menu.map((item, index) => {
                  return (
                    <Paper withBorder radius={"sm"} px={"md"} py={"xs"} mb={"sm"}>
                      <Flex align={"center"} justify={"space-between"}>
                        <Text key={index} fw={700}>
                          {item}
                        </Text>
                        <ActionIcon onClick={() => handleToggle(index)}>
                          {selectedOption === index ? <IconChevronUp size={"1.1rem"} /> : <IconChevronDown size={"1.1rem"} />}
                        </ActionIcon>
                      </Flex>
                      <Collapse in={selectedOption === index && opened}>
                        <Text>Search Options</Text>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Box>
            </Tabs.Panel>
            <Tabs.Panel value="save">Saved searches</Tabs.Panel>
          </Tabs>
        </Paper>
        <Paper w={"80%"}>
          <Flex align={"center"} justify={"space-between"}>
            <Box>
              <Text fw={700} size={"xl"}>
                Search Results
              </Text>
              <Text fw={400} size={"sm"}>
                Displaying 100 out of 188,388,545+ total results.
              </Text>
            </Box>
            <Flex align={"center"} gap={"sm"} pr={"sm"}>
              <Button disabled>Create Segment</Button>
              <Switch
                label="Advanced View"
                labelPosition="left"
                styles={{
                  root: {
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                    padding: "8px",
                  },
                }}
              />
            </Flex>
          </Flex>
          <Flex direction={"column"} gap={"sm"} mt={"md"}>
            <ScrollArea h={700} offsetScrollbars>
              {searchResult.map((item, index) => {
                return (
                  <Paper withBorder radius={"sm"} mb={"md"} p={"sm"} key={index}>
                    <Flex justify={"space-between"} align={"end"}>
                      <Flex align={"start"} gap={"sm"}>
                        <Avatar size={60} radius={"xl"} src={item.avatar} />
                        <Box>
                          <Text size={"lg"} fw={700}>
                            {item.name}
                          </Text>
                          <Text color="gray" fw={500} size={"sm"} mt={4}>
                            {item.job}
                          </Text>
                          <Button mt={"sm"}>
                            <IconBrandLinkedin size={"1rem"} />
                          </Button>
                        </Box>
                      </Flex>
                      <Box>
                        <Flex gap={"sm"}>
                          <Box>
                            <Text size={"sm"} fw={700}>
                              {item.company_name}
                            </Text>
                            <Text size={"sm"} fw={500} color="gray">
                              {item.company_url}
                            </Text>
                          </Box>
                          <Avatar src={item.company_avatar} size={44} radius={"xl"} />
                        </Flex>
                        <Flex mt={"sm"} gap={"sm"}>
                          <Button>
                            <IconBrandLinkedin size={"1rem"} />
                          </Button>
                          <Button>
                            <IconGlobe size={"1rem"} />
                          </Button>
                        </Flex>
                      </Box>
                    </Flex>
                  </Paper>
                );
              })}
            </ScrollArea>
          </Flex>
        </Paper>
      </Flex>
    </Paper>
  );
}
