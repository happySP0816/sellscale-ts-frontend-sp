import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Flex,
  RingProgress,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  rem,
  Title,
  useMantineTheme,
  ActionIcon,
} from "@mantine/core";
import {
  IconArrowUp,
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
  IconSearch,
  IconSelector,
  IconX,
} from "@tabler/icons";
import { Pie, getDatasetAtEvent, getElementAtEvent } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  DoughnutController,
  ArcElement,
  Chart,
} from "chart.js";
import { useRef } from "react";
import { Bar, getElementsAtEvent } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
ChartJS.register(ArcElement, Tooltip, Legend);
const DisqualifiedData = [
  { category: "Not a decision maker", value: 30 },
  { category: "Poor account fit", value: 70 },
  { category: 'Contact is "open to work"', value: 50 },
  { category: "Competitor", value: 50 },
  { category: "Others", value: 50 },
];
const NotInterestedData = [
  { category: "Unconvinced", value: 30 },
  { category: "Timing not right", value: 70 },
  { category: "Unreponsive", value: 50 },
  { category: "Using a competitor", value: 50 },
  { category: "Others", value: 50 },
];

export function createRandomData(): Data {
  return {
    contactName: faker.name.fullName(),
    avatar: "",
    companyAvatar: "",
    company: faker.company.name(),
    category: faker.helpers.arrayElement([
      ...DisqualifiedData.map((i) => i.category),
      ...NotInterestedData.map((i) => i.category),
    ]),
    contact_content: faker.lorem.sentence(),
    campaign: faker.company.catchPhrase(),
    reason: faker.company.catchPhrase(),
    campaignImage: "",
    color: "orange",
  };
}

export interface Data {
  contactName: string;
  contact_content: string;
  company: string;
  companyAvatar: string;
  avatar: string;
  campaign: string;
  reason: string;
  campaignImage: string;
  color: string;
  category: string;
}

const mockData: Array<Data> = [];

Array.from({ length: 50 }).forEach(() => {
  mockData.push(createRandomData());
});

