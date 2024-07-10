import CustomSelect from "@common/persona/ICPFilter/CustomSelect";
import {
  Accordion,
  Avatar,
  Box,
  Center,
  Badge,
  Flex,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
  Button,
  ScrollArea,
} from "@mantine/core";
import { IconBrandLinkedin, IconCircleCheck, IconUsers } from "@tabler/icons";
import { nameToInitials, valueToColor } from "@utils/general";
import { useState } from "react";

export default function PreFiltersV2EditModal() {
  const theme = useMantineTheme();

  const [included, setIncluded] = useState(["Option ONe", "Option Two"]);
  const [excluded, setExcluded] = useState([""]);

  const [menu, setMenu] = useState(["Seniority", "Industry", "Skills", "Locations", "Bios & Job Descriptions", "Education", "Experience"]);
  const [prospects, setProspects] = useState([
    {
      avatar: "",
      name: "Aaron Mackey",
      linkedin: true,
      email: false,
      prospects: "",
      job: "VP, Head of AI and ML, Sonata Therapeutics",
      filter: {
        title: "IBM",
        company_headcount: 525,
        position: "Managers and Directors",
      },
    },
    {
      avatar: "",
      name: "Abhay A Shukla",
      linkedin: true,
      email: false,
      prospects: "",
      job: "Director Molecular Research, KSL Biomedical",
      filter: {
        title: "IBM",
        company_headcount: 525,
        position: "Managers and Directors",
      },
    },
    {
      avatar: "",
      name: "David Perry",
      linkedin: true,
      email: false,
      prospects: "",
      job: "VP, Head of AI and ML, Sonata Therapeutics",
      filter: {
        title: "IBM",
        company_headcount: 525,
        position: "Managers and Directors",
      },
    },
    {
      avatar: "",
      name: "Benn TK",
      linkedin: true,
      email: false,
      prospects: "",
      job: "VP, Head of AI and ML, Sonata Therapeutics",
      filter: {
        title: "IBM",
        company_headcount: 525,
        position: "Managers and Directors",
      },
    },
  ]);
  return (
    <Box>
      <TextInput label="Pre-Filter Name" />
      <Flex mt={"sm"} gap={"md"}>
        <Paper withBorder radius={"sm"} w={"100%"}>
          <Box w={"100%"} bg={"#eceef1"} p={3}>
            <SegmentedControl
              data={[
                {
                  value: "person",
                  label: (
                    <Center style={{ gap: 10 }}>
                      <span>Person</span>
                    </Center>
                  ),
                },
                {
                  value: "account",
                  label: (
                    <Center style={{ gap: 10 }}>
                      <span>Account</span>
                      <Badge color="gray" variant="filled">
                        {4}
                      </Badge>
                    </Center>
                  ),
                },
              ]}
              style={{ backgroundColor: "transparent" }}
            />
          </Box>
          <Stack spacing={"xs"} px={"lg"}>
            <Accordion
              defaultValue={"job"}
              mt={"sm"}
              styles={{
                control: {
                  paddingTop: "3px",
                  paddingBottom: "3px",
                  paddingLeft: "0px",
                  paddingRight: "0px",
                },
                content: {
                  paddingLeft: "0px",
                  paddingRight: "0px",
                },
              }}
            >
              <Accordion.Item value="job">
                <Accordion.Control>Job Title</Accordion.Control>
                <Accordion.Panel>
                  <CustomSelect
                    maxWidth="30vw"
                    value={included}
                    label="Included"
                    placeholder="Select options"
                    setValue={setIncluded}
                    data={included}
                    setData={setIncluded}
                  />
                  <CustomSelect
                    maxWidth="30vw"
                    value={excluded}
                    label="Excluded"
                    placeholder="Select options"
                    setValue={setExcluded}
                    data={excluded}
                    setData={setExcluded}
                  />
                </Accordion.Panel>
              </Accordion.Item>
              {menu.map((item, index) => {
                return (
                  <Accordion.Item value={item.toLowerCase()}>
                    <Accordion.Control>{item}</Accordion.Control>
                    <Accordion.Panel>{item}</Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Stack>
        </Paper>
        <Paper withBorder radius={"sm"} w={"100%"}>
          <Flex align={"center"} gap={3} p={"sm"} bg={"#eceef1"}>
            <IconUsers size={"1rem"} color="gray" />
            <Text size={"sm"} fw={500} color="gray" tt={"uppercase"}>
              {"542,809"} prospects found
            </Text>
          </Flex>
          <ScrollArea h={500}>
            <Stack spacing={"sm"} px={"md"} py={"sm"}>
              {prospects.map((item, index) => {
                return (
                  <Flex align={"start"} gap={"xs"} key={index}>
                    <Avatar src={item.avatar} color={valueToColor(theme, item.name)} radius="lg" size={30}>
                      {nameToInitials(item.name)}
                    </Avatar>
                    <Box>
                      <Flex align={"center"} justify={"space-between"}>
                        <Flex align={"center"} gap={4}>
                          <Text size={"sm"} fw={500}>
                            {item.name}
                          </Text>
                          <IconBrandLinkedin size={"1.4rem"} fill="#228be6" color="white" />
                        </Flex>
                        <Badge variant="light">{"very high"}</Badge>
                      </Flex>
                      <Text size={"xs"} fw={400} color="gray">
                        {item.job}
                      </Text>
                      <Flex align={"center"} gap={4} wrap={"wrap"} mt={5}>
                        <Text tt={"uppercase"} size={"xs"} color="gray">
                          matched filters:
                        </Text>
                        <Flex align={"center"} gap={4}>
                          <IconCircleCheck fill="green" color="white" size={"1.2rem"} />
                          <Text fw={400} size={"xs"}>
                            title: <span className="font-medium">{item.filter.title}</span>
                          </Text>
                        </Flex>
                        <Flex align={"center"} gap={4}>
                          <IconCircleCheck fill="green" color="white" size={"1.2rem"} />
                          <Text fw={400} size={"xs"}>
                            company headcount: <span className="font-medium">{item.filter.company_headcount}</span>
                          </Text>
                        </Flex>
                        <Flex align={"center"} gap={4}>
                          <IconCircleCheck fill="green" color="white" size={"1.2rem"} />
                          <Text fw={400} size={"xs"}>
                            Position: <span className="font-medium">{item.filter.position}</span>
                          </Text>
                        </Flex>
                      </Flex>
                    </Box>
                  </Flex>
                );
              })}
            </Stack>
          </ScrollArea>
        </Paper>
      </Flex>
      <Flex gap={"xl"} mt={"xl"}>
        <Button variant="outline" color="gray" fullWidth>
          Cancel
        </Button>
        <Button fullWidth>Save Pre-filter</Button>
      </Flex>
    </Box>
  );
}
