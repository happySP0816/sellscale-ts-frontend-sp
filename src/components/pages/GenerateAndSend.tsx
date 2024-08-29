import { ActionIcon, Avatar, Badge, Box, Button, Center, Flex, Paper, SegmentedControl, Stack, Text, Textarea } from "@mantine/core";
import { IconBrandLinkedin, IconEdit, IconGlobe, IconLetterT, IconLoader, IconMail, IconRecordMail, IconX } from "@tabler/icons";
import { IconClockBolt, IconClockCog, IconSparkles } from "@tabler/icons-react";
import { DataGrid } from "mantine-data-grid";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";

export default function GenerateAndSend() {
  const [data, setData] = useState([
    {
      avatar: "https://www.figma.com/design/6tiYgFavVgP2Wz20X3G4uj/SellScale-V3?node-id=8359-44985&node-type=FRAME&t=styRm49in4GyGWml-0#",
      name: "Oliver King",
      job: "Former Quant & VC",
      part: "Helping Founder GT",
      status: false,
      linkedin: true,
      email: false,
      message:
        "Hi Oliver! Saw your new role in a startup. With your VC and quant background, you must have insights on software development. Interested in boosting your funnel? Let's talk!",
    },
    {
      avatar: "",
      name: "Etika Srivastava",
      job: "Talent Acquisition Recruiter",
      part: "HCL Tech",
      status: false,
      linkedin: true,
      email: false,
      message:
        "Hi Etika! I noticed your new role in a startup. With your experience in talent acquisition recruitment and quantitative analysis, I bet you have some valuable insights on software development. Interested in enhancing your pipeline? Let's connect!",
    },
    {
      avatar: "",
      name: "Nancy Ice",
      job: "Sales Head",
      part: "XM Telecom",
      status: false,
      linkedin: false,
      email: true,
      message:
        "Hi Nancy! Congrats on your new startup role! Given your strong background in sales and growth analysis, I'm sure you have some sharp perspectives on software development. Let's discuss ways to elevate your funnel!",
    },
    {
      avatar: "",
      name: "David Bekk",
      job: "Managing Director",
      part: "Meewa",
      status: false,
      linkedin: true,
      email: false,
      message:
        "Hi David! Excited to see your new role in the startup world! With your managing direction and quant background, you're likely already thinking about optimizing your software development processes. Want to talk about boosting your funnel?",
    },
    {
      avatar: "",
      name: "Erik Thomas",
      job: "Head of Department",
      part: "LM Infotech",
      status: false,
      linkedin: true,
      email: true,
      message:
        "Hi Erik! I came across your recent move to a startup. Your experience in managing and quant must give you unique insights into software development. Interested in discussing how to supercharge your funnel? Let's chat!",
    },
  ]);
  const [filterData, setFilterData] = useState(data);
  const [selected, setSelected] = useState<any>(data[0]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const [approveStatus, setApproveStatus] = useState(false);

  const [message, setMessage] = useState("");

  const [type, setType] = useState("all");

  const handleApprove = () => {
    if (selectedIndex !== null) {
      const newData = [...data];
      newData[selectedIndex].status = true;
      setFilterData(newData);
      setSelectedIndex((item) => (item !== null ? (item < data.length - 1 ? item + 1 : 0) : null));
      setSelected(data[selectedIndex < data.length - 1 ? selectedIndex + 1 : 0]);
      if (newData.every((item) => item.status)) {
        setApproveStatus(true);
      }
    }
  };
  useEffect(() => {}, [selected, selectedIndex]);

  useEffect(() => {
    setMessage(selected.message);
  }, [selected.message]);

  return (
    <Paper p={"sm"}>
      <Flex justify={"space-between"} align={"center"} p={"sm"}>
        <Flex gap={"xs"} align={"ceter"}>
          <IconEdit color="#228be6" size={"1.2rem"} className="mt-1" />
          <Text size={"lg"} fw={600}>
            Generate 5 and Send
          </Text>
        </Flex>
        <Flex align={"center"} gap={"sm"}>
          <Badge variant="outline" radius={"sm"} size="lg" color="green" leftSection={<IconClockBolt size={"1rem"} className="mt-2" />}>
            {100}%
          </Badge>
          <ActionIcon variant="outline" radius={"xl"}>
            <IconX size={"1.2rem"} />
          </ActionIcon>
        </Flex>
      </Flex>
      <Flex gap={"sm"} w={"100%"}>
        <Paper bg={"#F7F8FA"} p={"md"} w={"35%"}>
          <SegmentedControl
            fullWidth
            onChange={(value) => {
              setType(value);
              if (value !== "all") {
                setFilterData(data.filter((item) => item.status === (value === "ready" ? true : false)));
              }
              if (value === "all") setFilterData(data);
            }}
            data={[
              {
                value: "all",
                label: (
                  <Center style={{ gap: 10 }}>
                    <span>All</span>
                  </Center>
                ),
              },
              {
                value: "warning",
                label: (
                  <Center style={{ gap: 10 }}>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Warning</span>
                  </Center>
                ),
              },

              {
                value: "ready",
                label: (
                  <Center style={{ gap: 10 }}>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ready to send</span>
                  </Center>
                ),
              },
            ]}
          />
          <DataTable
            records={filterData || []}
            highlightOnHover
            withColumnBorders
            height={"fit-content"}
            withBorder
            onRowClick={(record, index) => {
              setSelected(record);
              setSelectedIndex(index);
            }}
            rowStyle={(record, index) => {
              return { background: index === selectedIndex ? "#3B85EF10" : "white" };
            }}
            mt={"sm"}
            sx={{
              cursor: "pointer",
              "& .mantine-10xyzsm>tbody>tr>td": {
                padding: "0px",
              },
              "& tr:hover": {
                background: "#f0f0f0",
              },
            }}
            columns={[
              {
                accessor: "id",
                title: (
                  <Flex align={"center"} gap={"3px"}>
                    <Text color="gray">#</Text>
                  </Flex>
                ),
                render: (_, index) => {
                  return (
                    <Flex w={"100%"} h={"100%"} px={4} py={"xs"} align={"center"} justify={"start"}>
                      <Text size={"sm"} fw={500} color="gray">
                        {index + 1}
                      </Text>
                    </Flex>
                  );
                },
              },
              {
                accessor: "prospect_name",
                title: (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLetterT color="gray" size={"0.9rem"} />
                    <Text color="gray">Company Name</Text>
                  </Flex>
                ),
                render: ({ avatar, name, job, part, linkedin, email }) => {
                  return (
                    <Flex w={"100%"} gap={"sm"} h={"100%"} px={4} py={"xs"} align={"center"} justify={"start"}>
                      <Avatar src={avatar} size={"md"} radius={"xl"} />
                      <Box>
                        <Flex align={"center"} gap={"xs"}>
                          <Text fw={500}>{name}</Text>
                          {linkedin && <IconBrandLinkedin fill="#228be6" color="white" size={"1.3rem"} />}
                          {email && <IconMail fill="#228be6" color="white" size={"1.3rem"} />}
                        </Flex>
                        <Flex>
                          <Text size={"xs"} color="gray" fw={500}>
                            {job}
                          </Text>
                        </Flex>
                        <Flex>
                          <Text size={"xs"} color="gray" fw={500}>
                            {part}
                          </Text>
                        </Flex>
                      </Box>
                    </Flex>
                  );
                },
              },
              {
                accessor: "status",
                title: (
                  <Flex align={"center"} gap={"3px"}>
                    <IconLoader color="gray" size={"0.9rem"} />
                  </Flex>
                ),
                render: ({ status }) => {
                  return (
                    <Flex w={"100%"} h={"100%"} align={"center"} px={4} py={"xs"} justify={"start"}>
                      {status ? <div className="rounded-full w-4 h-4 bg-green-500"></div> : <div className="rounded-full w-4 h-4 bg-red-600"></div>}
                    </Flex>
                  );
                },
              },
            ]}
          />
        </Paper>
        <Paper bg={"#F7F8FA"} p={"md"} w={"65%"}>
          <Stack spacing={"sm"}>
            <Flex gap={"sm"}>
              <Button fullWidth color="red">
                Unapprove Message
              </Button>
              <Button fullWidth color="green" onClick={handleApprove} disabled={approveStatus}>
                Approve Message
              </Button>
            </Flex>
            <Paper p={"sm"} radius={"sm"} withBorder>
              <Stack spacing={"sm"}>
                <Text fw={600} size={"lg"}>
                  Verify message below
                </Text>
                <Text size={"sm"} fw={600} color="gray">
                  After you verify make sure to select the <span className="text-green-500">Approve</span> button.
                </Text>
                <Flex direction={"column"} align={"end"}>
                  <Paper radius={"sm"} bg={"#D9DEE5"} p={4} style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} mb={-2}>
                    <Text fw={500} size={"xs"} color="gray">
                      {message.length}/300
                    </Text>
                  </Paper>
                  <Textarea
                    w={"100%"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    defaultValue={selected.message}
                    maxRows={4}
                    autosize
                    maxLength={300}
                    styles={{
                      input: {
                        background: "#F7F8FA",
                      },
                    }}
                  />
                </Flex>
                <Flex justify={"space-between"} mt={"md"}>
                  <Button color="grape" variant="outline" leftIcon={<IconEdit size={"1.3rem"} />}>
                    Auto Edit Using AI
                  </Button>
                  <Button color="grape" leftIcon={<IconSparkles size={"1.3rem"} />}>
                    Regenerate
                  </Button>
                </Flex>
              </Stack>
            </Paper>
            <Paper p={"sm"} withBorder>
              <Flex justify={"space-between"}>
                <Flex align={"center"} gap={"sm"}>
                  <Avatar src={selected?.avatar} size={"lg"} radius={"xl"} />
                  <Box>
                    <Flex align={"center"} gap={"sm"}>
                      <Text fw={600}>{selected?.name}</Text>
                      {selected?.linkedin && <IconBrandLinkedin fill="#228be6" color="white" size={"1.3rem"} />}
                      {selected?.email && <IconMail fill="#228be6" color="white" size={"1.3rem"} />}
                    </Flex>
                    <Text color="gray" size={"sm"} fw={500}>
                      {selected?.job}
                    </Text>
                  </Box>
                </Flex>
                <Badge variant="light" color="green">
                  No Errors
                </Badge>
              </Flex>
              <Text color="gray" fw={500} size={"sm"} mt={"sm"}>
                Company Voice Used: <span className="text-black">SS-Baseline Linkedin(#32)</span>
              </Text>
            </Paper>
            <Paper withBorder radius={"sm"} p={"sm"}>
              <Text fw={"600"} size={"lg"}>
                CTA Used<span className="text-gray-500">(Linkedin only)</span>
              </Text>
              <Paper withBorder radius={"sm"} p={"xs"} mt={"sm"} style={{ borderColor: "#3B85EF", backgroundColor: "#3B85EF10" }}>
                <Text size={"sm"} fw={500}>
                  Interested in boosting your top of funnel? Let's chat about how we can help.
                </Text>
              </Paper>
            </Paper>
            <Paper withBorder radius={"sm"} p={"sm"}>
              <Text size={"lg"} fw={600}>
                Research
              </Text>
              <Stack spacing={"lg"} mt={"sm"}>
                <Box>
                  <Text fw={500} size={"sm"} color="gray">
                    🔥 Current Job Industry
                  </Text>
                  <Paper ml={"md"} mt={"xs"} withBorder p={"xs"} style={{ borderColor: "#3B85EF", backgroundColor: "#3B85EF10" }}>
                    <Text size={"sm"} fw={500}>
                      {"Stealth Startup works in the software development industry"}
                    </Text>
                  </Paper>
                </Box>
                <Box>
                  <Text fw={500} size={"sm"} color="gray">
                    🔥 Year of Expereince at current job
                  </Text>
                  <Paper ml={"md"} mt={"xs"} withBorder p={"xs"} style={{ borderColor: "#3B85EF", backgroundColor: "#3B85EF10" }}>
                    <Text size={"sm"} fw={500}>
                      {"Just started at Stealth Startup."}
                    </Text>
                  </Paper>
                </Box>
                <Paper withBorder p={"xs"} mt={"md"} style={{ borderColor: "#3B85EF", backgroundColor: "#3B85EF10" }}>
                  123
                </Paper>
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      </Flex>
      <Flex mt={"lg"} gap={"md"} mb={"sm"}>
        <Button size="md" fullWidth variant="outline" color="gray">
          Cancel
        </Button>
        <Button size="md" fullWidth disabled={approveStatus}>
          Finish & Send
        </Button>
      </Flex>
    </Paper>
  );
}