const RejectionAnalysis = () => {
  const [page, setPage] = useState(1);
  const disqualifiedDataChartRef = useRef(null);
  const notInterestedDataChartRef = useRef(null);
  const theme = useMantineTheme();
  const [filterContact, setFilterContact] = useState("");
  const rows = useMemo(() => {
    return mockData
      .filter((d) => {
        if (filterContact) {
          return d.category === filterContact;
        }

        return true;
      })
      .map((element, idx) => (
        <tr key={idx} className="bg-white">
          <td
            style={{
              paddingTop: rem(16),
              paddingBottom: rem(16),
            }}
          >
            <Flex align={"center"}>
              <Avatar src={element.companyAvatar} size={40} radius={"xl"} />
              <Text color="gray.8" fw={600}>
                {element.company}
              </Text>
            </Flex>
          </td>
          <td
            style={{
              paddingTop: rem(16),
              paddingBottom: rem(16),
            }}
          >
            <Flex align={"center"} gap={"sm"}>
              <Avatar src={element.avatar} size={40} radius={"xl"} />
              <Box>
                <Flex align={"center"} gap={3}>
                  <Text color="gray.8" fw={600} size={"md"}>
                    {element.contactName}
                  </Text>
                  <IconExternalLink size={18} color="#478cef" />
                </Flex>
                <Text color="gray">{element.contact_content}</Text>
              </Box>
            </Flex>
          </td>

          <td
            style={{
              paddingTop: rem(16),
              paddingBottom: rem(16),
            }}
          >
            <Flex align={"center"} gap={"sm"}>
              <Avatar src={element.campaignImage} radius={"xl"} />
              <Text fw={600}>{element.campaign}</Text>
              <IconExternalLink size={18} color="#478cef" />
            </Flex>
          </td>
          <td>
            <Badge color={element.color} size="md">
              {element.reason}
            </Badge>
          </td>
        </tr>
      ));
  }, [filterContact, mockData]);

  const chartDisqualifiedData = {
    labels: DisqualifiedData.map((item) => item.category),
    datasets: [
      {
        data: DisqualifiedData.map((item) => item.value),
        backgroundColor: [
          theme.colors.orange[6],
          theme.colors.blue[6],
          theme.colors.violet[6],
          theme.colors.yellow[6],
          theme.colors.gray[6],
        ],
      },
    ],
  };
  const chartNotInterestedData = {
    labels: NotInterestedData.map((item) => item.category),
    datasets: [
      {
        data: NotInterestedData.map((item) => item.value),
        backgroundColor: [
          theme.colors.orange[6],
          theme.colors.green[6],
          theme.colors.blue[6],
          theme.colors.red[6],
          theme.colors.gray[6],
        ],
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right" as "right",
        labels: {
          usePointStyle: true,
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };
  return (
    <Container size="97%" my={"lg"}>
      <Title order={3} mt={0} mb="xs">
        Rejection Analysis
      </Title>
      <Flex gap={"md"}>
        <Box
          style={{ border: "2px solid #DBDBDB", borderRadius: "10px" }}
          w={"100%"}
          p={"xl"}
        >
          <Flex align={"center"} gap={"sm"}>
            <Text color="gray" fw={500}>
              # Contacts Disqualified:{" "}
            </Text>
            <Text fw={600}>{256}</Text>
            <Badge
              color="green"
              leftSection={<IconArrowUp size={10} stroke={3} />}
            >
              8.5%
            </Badge>
          </Flex>
          <Flex mt={"sm"}>
            <Pie
              data={chartDisqualifiedData}
              options={options}
              ref={disqualifiedDataChartRef}
              onClick={(e) => {
                setFilterContact(
                  chartNotInterestedData.labels[
                    getElementAtEvent(
                      disqualifiedDataChartRef?.current as any,
                      e
                    )[0].index
                  ]
                );
              }}
            />
          </Flex>
        </Box>
        <Box
          style={{ border: "2px solid #DBDBDB", borderRadius: "10px" }}
          w={"100%"}
          p={"xl"}
        >
          <Flex align={"center"} gap={"sm"}>
            <Text color="gray" fw={500}>
              # Contacts Not Interested:{" "}
            </Text>
            <Text fw={600}>{127}</Text>
            <Badge
              color="green"
              leftSection={<IconArrowUp size={10} stroke={3} />}
            >
              8.5%
            </Badge>
          </Flex>
          <Flex mt={"sm"}>
            <Pie
              data={chartNotInterestedData}
              options={options}
              ref={notInterestedDataChartRef}
              onClick={(e) => {
                setFilterContact(
                  chartNotInterestedData.labels[
                    getElementAtEvent(
                      notInterestedDataChartRef?.current as any,
                      e
                    )[0].index
                  ]
                );
              }}
            />
          </Flex>
        </Box>
      </Flex>
      <Flex justify={"space-between"} mt={"xl"} align={"center"}>
        <Flex align={"center"} gap={"xs"}>
          <Text size={20} fw={600}>
            Rejection Report
          </Text>

          {filterContact && (
            <Badge
              color="red"
              rightSection={
                <ActionIcon
                  size={"xs"}
                  onClick={() => setFilterContact("")}
                  color="blue"
                >
                  <IconX />
                </ActionIcon>
              }
            >
              {filterContact}
            </Badge>
          )}
        </Flex>
        <TextInput
          rightSection={<IconSearch size={16} color="gray" />}
          placeholder="Search"
        />
      </Flex>
      <Box mt={"md"}>
        <Stack
          style={{
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <Table>
            <thead>
              <tr
                style={{
                  background: "#f9f9fd",
                }}
              >
                <th>
                  <Text fw={700}>Company</Text>
                </th>
                <th
                  style={{
                    textAlign: "left",
                    paddingTop: rem(15),
                    paddingBottom: rem(15),
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                  }}
                >
                  <Text fw={700}>Contact Name</Text>
                  <IconSelector size={16} />
                </th>

                <th>
                  <Text fw={700}>Campaign</Text>
                </th>
                <th>
                  <Text fw={700}>Reason</Text>
                </th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Stack>
        <Flex
          w={"100%"}
          bg={"white"}
          justify={"space-between"}
          p={20}
          style={{
            border: "1px solid #dee2e6",
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
          }}
        >
          <Flex align={"center"} gap={"sm"}>
            <Text color="gray" fw={500}>
              Show
            </Text>
            <Select
              style={{ width: "150px" }}
              data={["Show 25 rows", "Show 5 rows", "Show 10 rows"]}
              defaultValue="Show 25 rows"
            />
            <Text color="gray" fw={500}>
              of 126
            </Text>
          </Flex>
          <Flex>
            <Select
              style={{
                width: "80px",
              }}
              data={["01", "02", "03", "04", "05", "06", "071"]}
              defaultValue="01"
              radius={0}
            />
            <Text
              style={{
                display: "flex",
                justifyContent: "center",

                border: "1px solid #ced4da",
                alignItems: "center",
              }}
              color="gray"
              size={"sm"}
              px={10}
              fw={500}
            >
              of {page} pages
            </Text>
            <Button variant="default" px={5} radius={0}>
              <IconChevronLeft color="gray" />
            </Button>
            <Button variant="default" px={5} radius={0}>
              <IconChevronRight color="gray" />
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Container>
  );
};

export default RejectionAnalysis;
